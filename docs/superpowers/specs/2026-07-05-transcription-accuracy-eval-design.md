# Transcription Accuracy Eval — Design Spec

**Date**: 2026-07-05
**Repo**: `lessonscriptor-website`
**Status**: Draft for review

## Problem

Users report inaccurate transcriptions and lost content. We have no repeatable
way to measure transcription quality, compare models, or know whether a change
(model swap, prompt tweak) helps or regresses. Model choice today is driven by
benchmark blogs, not by LessonScriptor's own audio.

This spec defines an **API-level** evaluation harness that measures transcription
accuracy on a curated test set, plus a Claude-in-the-loop analysis step that reads
the results, identifies failure patterns, and proposes the next batch of test cases.

## Goals

- Measure transcription accuracy (WER) on cases where reliable ground truth exists.
- Compare candidate models/configs on the *same* audio, deterministically.
- Produce a stable JSON artifact Claude can re-read to detect failure patterns
  (e.g. "proper nouns 3× the mean WER", "WER climbs above noise:high").
- Be re-runnable so two runs can be diffed → free regression detection.

## Non-Goals (YAGNI)

- **No Playwright / end-to-end extension automation.** This tests the model+route
  layer (accuracy), not the capture layer (chunking/audio routing). E2E is a
  possible later "layer 2", only if a pattern points at capture.
- No automated video discovery, no dashboard, no CI gate (yet).
- The "propose next batch" step is **conversational** (Claude reads the JSON and
  proposes), not an automated generator.

## Key findings that shape this design

From manual benchmarking on 2026-07-05 (Indian-accent clip + Stephen Fry clip):

1. **gpt-4o-transcribe omits hard content** — it truncates/drops low-confidence
   speech (3/3 hard chunks). For a lecture tool this is the worst failure mode.
   gpt-4o-mini is cleaner but still drops the hardest fragments.
2. **Groq `whisper-large-v3-turbo` captures-through** — garbles some words but
   keeps content. It is the current prod default and the completeness baseline.
3. **The confidence signal is usable per-chunk** — per-chunk `avg_logprob` varies
   (-0.14 → -0.63) and tracks difficulty, even though it is constant *within* a
   single call.
4. **Language must be pinned** — non-turbo `whisper-large-v3` hallucinated Malay on
   accented English with no `language` set; pinning `en` fixed it. Every model
   benefits from a guaranteed `language`.
5. Ground truth (human subs) exists mainly for *clean* audio; the *hard* cases
   users complain about rarely have human subtitles → two-tier test set.

## Architecture

```
eval/
  testset.json          # manifest: one entry per case + metadata/tags
  fixtures/             # gitignored: downloaded audio + reference subs
  results/<date>.json   # per-run output (per-case + aggregate)
  harness.py            # download → transcribe → WER → store
  wer.py                # pure-python WER (word Levenshtein, sub/ins/del)
  subs.py               # fetch human subs, clean, normalize
  requirements.txt      # minimal; WER hand-rolled, no jiwer
  .venv/                # gitignored
```

Language: **Python + venv** (natural for audio/WER). WER implemented by hand
(~30 lines) — no heavy deps.

### Test set (`testset.json`) — two tiers

Each case:
```jsonc
{
  "id": "ted-mcgonigal-stress",
  "tier": 1,                          // 1 = WER-scored, 2 = qualitative
  "url": "https://www.youtube.com/watch?v=RcGyVTAoXEU",
  "segment": { "start": 60, "dur": 120 },   // optional; omit = whole video
  "language": "en",                   // pinned on every call (prevents drift)
  "tags": { "accent": "us", "noise": "low", "domain": "psychology",
            "speakers": 1 },
  "ground_truth": "human_subs"        // tier 1; tier 2 omits this
}
```

- **Tier 1 — WER-scored**: human-subtitled sources (primarily TED, some
  university). Includes accented-but-clean TED speakers for partial hard coverage.
- **Tier 2 — qualitative**: genuinely hard audio (strong accent, noise) with no
  ground truth → multi-model side-by-side + human judgment; track "omission vs
  error", no WER.

### Ground truth (`subs.py`)

- Fetch with `yt-dlp --write-subs --sub-langs "en.*"` — **manual tracks only**,
  never `--write-auto-subs`. Probe must accept `en`, `en-US`, `en-GB` (the
  first-pass probe that only checked `en` produced false negatives).
- Reject a case at build time if only automatic captions exist.
- Clean: strip timestamps/cues, `[Music]`/`[Applause]`, speaker labels.
- Normalize before WER: lowercase, strip punctuation, collapse whitespace,
  spell out or standardize numbers. Same normalization applied to hypothesis.
- **Caveat (documented, accepted for v1):** TED human subs are lightly edited
  (dropped fillers, minor grammar fixes), so they are a near- but not
  verbatim-reference — a small, known source of reference noise.

### Execution (`harness.py`)

- Per case: transcribe via the **production config** (Groq `whisper-large-v3-turbo`,
  `language` pinned from the case or a default) — the path we want to monitor.
- A **pluggable model list** lets a run also transcribe candidates
  (`whisper-large-v3`, `gpt-4o-mini-transcribe`, `gpt-4o-transcribe`) on the same
  audio for comparison.
- Tier 1: compute WER + substitutions/insertions/deletions (the S/I/D split
  distinguishes "omits" from "mis-hears").
- Record latency per call. Keys from env (`GROQ_API_KEY`, `OPENAI_API_KEY`),
  never committed.

### Results (`results/<date>.json`)

```jsonc
{
  "run_at": "2026-07-05T...",           // ISO timestamp of the run
  "cases": [
    { "id": "...", "tier": 1, "model": "whisper-large-v3-turbo",
      "wer": 0.07, "sub": 4, "ins": 1, "del": 9, "latency_s": 1.1,
      "tags": {...}, "transcript": "...", "reference": "..." }
  ],
  "summary_by_tag": { "accent:us": {"mean_wer": ...}, "noise:high": {...} }
}
```

### Analysis loop (Claude, conversational)

1. Run `harness.py` → `results/<date>.json`.
2. Claude reads the JSON, correlates WER/S-I-D with tags, surfaces patterns
   ("del-heavy on accent:in → model omitting accented speech").
3. Claude proposes the next batch of cases targeting the weakness; user approves;
   cases added to `testset.json`; re-run.

The harness *produces data*; the intelligence lives in Claude reading a stable
artifact. This keeps the script deterministic and the loop re-runnable.

## Risks / open questions

- **Hard cases lack ground truth** — the core limitation. Tier 2 (qualitative)
  is the mitigation; if hard WER numbers are ever required, that needs human
  transcription of a few key clips (out of scope for v1).
- **YouTube ToS / availability** — fixtures are downloaded locally for eval only,
  gitignored, not redistributed. Videos can disappear; the manifest records IDs so
  gaps are visible.
- **TED subs edited, not verbatim** — accepted reference noise for v1.

## Success criteria

- `harness.py` runs a ≥5-case Tier 1 set end-to-end and emits a valid results JSON.
- WER + S/I/D computed against normalized human-sub references.
- At least one candidate model comparison reproducible on the same audio.
- Claude can read the JSON and produce a tag-correlated failure summary.
