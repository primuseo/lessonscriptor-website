'use client'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

export default function TermsPage() {
  const t = useTranslations('terms')
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

      {/* Terms of Use Content (English, legally accurate) */}
      <div className="prose prose-lg max-w-none space-y-8 text-light-txt leading-relaxed">

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">1. Acceptance of Terms</h2>
          <p>
            By installing, accessing, or using LessonScriptor (the "Extension"), you agree to be bound by these Terms of Use. If you do not agree with any part of these terms, you must not use the Extension.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">2. Description of Service</h2>
          <p>
            LessonScriptor is a free Chrome extension that provides real-time AI transcription of video content viewed in your web browser. The Extension operates in two modes: Free Mode and Premium Mode (described below). The Extension allows you to transcribe, edit, highlight, and export transcripts of video content to which you have authorized access.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">3. Free Mode</h2>
          <p>
            Free Mode is completely free and has no restrictions on usage. There is no time limit, no transcript limit, and no sign-up required. Free Mode uses the Web Speech API, which processes audio locally on your device. Free Mode is provided indefinitely at no cost.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">4. Premium Mode — Pay-as-You-Go</h2>
          <p>
            Premium Mode uses advanced transcription powered by Grok (xAI), offering higher accuracy and compatibility with headphones. Premium Mode operates on a pay-as-you-go credit system. You purchase credits in packs (€10, €20, €30, etc.), and credits are consumed based on the duration of audio transcribed (approximately €1 per hour).
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong>No Refunds on Used Credits:</strong> Credits used for transcription are non-refundable. You may request a refund for credits purchased in error within 30 days of purchase.</li>
            <li><strong>Credit Expiration:</strong> Credits do not expire. They remain in your account indefinitely until used.</li>
            <li><strong>Account Responsibility:</strong> You are responsible for managing your account and credit balance. We are not responsible for unauthorized use if you share your account credentials.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">5. License and Intellectual Property</h2>
          <p>
            LessonScriptor is distributed under an "All rights reserved" license.
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong>Personal Use:</strong> The Extension is free for personal, non-commercial use.</li>
            <li><strong>Student Use:</strong> The Extension is free for students, educators, and academic institutions for educational purposes.</li>
            <li><strong>Non-Profit Use:</strong> The Extension is free for non-profit organizations.</li>
            <li><strong>Commercial Resale Prohibited:</strong> You may not resell, repackage, or commercialize LessonScriptor without explicit written permission from the developer. Commercial use includes using the Extension to provide transcription services for payment.</li>
          </ul>
          <p className="mt-4">
            You own the transcripts you create. We claim no ownership or copyright over your transcripts. Use your transcripts as you see fit, subject to the restrictions in Section 6 below.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">6. User Responsibilities</h2>
          <p>
            You agree to use LessonScriptor only for lawful purposes and in accordance with applicable laws. You agree not to:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>Transcribe content for which you do not have authorization or rights to access.</li>
            <li>Transcribe copyrighted content for commercial distribution without proper licensing.</li>
            <li>Transcribe content that is illegal, harmful, obscene, or violates others' rights.</li>
            <li>Use the Extension to harvest, scrape, or extract data for unauthorized purposes.</li>
            <li>Reverse-engineer, decompile, or attempt to circumvent the Extension's functionality.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">7. Privacy</h2>
          <p>
            Your use of LessonScriptor is also governed by our <a href={`https://lessonscriptor.com${base}/privacy`} className="text-accent-500 hover:underline">Privacy Policy</a>. Please review it to understand our privacy practices.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">8. Disclaimer of Warranties</h2>
          <p>
            The Extension is provided "as is" and "as available" without any representations or warranties, express or implied. We do not guarantee that:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>The Extension will be uninterrupted, error-free, or secure.</li>
            <li>Transcriptions will be 100% accurate. While we strive for accuracy, transcription errors may occur.</li>
            <li>The Extension will be compatible with all browsers, devices, or video platforms.</li>
            <li>The Extension will meet your specific needs.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">9. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, LessonScriptor and its developer shall not be liable for:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>Any indirect, incidental, special, consequential, or punitive damages.</li>
            <li>Loss of data, revenue, profits, or business.</li>
            <li>Errors or inaccuracies in transcriptions.</li>
            <li>Unauthorized access or alteration of your transcripts.</li>
            <li>Any claim arising out of or related to your use of the Extension.</li>
          </ul>
          <p className="mt-4">
            In no event shall our total liability exceed the amount you have paid for Premium credits (if applicable) in the 12 months preceding the claim.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">10. Governing Law and Jurisdiction</h2>
          <p>
            These Terms of Use are governed by and construed in accordance with the laws of France, without regard to its conflict of law principles. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts of France.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">11. Severability</h2>
          <p>
            If any part of these Terms of Use is found to be invalid or unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">12. Modification of Terms</h2>
          <p>
            We reserve the right to modify these Terms of Use at any time. Changes will be effective immediately upon posting to this page. Your continued use of the Extension following any such change constitutes your acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">13. Contact</h2>
          <p>
            For questions about these Terms of Use or to report violations, please contact us at:
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
          These Terms of Use are provided in English across all language versions of our website. English is the authoritative version.
        </p>
      </div>
    </article>
  )
}
