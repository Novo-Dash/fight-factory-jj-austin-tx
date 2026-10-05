/**
 * Microsoft Clarity: mapa de calor, gravação de sessão e funil de saída.
 *
 * O snippet do index.html cria `window.clarity` como FILA antes do script
 * chegar, então chamar daqui é seguro desde o primeiro render. Se o projeto
 * não tiver o snippet, ou se um bloqueador derrubar o script, `window.clarity`
 * fica undefined e tudo aqui vira no-op silencioso: o funil de lead e booking
 * nunca pode quebrar por causa de analytics.
 *
 * VOCABULÁRIO DO FUNIL (idêntico em todo cliente, senão não dá para comparar
 * uma página com a outra no dashboard):
 *
 *   evento  booking_open       abriu o modal             espelha ViewContent
 *   evento  lead               passou da etapa 1         espelha Lead
 *   evento  trial_booked       confirmou o horário       espelha Schedule
 *   evento  booking_abandoned  fechou o form sem marcar  só no Clarity
 *
 *   tag     funnel_step        passo mais fundo que a sessão alcançou
 *   tag     exit_step          onde estava quando desistiu
 *   tag     audience           adults | kids
 *   tag     program            calendário escolhido
 *
 * Como isso responde "onde o lead cai fora": filtre as gravações por
 * `funnel_step = booking_open` sem o evento `trial_booked`, ou direto pelo
 * evento `booking_abandoned` cruzado com a tag `exit_step`.
 */

type ClarityFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    clarity?: ClarityFn;
  }
}

/** Passos do funil, do mais raso ao mais fundo. A ordem importa: `clarityStep`
 *  compara índices para nunca regredir a tag. */
export const FUNNEL_STEPS = ["landed", "booking_open", "lead", "trial_booked"] as const;

export type FunnelStep = (typeof FUNNEL_STEPS)[number];

/** Toda chamada passa por aqui: um único guard, um único try. */
function call(...args: unknown[]): void {
  if (typeof window === "undefined") return;
  const clarity = window.clarity;
  if (typeof clarity !== "function") return;
  try {
    clarity(...args);
  } catch {
    /* analytics nunca derruba a página */
  }
}

/** Tag arbitrária na sessão. Vira filtro no dashboard do Clarity. */
export function clarityTag(key: string, value: string | string[]): void {
  if (!key || !value || (Array.isArray(value) && value.length === 0)) return;
  call("set", key, value);
}

/** Evento customizado. Aparece junto dos smart events, e é filtrável. */
export function clarityEvent(name: string): void {
  if (!name) return;
  call("event", name);
}

/**
 * Prioriza a gravação desta sessão quando o projeto bate o teto diário de
 * retenção. Barato, e garante que a sessão que chegou no formulário é a que
 * sobrevive à amostragem.
 */
export function clarityUpgrade(reason: string): void {
  if (!reason) return;
  call("upgrade", reason);
}

/**
 * Liga a gravação ao lead do CRM. O Clarity faz hash do `custom-id` NO
 * BROWSER antes de mandar, então o e-mail nunca trafega nem fica armazenado em
 * claro; filtrar por ele no dashboard funciona porque o Clarity hasheia a
 * busca também.
 *
 * ⚠️ O `friendly-name` (4º argumento) é o único campo que aparece em CLARO na
 * dashboard: mande o PRIMEIRO NOME, nunca o e-mail nem o nome completo.
 */
export function clarityIdentify(email: string | undefined, firstName?: string): void {
  const id = email?.trim().toLowerCase();
  if (!id) return;
  const hint = firstName?.trim().split(/\s+/)[0];
  // Sem `hint` não passe os slots de session/page: a assinatura é posicional.
  if (hint) call("identify", id, undefined, undefined, hint);
  else call("identify", id);
}

/** Guarda o passo mais fundo alcançado: a sessão não pode "voltar" no funil. */
let deepest: FunnelStep = "landed";

/** Marca o passo do funil, sem nunca regredir a tag. */
export function clarityStep(step: FunnelStep): void {
  if (FUNNEL_STEPS.indexOf(step) > FUNNEL_STEPS.indexOf(deepest)) {
    deepest = step;
  }
  clarityTag("funnel_step", deepest);
}

/** O passo mais fundo alcançado até agora (o provider usa para o abandono). */
export function clarityDeepestStep(): FunnelStep {
  return deepest;
}

/**
 * Espelha no Clarity o mesmo evento que já vai para Meta e GA4. Chamado de
 * dentro do `analytics.ts`, e é isso que evita espalhar chamada de Clarity
 * por toda a página: quem já dispara o funil passa por aqui de graça.
 */
export function mirrorToClarity(metaEvent: string, params?: Record<string, unknown>): void {
  switch (metaEvent) {
    case "ViewContent":
      clarityEvent("booking_open");
      clarityStep("booking_open");
      clarityUpgrade("booking_open");
      armAbandonWatch();
      break;
    case "Lead":
      clarityEvent("lead");
      clarityStep("lead");
      break;
    case "Schedule":
      clarityEvent("trial_booked");
      clarityStep("trial_booked");
      break;
    default:
      return;
  }
  const audience = params?.content_category;
  if (typeof audience === "string" && audience) clarityTag("audience", audience);
  const program = params?.content_name;
  if (typeof program === "string" && program && metaEvent === "Schedule") {
    clarityTag("program", program);
  }
}

let abandonSent = false;
let abandonArmed = false;

/**
 * Abriu o formulário e foi embora sem marcar. É o sinal que o tráfego pede:
 * separa "nem abriu o form" de "abriu, digitou e desistiu", e diz em qual
 * etapa parou. A etapa sai do próprio funil, sem o componente precisar
 * avisar nada: parou em booking_open = etapa 1, chegou em lead = etapa 2.
 *
 * No-op quando a sessão marcou a aula, quando nem abriu o form, e da segunda
 * chamada em diante.
 */
export function clarityAbandon(): void {
  if (abandonSent || deepest === "trial_booked" || deepest === "landed") return;
  abandonSent = true;
  clarityTag("exit_step", deepest === "lead" ? "step2_schedule" : "step1_details");
  clarityEvent("booking_abandoned");
  clarityUpgrade("booking_abandoned");
}

/**
 * Arma o disparo do abandono na saída da página. Chamado sozinho quando o
 * modal abre, então nenhum componente precisa ser tocado na instalação.
 *
 * `pagehide` cobre navegação e bfcache; `visibilitychange` cobre o mobile,
 * onde trocar de app muitas vezes é a única saída que o navegador reporta.
 */
function armAbandonWatch(): void {
  if (abandonArmed || typeof window === "undefined") return;
  abandonArmed = true;
  window.addEventListener("pagehide", clarityAbandon);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") clarityAbandon();
  });
}

/**
 * Marca toda sessão que carregou a página, para o dashboard ter denominador:
 * `funnel_step = landed` sem `booking_open` é quem leu e não abriu o form.
 * Roda no import porque o módulo entra pelo `analytics`, que entra no boot.
 */
if (typeof window !== "undefined") clarityStep("landed");
