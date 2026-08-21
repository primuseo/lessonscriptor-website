'use client'
import { useTranslations, useLocale } from 'next-intl'
import { useState } from 'react'

interface FormData {
  name: string
  email: string
  subject: string
  message: string
}

export default function ContactPage() {
  const t = useTranslations('contact')
  const locale = useLocale()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setError(t('error'))
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError(t('error'))
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          locale,
        }),
      })

      if (response.ok) {
        setSubmitted(true)
      } else {
        setError(t('error'))
      }
    } catch (err) {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-14">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-dark mb-4">
          {t('h1')}
        </h1>
        <p className="text-lg text-muted">
          {t('subtitle')}
        </p>
      </div>

      {submitted ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-6">✉️</div>
          <p className="text-lg text-dark">{t('success')}</p>
        </div>
      ) : (
      <>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-dark mb-2">
            {t('name')}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-amber-600 transition-colors"
            placeholder={t('namePlaceholder') || 'Your name'}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-dark mb-2">
            {t('email')}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-amber-600 transition-colors"
            placeholder={t('emailPlaceholder') || 'your@email.com'}
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-semibold text-dark mb-2">
            {t('subject')}
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-amber-600 transition-colors"
            placeholder={t('subjectPlaceholder') || 'Subject'}
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-dark mb-2">
            {t('message')}
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={6}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-amber-600 transition-colors resize-none"
            placeholder={t('messagePlaceholder') || 'Your message...'}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-dark text-primary-foreground font-bold rounded-lg hover:opacity-[0.88] transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('sending') || 'Sending...' : t('submit') || 'Send Message'}
        </button>
      </form>
      </>
      )}

    </div>
  )
}
