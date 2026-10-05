// ═══════════════════════════════════════════════════════════════════════════
// check-tracking-ids.mjs — static tracking check. Runs on every build.
//
// It exists because the failures it catches are SILENT. A pixel that differs
// between the page and the CAPI mirror does not lose events, it doubles them
// in one ad account and hides them in another. A document shipped without the
// GA4 loader reports nothing and looks fine. An Ads id without its conversion
// label fires no conversion and says nothing. None of that shows up in a
// browser, in a build log, or in a screenshot.
//
// Source of truth is the client's row in Supabase (conversoes_tracking); the
// repository is a copy of it. The values below were read from that row on
// 15/09/2026 and are asserted here so a divergence breaks the build instead of
// quietly costing a month of attribution.
//
//   node scripts/check-tracking-ids.mjs           # report, exit 1 on failure
// ═══════════════════════════════════════════════════════════════════════════

import { readFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/* From public.conversoes_tracking, row "Fight Factory JJ - Austin TX". */
const EXPECTED = {
  pixel: '4326414901006955',
  ga4: 'G-RM8ZE8H789',
  ads: 'AW-18177687947',
  leadLabel: 'nG6XCNHClr4cEIuD5ttD',
  bookingLabel: 'bWvTCJnblr4cEIuD5ttD',
}

/* Every document a visitor can land on. The blog's are generated into /blog by
   scripts/blog-entries.mjs, so they are discovered rather than listed: a post
   added later has to be covered too, and a list would not know about it. */
async function documents() {
  const fixed = ['index.html', 'home.html', 'about.html', 'programs.html', 'schedule.html', 'contact.html']
  const found = fixed.filter((f) => existsSync(join(ROOT, f)))

  const blogDir = join(ROOT, 'blog')
  if (existsSync(blogDir)) {
    for (const entry of await readdir(blogDir, { withFileTypes: true })) {
      if (entry.isFile() && entry.name === 'index.html') found.push('blog/index.html')
      if (entry.isDirectory() && existsSync(join(blogDir, entry.name, 'index.html'))) {
        found.push(`blog/${entry.name}/index.html`)
      }
    }
  }
  return found
}


/* ── Dois modelos de tracking convivem neste repo ─────────────────────────
   A LP migrou para o kit `src/nd` em 24/09/2026: o `index.html` dela nao
   tem mais os ids literais, tem o bloco `nd:tracking` com
   `window.__ND = {pixel, ga4, ads, clarity}`, e o snippet chama
   `fbq('init', n.pixel)` / `gtag('config', n.ga4)` lendo desse objeto.
   O site institucional e o blog seguem com os ids escritos no HTML.

   Procurar so o literal reprovava o documento do kit dizendo "no fbq('init')"
   numa pagina cujo tracking esta certo. Entao: documento com `window.__ND`
   e conferido PELO __ND, o resto pelo literal. O que nao muda e a regra —
   todo documento tem de declarar os tres ids, e serem os do Supabase. */
function ndBlock(source) {
  const m = source.match(/window\.__ND\s*=\s*(\{[^<]*?\})\s*<\/script>/)
  if (!m) return null
  try { return JSON.parse(m[1]) } catch { return 'unparsable' }
}

const fails = []
const notes = []
const fail = (msg) => fails.push(msg)

const html = {}
for (const file of await documents()) {
  html[file] = await readFile(join(ROOT, file), 'utf8')
}
const docNames = Object.keys(html)
if (docNames.length < 6) fail(`Only ${docNames.length} documents found; expected the site plus the blog`)

const analytics = await readFile(join(ROOT, 'src/booking/analytics.ts'), 'utf8')
const capi = existsSync(join(ROOT, 'api/capi.ts'))
  ? await readFile(join(ROOT, 'api/capi.ts'), 'utf8')
  : null

/* ── 1. The pixel in all three places ─────────────────────────────────────
   The page, the client module and the server mirror. A mismatch is the
   expensive one: it splits a funnel across two ad accounts. */
for (const [file, source] of Object.entries(html)) {
  const nd = ndBlock(source)
  if (nd === 'unparsable') {
    fail(`${file}: the nd:tracking block is not valid JSON, so no id reaches the page`)
    continue
  }
  if (nd) {
    /* Kit: o id vive no __ND e o snippet faz fbq('init', n.pixel). */
    if (!nd.pixel) fail(`${file}: nd:tracking has no pixel, the page reports no PageView`)
    else if (nd.pixel !== EXPECTED.pixel) fail(`${file}: pixel ${nd.pixel} is not ${EXPECTED.pixel}`)
    if (!/fbq\('init'/.test(source)) fail(`${file}: nd:tracking is there but nothing calls fbq('init')`)
    continue
  }
  const ids = [...source.matchAll(/fbq\('init',\s*'(\d+)'\)/g)].map((m) => m[1])
  if (ids.length === 0) fail(`${file}: no fbq('init') call, the page reports no PageView`)
  for (const id of ids) {
    if (id !== EXPECTED.pixel) fail(`${file}: pixel ${id} is not ${EXPECTED.pixel}`)
  }
}
if (!analytics.includes(`'${EXPECTED.pixel}'`)) {
  fail(`src/booking/analytics.ts: PIXEL_ID is not ${EXPECTED.pixel}`)
}
if (capi === null) {
  fail('api/capi.ts is missing, so no event is mirrored into the Conversions API')
} else if (!capi.includes(`'${EXPECTED.pixel}'`)) {
  fail(`api/capi.ts: PIXEL_ID is not ${EXPECTED.pixel}`)
}

/* ── 2. GA4 and Ads on every document ─────────────────────────────────────
   A document without the GA4 loader is invisible in reporting, and the ones
   for the site and the blog are written by hand and by a generator, which is
   exactly where one gets forgotten. */
for (const [file, source] of Object.entries(html)) {
  const nd = ndBlock(source)
  if (nd && nd !== 'unparsable') {
    /* Kit: o loader e montado do __ND, entao a asercao e sobre os valores. */
    if (nd.ga4 !== EXPECTED.ga4) fail(`${file}: nd:tracking ga4 is ${nd.ga4 ?? 'missing'}, not ${EXPECTED.ga4}`)
    if (nd.ads !== EXPECTED.ads) fail(`${file}: nd:tracking ads is ${nd.ads ?? 'missing'}, not ${EXPECTED.ads}`)
    if (!/gtag\('config',\s*n\.ga4\)/.test(source)) fail(`${file}: nd:tracking has ga4 but nothing configures it`)
    if (!/gtag\('config',\s*n\.ads\)/.test(source)) fail(`${file}: nd:tracking has ads but nothing configures it`)
    continue
  }
  if (!source.includes(`gtag/js?id=${EXPECTED.ga4}`)) {
    fail(`${file}: the gtag loader does not use ${EXPECTED.ga4}`)
  }
  if (!source.includes(`gtag('config', '${EXPECTED.ga4}')`)) {
    fail(`${file}: no gtag config for ${EXPECTED.ga4}, so no page_view`)
  }
  if (!source.includes(`gtag('config', '${EXPECTED.ads}')`)) {
    fail(`${file}: no gtag config for ${EXPECTED.ads}, so no remarketing tag`)
  }
}

/* ── 3. Ads conversions: both labels, or neither ──────────────────────────
   An id with a missing label fires nothing and reports nothing. */
const hasAdsId = analytics.includes(EXPECTED.ads)
const hasLead = analytics.includes(EXPECTED.leadLabel)
const hasBooking = analytics.includes(EXPECTED.bookingLabel)
if (hasAdsId && !(hasLead && hasBooking)) {
  fail(`analytics.ts: ${EXPECTED.ads} is set but a conversion label is missing (lead: ${hasLead}, booking: ${hasBooking})`)
}
if (!hasAdsId) notes.push('analytics.ts has no Google Ads id; conversions are a no-op by design')

/* ── 4. The four Meta events, and only those ──────────────────────────────
   Anything else on this stack means a second source of truth. */
const STANDARD = ['PageView', 'ViewContent', 'Lead', 'Schedule']
const BANNED = ['Purchase', 'AddToCart', 'InitiateCheckout', 'CompleteRegistration', 'AddPaymentInfo']

/* Matched as a CALL, never as a bare string. "Schedule" is also a nav label in
   content/site.ts, and a loose grep counts that as a tracking event: the check
   would pass on a page that reports nothing. The events fire from the booking
   module, not from analytics.ts alone, so the whole folder is read. */
const EVENT_CALL = /(?:fbqTrack|fbq)\(\s*(?:'track',\s*)?'(PageView|ViewContent|Lead|Schedule|Purchase|AddToCart|InitiateCheckout|CompleteRegistration|AddPaymentInfo)'/g

const bookingSources = []
for (const entry of await readdir(join(ROOT, 'src/booking'))) {
  if (/\.(ts|tsx)$/.test(entry)) {
    bookingSources.push(await readFile(join(ROOT, 'src/booking', entry), 'utf8'))
  }
}

const events = new Set()
for (const source of [...Object.values(html), ...bookingSources]) {
  for (const m of source.matchAll(EVENT_CALL)) events.add(m[1])
}
for (const name of STANDARD) {
  if (!events.has(name)) fail(`Meta event ${name} appears nowhere`)
}
for (const name of BANNED) {
  if (events.has(name)) fail(`Meta event ${name} should not be on this stack`)
}

/* ── 5. The bans ──────────────────────────────────────────────────────────
   No GTM (a container would double every event), and no `value` on a free
   trial. Both are cheap to check and expensive to discover in a report. */
for (const [file, source] of Object.entries(html)) {
  if (/gtm\.js|GTM-[A-Z0-9]/.test(source)) fail(`${file}: Google Tag Manager, which would double every event`)
}
const bookingDir = join(ROOT, 'src/booking')
for (const entry of await readdir(bookingDir)) {
  if (!/\.(ts|tsx)$/.test(entry)) continue
  const source = await readFile(join(bookingDir, entry), 'utf8')
  if (/gtm\.js|GTM-[A-Z0-9]/.test(source)) fail(`src/booking/${entry}: Google Tag Manager`)
  for (const line of source.split('\n')) {
    if (/^\s*value:/.test(line)) fail(`src/booking/${entry}: "value:" on a free trial (${line.trim()})`)
  }
}

/* ── 6. Attribution: the two pieces that are about WHO, not WHETHER ───────
   These are the ones that were missing on other repos built to the same
   model, because nothing visibly breaks without them. */
if (!/export function identify\b/.test(analytics)) {
  fail('analytics.ts: no identify(), so Meta gets anonymous leads (Advanced Matching)')
}
if (!/gtag\('set',\s*'user_data'/.test(analytics)) {
  fail("analytics.ts: no gtag('set','user_data'), so no Enhanced Conversions")
}
const form = await readFile(join(ROOT, 'src/booking/BookingForm.tsx'), 'utf8')
const atIdentify = form.indexOf('identify(')
const atLead = form.search(/fbqTrack\('Lead'|trackLead\(/)
if (atIdentify === -1) fail('BookingForm.tsx: identify() is never called')
if (atLead !== -1 && atIdentify > atLead) {
  fail('BookingForm.tsx: identify() runs AFTER the Lead event, so that Lead is still anonymous')
}

/* ── 7. eventID on the three mirrored events ──────────────────────────────
   PageView is deliberately exempt: it fires from the document and is not
   mirrored, so demanding an eventID there fails a correct implementation. */
if (!/eventID/.test(analytics)) {
  fail('analytics.ts: no eventID, so browser and CAPI events cannot be deduplicated')
}

/* ── Report ───────────────────────────────────────────────────────────────── */
console.log(`tracking check: ${docNames.length} documents`)
for (const note of notes) console.log(`  note  ${note}`)
if (fails.length === 0) {
  console.log(`  pass  pixel ${EXPECTED.pixel} · GA4 ${EXPECTED.ga4} · Ads ${EXPECTED.ads} + 2 labels`)
  console.log('  pass  4 Meta events, no GTM, no value, Advanced Matching before Lead, CAPI mirror with eventID')
} else {
  for (const f of fails) console.error(`  FAIL  ${f}`)
  console.error(`\n${fails.length} tracking problem(s).`)
  process.exit(1)
}
