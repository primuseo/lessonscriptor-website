// Whisper mimics the punctuation style of its prompt. Since the prompt is
// seeded with the previous chunk's own output, a single unpunctuated chunk
// (an occasional Groq failure mode on short/noisy audio) would otherwise
// poison every subsequent chunk in the session — the transcript degrades to
// lowercase text with no punctuation and never recovers.
const SENTENCE_PUNCTUATION = /[.!?。！？]/

export function buildWhisperPrompt(
  previousTranscript: unknown,
  customDictionary: unknown
): string | undefined {
  const promptParts: string[] = []

  if (
    previousTranscript &&
    typeof previousTranscript === 'string' &&
    SENTENCE_PUNCTUATION.test(previousTranscript)
  ) {
    promptParts.push(previousTranscript.slice(-200))
  }
  if (customDictionary && typeof customDictionary === 'string') {
    promptParts.push(customDictionary.slice(0, 200))
  }

  return promptParts.length > 0 ? promptParts.join('. ') : undefined
}
