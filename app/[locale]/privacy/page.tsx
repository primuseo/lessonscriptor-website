'use client'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

export default function PrivacyPage() {
  const t = useTranslations('privacy')
  const params = useParams()
  const locale = params.locale as string

  // Calculate base path for canonical URL
  const base = locale === 'en' ? '' : `/${locale}`

  return (
    <article className="max-w-3xl mx-auto px-4 py-16">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-terra-800 mb-4">
          {t('h1')}
        </h1>
        <p className="text-terra-800/60 italic">
          {t('lastUpdated')}: April 27, 2026
        </p>
      </header>

      {/* Privacy Policy Content (English, legally accurate) */}
      <div className="prose prose-lg max-w-none space-y-8 text-light-txt leading-relaxed">

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">Who We Are</h2>
          <p>
            LessonScriptor is a Chrome extension developed and operated by Pierre Girardot. We are committed to protecting your privacy and respecting the European General Data Protection Regulation (GDPR) and other applicable privacy laws. For any privacy-related questions, you can contact us at <a href="mailto:contact@lessonscriptor.com" className="text-accent-500 hover:underline">contact@lessonscriptor.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">What Data We Collect</h2>
          <p>
            LessonScriptor is designed with privacy by default. <strong>We do not collect personal data about you.</strong>
          </p>
          <p>
            <strong>Free Mode:</strong> All audio processing happens locally on your device using the Web Speech API. The audio is never sent to our servers. Transcripts are stored only in your browser's local storage, on your device. We have no access to this data.
          </p>
          <p>
            <strong>Premium Mode:</strong> When you use Premium mode, audio from the video is sent to the Grok API (operated by xAI) for transcription. Once the transcription is complete, the audio is immediately deleted by Grok and never stored by LessonScriptor or on our servers. Transcripts are still stored locally in your browser's local storage. We do not retain any personal data.
          </p>
          <p>
            We do not use cookies. We do not use analytics tools. We do not track your behavior or usage patterns.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">Local Storage</h2>
          <p>
            Your transcripts and extension settings are stored exclusively in your browser's local storage. This data lives on your device only. LessonScriptor has no server-side storage of transcripts, settings, or user information. If you clear your browser data, your local transcripts will be deleted. We cannot access or recover this data for you.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">Third-Party Services</h2>
          <p>
            <strong>Google Search Console:</strong> We use Google Search Console to monitor the aggregate search performance of our website (lessonscriptor.com). This is limited to non-personally-identifiable search metrics and does not track individual users.
          </p>
          <p>
            <strong>Grok API (xAI):</strong> Premium mode users have the option to use Grok (xAI) for high-accuracy transcription. Audio is sent to the Grok API, processed, and immediately deleted. Please review <a href="https://grok.x.ai/privacy" target="_blank" rel="noopener noreferrer" className="text-accent-500 hover:underline">xAI's privacy policy</a> for details on how they handle data.
          </p>
          <p>
            We do not share your data with any other third parties.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">Your Rights Under GDPR</h2>
          <p>
            Under the GDPR, you have the following rights:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong>Right to Access:</strong> You have the right to request a copy of the personal data we hold about you.</li>
            <li><strong>Right to Rectification:</strong> You have the right to correct inaccurate personal data.</li>
            <li><strong>Right to Erasure:</strong> You have the right to request the deletion of your personal data.</li>
            <li><strong>Right to Data Portability:</strong> You have the right to request your personal data in a portable format.</li>
            <li><strong>Right to Object:</strong> You have the right to object to our processing of your personal data.</li>
          </ul>
          <p className="mt-4">
            <strong>Important note:</strong> Since LessonScriptor does not collect personal data on our servers, most of these rights are moot for data processed by us. Your transcripts exist only in your browser's local storage, which you control directly. If you have questions about your rights, please contact us at <a href="mailto:contact@lessonscriptor.com" className="text-accent-500 hover:underline">contact@lessonscriptor.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">Data Retention</h2>
          <p>
            LessonScriptor retains no personal data on our servers. Your transcripts and settings are retained only in your browser's local storage for as long as you choose to keep them. You can delete them at any time by clearing your browser data or uninstalling the extension.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by updating the "last updated" date on this page. Your continued use of LessonScriptor after such changes constitutes your acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">Contact Us</h2>
          <p>
            If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us at:
          </p>
          <p className="mt-4 font-semibold">
            LessonScriptor<br />
            Email: <a href="mailto:contact@lessonscriptor.com" className="text-accent-500 hover:underline">contact@lessonscriptor.com</a>
          </p>
        </section>

      </div>

      {/* Note about language */}
      <div className="mt-12 pt-8 border-t border-cream-200 text-sm text-terra-800/60 italic">
        <p>
          This Privacy Policy is provided in English across all language versions of our website. English is the authoritative version.
        </p>
      </div>
    </article>
  )
}
