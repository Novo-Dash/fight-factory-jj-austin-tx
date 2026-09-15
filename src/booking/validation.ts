import type { BookingData } from './types'

/**
 * Máscara de telefone US "(555) 555-5555", aplicada enquanto digita.
 * Aceita colar E.164 (+15555555555 → remove o código de país) e corta em 10 dígitos.
 * Progressiva: ") " e "-" só entram quando há dígitos depois deles, para o
 * backspace não "travar" no separador.
 */
export function formatUSPhone(raw: string): string {
  let d = raw.replace(/\D/g, '')
  if (d.length === 11 && d.startsWith('1')) d = d.slice(1)
  d = d.slice(0, 10)
  if (!d.length) return ''
  if (d.length <= 3) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}

/**
 * Validação da Etapa 1: nome ≥ 2 chars, e-mail válido, telefone ≥ 10 dígitos,
 * programa escolhido (objeto vindo do GHL). Se o programa for de kids
 * (audience do GHL, nunca recalculado pelo nome), exige o nome da criança.
 */
export function isStep1Valid(data: BookingData): boolean {
  const nameOk = data.name.trim().length >= 2
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())
  const phoneOk = data.phone.replace(/\D/g, '').length >= 10
  const programOk = data.program != null
  const childOk =
    data.program?.audience === 'kids'
      ? (data.childName ?? '').trim().length >= 2
      : true
  return nameOk && emailOk && phoneOk && programOk && childOk
}
