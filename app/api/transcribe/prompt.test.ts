import { describe, it, expect } from 'vitest'
import { buildWhisperPrompt } from './prompt'

/**
 * Whisper mimics the punctuation style of its prompt. The prompt is seeded
 * with the previous chunk's own output, so one unpunctuated chunk (an
 * occasional Groq whisper-large-v3 failure mode on short/noisy audio) used to
 * poison every subsequent chunk for the rest of the session: unpunctuated
 * prompt → unpunctuated output → unpunctuated prompt → ...
 *
 * The guard: previous transcript is only worth feeding back when it actually
 * carries sentence punctuation.
 */
describe('buildWhisperPrompt', () => {
  it('includes a punctuated previous transcript for boundary accuracy', () => {
    const prompt = buildWhisperPrompt('The lecture covers photosynthesis. Now, moving on!', '')
    expect(prompt).toContain('photosynthesis')
  })

  it('drops an unpunctuated previous transcript so it cannot poison the style', () => {
    const poisoned = 'so once you have that your grok bots can now just work off this board they can go autonomous'
    const prompt = buildWhisperPrompt(poisoned, '')
    expect(prompt ?? '').not.toContain('grok')
  })

  it('accepts CJK sentence punctuation as punctuated', () => {
    const prompt = buildWhisperPrompt('这节课讲光合作用。现在继续！', '')
    expect(prompt).toContain('光合作用')
  })

  it('keeps the custom dictionary even when the previous transcript is dropped', () => {
    const prompt = buildWhisperPrompt('unpunctuated poison text', 'LessonScriptor, Canva, Groq')
    expect(prompt).toContain('LessonScriptor')
    expect(prompt).not.toContain('poison')
  })

  it('returns undefined when there is nothing usable', () => {
    expect(buildWhisperPrompt('', '')).toBeUndefined()
    expect(buildWhisperPrompt('no punctuation here either', '')).toBeUndefined()
  })

  it('keeps the existing length limits (last 200 of transcript, first 200 of dictionary)', () => {
    const longPrev = 'x'.repeat(300) + ' final punctuated sentence.'
    const longDict = 'y'.repeat(300)
    const prompt = buildWhisperPrompt(longPrev, longDict)!
    expect(prompt).toContain('final punctuated sentence.')
    expect(prompt.length).toBeLessThanOrEqual(200 + 2 + 200)
  })
})
