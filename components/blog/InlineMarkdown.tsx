import React from 'react'

function parseBold(text: string): React.ReactNode[] {
  if (typeof text !== 'string') return [String(text)]
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  )
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
                <li key={j} className="text-terra-800/70">
                  <InlineText text={line.replace(/^(\d+\.\s|[-•]\s)/, '')} />
                </li>
              ))}
            </Tag>
          )
        }

        return (
          <p key={i} className="text-terra-800/70 leading-relaxed mb-4">
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
