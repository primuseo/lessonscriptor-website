# Transcription Accuracy Eval

API-level eval for LessonScriptor transcription. See the design spec:
`docs/superpowers/specs/2026-07-05-transcription-accuracy-eval-design.md`.

## Setup
```bash
cd eval && python3 -m venv .venv && ./.venv/bin/pip install -r requirements.txt
```
Requires `yt-dlp` and `ffmpeg` on PATH. Set `GROQ_API_KEY` and `OPENAI_API_KEY`.

## Run
From the repo root:
```bash
# prod path only:
eval/.venv/bin/python -m eval.harness
# compare candidates on the same audio:
eval/.venv/bin/python -m eval.harness groq-turbo,groq-v3,gpt-4o-mini,gpt-4o
```
Results land in `eval/results/<date>.json` (gitignored). Ground truth = manual
YouTube subtitles only; Tier-2 cases have no reference (qualitative).
