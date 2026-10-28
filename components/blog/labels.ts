// Fixed labels inside blog components. Blog content is per-locale JSON, but these
// strings live in components, so they need their own small dictionary.
type LabelSet = Record<'platform' | 'freeTier' | 'price' | 'bestFor' | 'limitations' | 'effort' | 'cost' | 'setup', string>

const LABELS: Record<string, LabelSet> = {
  en: { platform: 'Platform', freeTier: 'Free tier', price: 'Price', bestFor: 'Best for', limitations: 'Limitations', effort: 'Effort', cost: 'Cost', setup: 'Setup' },
  fr: { platform: 'Plateforme', freeTier: 'Version gratuite', price: 'Prix', bestFor: 'Idéal pour', limitations: 'Limites', effort: 'Effort', cost: 'Coût', setup: 'Mise en place' },
  es: { platform: 'Plataforma', freeTier: 'Plan gratuito', price: 'Precio', bestFor: 'Ideal para', limitations: 'Limitaciones', effort: 'Esfuerzo', cost: 'Coste', setup: 'Configuración' },
  pt: { platform: 'Plataforma', freeTier: 'Plano gratuito', price: 'Preço', bestFor: 'Ideal para', limitations: 'Limitações', effort: 'Esforço', cost: 'Custo', setup: 'Configuração' },
  de: { platform: 'Plattform', freeTier: 'Kostenlose Version', price: 'Preis', bestFor: 'Ideal für', limitations: 'Einschränkungen', effort: 'Aufwand', cost: 'Kosten', setup: 'Einrichtung' },
  zh: { platform: '平台', freeTier: '免费版', price: '价格', bestFor: '适合', limitations: '局限', effort: '投入', cost: '费用', setup: '设置' },
}

export type BlogLabels = LabelSet

export function blogLabels(locale: string): BlogLabels {
  return LABELS[locale] ?? LABELS.en
}
