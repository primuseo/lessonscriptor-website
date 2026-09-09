import React from 'react'

// Blog content JSON sometimes embeds a raw `<a href="...">text</a>` tag inline
// (rather than using a section-level internal_links array). Since this string
// is rendered as text, not HTML, that tag needs to be parsed here or it shows
// up as literal "<a href=...>" on the page instead of a clickable link.
const INLINE_PATTERN = /\*\*(.*?)\*\*|<a href="([^"]*)">(.*?)<\/a>/g

function parseBold(text: string): React.ReactNode[] {
  if (typeof text !== 'string') return [String(text)]
  const nodes: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let i = 0
  INLINE_PATTERN.lastIndex = 0
  while ((match = INLINE_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index))
    if (match[1] !== undefined) {
      nodes.push(<strong key={`b${i}`}>{match[1]}</strong>)
    } else {
      nodes.push(
        <a key={`a${i}`} href={match[2]} className="text-accent hover:text-accent-hover underline">
          {match[3]}
        </a>
      )
    }
    lastIndex = INLINE_PATTERN.lastIndex
    i++
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
  return nodes
}

export function InlineText({ text }: { text: string }) {
  if (typeof text !== 'string') return <>{String(text ?? '')}</>
  return <>{parseBold(text)}</>
}

export function Paragraphs({ text }: { text: string }) {
  if (typeof text !== 'string') return null
  const paragraphs = text.split(/\n\n+/)
  return (
    <>
      {paragraphs.map((p, i) => {
        const trimmed = p.trim()
        if (!trimmed) return null

        const lines = trimmed.split('\n')
        const isList = lines.every(
          (l) => /^\d+\.\s/.test(l.trim()) || /^[-•]\s/.test(l.trim())
        )

        if (isList) {
          const isOrdered = /^\d+\.\s/.test(lines[0].trim())
          const Tag = isOrdered ? 'ol' : 'ul'
          return (
            <Tag key={i} className={`${isOrdered ? 'list-decimal' : 'list-disc'} pl-6 space-y-1 mb-4`}>
              {lines.map((line, j) => (
                <li key={j} className="text-foreground/70">
                  <InlineText text={line.replace(/^(\d+\.\s|[-•]\s)/, '')} />
                </li>
              ))}
            </Tag>
          )
        }

        return (
          <p key={i} className="text-foreground/70 leading-relaxed mb-4">
            <InlineText text={trimmed} />
          </p>
        )
      })}
    </>
  )
}

export function ParagraphArray({ paragraphs }: { paragraphs: string[] }) {
  return (
    <>
      {paragraphs.map((p, i) => (
        <Paragraphs key={i} text={p} />
      ))}
    </>
  )
}
