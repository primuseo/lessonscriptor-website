'use client'
import { useTranslations } from 'next-intl'

export default function PrivacyPage() {
  const t = useTranslations('privacy')

  return (
    <article className="max-w-3xl mx-auto px-4 py-16">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-terra-800 mb-4">
          {t('h1')}
        </h1>
        <p className="text-terra-800/60 italic">
          {t('lastUpdated')}: April 29, 2026
        </p>
      </header>

      <div className="prose prose-lg max-w-none space-y-8 text-light-txt leading-relaxed">

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">{t('whoWeAre')}</h2>
          <p>
            LessonScriptor is a Chrome extension developed and operated by Pierre Girardot. We are committed to protecting your privacy and respecting the European General Data Protection Regulation (GDPR) and other applicable privacy laws. For any privacy-related questions, you can contact us at <a href="mailto:contact@lessonscriptor.com" className="text-accent-500 hover:underline">contact@lessonscriptor.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">{t('whatWeCollect')}</h2>
          <p>
            LessonScriptor is designed with privacy by default. <strong>We do not collect personal data about you. We do not create accounts for you, and we never ask for your email address. There is no sign-up — ever.</strong>
          </p>
          <p>
            <strong>Microphone Mode:</strong> All audio processing happens locally on your device using the Web Speech API. Audio never leaves your device and is never sent to any server. Transcripts are stored only in your browser&apos;s local storage. We have no access to this data.
          </p>
          <p>
            <strong>Tab Audio Mode:</strong> When you use Tab Audio mode, audio chunks from the browser tab are sent to Groq (api.groq.com) for transcription using their Whisper model. Groq does not retain audio data beyond the transcription request. Transcripts are saved locally in your browser only and are never transmitted to LessonScriptor&apos;s servers. We do not retain any personal data.
          </p>
          <p>
            We do not use cookies. We do not use analytics tools. We do not track your browsing, behavior, or usage patterns. We do not sell data.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">{t('localStorage')}</h2>
          <p>
            Your transcripts and extension settings are stored exclusively in your browser&apos;s local storage. This data lives on your device only. LessonScriptor has no server-side storage of transcripts, settings, or user information. If you clear your browser data, your local transcripts will be deleted. We cannot access or recover this data for you.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">{t('paymentsTitle')}</h2>
          <p>
            Tab Audio credits are purchased through <strong>LemonSqueezy</strong>, a third-party payment processor. Your payment details and personal information are handled entirely by LemonSqueezy — LessonScriptor never receives or stores your payment information, billing address, or email address.
          </p>
          <p>
            Upon purchase, LemonSqueezy provides an anonymous license key. That key is stored locally on your device only. LessonScriptor has no way to associate your license key with your identity. Please review <a href="https://www.lemonsqueezy.com/privacy" target="_blank" rel="noopener noreferrer" className="text-accent-500 hover:underline">LemonSqueezy&apos;s privacy policy</a> for details on how they handle payment data.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">{t('thirdParty')}</h2>
          <p>
            <strong>Groq (api.groq.com):</strong> Tab Audio mode users have audio processed by Groq&apos;s Whisper model for high-accuracy transcription. Audio chunks are sent to Groq, processed, and not retained beyond the request. Please review <a href="https://groq.com/privacy-policy/" target="_blank" rel="noopener noreferrer" className="text-accent-500 hover:underline">Groq&apos;s privacy policy</a> for details on how they handle data.
          </p>
          <p>
            <strong>LemonSqueezy:</strong> Handles all payment processing for Tab Audio credit purchases. See the Payments section above.
          </p>
          <p>
            <strong>Google Search Console:</strong> We use Google Search Console to monitor the aggregate search performance of our website (lessonscriptor.com). This is limited to non-personally-identifiable search metrics and does not track individual users.
          </p>
          <p>
            We do not share your data with any other third parties.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">{t('gdprRights')}</h2>
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
            <strong>Important note:</strong> Since LessonScriptor does not collect personal data on our servers, most of these rights are moot for data processed by us. Your transcripts exist only in your browser&apos;s local storage, which you control directly. If you have questions about your rights, please contact us at <a href="mailto:contact@lessonscriptor.com" className="text-accent-500 hover:underline">contact@lessonscriptor.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">{t('dataRetention')}</h2>
          <p>
            LessonScriptor retains no personal data on our servers. Your transcripts and settings are retained only in your browser&apos;s local storage for as long as you choose to keep them. You can delete them at any time by clearing your browser data or uninstalling the extension.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">{t('changes')}</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by updating the &quot;last updated&quot; date on this page. Your continued use of LessonScriptor after such changes constitutes your acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">{t('contactTitle')}</h2>
          <p>
            If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us at:
          </p>
          <p className="mt-4 font-semibold">
            LessonScriptor<br />
            Email: <a href="mailto:contact@lessonscriptor.com" className="text-accent-500 hover:underline">contact@lessonscriptor.com</a>
          </p>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-cream-200 text-sm text-terra-800/60 italic">
        <p>{t('englishNote')}</p>
      </div>
    </article>
  )
}
