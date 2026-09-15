import type { Program } from './schedule'

/** Estado do formulário de booking (compartilhado entre modal e /book). */
export interface BookingData {
  /**
   * "Seu nome" — o responsável que preenche. É o Full Name do contato no GHL
   * e vira o `parent_name` no Webhook 2 (parent_name === nome do contato).
   */
  name: string
  /** Nome da criança — só aparece/é exigido quando o programa é de kids. */
  childName?: string
  email: string
  phone: string
  /** Turma escolhida — objeto vindo AO VIVO do GHL (get_programs, §5.1). */
  program: Program | null
  /** Data escolhida na Etapa 2 (local). */
  date: Date | null
  /** Horário escolhido na Etapa 2, em 24h "HH:MM". */
  time: string | null
}
