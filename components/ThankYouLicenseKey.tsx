'use client'
import { useEffect, useState } from 'react'
import CopyButton from '@/components/CopyButton'

interface Props {
  sessionId: string | null
  copyButton: string
  copiedButton: string
  checkingLabel: string
  noKeyYetLabel: string
}

export default function ThankYouLicenseKey({
  sessionId,
  copyButton,
  copiedButton,
  checkingLabel,
  noKeyYetLabel,
}: Props) {
  const [licenseKey, setLicenseKey] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!sessionId) {
      setChecked(true)
      return
    }
    fetch(`/api/checkout-session?session_id=${encodeURIComponent(sessionId)}`)
      .then((res) => (res.ok ? res.json() : { licenseKey: null }))
      .then((data) => setLicenseKey(data.licenseKey ?? null))
      .catch(() => setLicenseKey(null))
      .finally(() => setChecked(true))
  }, [sessionId])

  if (!checked) {
    return <p className="text-foreground/60 italic text-sm">{checkingLabel}</p>
  }

  if (!licenseKey) {
    return <p className="text-foreground/60 italic text-sm">{noKeyYetLabel}</p>
  }

  return (
    <div className="flex items-center gap-3">
      <code className="flex-1 bg-muted border border-border rounded-lg px-4 py-3 text-foreground font-mono text-sm break-all">
        {licenseKey}
      </code>
      <CopyButton text={licenseKey} label={copyButton} copiedLabel={copiedButton} />
    </div>
  )
}
