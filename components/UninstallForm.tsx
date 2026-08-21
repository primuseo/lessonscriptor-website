'use client'

import { useTranslations, useLocale } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface Reason {
  id: string
  label: string
}

export default function UninstallForm() {
  const t = useTranslations('uninstall')
  const locale = useLocale()
  const searchParams = useSearchParams()

  const version = searchParams.get('v') || ''
  const lang = searchParams.get('lang') || locale

  const reasons = t.raw('reasons') as Reason[]

  const [selected, setSelected] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const needsDetail = selected === 'missing_feature'
  const commentPlaceholder =
    selected === 'missing_feature'
      ? t('missingFeaturePlaceholder')
      : selected === 'didnt_work'
      ? t('bugPlaceholder')
      : t('commentPlaceholder')
  const canSubmit = !loading && (selected || comment.trim()) && !(needsDetail && !comment.trim())

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)

    const reason = reasons.find(r => r.id === selected)
    const reasonLabel = reason ? reason.label : 'other'
    const text = `[${selected || 'other'}] ${reasonLabel}${comment.trim() ? ' — ' + comment.trim() : ''}`

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.slice(0, 2000),
          version,
          lang,
          source: 'uninstall',
        }),
      })
    } catch {
      // Even on network failure we thank the user — the goal is a graceful exit, not a retry loop.
    } finally {
      setLoading(false)
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="text-center">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
          {t('successH1')}
        </h1>
        <p className="text-lg text-foreground/60 mb-8">{t('successBody')}</p>
        <a
          href={`https://chromewebstore.google.com/detail/apofgfejefeeepabfbaabdijnokbpcgp`}
          className="btn-primary inline-block px-8 py-3 rounded-full font-bold"
        >
          {t('reinstallCTA')}
        </a>
      </div>
    )
  }

  return (
    <div>
      <div className="text-center mb-10">
        <p className="eyebrow text-accent font-semibold text-xs tracking-widest uppercase mb-4">
          {t('eyebrow')}
        </p>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
          {t('h1')}
        </h1>
        <p className="text-lg text-foreground/60">{t('subtitle')}</p>
      </div>

      <div className="card p-6 mb-6">
        <p className="text-sm font-semibold text-foreground/60 mb-4">{t('reasonsLabel')}</p>
        <div className="space-y-3">
          {reasons.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelected(r.id)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                selected === r.id
                  ? 'border-accent bg-accent/10 text-foreground font-semibold'
                  : 'border-border bg-muted text-foreground/80 hover:border-accent/50'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={commentPlaceholder}
          rows={3}
          maxLength={2000}
          className={`mt-4 w-full bg-muted border rounded-lg px-4 py-3 text-foreground text-sm focus:outline-none focus:border-accent ${
            needsDetail && !comment.trim() ? 'border-accent/60' : 'border-border'
          }`}
        />
        {needsDetail && !comment.trim() && (
          <p className="mt-2 text-xs text-accent">{t('missingFeatureRequired')}</p>
        )}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="btn-primary w-full px-8 py-3 rounded-full font-bold disabled:opacity-50"
      >
        {loading ? t('sending') : t('submit')}
      </button>
    </div>
  )
}
