// ═══════════════════════════════════════════════════════════════════════════
// tracking-audit-kit.mjs — roda o funil da LP NO KIT `src/nd` de verdade e
// afirma o checklist Novo Dash inteiro.
//
// Por que existe um segundo script: `tracking-audit.mjs` nasceu para o
// formulário próprio (`src/booking`), que tem ids estáveis (`#bk-name`). O kit
// monta os ids com o `useId()` do React (`_r_0_-name`), então aquele script
// expira no waitForSelector e não audita nada. Este encontra os campos por
// TIPO e por rótulo, que é o que o kit garante.
//
// ⛔ Nenhum POST sai para o CRM: o Webhook 1 parte já na etapa 1, então as
//    rotas são interceptadas ANTES do goto, nunca depois.
//
//   BASE=https://lp.fightfactoryjiujitsu.com node scripts/tracking-audit-kit.mjs
// ═══════════════════════════════════════════════════════════════════════════

/* O playwright nao e dependencia da LP (nao vai para o bundle do cliente).
   Resolve de qualquer node_modules da maquina, como o audit irmao faz, mas
   procurando em vez de fixar um caminho de um repo que pode sumir. */
import { existsSync } from 'node:fs'
import { readdirSync } from 'node:fs'
const DOCS = '/Users/lucasaraujocabral/Documents'
function findPlaywright() {
  if (process.env.PLAYWRIGHT_PATH) return process.env.PLAYWRIGHT_PATH
  for (const d of readdirSync(DOCS)) {
    const c = `${DOCS}/${d}/node_modules/playwright/index.mjs`
    if (existsSync(c)) return c
  }
  throw new Error('playwright nao encontrado; use PLAYWRIGHT_PATH=/caminho/index.mjs')
}
const { chromium } = await import(findPlaywright())

const BASE = process.env.BASE ?? 'https://lp.fightfactoryjiujitsu.com'
const EXPECTED = { pixel: '4326414901006955', ga4: 'G-RM8ZE8H789', ads: 'AW-18177687947' }

const passes = []
const fails = []
const ok = (m) => passes.push(m)
const bad = (m) => fails.push(m)

const browser = await chromium.launch({ args: ['--disable-blink-features=AutomationControlled'] })
const page = await browser.newPage({
  viewport: { width: 1280, height: 1000 },
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
})

/* ── Instrumentação antes de qualquer script da página ────────────────────
   fbq com pixel real emite beacon, mas a prova que não depende de rede é a
   CHAMADA. gtag idem: o dataLayer guarda tudo. */
await page.addInitScript(() => {
  window.__fb = []
  let realFbq
  Object.defineProperty(window, 'fbq', {
    configurable: true,
    get() { return realFbq },
    set(fn) {
      realFbq = function (...a) { window.__fb.push(a); return fn.apply(this, a) }
      Object.assign(realFbq, fn)
    },
  })
  window.__ga = []
  let realGtag
  Object.defineProperty(window, 'gtag', {
    configurable: true,
    get() { return realGtag },
    set(fn) {
      realGtag = function (...a) { window.__ga.push(a); return fn.apply(this, a) }
      Object.assign(realGtag, fn)
    },
  })
})

/* ── Captura dos webhooks e do CAPI, sem deixar nada chegar ───────────── */
const sent = []
await page.route(/leadconnectorhq\.com|n8n\.novodash|\/api\/capi/i, async (route) => {
  const req = route.request()
  let body = {}
  try { body = JSON.parse(req.postData() || '{}') } catch { body = { raw: req.postData() } }
  // o get_programs precisa passar, senão a etapa 2 não tem o que mostrar
  if (body.action === 'get_programs' || body.action === 'get_slots') return route.continue()
  sent.push({ url: req.url(), body })
  return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' })
})

/* Entrar COM atribuicao. Sem parametro na URL nao existe utm/gclid/fbclid
   para capturar, e o check de atribuicao reprovaria um funil correto. */
const ENTRY = BASE + '/?utm_source=facebook&utm_medium=paid&utm_campaign=audit&gclid=AUDIT_GCLID&fbclid=AUDIT_FBCLID'
await page.goto(ENTRY, { waitUntil: 'networkidle' })
await page.waitForTimeout(1800)

/* ── Etapa 1 ───────────────────────────────────────────────────────────── */
const cta = await page.$('text=/book.*free trial|schedule free trial/i')
if (!cta) { bad('nenhum CTA de agendamento encontrado na LP'); }
else {
  await cta.click({ force: true }).catch(() => {})
  await page.waitForTimeout(2000)
  /* O kit nao declara type="text" no nome (o default do HTML ja e text), entao
     `input[type="text"]` NAO casa. O id vem do useId() e termina em "-name". */
  const name = await page.$('input[id$="-name"], input[type="text"]')
  const email = await page.$('input[type="email"]')
  const phone = await page.$('input[type="tel"]')
  if (name && email && phone) ok('etapa 1 do kit abriu com nome, e-mail e telefone')
  else bad(`etapa 1 incompleta (nome:${!!name} email:${!!email} tel:${!!phone})`)

  if (name) await name.fill('ND TEMPLATE TEST')
  if (email) await email.fill('templatetest@novodash.com')
  if (phone) await phone.fill('5550405060')

  const progs = await page.$$('input[type="radio"]')
  if (progs.length) { ok(`${progs.length} turmas vieram da lista do app`); await progs[0].check().catch(()=>{}) }
  else bad('nenhuma turma listada na etapa 1')

  const next = await page.$('button:has-text("Next"), button:has-text("Continue"), button[type="submit"]')
  if (next) { await next.click({ force: true }).catch(()=>{}); await page.waitForTimeout(4000) }

  /* ── Etapa 2: calendario ao vivo do GHL, e so entao Confirmar ──────────
     ⚠️ As buscas sao ESCOPADAS no painel do formulario. A LP tem 7 botoes
     "Book a free trial class" no corpo da pagina, e um seletor global pega
     um deles em vez do botao do passo, dando falso "passou". */
  const panel = (await page.$('[role="dialog"]')) ?? (await page.$('.nd')) ?? page

  /* O calendario mostra o mes; o dia indisponivel vem disabled. */
  const days = await panel.$$('button:not([disabled])')
  let picked = false
  for (const d of days) {
    const t = (await d.textContent() ?? '').trim()
    if (/^\d{1,2}$/.test(t)) { await d.click({ force: true }).catch(()=>{}); picked = true; break }
  }
  if (picked) { ok('etapa 2: dia disponivel escolhido no calendario do GHL'); await page.waitForTimeout(2500) }
  else bad('etapa 2: nenhum dia disponivel no calendario')

  /* Com o dia escolhido, aparecem as horas reais daquele calendario. */
  const times = []
  for (const btn of await panel.$$('button:not([disabled])')) {
    const t = (await btn.textContent() ?? '').trim()
    if (/^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(t)) times.push(btn)
  }
  if (times.length) {
    ok(`etapa 2 mostra ${times.length} horario(s) reais do calendario`)
    await times[0].click({ force: true }).catch(()=>{})
    await page.waitForTimeout(900)
    let confirm = null
    for (const btn of await panel.$$('button:not([disabled])')) {
      const t = (await btn.textContent() ?? '').trim()
      if (/^(confirm|confirmar)/i.test(t)) { confirm = btn; break }
    }
    if (confirm) { await confirm.click({ force: true }).catch(()=>{}); await page.waitForTimeout(5000); ok('etapa 2: Confirmar acionado') }
    else bad('etapa 2 sem botao Confirmar')
  } else bad('etapa 2 nao mostrou horario: o calendario do GHL nao carregou')
}

const fb = await page.evaluate(() => window.__fb || [])
const ga = await page.evaluate(() => window.__ga || [])

/* ── Meta ──────────────────────────────────────────────────────────────── */
const fbEvents = fb.filter((a) => a[0] === 'track' || a[0] === 'trackCustom').map((a) => a[1])
const inits = fb.filter((a) => a[0] === 'init')
for (const ev of ['PageView', 'ViewContent', 'Lead', 'Schedule']) {
  if (fbEvents.includes(ev)) ok(`Meta ${ev}`)
  else bad(`Meta ${ev} NAO disparou`)
}
const BANNED = ['Purchase', 'AddToCart', 'InitiateCheckout', 'CompleteRegistration', 'AddPaymentInfo']
const strays = fbEvents.filter((e) => BANNED.includes(e))
if (strays.length === 0) ok('nenhum evento de e-commerce no Meta')
else bad(`evento fora do padrao: ${strays.join(', ')}`)

if (inits.some((a) => a[1] === EXPECTED.pixel)) ok(`pixel ${EXPECTED.pixel} inicializado`)
else bad(`fbq('init') nao usou ${EXPECTED.pixel} (veio: ${inits.map(a=>a[1]).join(',') || 'nada'})`)

const withValue = fb.filter((a) => a[2] && typeof a[2] === 'object' && 'value' in a[2])
if (withValue.length === 0) ok('nenhum evento Meta carrega `value` (a aula e gratis)')
else bad(`${withValue.length} evento(s) Meta com value`)

const am = inits.find((a) => a[2] && typeof a[2] === 'object' && ('em' in a[2] || 'ph' in a[2]))
const leadIdx = fb.findIndex((a) => a[1] === 'Lead')
const amIdx = fb.findIndex((a) => a === am)
if (am && leadIdx > -1 && amIdx < leadIdx) ok('Advanced Matching definido ANTES do Lead')
else if (!am) bad('Advanced Matching ausente: fbq("init") sem em/ph')
else bad('Advanced Matching veio DEPOIS do Lead')

const evIds = fb.filter((a) => a[3] && a[3].eventID).map((a) => a[1])
if (evIds.length >= 2) ok(`eventID nos eventos espelhados (${[...new Set(evIds)].join(', ')})`)
else bad(`eventID ausente: so ${evIds.length} evento(s) o declaram`)

/* ── GA4 e Ads ─────────────────────────────────────────────────────────── */
const gaCfg = ga.filter((a) => a[0] === 'config').map((a) => a[1])
if (gaCfg.includes(EXPECTED.ga4)) ok(`GA4 configurado (${EXPECTED.ga4})`)
else bad(`GA4 ${EXPECTED.ga4} nao configurado (veio: ${gaCfg.join(',') || 'nada'})`)
if (gaCfg.includes(EXPECTED.ads)) ok(`Ads configurado (${EXPECTED.ads})`)
else bad(`Ads ${EXPECTED.ads} nao configurado`)

const gaEvents = ga.filter((a) => a[0] === 'event').map((a) => a[1])
for (const ev of ['view_content', 'generate_lead', 'trial_booked']) {
  if (gaEvents.includes(ev)) ok(`GA4 ${ev}`)
  else bad(`GA4 ${ev} NAO disparou`)
}
const conv = ga.filter((a) => a[0] === 'event' && a[1] === 'conversion')
if (conv.length) ok(`${conv.length} conversao(oes) do Ads disparada(s)`)
else bad('nenhuma conversao do Ads')
const userData = ga.find((a) => a[0] === 'set' && a[1] === 'user_data')
if (userData) ok('Enhanced Conversions: user_data definido')
else bad('Enhanced Conversions ausente (sem gtag("set","user_data"))')

/* ── GTM nunca ─────────────────────────────────────────────────────────── */
const html = await page.content()
if (!/gtm\.js|GTM-/.test(html)) ok('zero GTM na pagina')
else bad('GTM encontrado na pagina')

/* ── Webhooks ──────────────────────────────────────────────────────────── */
const lead = sent.find((s) => /leadconnectorhq/i.test(s.url))
if (lead) {
  ok('Webhook 1 enviado ao hook do GHL')
  if (lead.body.source) ok(`Webhook 1 source: ${lead.body.source}`)
  else bad('Webhook 1 sem `source`')
  const attribution = ['utm_source', 'gclid', 'fbclid'].filter((k) => k in lead.body)
  if (attribution.length) ok(`Webhook 1 carrega atribuicao (${attribution.join(', ')})`)
  else bad('Webhook 1 sem campo de atribuicao')
} else bad('Webhook 1 NAO saiu: o lead nao chega ao CRM')

/* ── Webhook 2: o contrato e fixo, nem um campo a mais nem a menos ───── */
/* Os 9 campos, conferidos contra os DOIS emissores deste repo (src/nd/webhook.ts
   do kit e src/booking/webhook.ts do site), que mandam o mesmo conjunto. O nome
   do titular e `parent_name`, nao `name`: o workflow faz split em first/last, e
   `child_name` so aparece em turma de kids. `program` NAO existe no contrato —
   quem casa a turma e o `calendar_id`, que e imune a renomear a aula. */
const CONTRACT = ['parent_name','email','phone','calendar_id','location_id','stage','appointment_date','appointment_time','source']
const booking = sent.find((s) => /n8n\.novodash/i.test(s.url) && s.body && 'appointment_date' in (s.body || {}))
if (booking) {
  ok('Webhook 2 (booking) enviado')
  const missing = CONTRACT.filter((k) => !(k in booking.body))
  if (missing.length === 0) ok('Webhook 2 carrega os 9 campos do contrato')
  else bad(`Webhook 2 sem: ${missing.join(', ')}`)
  const extra = Object.keys(booking.body).filter((k) => !CONTRACT.includes(k) && k !== 'child_name' && k !== 'action')
  if (extra.length === 0) ok('Webhook 2 sem campo fora do contrato')
  else bad(`Webhook 2 com campo extra: ${extra.join(', ')}`)
} else bad('Webhook 2 NAO saiu: o agendamento nao chega ao CRM')

const capi = sent.filter((s) => /\/api\/capi/.test(s.url))
if (capi.length) ok(`CAPI espelhou ${capi.length} evento(s) no servidor`)
else bad('CAPI nao recebeu nada: o espelho server-side esta mudo')
const capiIds = capi.map((c) => c.body?.event_id).filter(Boolean)
if (capi.length && capiIds.length === capi.length) ok('todo evento do CAPI leva event_id do browser')
else if (capi.length) bad('evento do CAPI sem event_id: a Meta vai contar em dobro')

await browser.close()

console.log(`\ntracking audit (kit) — ${BASE}\n`)
for (const p of passes) console.log(`  pass  ${p}`)
for (const f of fails) console.log(`  FAIL  ${f}`)
console.log(`\n${passes.length} passed, ${fails.length} failed`)
process.exit(fails.length ? 1 : 0)
