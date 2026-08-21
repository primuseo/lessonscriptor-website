'use client'
import { useState } from 'react'

export default function CopyButton({ text, label, copiedLabel }: { text: string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 px-4 py-2 bg-accent hover:bg-accent-hover text-accent-foreground text-sm font-semibold rounded-lg transition-colors"
    >
      {copied ? copiedLabel : label}
    </button>
  )
}
