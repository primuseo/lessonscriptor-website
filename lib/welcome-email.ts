export const SUPPORTED_LOCALES = ['en', 'fr', 'es', 'de', 'pt', 'zh'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

export function resolveLocale(raw: unknown): Locale {
  return typeof raw === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(raw)
    ? (raw as Locale)
    : 'en'
}

interface Template {
  subject: string
  greetingNamed: string // contains {name}
  greetingAnon: string
  intro: string
  ready: string
  leadIn: string
  bullets: [string, string, string]
  replies: string
  closing: string
  signoff: string
}

const TEMPLATES: Record<Locale, Template> = {
  en: {
    subject: 'Welcome to LessonScriptor 🎓 — a quick hello from Pierre & Victoria',
    greetingNamed: 'Hi {name},',
    greetingAnon: 'Hi there,',
    intro: "Pierre and Victoria here — the two people behind LessonScriptor. Thank you so much for grabbing a Tab Audio credit pack. We're a tiny team, so every person who trusts us genuinely makes our week.",
    ready: "You're all set — your credits are ready whenever you are.",
    leadIn: "You've only just started, so we're not going to ask you for a review yet :) But we build this around what real users tell us, so keep this in the back of your mind:",
    bullets: [
      'Anything confusing or not working right? Just hit reply.',
      "Something that'd make it fit your workflow better? We want to hear it.",
      'Even a one-line first impression helps.',
    ],
    replies: 'Replies come straight to the two of us, and we answer every one personally.',
    closing: 'Thanks for being early — it matters.',
    signoff: 'Pierre & Victoria',
  },
  fr: {
    subject: 'Bienvenue sur LessonScriptor 🎓 — un petit mot de Pierre & Victoria',
    greetingNamed: 'Bonjour {name},',
    greetingAnon: 'Bonjour,',
    intro: "Ici Pierre et Victoria — les deux personnes derrière LessonScriptor. Un immense merci d'avoir pris un pack de crédits Tab Audio. Nous sommes une toute petite équipe, alors chaque personne qui nous fait confiance nous touche vraiment.",
    ready: 'Tout est prêt — vos crédits vous attendent dès que vous le souhaitez.',
    leadIn: "Vous venez tout juste de commencer, donc on ne va pas vous demander un avis complet tout de suite :) Mais nous construisons LessonScriptor à partir des retours de nos utilisateurs, alors gardez ceci en tête :",
    bullets: [
      "Quelque chose n'est pas clair ou ne fonctionne pas comme prévu ? Répondez simplement à cet e-mail.",
      "Une idée pour que l'outil s'adapte mieux à votre façon de travailler ? On veut l'entendre.",
      'Même une première impression en une ligne nous aide énormément.',
    ],
    replies: 'Vos réponses nous arrivent directement, à tous les deux, et nous répondons personnellement à chacune.',
    closing: "Merci d'être là dès le début — ça compte beaucoup pour nous.",
    signoff: 'Pierre & Victoria',
  },
  es: {
    subject: 'Bienvenido a LessonScriptor 🎓 — un saludo de Pierre y Victoria',
    greetingNamed: 'Hola {name}:',
    greetingAnon: 'Hola:',
    intro: 'Somos Pierre y Victoria, las dos personas detrás de LessonScriptor. Muchísimas gracias por conseguir un paquete de créditos de Tab Audio. Somos un equipo muy pequeño, así que cada persona que confía en nosotros nos alegra el día.',
    ready: 'Ya está todo listo: tus créditos están disponibles cuando quieras.',
    leadIn: 'Acabas de empezar, así que no vamos a pedirte una opinión completa todavía :) Pero construimos LessonScriptor a partir de lo que nos cuentan los usuarios reales, así que ten esto en mente:',
    bullets: [
      '¿Algo confuso o que no funciona como esperabas? Solo responde a este correo.',
      '¿Algo que lo haría encajar mejor en tu forma de trabajar? Queremos escucharlo.',
      'Incluso una primera impresión en una línea nos ayuda muchísimo.',
    ],
    replies: 'Tus respuestas nos llegan directamente a los dos, y respondemos personalmente a cada una.',
    closing: 'Gracias por estar desde el principio: significa mucho para nosotros.',
    signoff: 'Pierre y Victoria',
  },
  de: {
    subject: 'Willkommen bei LessonScriptor 🎓 — ein kurzer Gruß von Pierre & Victoria',
    greetingNamed: 'Hallo {name},',
    greetingAnon: 'Hallo,',
    intro: 'Hier sind Pierre und Victoria – die zwei Menschen hinter LessonScriptor. Vielen Dank, dass du dir ein Tab-Audio-Guthabenpaket geholt hast. Wir sind ein winziges Team, deshalb freut uns jede Person, die uns vertraut, ganz besonders.',
    ready: 'Alles ist startklar – dein Guthaben steht bereit, wann immer du möchtest.',
    leadIn: 'Du hast gerade erst angefangen, deshalb bitten wir dich noch nicht um eine Bewertung :) Aber wir entwickeln LessonScriptor auf Basis von echtem Nutzer-Feedback, also behalte das im Hinterkopf:',
    bullets: [
      'Etwas unklar oder funktioniert nicht wie erwartet? Antworte einfach auf diese E-Mail.',
      'Etwas, das es besser an deinen Workflow anpassen würde? Wir wollen es hören.',
      'Schon ein erster Eindruck in einem Satz hilft uns sehr.',
    ],
    replies: 'Deine Antworten kommen direkt bei uns beiden an, und wir beantworten jede einzelne persönlich.',
    closing: 'Danke, dass du von Anfang an dabei bist – das bedeutet uns viel.',
    signoff: 'Pierre & Victoria',
  },
  pt: {
    subject: 'Bem-vindo ao LessonScriptor 🎓 — um olá de Pierre e Victoria',
    greetingNamed: 'Olá {name},',
    greetingAnon: 'Olá,',
    intro: 'Aqui são Pierre e Victoria — as duas pessoas por trás do LessonScriptor. Muito obrigado por adquirir um pacote de créditos do Tab Audio. Somos uma equipe pequena, então cada pessoa que confia na gente alegra a nossa semana.',
    ready: 'Está tudo pronto — seus créditos estão disponíveis quando você quiser.',
    leadIn: 'Você acabou de começar, então não vamos pedir uma avaliação completa ainda :) Mas construímos o LessonScriptor com base no que os usuários reais nos contam, então guarde isto:',
    bullets: [
      'Algo confuso ou que não funciona como esperado? É só responder a este e-mail.',
      'Algo que o deixaria mais adequado ao seu fluxo de trabalho? Queremos ouvir.',
      'Até uma primeira impressão em uma linha já ajuda muito.',
    ],
    replies: 'Suas respostas chegam direto para nós dois, e respondemos pessoalmente a cada uma.',
    closing: 'Obrigado por estar aqui desde o início — isso significa muito.',
    signoff: 'Pierre e Victoria',
  },
  zh: {
    subject: '欢迎使用 LessonScriptor 🎓 — 来自 Pierre 和 Victoria 的问候',
    greetingNamed: '你好 {name}，',
    greetingAnon: '你好，',
    intro: '我们是 Pierre 和 Victoria——LessonScriptor 背后的两个人。非常感谢你购买 Tab Audio 额度包。我们是一个很小的团队，所以每一位信任我们的用户都让我们特别开心。',
    ready: '一切都已就绪——你的额度随时可以使用。',
    leadIn: '你才刚刚开始，所以我们现在不会请你写评价 :) 但我们是根据真实用户的反馈来打造 LessonScriptor 的，所以请记住：',
    bullets: [
      '有什么让你困惑，或运行得不如预期？直接回复这封邮件就好。',
      '有什么能让它更贴合你的工作流程？我们很想听。',
      '哪怕只是一句话的初步印象，也对我们帮助很大。',
    ],
    replies: '你的回复会直接发到我们两个人手中，我们会亲自回复每一封。',
    closing: '谢谢你在最早期就加入——这对我们意义重大。',
    signoff: 'Pierre 和 Victoria',
  },
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function buildWelcomeEmail(
  rawLocale: unknown,
  name: string | null
): { subject: string; html: string; text: string } {
  const locale = resolveLocale(rawLocale)
  const t = TEMPLATES[locale]
  const trimmed = name && name.trim() ? name.trim() : null
  const greeting = trimmed ? t.greetingNamed.replace('{name}', trimmed) : t.greetingAnon

  const text = [
    greeting,
    '',
    t.intro,
    '',
    t.ready,
    '',
    t.leadIn,
    `- ${t.bullets[0]}`,
    `- ${t.bullets[1]}`,
    `- ${t.bullets[2]}`,
    '',
    t.replies,
    '',
    t.closing,
    '',
    t.signoff,
    'LessonScriptor',
  ].join('\n')

  const e = escapeHtml
  const html = `<div style="font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1714">
<p>${e(greeting)}</p>
<p>${e(t.intro)}</p>
<p><strong>${e(t.ready)}</strong></p>
<p>${e(t.leadIn)}</p>
<ul>
<li>${e(t.bullets[0])}</li>
<li>${e(t.bullets[1])}</li>
<li>${e(t.bullets[2])}</li>
</ul>
<p>${e(t.replies)}</p>
<p>${e(t.closing)}</p>
<p>${e(t.signoff)}<br/>LessonScriptor</p>
</div>`

  return { subject: t.subject, html, text }
}
