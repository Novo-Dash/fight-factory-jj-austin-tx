// ═══════════════════════════════════════════════════════════════════════════
// staff.ts — the coaching staff.
//
// Every biography is VERBATIM from the academy's own instructor pages on
// fightfactoryjiujitsu.com. Credentials are lifted from those same pages, so
// the record shown on the About page is the academy's own claim, not ours.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * O quadro de instrutores mudou (cliente, 15/09/2026). Saíram:
 *
 *   · Tiffany Butler  — parou de treinar e de dar aula
 *   · William Tackett — mudou para Las Vegas
 *   · Andrew Tackett  — mudou para Las Vegas
 *   · Corey           — saiu (nunca esteve nesta lista, entrou depois do site)
 *
 * O cliente aprovou o site e quer publicar já, com este capítulo oculto até as
 * fotos e as bios novas chegarem: ele contratou fotógrafo e o material vem
 * nesta semana de 15/09/2026. É uma ocultação de dias, não de mês.
 *
 * O capítulo sai INTEIRO, e não só os quatro que saíram: com metade da lista
 * vencida a seção não se sustenta, e o material novo chega junto de todo modo.
 *
 * O conteúdo antigo continua aqui de propósito. Quando as bios novas chegarem,
 * o trabalho é substituir COACHES e virar esta flag para `true`. A numeração
 * dos capítulos da About é derivada dela, então ligar e desligar não deixa
 * buraco nem número repetido na sequência.
 *
 * O Rodrigo (HEAD_COACH) não faz parte da troca: ele é o fundador e segue na
 * página, no capítulo dele. Kody Steele, Davis Cole e Caleb Tackett também
 * seguem na academia; só estão esperando a mesma leva de fotos.
 */
export const SHOW_TRAINERS: boolean = false

export interface Coach {
  slug: string
  name: string
  /** How the academy titles them on its own site. */
  role: string
  /** Short credential line, shown in the record row. */
  credential: string
  /** Longer credential list for the expanded panel. */
  record: string[]
  photo: string | null
  /** VERBATIM paragraphs. */
  bio: string[]
}

export const HEAD_COACH: Coach = {
  slug: 'rodrigo-cabral',
  name: 'Rodrigo “Brucutu” Cabral',
  role: 'Head Instructor & Founder',
  credential: 'Black belt under Léo Vieira · Brazilian National Champion',
  record: [
    'Black belt awarded 2005 by Léo Vieira',
    'Brazilian National Champion',
    'Multiple-time State Champion',
    'World Championship silver medalist',
    'Founded Fight Factory Jiu Jitsu, Austin · 2013',
  ],
  photo: '/site/team/rodrigo.webp',
  bio: [
    'Rodrigo “Brucutu” Cabral, born in 1981 in Rio de Janeiro, Brazil, has dedicated his life to Brazilian Jiu-Jitsu for nearly three decades. He began training in 1996 under Ricardo Holanda “Ricardão,” where he earned his blue belt. In 1998, he joined Fredson Alves of Gracie Humaitá, achieving his purple belt in 2002. After moving to São Paulo, he was promoted to brown belt under Rocian Gracie.',
    'In 2005, Rodrigo was awarded his black belt by Léo Vieira, one of the most respected and accomplished athletes in Jiu-Jitsu history, multiple-time ADCC and World Champion.',
    'His passion for teaching soon took him around the world. In London, he became the head instructor at London Fight Factory, where he taught until 2008. He also shared his knowledge in Russia, Singapore, Italy, Sweden, and Spain, before returning to Rio de Janeiro.',
    'In 2013, Rodrigo founded Fight Factory Jiu Jitsu in Austin, Texas, which has since grown into one of the city’s premier academies. Under his leadership, the academy has produced world-class athletes including Kody Steele (UFC fighter), Andrew Tackett (UFC BJJ Champion), and William Tackett (UFC BJJ fighter). Today, Fight Factory continues to expand with affiliate schools in San Antonio, Belton, and Marble Falls, Texas.',
    'As a competitor, Rodrigo is a Brazilian National Champion, multiple-time State Champion, and World Championship silver medalist. His achievements reflect both his dedication to the art and his ability to pass on high-level knowledge to the next generation.',
    'Rodrigo remains committed to building champions on and off the mats, sharing Jiu-Jitsu as a tool for discipline, resilience, and community worldwide.',
  ],
}

export const COACHES: Coach[] = [
  {
    slug: 'andrew-tackett',
    name: 'Andrew Tackett',
    role: 'BJJ Instructor',
    credential: 'UFC BJJ Champion · 3× Jiu-Jitsu World Champion',
    record: [
      'UFC BJJ Champion',
      '3-time Jiu-Jitsu World Champion',
      '1-time Jiu-Jitsu World Champion in combat',
      'Started training at age six',
    ],
    photo: '/site/team/andrew-tackett.webp',
    bio: [
      'Hello, everyone! I’m Andrew Tackett, a 20-year-old passionate about the art of Jiu-Jitsu. I embarked on this incredible journey when I was just six years old, all thanks to my parents who recognized my boundless energy needed a constructive outlet. Little did I know that this decision would shape my life in the most profound way.',
      'By the time I turned eight, I was head over heels in love with Jiu-Jitsu. It became more than just a pastime; it became my life’s purpose. I’ve dedicated countless hours to honing my skills, pushing myself to new limits, and exploring the endless depths of this martial art.',
      'My aspirations in the world of Jiu-Jitsu are twofold. Firstly, I aim to be the best teacher possible. Sharing the knowledge and passion that I’ve acquired over the years is a calling I hold dear. I want to inspire and guide others on their own Jujitsu journeys, just as my mentors did for me. Secondly, I strive to be the best competitor possible. With the honor of being a 3-time Jiu-Jitsu World Champion and a 1-time Jiu-Jitsu World Champion in combat, I’ve demonstrated the highest level of skill, technique, and sportsmanship on the world stage. My ultimate goal is to make a lasting mark in the world of Jiu-Jitsu, leaving a legacy for generations to come.',
    ],
  },
  {
    slug: 'william-tackett',
    name: 'William Tackett',
    role: 'BJJ Instructor',
    credential: 'UFC BJJ fighter · Black belt under Rodrigo Cabral',
    record: [
      'Black belt awarded 27 March 2021 by Rodrigo Cabral',
      'Competed against top adult athletes as a minor',
      'Joined Fight Factory as a blue belt in 2017',
    ],
    photo: '/site/team/william-tackett.webp',
    bio: [
      'Born on May 14, 2001, in the picturesque Orange County, California, William Tackett’s journey into the world of martial arts began at a young age. At the tender age of 4, he embarked on a life-changing adventure when his family moved to Austin, Texas, where his story of dedication and excellence would unfold. Initially, William tried his hand at football (soccer), displaying an early passion for sports. However, fate had something extraordinary in store for him.',
      'When he was just 8 years old, a Jiu-Jitsu club sprouted in close proximity to the Tackett family’s residence. Fueled by his father’s fascination with martial arts movies, they decided to give it a try. This marked the beginning of a remarkable journey as they enrolled in classes at Team Rabadi, an esteemed affiliate of the Ribeiro Jiu-Jitsu Association. William and his brother Andrew quickly became part of the fabric of this thriving Jiu-Jitsu community.',
      'In 2017, seeking a more competitive environment to hone his skills, William Tackett crossed paths with Rodrigo Cabral’s Brazilian Fight Factory, an establishment that was quickly gaining recognition for its commitment to excellence. William, along with his brothers, joined this dynamic team, seamlessly integrating into the team and making their mark on the mats.',
      'Starting his journey as a blue belt, William’s talent and dedication shone brightly. He rapidly climbed the ranks, earning his purple and brown belts under the tutelage of Mr. Cabral. What set William apart was his ability to take on some of the sport’s top adult athletes while still grappling as a minor, a feat he continued even after reaching adulthood in 2019. On March 27, 2021, William Tackett reached the pinnacle of his Jiu-Jitsu journey as he was awarded his well-deserved black belt by his coach, Rodrigo Cabral.',
    ],
  },
  {
    slug: 'kody-steele',
    name: 'Kody Steele',
    role: 'BJJ Instructor',
    credential: 'UFC fighter · Undefeated MMA record',
    record: [
      'MMA career record 5–0',
      'Professional grappling competitor',
      'Greco-Roman, freestyle and folkstyle wrestling background',
    ],
    photo: '/site/team/kody-steele.webp',
    bio: [
      'Kody Steele’s journey in the world of combat sports has taken an exciting turn, as he sets his sights on becoming a future UFC champion. Born on April 21, 1995, in Port Angeles, Washington, USA, Kody’s remarkable career has evolved from a young wrestling enthusiast to a promising MMA prospect.',
      'Growing up in Port Angeles and Sequim, Washington, Kody Steele was an active child who explored various sports, including baseball and football. However, his true passion ignited when he discovered wrestling at the age of 13. As a club wrestler, he embraced Greco-Roman, freestyle, and folk-style wrestling, laying the groundwork for his future success in combat sports.',
      'In 2013, Kody relocated to Texas, where he encountered a lack of wrestling schools. Undeterred, he ventured into Brazilian Jiu-Jitsu, quickly finding a home at the Brazilian Fight Factory Academy under the mentorship of Coach Rodrigo Cabral. The seamless transition from wrestling to BJJ showcased his innate talent and dedication.',
      'Kody Steele’s commitment to Brazilian Jiu-Jitsu led to a meteoric rise through the colored belt divisions. His prowess in no-gi competitions earned him recognition and opportunities to compete in prestigious professional events, solidifying his reputation as a rising star in the world of grappling.',
    ],
  },
  {
    slug: 'tiffany-butler',
    name: 'Tiffany Butler',
    role: 'BJJ Instructor',
    credential: 'No-Gi World Champion 2019 · Kids programme coach',
    record: [
      'No-Gi World Champion, 2019',
      'Eleven years on the mats',
      'Three years teaching kids Jiu-Jitsu',
      'Certified Personal Trainer and Nutrition Coach',
    ],
    photo: '/site/team/tiffany-butler.webp',
    bio: [
      'Tiffany Butler’s passion for martial arts and holistic wellness comes to life. At just 20 years old, Tiffany is already a force to be reckoned with in the world of Brazilian Jiu-Jitsu.',
      'In 2019, Tiffany made her mark on the Jiu-Jitsu world by becoming the World Champion in No-Gi, an impressive feat at such a young age. Her dedication and skill were on full display as she achieved this remarkable milestone.',
      'Tiffany’s journey began 11 years ago, and her love for Brazilian Jiu-Jitsu has only grown stronger with time. Her wealth of experience and deep understanding of the sport is a testament to her dedication and commitment.',
      'Beyond her own achievements, Tiffany has been sharing her knowledge and passion with the next generation. She has been teaching kids’ Jiu-Jitsu classes for three years, nurturing young talents and instilling in them the values of discipline, respect, and perseverance.',
      'Tiffany is not just a Jiu-Jitsu champion; she’s also a certified Personal Trainer and Nutrition Coach. Her expertise in fitness and nutrition complements her martial arts journey, offering a well-rounded approach to health and wellness.',
    ],
  },
  {
    slug: 'davis-cole',
    name: 'Davis Cole',
    role: 'BJJ & MMA Coach',
    credential: 'Youth and beginner specialist · BJJ and Muay Thai',
    record: [
      'Coaches BJJ and Mixed Martial Arts',
      'Specialist in youth athletes and beginners',
      'Proficient in both BJJ and Muay Thai',
    ],
    photo: '/site/team/davis-cole.webp',
    bio: [
      'Coach Davis Cole is a highly accomplished Brazilian Jiu-Jitsu coach and Mixed Martial Arts (MMA) trainer, known for his expertise in nurturing youth athletes and beginners. A native Texan, he fell in love with BJJ and Muay Thai at a young age. Cole’s coaching philosophy centers on providing a supportive environment for beginners, fostering discipline, and instilling a strong technical foundation. His proficiency in both BJJ and Muay Thai allow his students to excel to their maximum in both grappling and striking.',
    ],
  },
  {
    slug: 'caleb-tackett',
    name: 'Caleb Tackett',
    role: 'BJJ Instructor',
    credential: 'Tackett brother · Fight Factory competition team',
    record: ['Fight Factory competition team'],
    // The academy lists Caleb on its staff page but has published no biography
    // and no full-resolution portrait. Shown as a visible marker, not invented.
    photo: null,
    bio: [],
  },
]

/** VERBATIM — the academy's own description of its coaching team. */
export const TEAM_COPY = [
  'In addition to their technical expertise, our instructors are also excellent teachers who know how to create a supportive and challenging learning environment.',
  'They understand that every student is unique and tailor their approach to meet the needs of each individual. Our instructors also prioritize safety, ensuring that all students learn and practice techniques in a safe and controlled manner. They are committed to helping our students build strong foundations in Jiu-Jitsu, and are always available to answer questions and provide feedback.',
]
