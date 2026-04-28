import { InlineText } from './InlineMarkdown'

interface TldrProps {
  heading?: string
  title?: string
  headline?: string
  label?: string
  points?: string[]
  items?: Array<Record<string, string>>
  tools?: Array<{ name: string; for?: string; why: string }>
  lead?: string
  bullets?: string[]
}

export default function TldrSection({ data }: { data: TldrProps }) {
  const heading = data.heading || data.title || data.headline || data.label || 'TL;DR'

  return (
    <div className="bg-accent-500/5 border border-accent-500/20 rounded-xl p-6 mb-8">
      <h2 className="text-lg font-bold text-accent-600 mb-3">{heading}</h2>
      {data.lead && (
        <p className="text-sm text-terra-800/70 mb-3">{data.lead}</p>
      )}

      {data.points && (
        <ul className="space-y-2">
          {data.points.map((p, i) => (
            <li key={i} className="flex gap-2 text-sm text-terra-800/70">
              <span className="text-accent-500 shrink-0">-</span>
              <InlineText text={p} />
            </li>
          ))}
        </ul>
      )}

      {data.bullets && (
        <ul className="space-y-2">
          {data.bullets.map((b, i) => (
            <li key={i} className="flex gap-2 text-sm text-terra-800/70">
              <span className="text-accent-500 shrink-0">-</span>
              <InlineText text={b} />
            </li>
          ))}
        </ul>
      )}

      {data.items && (
        <div className="space-y-3">
          {data.items.map((item, i) => (
            <div key={i} className="flex gap-3 text-sm">
              {item.category && (
                <span className="font-semibold text-terra-800 shrink-0 min-w-[140px]">{item.category}</span>
              )}
              <div className="text-terra-800/70">
                {item.winner && <span className="font-semibold text-terra-800">{item.winner}</span>}
                {item.why && <span> — {item.why}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {data.tools && (
        <div className="space-y-3">
          {data.tools.map((tool, i) => (
            <div key={i} className="bg-white rounded-lg p-3 border border-cream-200">
              <div className="font-semibold text-terra-800 text-sm">{tool.name}</div>
              {tool.for && <div className="text-xs text-terra-800/50">{tool.for}</div>}
              <div className="text-sm text-terra-800/70 mt-1">{tool.why}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
