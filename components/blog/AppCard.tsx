import { InlineText } from './InlineMarkdown'

interface AppCardProps {
  app_name: string
  tagline?: string
  rank?: number
  platform?: string
  free_tier?: string
  price?: string
  best_for?: string
  adhd_fit?: number
  why_it_wins?: string
  key_features?: string[]
  limitations?: string
  url?: string
  internal_link?: string
}

export default function AppCard({ section }: { section: AppCardProps }) {
  return (
    <div className="bg-white rounded-xl border border-cream-200 p-6 mb-6">
      <div className="flex items-start justify-between mb-3">
        <div>
          {section.rank && (
            <span className="text-xs font-bold text-accent-500 mr-2">#{section.rank}</span>
          )}
          <h3 className="inline text-lg font-bold text-terra-800">{section.app_name}</h3>
          {section.tagline && (
            <p className="text-sm text-terra-800/50 mt-1">{section.tagline}</p>
          )}
        </div>
        {section.adhd_fit != null && (
          <span className="shrink-0 ml-4 text-xs font-bold bg-accent-500/10 text-accent-600 px-2 py-1 rounded-full">
            {section.adhd_fit}/10
          </span>
        )}
      </div>

      {section.why_it_wins && (
        <p className="text-sm text-terra-800/70 leading-relaxed mb-4">
          <InlineText text={section.why_it_wins} />
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 text-xs mb-4">
        {section.platform && (
          <div><span className="font-semibold text-terra-800/50">Platform:</span> <span className="text-terra-800/70">{section.platform}</span></div>
        )}
        {section.free_tier && (
          <div><span className="font-semibold text-terra-800/50">Free tier:</span> <span className="text-terra-800/70">{section.free_tier}</span></div>
        )}
        {section.price && (
          <div><span className="font-semibold text-terra-800/50">Price:</span> <span className="text-terra-800/70">{section.price}</span></div>
        )}
        {section.best_for && (
          <div><span className="font-semibold text-terra-800/50">Best for:</span> <span className="text-terra-800/70">{section.best_for}</span></div>
        )}
      </div>

      {section.key_features && section.key_features.length > 0 && (
        <ul className="list-disc pl-5 space-y-1 mb-4">
          {section.key_features.map((f, i) => (
            <li key={i} className="text-xs text-terra-800/60">{f}</li>
          ))}
        </ul>
      )}

      {section.limitations && (
        <p className="text-xs text-terra-800/40 italic">
          Limitations: {section.limitations}
        </p>
      )}
    </div>
  )
}
