import { readFileSync } from 'fs'
import { describe, it, expect } from 'vitest'

/**
 * Regression guard for the "missing blocks of audio" bug.
 *
 * The route used to short-circuit with `{ silent: true }` based on a raw
 * byte-average heuristic (`looksLikeSilence`). That logic only holds for
 * uncompressed PCM. The extension sends COMPRESSED audio (webm/opus, mp4/aac),
 * whose bytes are near-uniformly distributed 0-255 → mean ≈ 127.5, which lands
 * inside the heuristic's `[125,131]` "silence" band. Measured against real
 * compressed speech it dropped 25% (m4a) to 44% (webm) of legitimate 10s
 * chunks — each returned `{silent:true}` and was discarded client-side with no
 * retry. That was the root cause of missing transcript blocks.
 *
 * True silence is handled downstream by Whisper (empty text) + isHallucination.
 * Do NOT reintroduce a byte-average silence gate.
 */
describe('transcribe route: no byte-average silence gate', () => {
  const src = readFileSync(new URL('./route.ts', import.meta.url), 'utf8')

  it('does not contain a looksLikeSilence heuristic', () => {
    expect(src).not.toMatch(/looksLikeSilence/)
  })

  it('does not gate on a raw byte-average silence band', () => {
    // e.g. `avg > 125 && avg < 131` — meaningless for compressed audio
    expect(src).not.toMatch(/avg\s*[<>]/)
  })

  it('demonstrates why: the old heuristic misclassifies compressed audio', () => {
    // The exact removed logic, kept here only to document the failure mode.
    const looksLikeSilence = (buffer: Buffer): boolean => {
      if (buffer.length < 100) return true
      const step = Math.max(1, Math.floor(buffer.length / 200))
      let sum = 0
      let count = 0
      for (let i = 0; i < buffer.length; i += step) {
        sum += buffer[i]
        count++
      }
      const avg = sum / count
      return avg < 3 || (avg > 125 && avg < 131)
    }
    // Compressed audio's bytes are near-uniform 0-255, so their mean sits
    // around 127.5 — the crux of the bug. A buffer centered at 128 isolates
    // exactly that property (measured medians on real m4a/webm speech were
    // 122-126, all in or beside the [125,131] band).
    const meanCenteredLikeCompressedAudio = Buffer.alloc(60000, 128)
    // This is the bug: audio that centers near 128 gets called "silence".
    expect(looksLikeSilence(meanCenteredLikeCompressedAudio)).toBe(true)
  })
})
