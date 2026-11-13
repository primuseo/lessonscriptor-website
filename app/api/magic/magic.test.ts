import { describe, it, expect } from 'vitest'
import {
  buildMessages,
  letterCount,
  validateLineResults,
  validateNotes,
  validateRequest,
} from './magic'

const lines = [
  { id: 'l1', text: 'so um today we talk about cells and the cell is the basic unit of life' },
  { id: 'l2', text: 'mitochondria make energy for the cell' },
]

describe('letterCount', () => {
  it('counts letters and digits in any script, ignoring spaces and punctuation', () => {
    expect(letterCount('Hello, world 42!')).toBe(12)
    expect(letterCount('细胞是生命的基本单位。')).toBe(10)
  })
})

describe('validateLineResults', () => {
  it('keeps a valid format item', () => {
    const raw = { items: [{ id: 'l2', paragraphs: ['Mitochondria make energy for the cell.'] }] }
    expect(validateLineResults('format', lines, raw)).toEqual([
      { id: 'l2', paragraphs: ['Mitochondria make energy for the cell.'] },
    ])
  })

  it('drops unknown ids, duplicate ids, and non-string paragraphs', () => {
    const raw = {
      items: [
        { id: 'zz', paragraphs: ['Hello.'] },
        { id: 'l2', paragraphs: ['Mitochondria make energy for the cell.'] },
        { id: 'l2', paragraphs: ['Mitochondria make energy for the cell.'] },
        { id: 'l1', paragraphs: [42] },
      ],
    }
    expect(validateLineResults('format', lines, raw)).toEqual([])
  })

  it('drops a format item that lost half its letters', () => {
    const raw = { items: [{ id: 'l1', paragraphs: ['Today we talk about cells.'] }] }
    expect(validateLineResults('format', lines, raw)).toEqual([])
  })

  it('accepts a cleanup item that removed fillers (ratio ~0.9)', () => {
    const raw = { items: [{ id: 'l1', paragraphs: ['Today we talk about cells.', 'The cell is the basic unit of life.'] }] }
    expect(validateLineResults('cleanup', lines, raw)).toHaveLength(1)
  })

  it('accepts a short organize heading', () => {
    const ok = { items: [{ id: 'l2', heading: 'Energy in the cell', paragraphs: ['Mitochondria make energy for the cell.'] }] }
    expect(validateLineResults('organize', lines, ok)[0].heading).toBe('Energy in the cell')
  })

  it('ignores a heading outside organize mode', () => {
    const raw = { items: [{ id: 'l2', heading: 'Energy', paragraphs: ['Mitochondria make energy for the cell.'] }] }
    expect(validateLineResults('format', lines, raw)).toEqual([
      { id: 'l2', paragraphs: ['Mitochondria make energy for the cell.'] },
    ])
  })

  it('uses letters, not words, so CJK text is checked fairly', () => {
    const cjk = [{ id: 'c1', text: '细胞是生命的基本单位线粒体为细胞提供能量' }]
    const raw = { items: [{ id: 'c1', paragraphs: ['细胞是生命的基本单位。', '线粒体为细胞提供能量。'] }] }
    expect(validateLineResults('format', cjk, raw)).toHaveLength(1)
  })

  it('returns [] for garbage', () => {
    expect(validateLineResults('format', lines, null)).toEqual([])
    expect(validateLineResults('format', lines, { items: 'x' })).toEqual([])
  })
})

describe('validateNotes', () => {
  it('accepts well-formed notes and caps list sizes at 12', () => {
    const notes = validateNotes({
      summary: 'Cells are the unit of life.',
      key_points: Array.from({ length: 20 }, (_, i) => `Point ${i}`),
      terms: Array.from({ length: 20 }, (_, i) => ({ term: `T${i}`, definition: 'd' })),
    })
    expect(notes?.key_points).toHaveLength(12)
    expect(notes?.terms).toHaveLength(12)
  })

  it('rejects notes without a summary', () => {
    expect(validateNotes({ key_points: ['a'] })).toBeNull()
  })

  it('drops malformed terms', () => {
    const notes = validateNotes({ summary: 's', key_points: [], terms: [{ term: 'a' }, { term: 'b', definition: 'c' }] })
    expect(notes?.terms).toEqual([{ term: 'b', definition: 'c' }])
  })
})

describe('validateRequest', () => {
  it('accepts a format request', () => {
    const r = validateRequest({ mode: 'format', lines })
    expect(r.ok).toBe(true)
  })

  it('rejects an unknown mode', () => {
    expect(validateRequest({ mode: 'translate', lines }).ok).toBe(false)
  })

  it('rejects more than 80 lines', () => {
    const many = Array.from({ length: 81 }, (_, i) => ({ id: `l${i}`, text: 'a' }))
    expect(validateRequest({ mode: 'format', lines: many }).ok).toBe(false)
  })

  it('rejects more than 12,000 characters', () => {
    expect(validateRequest({ mode: 'format', lines: [{ id: 'a', text: 'x'.repeat(12001) }] }).ok).toBe(false)
  })

  it('rejects empty lines arrays and non-string ids', () => {
    expect(validateRequest({ mode: 'format', lines: [] }).ok).toBe(false)
    expect(validateRequest({ mode: 'format', lines: [{ id: 1, text: 'a' }] }).ok).toBe(false)
  })

  it('accepts notes_merge with partials and rejects it with lines only', () => {
    const partial = { summary: 's', key_points: ['a'], terms: [] }
    expect(validateRequest({ mode: 'notes_merge', partials: [partial, partial] }).ok).toBe(true)
    expect(validateRequest({ mode: 'notes_merge', lines }).ok).toBe(false)
  })
})

describe('buildMessages', () => {
  it('forbids translation and includes the mode instruction', () => {
    const messages = buildMessages('cleanup', { lines }, 'fr')
    expect(messages[0].role).toBe('system')
    expect(messages[0].content).toContain('Never translate')
    expect(messages[0].content).toMatch(/filler/i)
    expect(messages[1].content).toContain('"l1"')
  })

  it('asks organize for headings and notes for a summary', () => {
    expect(buildMessages('organize', { lines })[0].content).toMatch(/heading/i)
    expect(buildMessages('notes', { lines })[0].content).toMatch(/summary/i)
  })
})

describe('review fixes: wording must be kept', () => {
  const fr = [{ id: 'f1', text: "bon alors aujourd'hui on va parler de la révolution française qui commence en 1789 avec la convocation des états généraux" }]

  it('drops a French line translated to English even if its length is similar', () => {
    const raw = { items: [{ id: 'f1', paragraphs: ['So today we are going to talk about the French Revolution, which begins in 1789 with the summoning of the Estates General.'] }] }
    expect(validateLineResults('format', fr, raw)).toEqual([])
    expect(validateLineResults('cleanup', fr, raw)).toEqual([])
  })

  it('keeps a correctly formatted French line', () => {
    const raw = { items: [{ id: 'f1', paragraphs: ["Bon, alors aujourd'hui, on va parler de la Révolution française, qui commence en 1789 avec la convocation des États généraux."] }] }
    expect(validateLineResults('format', fr, raw)).toHaveLength(1)
  })

  it('drops a cleanup that keeps only ~55% of the text', () => {
    const long = [{ id: 'c', text: 'the cell cycle is the series of events that a cell goes through as it grows and divides and there are two main phases interphase and the mitotic phase' }]
    const raw = { items: [{ id: 'c', paragraphs: ['The cell cycle is the series of events a cell goes through as it grows.'] }] }
    expect(validateLineResults('cleanup', long, raw)).toEqual([])
  })

  it('checks CJK text with character pairs', () => {
    const cjk = [{ id: 'c1', text: '细胞是生命的基本单位线粒体为细胞提供能量' }]
    const english = { items: [{ id: 'c1', paragraphs: ['The cell is the basic unit of life and mitochondria provide energy.'] }] }
    expect(validateLineResults('format', cjk, english)).toEqual([])
  })

  it('keeps the paragraphs when only the organize heading is bad', () => {
    const raw = { items: [{ id: 'l2', heading: 'one two three four five six seven eight nine ten eleven twelve', paragraphs: ['Mitochondria make energy for the cell.'] }] }
    expect(validateLineResults('organize', lines, raw)).toEqual([{ id: 'l2', paragraphs: ['Mitochondria make energy for the cell.'] }])
  })
})

describe('review fixes: notes merge size', () => {
  it('accepts up to 40 partials and 40,000 characters', () => {
    const partial = { summary: 'x'.repeat(800), key_points: ['a'.repeat(100)], terms: [] }
    expect(validateRequest({ mode: 'notes_merge', partials: Array(30).fill(partial) }).ok).toBe(true)
    expect(validateRequest({ mode: 'notes_merge', partials: Array(41).fill({ summary: 's', key_points: [], terms: [] }) }).ok).toBe(false)
  })
})

describe('outputTokenBudget', () => {
  it('gives token-heavy scripts more room than Latin text of the same length', async () => {
    const { outputTokenBudget } = await import('./magic')
    const latin = outputTokenBudget('word '.repeat(1000))
    const cjk = outputTokenBudget('细胞是生命的基本单位'.repeat(500))
    expect(cjk).toBeGreaterThan(5000)
    expect(latin).toBeGreaterThan(1500)
    expect(cjk).toBeGreaterThan(latin)
    expect(outputTokenBudget('x'.repeat(100000))).toBe(8000)
  })
})
