// ═══════════════════════════════════════════════════════════════════════════
// tracking-audit.mjs — runs the booking funnel for real and asserts the
// tracking that came out of it.
//
// WHY RUN IT rather than read the code. Calling the trackers by hand proves
// nothing: not that a component fires them, not the ORDER, and order is the
// whole point of Advanced Matching (an identify() after the Lead leaves that
// Lead anonymous). The static check in check-tracking-ids.mjs covers the ids;
// this covers the behaviour.
//
//   node scripts/tracking-audit.mjs                 # against BASE
//   BASE=http://localhost:4173 node scripts/tracking-audit.mjs
//
// TWO PHASES, and the split matters:
//   A. Nothing intercepted except the platform beacons. The GHL calendar loads
//      the way a visitor sees it, and the run stops BEFORE Confirm. Registering
//      a route on the n8n URL earlier kills the get_programs preflight and the
//      form opens with zero classes, which looks exactly like a broken page.
//   B. The webhook route is registered only once step 2 is on screen, then
//      Confirm runs. Webhook 2 is captured, the events fire, and NOTHING is
//      written to the client's calendar.
//
// No test ids and no test conversions: every platform beacon is aborted and
// the assertions read the CALLS made in the page runtime.
// ═══════════════════════════════════════════════════════════════════════════

import { chromium } from '/Users/lucasaraujocabral/Documents/campos-jiu-jitsu-austin-tx/node_modules/playwright/index.mjs'

const BASE = process.env.BASE ?? 'http://localhost:4173'
const PAGE = process.env.PAGE ?? '/contact'
const PIXEL = '4326414901006955'
const GA4 = 'G-RM8ZE8H789'
const ADS = 'AW-18177687947'
const GADS_LEAD = `${ADS}/nG6XCNHClr4cEIuD5ttD`
const GADS_BOOKING = `${ADS}/bWvTCJnblr4cEIuD5ttD`

const PLATFORMS = /facebook\.(net|com)|googletagmanager\.com|analytics\.google|googleadservices|google\.com\/(ccm|pagead|rmkt)|google\.[a-z.]+\/ads/i

const results = []
const ok = (m) => results.push(['pass', m])
const bad = (m) => results.push(['FAIL', m])

/* fbq is instrumented with a getter/setter so the calls are recorded whatever
   the snippet does with it. gtag CANNOT be caught that way: its snippet is a
   function DECLARATION, which defines the property without going through a
   setter, so GA4 reads as silent when it is not. Its source of truth is
   window.dataLayer, and each pushed item has to be spread in on its own. */
const PROBE = () => {
  window.__fbq = []
  let real
  Object.defineProperty(window, 'fbq', {
    configurable: true,
    get() {
      return real
    },
    set(fn) {
      real = function (...args) {
        window.__fbq.push(args)
        return fn.apply(this, args)
      }
      Object.assign(real, fn)
    },
  })

  window.__dl = []
  const push = Array.prototype.push
  Object.defineProperty(window, 'dataLayer', {
    configurable: true,
    get() {
      return window.__realDl
    },
    set(v) {
      window.__realDl = v
      v.push = function (...args) {
        for (const a of args) window.__dl.push(Array.from(a))
        return push.apply(this, args)
      }
    },
  })
}

async function run() {
  const browser = await chromium.launch({
    args: ['--disable-blink-features=AutomationControlled'],
  })
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  })
  await ctx.addInitScript(PROBE)

  const page = await ctx.newPage()
  const capiCalls = []
  const webhooks = []

  /* Beacons never leave. The calls are still recorded above. */
  await page.route(PLATFORMS, (route) => route.abort())

  /* Webhook 1 is captured from the START, not in phase B. It fires on leaving
     step 1, and it posts to the GHL inbound hook, which is a DIFFERENT host
     from the n8n webhook: intercepting it cannot touch the get_programs
     preflight. Registering it late let a real lead reach the client's CRM. */
  await page.route(/services\.leadconnectorhq\.com/i, async (route) => {
    let parsed = {}
    try {
      parsed = JSON.parse(route.request().postData() ?? '{}')
    } catch {
      /* keep the raw body */
    }
    webhooks.push({ url: route.request().url(), body: parsed })
    return route.fulfill({
      status: 200,
      headers: { 'access-control-allow-origin': '*' },
      contentType: 'application/json',
      body: '{"ok":true}',
    })
  })

  page.on('request', (req) => {
    if (req.url().includes('/api/capi')) {
      try {
        capiCalls.push(JSON.parse(req.postData() ?? '{}'))
      } catch {
        capiCalls.push({ unparsed: true })
      }
    }
  })

  // ── Phase A ────────────────────────────────────────────────────────────
  await page.goto(BASE + PAGE, { waitUntil: 'networkidle' })

  const programs = await page.waitForSelector('select#bk-program, [data-bk-program], #bk-program', { timeout: 15000 }).catch(() => null)
  if (!programs) {
    // The form may render the programme list as buttons rather than a select.
    await page.waitForSelector('#bk-name', { timeout: 15000 })
  }

  await page.fill('#bk-name', 'Auditoria Novo Dash')
  await page.fill('#bk-email', 'auditoria@novodash.com')
  await page.fill('#bk-phone', '5124286125')

  /* An adults programme, so child_name has to be OMITTED from both webhooks. */
  const picked = await page.evaluate(() => {
    const labels = [...document.querySelectorAll('button, [role="radio"], label')]
    const target = labels.find((el) => /all levels|advanced/i.test(el.textContent ?? ''))
    if (target) {
      target.click()
      return target.textContent?.trim().slice(0, 40) ?? 'clicked'
    }
    const select = document.querySelector('select')
    if (select) {
      const opt = [...select.options].find((o) => /all levels|advanced/i.test(o.textContent))
      if (opt) {
        select.value = opt.value
        select.dispatchEvent(new Event('change', { bubbles: true }))
        return opt.textContent.trim().slice(0, 40)
      }
    }
    return null
  })
  if (!picked) {
    bad('could not select an adults programme, funnel not exercised')
    await browser.close()
    return report()
  }
  ok(`programme selected from the live GHL list: ${picked}`)

  const childOnStep1 = (await page.$('#bk-child')) !== null

  await page.evaluate(() => {
    const next = [...document.querySelectorAll('button')].find((b) =>
      /continue|next|prosseguir|schedule/i.test(b.textContent ?? ''),
    )
    next?.click()
  })

  /* Step 2: the aria-pressed elements are the DAYS. The time is a button whose
     label reads like "6:00 PM", and it is the one that enables Confirm. */
  const timeButton = 'button:text-matches("^\\\\s*\\\\d{1,2}:\\\\d{2}\\\\s*(AM|PM)\\\\s*$")'
  await page.waitForSelector(timeButton, { timeout: 20000 })
  const slots = await page.$$(timeButton)
  ok(`step 2 shows ${slots.length} real time slots from the GHL calendar`)

  const leadFbq = await page.evaluate(() => window.__fbq.map((a) => a.slice(0, 2)))
  const sawLead = leadFbq.some((a) => a[1] === 'Lead')
  if (sawLead) ok('Lead fired on leaving step 1')
  else bad('Lead did not fire on leaving step 1')

  // ── Phase B ────────────────────────────────────────────────────────────
  /* Registered only now: the get_programs preflight has already happened.
     Split by BODY, never by URL glob, since both calls share one URL. */
  await page.route(/n8n\.novodash\.com/i, async (route) => {
    const body = route.request().postData() ?? '{}'
    let parsed = {}
    try {
      parsed = JSON.parse(body)
    } catch {
      /* keep the raw body */
    }
    if (parsed.action === 'get_programs') return route.continue()
    webhooks.push({ url: route.request().url(), body: parsed })
    return route.fulfill({
      status: 200,
      headers: { 'access-control-allow-origin': '*' },
      contentType: 'application/json',
      body: '{"ok":true}',
    })
  })
  await slots[0].click()
  await page.evaluate(() => {
    const confirm = [...document.querySelectorAll('button')].find((b) =>
      /confirm|confirmar/i.test(b.textContent ?? ''),
    )
    confirm?.click()
  })
  await page.waitForTimeout(3500)

  // ── Assertions ─────────────────────────────────────────────────────────
  const fbq = await page.evaluate(() => window.__fbq.map((a) => a.map((x) => (typeof x === 'object' ? x : String(x)))))
  const dl = await page.evaluate(() => window.__dl)

  const track = fbq.filter((a) => a[0] === 'track')
  const names = track.map((a) => a[1])
  const order = ['PageView', 'ViewContent', 'Lead', 'Schedule']
  if (track.length === 0) bad('no fbq track call at all')
  for (const name of order) {
    if (names.includes(name)) ok(`Meta ${name}`)
    else bad(`Meta ${name} never fired`)
  }
  const idx = (n) => names.indexOf(n)
  if (idx('Lead') !== -1 && idx('Schedule') !== -1 && idx('Lead') > idx('Schedule')) {
    bad('Lead fired after Schedule')
  }

  /* Advanced Matching: a second fbq('init') carrying hashed fields, BEFORE the
     Lead. Order is the whole assertion. */
  const initWithData = fbq.findIndex((a) => a[0] === 'init' && typeof a[2] === 'object' && a[2] !== null)
  const leadAt = fbq.findIndex((a) => a[0] === 'track' && a[1] === 'Lead')
  if (initWithData === -1) bad('no fbq init with user data, Meta gets anonymous leads')
  else if (leadAt !== -1 && initWithData > leadAt) bad('Advanced Matching ran AFTER the Lead')
  else ok('Advanced Matching set before the Lead')

  /* eventID on the three mirrored events only. PageView comes from the
     document and is not mirrored, so requiring it there fails a correct
     implementation. And "all of X" needs "some X exists" beside it: .every()
     on an empty list is true, which once passed with the pixel switched off. */
  const mirrored = track.filter((a) => ['ViewContent', 'Lead', 'Schedule'].includes(a[1]))
  if (mirrored.length === 0) bad('none of the three mirrored events fired')
  else if (mirrored.every((a) => a[3] && typeof a[3] === 'object' && 'eventID' in a[3])) {
    ok(`eventID on all ${mirrored.length} mirrored events`)
  } else bad('a mirrored event has no eventID, so browser and CAPI cannot dedupe')

  if (track.some((a) => a[2] && typeof a[2] === 'object' && 'value' in a[2])) {
    bad('a Meta event carries `value` on a free trial')
  } else ok('no `value` on any Meta event')

  /* CAPI mirror: the three events, each with the SAME event_id as the browser. */
  const capiNames = capiCalls.map((c) => c.event)
  for (const name of ['ViewContent', 'Lead', 'Schedule']) {
    if (capiNames.includes(name)) ok(`CAPI mirror ${name}`)
    else bad(`CAPI mirror missing ${name}`)
  }
  const browserIds = new Set(mirrored.map((a) => a[3]?.eventID).filter(Boolean))
  const capiIds = capiCalls.map((c) => c.event_id).filter(Boolean)
  if (capiIds.length === 0) bad('no event_id on any CAPI call')
  else if (capiIds.every((id) => browserIds.has(id))) ok('every CAPI event_id matches the browser')
  else bad('a CAPI event_id does not match the browser, so Meta will double-count')

  /* GA4 and Ads, read from the dataLayer. */
  const dlEvents = dl.filter((a) => a[0] === 'event').map((a) => a[1])
  for (const name of ['view_content', 'generate_lead', 'trial_booked']) {
    if (dlEvents.includes(name)) ok(`GA4 ${name}`)
    else bad(`GA4 ${name} never fired`)
  }
  const configs = dl.filter((a) => a[0] === 'config').map((a) => a[1])
  if (configs.includes(GA4)) ok(`GA4 configured (${GA4})`)
  else bad(`no gtag config for ${GA4}`)
  if (configs.includes(ADS)) ok(`Ads configured (${ADS})`)
  else bad(`no gtag config for ${ADS}`)

  const sendTo = dl
    .filter((a) => a[0] === 'event' && a[1] === 'conversion')
    .map((a) => a[2]?.send_to)
    .filter(Boolean)
  for (const [label, target] of [['lead', GADS_LEAD], ['trial_booked', GADS_BOOKING]]) {
    if (sendTo.includes(target)) ok(`Ads conversion ${label}`)
    else bad(`Ads conversion ${label} missing (${target})`)
  }
  if (dl.some((a) => a[0] === 'set' && a[1] === 'user_data')) ok('Enhanced Conversions user_data set')
  else bad('no gtag set user_data, so no Enhanced Conversions')

  /* The two webhooks. */
  const lead = webhooks.find((w) => w.url.includes('leadconnectorhq'))
  const booking = webhooks.find((w) => w.url.includes('landing-page-booking'))

  if (lead) {
    ok('Webhook 1 sent to the GHL inbound hook')
    if (lead.body.source) ok(`Webhook 1 source: ${lead.body.source}`)
    else bad('Webhook 1 has no source')
  } else bad('Webhook 1 never fired')

  if (booking) {
    const CONTRACT = ['parent_name', 'email', 'phone', 'calendar_id', 'location_id', 'stage', 'appointment_date', 'appointment_time', 'source']
    const keys = Object.keys(booking.body)
    const missing = CONTRACT.filter((k) => !keys.includes(k))
    const extra = keys.filter((k) => !CONTRACT.includes(k) && k !== 'child_name')
    if (missing.length === 0) ok(`Webhook 2 carries all ${CONTRACT.length} contract fields`)
    else bad(`Webhook 2 missing: ${missing.join(', ')}`)
    if (extra.length === 0) ok('Webhook 2 has no field outside the contract')
    else bad(`Webhook 2 has extra fields: ${extra.join(', ')}`)

    if (/^\d{4}-\d{2}-\d{2}$/.test(booking.body.appointment_date ?? '')) ok(`appointment_date ${booking.body.appointment_date}`)
    else bad(`appointment_date not YYYY-MM-DD: ${booking.body.appointment_date}`)
    if (/^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(booking.body.appointment_time ?? '')) ok(`appointment_time ${booking.body.appointment_time}`)
    else bad(`appointment_time not 12h: ${booking.body.appointment_time}`)

    /* child_name is the field that goes missing quietly. Step 1 showing
       #bk-child means a kids programme, and then BOTH webhooks must carry it;
       for adults BOTH must omit it. */
    const inBooking = 'child_name' in booking.body
    const inLead = lead ? 'child_name' in lead.body : false
    if (childOnStep1 && inBooking && inLead) ok('kids programme: child_name in both webhooks')
    else if (!childOnStep1 && !inBooking && !inLead) ok('adults programme: child_name omitted from both webhooks')
    else bad(`child_name mismatch (step1 field: ${childOnStep1}, lead: ${inLead}, booking: ${inBooking})`)
  } else bad('Webhook 2 never fired')

  const leadCount = webhooks.filter((w) => w.url.includes('leadconnectorhq')).length
  if (leadCount <= 1) ok(`Webhook 1 sent ${leadCount}x (once per session)`)
  else bad(`Webhook 1 sent ${leadCount}x in one session`)

  await browser.close()
  return report()
}

function report() {
  console.log(`\ntracking audit — ${BASE}${PAGE}\n`)
  for (const [state, msg] of results) {
    console.log(`  ${state === 'pass' ? 'pass' : 'FAIL'}  ${msg}`)
  }
  const failed = results.filter(([s]) => s !== 'pass')
  console.log(`\n${results.length - failed.length} passed, ${failed.length} failed`)
  if (failed.length) process.exit(1)
}

await run()
