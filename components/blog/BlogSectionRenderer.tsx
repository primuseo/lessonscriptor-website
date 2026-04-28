import { Paragraphs, ParagraphArray, InlineText } from './InlineMarkdown'
import AppCard from './AppCard'
import ComparisonTable from './ComparisonTable'

type Section = Record<string, unknown>

function Callout({ callout }: { callout: { type?: string; label?: string; body: string } }) {
  const colors: Record<string, string> = {
    tip: 'bg-green-50 border-green-300',
    note: 'bg-blue-50 border-blue-300',
    insight: 'bg-purple-50 border-purple-300',
    comparison: 'bg-yellow-50 border-yellow-300',
    checklist: 'bg-orange-50 border-orange-300',
  }
  const cls = colors[callout.type || 'note'] || colors.note
  return (
    <div className={`${cls} border-l-4 rounded-r-lg p-4 mb-4`}>
      {callout.label && <div className="font-semibold text-sm text-terra-800 mb-1">{callout.label}</div>}
      <Paragraphs text={callout.body} />
    </div>
  )
}

function Steps({ steps }: { steps: Array<string | { step?: number; strategy?: string; detail?: string }> }) {
  return (
    <ol className="list-decimal pl-6 space-y-2 mb-4">
      {steps.map((step, i) => (
        <li key={i} className="text-terra-800/70 leading-relaxed">
          {typeof step === 'string' ? (
            <InlineText text={step} />
          ) : (
            <div>
              {step.strategy && <span className="font-semibold"><InlineText text={step.strategy} /></span>}
              {step.detail && <span className="block mt-1"><InlineText text={step.detail} /></span>}
            </div>
          )}
        </li>
      ))}
    </ol>
  )
}

function StackRecommendation({ section }: { section: Section }) {
  const title = section.title as string | undefined
  const layers = section.layers as Array<{ layer: string; app: string; why: string; effort?: string }> | undefined
  const totalCost = section.total_cost as string | undefined
  const timeSetup = section.time_setup as string | undefined
  return (
    <div className="bg-white rounded-xl border border-cream-200 p-6 mb-6">
      {title && <h3 className="text-lg font-bold text-terra-800 mb-4">{title}</h3>}
      {layers && (
        <div className="space-y-3">
          {layers.map((l, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-cream-50 rounded-lg">
              <span className="text-accent-500 font-bold text-sm shrink-0">{l.layer}</span>
              <div>
                <span className="font-semibold text-terra-800 text-sm">{l.app}</span>
                <span className="text-sm text-terra-800/60"> — {l.why}</span>
                {l.effort && <span className="block text-xs text-terra-800/40 mt-1">Effort: {l.effort}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
      {(totalCost || timeSetup) && (
        <div className="mt-4 pt-3 border-t border-cream-200 text-sm text-terra-800/60">
          {totalCost && <span>Cost: {totalCost}</span>}
          {totalCost && timeSetup && <span> · </span>}
          {timeSetup && <span>Setup: {timeSetup}</span>}
        </div>
      )}
    </div>
  )
}

export default function BlogSectionRenderer({ section }: { section: Section }) {
  if (section.type === 'faq_section') return null

  if (section.type === 'app_card') {
    return <AppCard section={section as never} />
  }

  if (section.type === 'stack_recommendation') {
    return <StackRecommendation section={section} />
  }

  if (section.type === 'table') {
    return <ComparisonTable data={section as never} />
  }

  if (section.type === 'hero' || section.type === 'infographic') return null

  const heading = (section.heading || section.h2) as string | undefined
  const body = (section.body || section.content) as string | undefined
  const paragraphs = section.paragraphs as string[] | undefined
  const steps = section.steps as string[] | undefined
  const callout = section.callout as { type?: string; label?: string; body: string } | undefined
  const compTable = section.comparison_table as { title?: string; rows: Array<Record<string, unknown>> } | undefined
  const table = section.table as { headers: string[]; rows: string[][] } | undefined
  const internalLinks = (() => {
    type LinkItem = { text: string; url: string }
    const normalize = (raw: unknown): LinkItem | null => {
      if (!raw || typeof raw !== 'object') return null
      const r = raw as Record<string, unknown>
      const url = (r.url || r.href) as string | undefined
      const text = (r.text || r.label) as string | undefined
      if (!url || !text) return null
      return { text, url }
    }
    const candidates: LinkItem[] = []
    const push = (v: unknown) => {
      if (Array.isArray(v)) v.forEach(i => { const n = normalize(i); if (n) candidates.push(n) })
      else if (v && typeof v === 'object') { const n = normalize(v); if (n) candidates.push(n) }
    }
    push(section.internal_links)
    push(section.internal_links_map)
    push(section.internal_link)
    if (typeof section.cta_link === 'string' && typeof section.cta_text === 'string')
      candidates.push({ url: section.cta_link as string, text: section.cta_text as string })
    if (typeof section.secondary_href === 'string' && typeof section.secondary_label === 'string')
      candidates.push({ url: section.secondary_href as string, text: section.secondary_label as string })
    return candidates.length > 0 ? candidates : undefined
  })()
  const subsections = section.subsections as Array<{ h3?: string; body?: string }> | undefined

  return (
    <section className="mb-8">
      {heading && (
        <h2 className="text-xl font-bold text-terra-800 mt-10 mb-4">{heading}</h2>
      )}

      {body && <Paragraphs text={body} />}
      {paragraphs && <ParagraphArray paragraphs={paragraphs} />}
      {steps && <Steps steps={steps} />}
      {callout && <Callout callout={callout} />}

      {compTable && (
        <ComparisonTable data={{
          title: compTable.title,
          rows: compTable.rows,
        }} />
      )}

      {table && (
        <ComparisonTable data={{
          headers: table.headers,
          rows: table.rows,
        }} />
      )}

      {subsections && subsections.map((sub, i) => (
        <div key={i} className="ml-4 mb-4">
          {sub.h3 && <h3 className="text-lg font-semibold text-terra-800 mb-2">{sub.h3}</h3>}
          {sub.body && <Paragraphs text={sub.body} />}
        </div>
      ))}

      {internalLinks && internalLinks.length > 0 && (
        <div className="mt-3 space-y-1">
          {internalLinks.map((link, i) => (
            <a key={i} href={link.url} className="block text-sm text-accent-600 hover:text-accent-700 underline">
              {link.text}
            </a>
          ))}
        </div>
      )}
    </section>
  )
}
