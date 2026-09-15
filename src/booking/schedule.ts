// =============================================================================
// schedule.ts — Tipos + helpers de data/hora + exceções da academia
// -----------------------------------------------------------------------------
// Fight Factory Jiu Jitsu — Austin, TX (sub-account GHL 7ai3O8KqknYgJu59oYfE)
//
// ⭐ A lista de turmas NÃO mora aqui (§5): programas E horários vêm AO VIVO do
// GHL numa chamada só (get_programs via n8n, §5.1). Este módulo guarda apenas
// o que o GHL não sabe — exceções por calendar_id e as constantes fixas.
// Turma criada no GHL aparece na página sozinha, sem deploy.
// =============================================================================

export type Audience = 'adults' | 'kids'

/** Disponibilidade ao vivo: "YYYY-MM-DD" → ["HH:MM", …] (hora local, 24h). */
export type SlotMap = Record<string, string[]>

/** Uma turma, exatamente como o n8n devolve (§5.1). Nada disso é escrito à mão. */
export type Program = {
  calendar_id: string // casa o calendário no Webhook 2 (imune a rename)
  name: string // nome do calendário no GHL = `program` do Webhook 1
  audience: Audience // vem do grupo do calendário no GHL — nunca recalcular
  duration_minutes: number | null
  capacity: number
  slots: SlotMap
  slots_error: string | null
}

/**
 * Exceções, e SÓ exceções. Chave = calendar_id.
 *   label → apelido bonito, quando o nome do GHL não serve para o público
 *   hide  → não aparece na página (ex.: 1:1, avaliação individual)
 * Calendário sem entrada aqui entra normalmente, com o próprio nome do GHL.
 * Começa VAZIO numa academia nova; só se preenche quando alguém pedir.
 */
export const PROGRAM_OVERRIDES: Record<string, { label?: string; hide?: true }> = {}

/** Apelido é só visual — os webhooks levam sempre o nome cru do GHL. */
export function displayName(p: Program): string {
  return PROGRAM_OVERRIDES[p.calendar_id]?.label ?? p.name
}

export const BOOKING_RANGE_DAYS = 14 // janela fixa, igual para todas as academias

export const ACADEMY_ADDRESS = {
  name: 'Fight Factory Jiu Jitsu',
  street: '9607 Research Blvd, Suite 675',
  city: 'Austin, TX 78759',
  phone: '(512) 905-0644',
  mapsUrl: 'https://www.google.com/maps/place/?q=place_id:ChIJeU0gUonMRIYR-Sw3F407_zo',
}

// -----------------------------------------------------------------------------
// Helpers de data/hora (lógica idêntica entre academias)
// -----------------------------------------------------------------------------

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function addDays(d: Date, days: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + days)
  return r
}

/** "2026-06-15" → Date local (NÃO usar new Date(str), que parseia como UTC). */
export function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Janela agendável: de hoje até hoje + BOOKING_RANGE_DAYS (datas locais). */
export function getBookingWindow(): { min: Date; max: Date } {
  const min = startOfDay(new Date())
  return { min, max: addDays(min, BOOKING_RANGE_DAYS) }
}

/** Horários do dia para a data, lendo o mapa que veio do GHL (§5.1). */
export function getTimesForDay(slots: SlotMap, date: Date): string[] {
  return slots[isoDate(date)] ?? []
}

/** Data agendável: dentro da janela E com pelo menos um horário no mapa. */
export function isDateBookable(slots: SlotMap, date: Date): boolean {
  const { min, max } = getBookingWindow()
  const d = startOfDay(date)
  if (d.getTime() < min.getTime() || d.getTime() > max.getTime()) return false
  return (slots[isoDate(date)]?.length ?? 0) > 0
}

/** Primeira data agendável do mapa (ou null). O calendário abre no mês dela. */
export function getFirstBookableDate(slots: SlotMap): Date | null {
  const keys = Object.keys(slots)
    .filter((k) => (slots[k]?.length ?? 0) > 0)
    .sort()
  for (const k of keys) {
    const d = parseLocalDate(k)
    if (isDateBookable(slots, d)) return d
  }
  return null
}

/**
 * "18:15" → "6:15 PM". É ESTA função que produz o `appointment_time`
 * (12h + AM/PM) — o formato que o Luxon do workflow n8n consegue parsear.
 * NUNCA enviar 24h ("18:15") para o webhook.
 */
export function formatTimeLabel(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  let hour = h % 12
  if (hour === 0) hour = 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

/**
 * Data local → "YYYY-MM-DD". NÃO usar toISOString() (UTC desloca o dia).
 * É o que vai no `appointment_date` do Webhook 2.
 */
export function isoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** "Monday, June 2" — exibição. */
export function formatDateLong(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

/** "June 2026" — exibição do cabeçalho do calendário. */
export function formatMonthYear(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
