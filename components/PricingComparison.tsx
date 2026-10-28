// Semester cost comparison shown under the pricing cards.
// Competitor list prices (USD, monthly billing) checked 2026-10-28 on
// otter.ai/pricing, notta.ai/en/pricing and turboscribe.ai. Re-check quarterly
// and update CHECKED_ON + the copy in messages/*.json (home.pricing.comparison).

const SEMESTER_MONTHS = 4 // 15 weeks spans 4 monthly billing periods
const LS_PACK = { hours: 30, price: 21 }
const SEMESTER_HOURS = 30 // 2h/week × 15 weeks

const COMPETITORS = [
  { key: 'otter', name: 'Otter.ai Pro', monthly: 16.99 },
  { key: 'notta', name: 'Notta Pro', monthly: 13.33 },
  { key: 'turboscribe', name: 'TurboScribe Unlimited', monthly: 20 },
] as const

type CompetitorKey = (typeof COMPETITORS)[number]['key']

interface RowCopy {
  label: string
  ls: string
  otter: string
  notta: string
  turboscribe: string
}

export interface ComparisonCopy {
  eyebrow: string
  title: string
  subtitle: string
  semesterRow: string
  packsDetail: string
  monthsDetail: string
  rows: RowCopy[]
  honestNote: string
  sources: string
}

const fmt = (n: number) => `$${Math.round(n)}`

export default function PricingComparison({ copy }: { copy: ComparisonCopy }) {
  const packs = Math.ceil(SEMESTER_HOURS / LS_PACK.hours)
  const lsTotal = packs * LS_PACK.price

  const cell = 'py-3.5 px-4 text-sm leading-snug align-top'
  const lsCell = `${cell} bg-accent/[0.06] text-foreground font-semibold`

  return (
    <div className="max-w-5xl mx-auto mt-16">
      <div className="text-center mb-8">
        <p className="text-xs font-extrabold tracking-[2.5px] uppercase text-accent mb-3">{copy.eyebrow}</p>
        <h3 className="font-serif text-3xl md:text-4xl font-semibold text-foreground tracking-tight leading-tight">
          {copy.title}
        </h3>
        <p className="text-[15px] text-foreground/60 mt-3 max-w-xl mx-auto leading-relaxed">{copy.subtitle}</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="py-4 px-4 w-[22%]" />
              <th className="py-4 px-4 bg-accent/[0.06] font-serif text-lg font-semibold text-foreground">LessonScriptor</th>
              {COMPETITORS.map((c) => (
                <th key={c.key} className="py-4 px-4 text-sm font-semibold text-foreground/70">{c.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <th scope="row" className={`${cell} font-semibold text-foreground/70`}>{copy.semesterRow}</th>
              <td className={lsCell}>
                <span className="font-serif text-3xl font-bold text-accent tabular-nums">{fmt(lsTotal)}</span>
                <span className="block text-xs font-normal text-foreground/50 mt-1">
                  {copy.packsDetail.replace('{packs}', String(packs)).replace('{price}', fmt(LS_PACK.price))}
                </span>
              </td>
              {COMPETITORS.map((c) => (
                <td key={c.key} className={`${cell} text-foreground/70`}>
                  <span className="font-serif text-2xl font-semibold tabular-nums">{fmt(c.monthly * SEMESTER_MONTHS)}</span>
                  <span className="block text-xs text-foreground/45 mt-1">
                    {copy.monthsDetail.replace('{months}', String(SEMESTER_MONTHS)).replace('{price}', `$${c.monthly}`)}
                  </span>
                </td>
              ))}
            </tr>
            {copy.rows.map((row, i) => (
              <tr key={i} className={i < copy.rows.length - 1 ? 'border-b border-border' : ''}>
                <th scope="row" className={`${cell} font-semibold text-foreground/70`}>{row.label}</th>
                <td className={lsCell}>
                  <span className="text-accent font-bold mr-1.5">✓</span>{row.ls}
                </td>
                {COMPETITORS.map((c) => (
                  <td key={c.key} className={`${cell} text-foreground/55`}>{row[c.key as CompetitorKey]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-foreground/60 text-center mt-5 max-w-2xl mx-auto leading-relaxed">{copy.honestNote}</p>
      <p className="text-[11px] text-foreground/35 text-center mt-2 max-w-2xl mx-auto leading-snug">{copy.sources}</p>
    </div>
  )
}
