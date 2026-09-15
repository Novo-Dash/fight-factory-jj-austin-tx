// ═══════════════════════════════════════════════════════════════════════════
// record.ts — the competitive record. The academy's differentiator.
//
// Athletes and titles are the ones the academy publishes about itself; the
// recent results are its own competition-results posts. Nothing is inflated
// and no title is added that the academy does not claim.
// ═══════════════════════════════════════════════════════════════════════════

export interface Athlete {
  name: string
  title: string
  detail: string
  /** The single strongest line, right-aligned in the record row. */
  mark: string
}

/** Athletes built at Fight Factory, as the academy lists them. */
export const ATHLETES: Athlete[] = [
  {
    name: 'Andrew Tackett',
    title: 'UFC BJJ Champion',
    detail: 'Started at six. Coached here from a child to a world title.',
    mark: '3× World Champion',
  },
  {
    name: 'William Tackett',
    title: 'UFC BJJ fighter',
    detail: 'Blue belt in 2017 to black belt in 2021, all under Rodrigo Cabral.',
    mark: 'Black belt 2021',
  },
  {
    name: 'Kody Steele',
    title: 'UFC fighter',
    detail: 'Came in as a wrestler with no BJJ. Left with a professional record.',
    mark: 'MMA 5–0',
  },
  {
    name: 'Tiffany Butler',
    title: 'No-Gi World Champion',
    detail: 'Won the world title at 20, and now coaches the kids programme.',
    mark: '2019',
  },
]

/**
 * A seção 02 da home ("Built on these mats") apresenta os quatro atletas
 * abaixo com retrato e credencial. Três dos quatro saíram da academia em
 * 09/2026 (Andrew e William Tackett mudaram para Las Vegas, Tiffany Butler
 * parou de dar aula); só o Kody Steele segue. Decisão do Lucas em 15/09/2026:
 * a seção sai do ar junto com o capítulo "Our trainers" da About, para não
 * publicar rosto de quem não está mais aqui. Ver SHOW_TRAINERS em
 * content/staff.ts, que é a mesma decisão e o mesmo prazo.
 *
 * ATHLETES fica aqui inteiro de propósito. Quando o material novo chegar,
 * virar esta flag para `true` devolve a seção e renumera os capítulos da home
 * sozinho.
 *
 * ⚠️ Duas coisas saem junto, porque moram dentro de <Record />: a foto
 * full-bleed com parallax (ufc-bjj.webp, Andrew com o cinturão do UFC BJJ ao
 * lado do Rodrigo e do William) e o único fundo escuro dessa parte da home.
 */
export const SHOW_ATHLETE_RECORD: boolean = false

export interface Result {
  event: string
  date: string
  /** VERBATIM opening line from the academy's own results post. */
  line: string
  photo: string
}

/** The academy's most recent published competition results. */
export const RESULTS: Result[] = [
  {
    event: 'IBJJF Summer Open',
    date: 'August 2026',
    line: 'Our team had an outstanding showing at the IBJJF Summer Open, with Coach Sean',
    photo: '/site/results/ibjjf-summer-open.webp',
  },
  {
    event: 'Grappling Industries',
    date: 'August 2026',
    line: 'Congratulations to our athlete Luka on an incredible performance at Grappling Industries, going 4-0',
    photo: '/site/results/grappling-industries.webp',
  },
  {
    event: 'IBJJF American National',
    date: 'August 2026',
    line: 'Coach Grayson Henly Earns Silver in Black Belt Debut',
    photo: '/site/results/american-national.webp',
  },
  {
    event: 'Elevate Superfight',
    date: 'June 2026',
    line: 'Alicia takes the win at the Elevate superfight.',
    photo: '/site/results/elevate-superfight.webp',
  },
]

/** The credentials ticker. Data, never slogans. */
export const TICKER = [
  'UFC BJJ Champion',
  '3× Jiu-Jitsu World Champion',
  'No-Gi World Champion',
  'Black belt under Léo Vieira',
  'Brazilian National Champion',
  'IBJJF No-Gi Worlds',
  'ADCC competitors on the mat',
  'Est. Austin 2013',
]

/**
 * The academy's milestones. Every year here is one the academy states itself in
 * Rodrigo's biography — nothing is dated by inference. The UFC BJJ title has no
 * published date on their site, so it is marked "Now" rather than guessed.
 *
 * ⚠️ 15/09/2026: o Andrew Tackett mudou para Las Vegas, então o verbo desse
 * marco saiu do presente ("holds" → "took"): o título foi conquistado treinando
 * aqui e isso segue verdade, mas a página não afirma mais que ele é do quadro
 * de hoje. O rótulo continua "Now" porque a data do título continua sem fonte
 * publicada, e chutar um ano seria pior. Com o ano confirmado pelo cliente,
 * trocar "Now" pelo ano fecha o marco.
 */
export interface Milestone {
  year: string
  title: string
  text: string
  photo: string
  alt: string
}

export const MILESTONES: Milestone[] = [
  {
    year: '1996',
    title: 'First class',
    text: 'Rodrigo begins training in Rio de Janeiro under Ricardo Holanda “Ricardão”, where he earns his blue belt.',
    photo: '/site/rail/backlit.webp',
    alt: 'A gi lit from behind at the edge of the mat',
  },
  {
    year: '2005',
    title: 'Black belt',
    text: 'Awarded by Léo Vieira, multiple-time ADCC and World Champion, and one of the most accomplished athletes in the sport.',
    photo: '/site/home/rodrigo-mat.webp',
    alt: 'Rodrigo Cabral in his black gi',
  },
  {
    year: '2013',
    title: 'Austin',
    text: 'Fight Factory Jiu Jitsu opens on Research Boulevard, after teaching stints in London, Russia, Singapore, Italy, Sweden and Spain.',
    photo: '/site/facility/mat-a.webp',
    alt: 'The main mat at the Austin academy',
  },
  {
    year: '2021',
    title: 'Home-grown black belt',
    text: 'William Tackett receives his black belt from Rodrigo, four years after walking in as a blue belt.',
    photo: '/site/team/william-tackett.webp',
    alt: 'William Tackett in his black gi',
  },
  {
    year: 'Now',
    title: 'UFC BJJ champion',
    text: 'Andrew Tackett, coached here since he was a child, took the UFC BJJ title, alongside three Jiu-Jitsu world titles.',
    photo: '/site/home/ufc-bjj.webp',
    alt: 'Andrew Tackett with the UFC BJJ championship belt',
  },
]
