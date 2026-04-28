import { Paragraphs, InlineText } from './InlineMarkdown'

interface SummaryProps {
  heading?: string
  headline?: string
  body?: string
  content?: string
  bullet_points?: string[]
  internal_links?: Array<{ text: string; url: string }>
  next_steps?: string[] | string
}

export default function SummarySection({ data }: { data: SummaryProps }) {
  const heading = data.heading || data.headline || 'Summary'
  const body = data.body || data.content

  return (
    <div className="bg-cream-100 rounded-xl p-6 mb-8">
      <h2 className="text-lg font-bold text-terra-800 mb-3">{heading}</h2>

      {body && <Paragraphs text={body} />}

      {data.bullet_points && (
        <ul className="list-disc pl-5 space-y-1 mb-4">
          {data.bullet_points.map((bp, i) => (
            <li key={i} className="text-sm text-terra-800/70">
              <InlineText text={bp} />
            </li>
          ))}
        </ul>
      )}

      {data.internal_links && data.internal_links.length > 0 && (
        <div className="mt-4 space-y-1">
          {data.internal_links.map((link, i) => (
            <a key={i} href={link.url} className="block text-sm text-accent-600 hover:text-accent-700 underline">
              {link.text}
            </a>
          ))}
        </div>
      )}

      {data.next_steps && (
        <div className="mt-4">
          <p className="font-semibold text-sm text-terra-800 mb-2">Next steps:</p>
          {Array.isArray(data.next_steps) ? (
            <ul className="list-disc pl-5 space-y-1">
              {data.next_steps.map((s, i) => (
                <li key={i} className="text-sm text-terra-800/70">{s}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-terra-800/70">{data.next_steps}</p>
          )}
        </div>
      )}
    </div>
  )
}
