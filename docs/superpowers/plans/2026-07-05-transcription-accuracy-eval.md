# Transcription Accuracy Eval — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an API-level eval harness that measures LessonScriptor transcription WER on a curated two-tier test set and emits a stable JSON artifact for failure-pattern analysis.

**Architecture:** A Python package under `eval/` with focused modules — pure-logic units (WER, subtitle cleaning) are TDD'd offline; network units (audio download, transcription) have unit-tested request-building plus env-gated smoke tests. An orchestrator reads `testset.json`, ensures fixtures, runs models, computes WER for Tier 1, and writes `results/<date>.json`.

**Tech Stack:** Python 3.11+, `requests` (HTTP multipart), `yt-dlp` + `ffmpeg` (CLI via subprocess), `pytest`. WER hand-rolled — no `jiwer`.

## Global Constraints

- API-level only — NO Playwright, NO extension automation (out of scope).
- WER implemented by hand (word-level Levenshtein with S/I/D counts) — no `jiwer`/heavy deps.
- Ground truth = **manual** YouTube subtitles only. Never `--write-auto-subs`. Probe/accept `en`, `en-US`, `en-GB`.
- Production transcription config = Groq `whisper-large-v3-turbo`, `language` pinned per case.
- API keys from env (`GROQ_API_KEY`, `OPENAI_API_KEY`) — never committed. Audio fixtures + results JSON are gitignored.
- Same normalization applied to both reference and hypothesis before WER.
- Groq base URL: `https://api.groq.com/openai/v1`; OpenAI: `https://api.openai.com/v1`. Endpoint path: `/audio/transcriptions`.

---

### Task 1: Scaffold `eval/` + WER module

**Files:**
- Create: `eval/requirements.txt`, `eval/.gitignore`, `eval/results/.gitkeep`, `eval/__init__.py`
- Create: `eval/wer.py`
- Test: `eval/tests/test_wer.py`, `eval/tests/__init__.py`

**Interfaces:**
- Consumes: nothing.
- Produces: `normalize(text: str) -> str`; `wer(reference: str, hypothesis: str) -> dict` returning `{"wer": float, "sub": int, "ins": int, "del": int, "ref_words": int}`.

- [ ] **Step 1: Create scaffold files**

`eval/requirements.txt`:
```
requests==2.32.3
yt-dlp==2025.6.9
pytest==8.3.2
```

`eval/.gitignore`:
```
.venv/
fixtures/
results/*.json
__pycache__/
*.pyc
```

`eval/results/.gitkeep`: (empty file)
`eval/__init__.py`: (empty file)
`eval/tests/__init__.py`: (empty file)

- [ ] **Step 2: Create the venv and install**

Run:
```bash
cd eval && python3 -m venv .venv && ./.venv/bin/pip install -r requirements.txt
```
Expected: installs `requests`, `yt-dlp`, `pytest` without error.

- [ ] **Step 3: Write the failing tests**

`eval/tests/test_wer.py`:
```python
from eval.wer import normalize, wer


def test_normalize_lowercases_and_strips_punctuation():
    assert normalize("Hello, World!") == "hello world"


def test_normalize_collapses_whitespace():
    assert normalize("a\n  b\tc") == "a b c"


def test_wer_identical_is_zero():
    r = wer("the cat sat", "the cat sat")
    assert r["wer"] == 0.0
    assert (r["sub"], r["ins"], r["del"]) == (0, 0, 0)


def test_wer_counts_substitution():
    r = wer("the cat sat", "the dog sat")
    assert r["sub"] == 1 and r["ins"] == 0 and r["del"] == 0
    assert r["wer"] == 1 / 3


def test_wer_counts_deletion_omitted_words():
    # hypothesis dropped two words -> deletions (the "omission" failure mode)
    r = wer("the cat sat on the mat", "the cat sat")
    assert r["del"] == 3 and r["sub"] == 0 and r["ins"] == 0


def test_wer_counts_insertion():
    r = wer("the cat sat", "the big cat sat")
    assert r["ins"] == 1 and r["sub"] == 0 and r["del"] == 0


def test_wer_empty_reference_returns_zero_division_safe():
    r = wer("", "anything here")
    assert r["ref_words"] == 0 and r["wer"] == 0.0
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `cd eval && ../eval/.venv/bin/python -m pytest tests/test_wer.py -v` (run from repo root: `cd .. && eval/.venv/bin/python -m pytest eval/tests/test_wer.py -v`)
Expected: FAIL — `ModuleNotFoundError: No module named 'eval.wer'`.

- [ ] **Step 5: Implement `eval/wer.py`**

```python
import re


def normalize(text: str) -> str:
    """Lowercase, strip punctuation to spaces, collapse whitespace."""
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def wer(reference: str, hypothesis: str) -> dict:
    """Word-level WER via Levenshtein DP with S/I/D backtrace.

    Returns {"wer", "sub", "ins", "del", "ref_words"}.
    wer = (sub + ins + del) / ref_words; 0.0 when reference is empty.
    """
    ref = normalize(reference).split()
    hyp = normalize(hypothesis).split()
    n, m = len(ref), len(hyp)

    # cost[i][j] = min edits to turn ref[:i] into hyp[:j]
    cost = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        cost[i][0] = i
    for j in range(m + 1):
        cost[0][j] = j
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if ref[i - 1] == hyp[j - 1]:
                cost[i][j] = cost[i - 1][j - 1]
            else:
                cost[i][j] = 1 + min(
                    cost[i - 1][j - 1],  # substitution
                    cost[i - 1][j],      # deletion (ref word omitted)
                    cost[i][j - 1],      # insertion (extra hyp word)
                )

    # backtrace to count operation types
    i, j = n, m
    sub = ins = dele = 0
    while i > 0 or j > 0:
        if i > 0 and j > 0 and ref[i - 1] == hyp[j - 1] and cost[i][j] == cost[i - 1][j - 1]:
            i, j = i - 1, j - 1
        elif i > 0 and j > 0 and cost[i][j] == cost[i - 1][j - 1] + 1:
            sub += 1
            i, j = i - 1, j - 1
        elif i > 0 and cost[i][j] == cost[i - 1][j] + 1:
            dele += 1
            i -= 1
        else:
            ins += 1
            j -= 1

    ref_words = n
    total = sub + ins + dele
    return {
        "wer": (total / ref_words) if ref_words else 0.0,
        "sub": sub,
        "ins": ins,
        "del": dele,
        "ref_words": ref_words,
    }
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `eval/.venv/bin/python -m pytest eval/tests/test_wer.py -v` (from repo root)
Expected: PASS (7 tests).

- [ ] **Step 7: Commit**

```bash
git add eval/requirements.txt eval/.gitignore eval/results/.gitkeep eval/__init__.py eval/wer.py eval/tests/
git commit -m "feat(eval): scaffold + hand-rolled WER with S/I/D counts"
```

---

### Task 2: Subtitle fetch, clean, normalize (`subs.py`)

**Files:**
- Create: `eval/subs.py`
- Test: `eval/tests/test_subs.py`, `eval/tests/fixtures/sample.en.vtt`

**Interfaces:**
- Consumes: nothing (uses `yt-dlp` CLI at runtime).
- Produces: `clean_vtt(vtt_text: str) -> str` (pure); `fetch_reference(url: str, out_dir: str) -> str` (raises `NoHumanSubtitlesError` if no manual track).

- [ ] **Step 1: Create the VTT fixture**

`eval/tests/fixtures/sample.en.vtt`:
```
WEBVTT

00:00:01.000 --> 00:00:03.000
Hello and <b>welcome</b> to the lecture.

00:00:03.500 --> 00:00:05.000
[Applause]

00:00:05.200 --> 00:00:07.000
Today we discuss the mitochondria.
```

- [ ] **Step 2: Write the failing tests**

`eval/tests/test_subs.py`:
```python
import os
from eval.subs import clean_vtt

FIX = os.path.join(os.path.dirname(__file__), "fixtures", "sample.en.vtt")


def test_clean_vtt_strips_header_timestamps_tags_and_nonspeech():
    text = clean_vtt(open(FIX, encoding="utf-8").read())
    assert "WEBVTT" not in text
    assert "-->" not in text
    assert "<b>" not in text and "</b>" not in text
    assert "[Applause]" not in text
    assert "Hello and welcome to the lecture." in text
    assert "Today we discuss the mitochondria." in text


def test_clean_vtt_joins_cues_with_spaces():
    text = clean_vtt(open(FIX, encoding="utf-8").read())
    assert "lecture. Today" in text  # cues joined, non-speech cue removed
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `eval/.venv/bin/python -m pytest eval/tests/test_subs.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'eval.subs'`.

- [ ] **Step 4: Implement `eval/subs.py`**

```python
import glob
import os
import re
import subprocess


class NoHumanSubtitlesError(Exception):
    """Raised when a video has no manual (human) subtitle track."""


_TAG_RE = re.compile(r"<[^>]+>")
_BRACKET_RE = re.compile(r"\[[^\]]*\]")
_TS_RE = re.compile(r"-->")


def clean_vtt(vtt_text: str) -> str:
    """Extract spoken text from a WebVTT string.

    Drops the WEBVTT header, cue-number lines, timestamp/cue-setting lines,
    inline tags, and bracketed non-speech ([Applause], [Music]). Joins the
    remaining cue text with single spaces.
    """
    lines = []
    for raw in vtt_text.splitlines():
        line = raw.strip()
        if not line:
            continue
        if line.startswith("WEBVTT") or line.startswith("NOTE"):
            continue
        if _TS_RE.search(line):
            continue
        if line.isdigit():  # SRT-style cue number
            continue
        line = _TAG_RE.sub("", line)
        line = _BRACKET_RE.sub("", line).strip()
        if line:
            lines.append(line)
    return re.sub(r"\s+", " ", " ".join(lines)).strip()


def fetch_reference(url: str, out_dir: str) -> str:
    """Download the MANUAL English subtitle track and return cleaned text.

    Never fetches auto-captions. Raises NoHumanSubtitlesError if none exist.
    """
    os.makedirs(out_dir, exist_ok=True)
    template = os.path.join(out_dir, "%(id)s.%(ext)s")
    subprocess.run(
        [
            "yt-dlp", "--skip-download", "--write-subs",
            "--sub-langs", "en.*", "--sub-format", "vtt",
            "-o", template, url,
        ],
        check=True, capture_output=True, text=True,
    )
    matches = glob.glob(os.path.join(out_dir, "*.en*.vtt"))
    if not matches:
        raise NoHumanSubtitlesError(f"No manual English subtitles for {url}")
    return clean_vtt(open(matches[0], encoding="utf-8").read())
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `eval/.venv/bin/python -m pytest eval/tests/test_subs.py -v`
Expected: PASS (2 tests). `fetch_reference` is exercised later in the live run.

- [ ] **Step 6: Commit**

```bash
git add eval/subs.py eval/tests/test_subs.py eval/tests/fixtures/sample.en.vtt
git commit -m "feat(eval): human-subtitle fetch + VTT cleaning"
```

---

### Task 3: Audio prep + transcription client (`transcribe.py`)

**Files:**
- Create: `eval/transcribe.py`
- Test: `eval/tests/test_transcribe.py`

**Interfaces:**
- Consumes: nothing (uses `yt-dlp`/`ffmpeg` CLIs and `requests` at runtime).
- Produces:
  - `MODELS: dict[str, dict]` mapping model key → `{"provider", "model"}`.
  - `download_audio(url: str, out_path: str, segment: dict | None) -> str`
  - `build_request(model_key: str, language: str | None) -> dict` returning `{"url", "auth_env", "data": {"model", "language"?, "temperature", "response_format"}}`.
  - `transcribe(audio_path: str, model_key: str, language: str | None) -> dict` returning `{"text": str, "latency_s": float}`.

- [ ] **Step 1: Write the failing tests** (pure request-building only; network paths are smoke-tested live)

`eval/tests/test_transcribe.py`:
```python
import pytest
from eval.transcribe import MODELS, build_request


def test_models_registry_has_prod_default_and_candidates():
    assert MODELS["groq-turbo"] == {"provider": "groq", "model": "whisper-large-v3-turbo"}
    assert MODELS["groq-v3"]["model"] == "whisper-large-v3"
    assert MODELS["gpt-4o-mini"]["model"] == "gpt-4o-mini-transcribe"
    assert MODELS["gpt-4o"]["model"] == "gpt-4o-transcribe"


def test_build_request_groq_targets_groq_base_and_pins_language():
    req = build_request("groq-turbo", "en")
    assert req["url"] == "https://api.groq.com/openai/v1/audio/transcriptions"
    assert req["auth_env"] == "GROQ_API_KEY"
    assert req["data"]["model"] == "whisper-large-v3-turbo"
    assert req["data"]["language"] == "en"
    assert req["data"]["temperature"] == 0


def test_build_request_openai_targets_openai_base():
    req = build_request("gpt-4o-mini", "en")
    assert req["url"] == "https://api.openai.com/v1/audio/transcriptions"
    assert req["auth_env"] == "OPENAI_API_KEY"


def test_build_request_omits_language_when_none():
    req = build_request("groq-turbo", None)
    assert "language" not in req["data"]


def test_build_request_unknown_model_raises():
    with pytest.raises(KeyError):
        build_request("nope", "en")
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `eval/.venv/bin/python -m pytest eval/tests/test_transcribe.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'eval.transcribe'`.

- [ ] **Step 3: Implement `eval/transcribe.py`**

```python
import os
import subprocess
import time

import requests

BASE_URLS = {
    "groq": "https://api.groq.com/openai/v1",
    "openai": "https://api.openai.com/v1",
}
AUTH_ENV = {"groq": "GROQ_API_KEY", "openai": "OPENAI_API_KEY"}

MODELS = {
    "groq-turbo": {"provider": "groq", "model": "whisper-large-v3-turbo"},  # prod default
    "groq-v3": {"provider": "groq", "model": "whisper-large-v3"},
    "gpt-4o-mini": {"provider": "openai", "model": "gpt-4o-mini-transcribe"},
    "gpt-4o": {"provider": "openai", "model": "gpt-4o-transcribe"},
}


def download_audio(url: str, out_path: str, segment: dict | None = None) -> str:
    """Download (optionally a segment of) a video's audio as m4a to out_path."""
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    cmd = ["yt-dlp", "-x", "--audio-format", "m4a", "-o", out_path]
    if segment:
        start = int(segment["start"])
        end = start + int(segment["dur"])
        cmd += ["--download-sections", f"*{start}-{end}"]
    cmd.append(url)
    subprocess.run(cmd, check=True, capture_output=True, text=True)
    return out_path


def build_request(model_key: str, language: str | None) -> dict:
    spec = MODELS[model_key]
    provider = spec["provider"]
    data = {"model": spec["model"], "temperature": 0, "response_format": "json"}
    if language:
        data["language"] = language
    return {
        "url": f"{BASE_URLS[provider]}/audio/transcriptions",
        "auth_env": AUTH_ENV[provider],
        "data": data,
    }


def transcribe(audio_path: str, model_key: str, language: str | None) -> dict:
    """POST the audio to the model's endpoint. Returns {text, latency_s}."""
    req = build_request(model_key, language)
    key = os.environ[req["auth_env"]]
    start = time.time()
    with open(audio_path, "rb") as fh:
        resp = requests.post(
            req["url"],
            headers={"Authorization": f"Bearer {key}"},
            data=req["data"],
            files={"file": (os.path.basename(audio_path), fh)},
            timeout=120,
        )
    latency = time.time() - start
    resp.raise_for_status()
    return {"text": resp.json()["text"], "latency_s": round(latency, 2)}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `eval/.venv/bin/python -m pytest eval/tests/test_transcribe.py -v`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add eval/transcribe.py eval/tests/test_transcribe.py
git commit -m "feat(eval): audio download + transcription client (pluggable models)"
```

---

### Task 4: Orchestrator + test set + aggregation (`harness.py`, `testset.json`)

**Files:**
- Create: `eval/harness.py`, `eval/testset.json`, `eval/README.md`
- Test: `eval/tests/test_harness.py`

**Interfaces:**
- Consumes: `wer.wer`, `subs.fetch_reference`, `transcribe.download_audio`, `transcribe.transcribe`, `transcribe.MODELS`.
- Produces:
  - `aggregate(cases: list[dict]) -> dict` — mean WER per `tag:value` over Tier-1 cases that have a numeric `wer`.
  - `run_case(case, models, deps) -> list[dict]` — `deps` is a dict of injected callables `{download, transcribe, fetch_reference, wer}` for testability.
  - `main(testset_path, out_dir, models, run_at) -> str` — writes `<out_dir>/<run_at-date>.json`, returns the path.

- [ ] **Step 1: Write the failing tests** (harness logic with injected fakes — no network)

`eval/tests/test_harness.py`:
```python
from eval.harness import aggregate, run_case


def test_aggregate_means_wer_by_tag():
    cases = [
        {"tags": {"accent": "us"}, "wer": 0.10},
        {"tags": {"accent": "us"}, "wer": 0.20},
        {"tags": {"accent": "in"}, "wer": 0.50},
    ]
    agg = aggregate(cases)
    assert agg["accent:us"]["mean_wer"] == 0.15
    assert agg["accent:us"]["n"] == 2
    assert agg["accent:in"]["mean_wer"] == 0.50


def test_aggregate_ignores_cases_without_wer():
    cases = [{"tags": {"noise": "high"}, "wer": None}, {"tags": {"noise": "high"}, "wer": 0.30}]
    agg = aggregate(cases)
    assert agg["noise:high"]["n"] == 1 and agg["noise:high"]["mean_wer"] == 0.30


def test_run_case_tier1_computes_wer_against_reference():
    case = {
        "id": "c1", "tier": 1, "url": "http://x", "language": "en",
        "tags": {"accent": "us"},
    }
    deps = {
        "download": lambda url, out, seg: "audio.m4a",
        "fetch_reference": lambda url, out: "the cat sat on the mat",
        "transcribe": lambda path, mk, lang: {"text": "the cat sat", "latency_s": 1.0},
        "wer": lambda ref, hyp: {"wer": 0.5, "sub": 0, "ins": 0, "del": 3, "ref_words": 6},
    }
    rows = run_case(case, ["groq-turbo"], deps)
    assert len(rows) == 1
    r = rows[0]
    assert r["id"] == "c1" and r["model"] == "groq-turbo"
    assert r["wer"] == 0.5 and r["del"] == 3
    assert r["transcript"] == "the cat sat"
    assert r["reference"] == "the cat sat on the mat"


def test_run_case_tier2_skips_wer():
    case = {"id": "c2", "tier": 2, "url": "http://x", "language": "en", "tags": {"noise": "high"}}
    deps = {
        "download": lambda url, out, seg: "audio.m4a",
        "fetch_reference": lambda url, out: (_ for _ in ()).throw(AssertionError("must not fetch")),
        "transcribe": lambda path, mk, lang: {"text": "whatever", "latency_s": 1.0},
        "wer": lambda ref, hyp: (_ for _ in ()).throw(AssertionError("must not score")),
    }
    rows = run_case(case, ["groq-turbo"], deps)
    assert rows[0]["wer"] is None and rows[0]["transcript"] == "whatever"
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `eval/.venv/bin/python -m pytest eval/tests/test_harness.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'eval.harness'`.

- [ ] **Step 3: Implement `eval/harness.py`**

```python
import json
import os

from eval import subs, transcribe, wer as wer_mod


def aggregate(cases: list[dict]) -> dict:
    """Mean WER per tag:value across cases that have a numeric wer."""
    buckets: dict[str, list[float]] = {}
    for c in cases:
        w = c.get("wer")
        if w is None:
            continue
        for tag, val in c.get("tags", {}).items():
            buckets.setdefault(f"{tag}:{val}", []).append(w)
    return {
        k: {"mean_wer": round(sum(v) / len(v), 4), "n": len(v)}
        for k, v in buckets.items()
    }


def run_case(case: dict, models: list[str], deps: dict) -> list[dict]:
    """Transcribe one case with each model. Tier 1 scores WER, Tier 2 skips it."""
    fixtures = os.path.join("eval", "fixtures")
    audio = deps["download"](case["url"], os.path.join(fixtures, f"{case['id']}.m4a"),
                             case.get("segment"))
    reference = None
    if case["tier"] == 1:
        reference = deps["fetch_reference"](case["url"], fixtures)

    rows = []
    for mk in models:
        out = deps["transcribe"](audio, mk, case.get("language"))
        row = {
            "id": case["id"], "tier": case["tier"], "model": mk,
            "tags": case.get("tags", {}), "latency_s": out["latency_s"],
            "transcript": out["text"], "reference": reference,
            "wer": None, "sub": None, "ins": None, "del": None,
        }
        if case["tier"] == 1:
            score = deps["wer"](reference, out["text"])
            row.update(wer=score["wer"], sub=score["sub"], ins=score["ins"],
                       **{"del": score["del"]})
        rows.append(row)
    return rows


def main(testset_path: str, out_dir: str, models: list[str], run_at: str) -> str:
    testset = json.load(open(testset_path, encoding="utf-8"))
    deps = {
        "download": transcribe.download_audio,
        "fetch_reference": subs.fetch_reference,
        "transcribe": transcribe.transcribe,
        "wer": wer_mod.wer,
    }
    cases: list[dict] = []
    for case in testset["cases"]:
        cases.extend(run_case(case, models, deps))

    result = {"run_at": run_at, "models": models, "cases": cases,
              "summary_by_tag": aggregate(cases)}
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, f"{run_at[:10]}.json")
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(result, fh, indent=2, ensure_ascii=False)
    return out_path


if __name__ == "__main__":
    import datetime as _dt

    default_models = ["groq-turbo"]  # prod path; add candidates via CLI arg below
    import sys
    models = sys.argv[1].split(",") if len(sys.argv) > 1 else default_models
    path = main("eval/testset.json", "eval/results", models,
                _dt.datetime.now().isoformat())
    print(f"Wrote {path}")
```

- [ ] **Step 4: Create the seed test set**

`eval/testset.json` (Tier-1 TED cases confirmed to have human subs on 2026-07-05; a Tier-2 hard case with no ground truth):
```json
{
  "cases": [
    {
      "id": "ted-mcgonigal-stress", "tier": 1,
      "url": "https://www.youtube.com/watch?v=RcGyVTAoXEU",
      "segment": { "start": 60, "dur": 120 }, "language": "en",
      "tags": { "accent": "us", "noise": "low", "domain": "psychology", "speakers": 1 }
    },
    {
      "id": "ted-walker-sleep", "tier": 1,
      "url": "https://www.youtube.com/watch?v=5MuIMqhT8DM",
      "segment": { "start": 60, "dur": 120 }, "language": "en",
      "tags": { "accent": "gb", "noise": "low", "domain": "neuroscience", "speakers": 1 }
    },
    {
      "id": "ted-suzuki-exercise", "tier": 1,
      "url": "https://www.youtube.com/watch?v=BHY0FxzoKZE",
      "segment": { "start": 60, "dur": 120 }, "language": "en",
      "tags": { "accent": "us", "noise": "low", "domain": "neuroscience", "speakers": 1 }
    },
    {
      "id": "indian-accent-sketch", "tier": 2,
      "url": "https://www.youtube.com/watch?v=eKp7vUffdXM",
      "language": "en",
      "tags": { "accent": "in", "noise": "medium", "domain": "comedy", "speakers": 3 }
    }
  ]
}
```

- [ ] **Step 5: Write `eval/README.md`**

````markdown
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
````

- [ ] **Step 6: Run tests to verify they pass**

Run: `eval/.venv/bin/python -m pytest eval/tests/test_harness.py -v`
Expected: PASS (4 tests).

- [ ] **Step 7: Commit**

```bash
git add eval/harness.py eval/testset.json eval/README.md eval/tests/test_harness.py
git commit -m "feat(eval): orchestrator, seed test set, aggregation, README"
```

---

### Task 5: Live end-to-end smoke run

**Files:** none created; verifies the whole pipeline against real APIs.

**Interfaces:**
- Consumes: everything above + `GROQ_API_KEY`, `OPENAI_API_KEY`, `yt-dlp`, `ffmpeg`.
- Produces: a valid `eval/results/<date>.json` (gitignored).

- [ ] **Step 1: Confirm full unit suite is green**

Run: `eval/.venv/bin/python -m pytest eval/tests/ -v`
Expected: PASS (all tasks' tests: 7 + 2 + 5 + 4 = 18).

- [ ] **Step 2: Run the harness on the seed set (prod path)**

Run (from repo root, keys exported):
```bash
eval/.venv/bin/python -m eval.harness
```
Expected: prints `Wrote eval/results/<date>.json`; no traceback.

- [ ] **Step 3: Validate the results JSON**

Run:
```bash
eval/.venv/bin/python -c "import json,glob; d=json.load(open(sorted(glob.glob('eval/results/*.json'))[-1])); \
print('cases:', len(d['cases'])); \
print('tier1 with wer:', sum(1 for c in d['cases'] if c['wer'] is not None)); \
print('tags:', list(d['summary_by_tag'])); \
assert any(c['wer'] is not None for c in d['cases']), 'no tier-1 WER computed'; \
assert any(c['wer'] is None for c in d['cases']), 'tier-2 case missing'; \
print('OK')"
```
Expected: prints case counts, a non-empty `summary_by_tag`, and `OK`.

- [ ] **Step 4: Sanity-read one Tier-1 result**

Confirm the WER on the TED cases is plausible (roughly < 0.20 for clean TED audio). If it is wildly high (e.g. > 0.6), the reference likely misaligned — inspect `reference` vs `transcript` in the JSON before trusting the number.

- [ ] **Step 5: Commit (docs only — results stay gitignored)**

No code to commit if the run is clean. If Step 4 surfaced a normalization gap (e.g. numbers/hyphenation), fix `normalize()` in `eval/wer.py`, re-run Task 1 tests + this run, then:
```bash
git add eval/wer.py
git commit -m "fix(eval): normalization edge case surfaced by live run"
```

---

## Self-Review

**Spec coverage:**
- API-level, no Playwright → Global Constraints + Task set (no Playwright anywhere). ✓
- Python + venv in `eval/` → Task 1. ✓
- Two-tier test set → Task 4 (`testset.json` tier 1 + tier 2); `run_case` branches on tier. ✓
- Human subs only, reject auto, accept en/en-US/en-GB → Task 2 (`fetch_reference` sub-langs `en.*`, `--write-subs` only, glob `*.en*.vtt`; `NoHumanSubtitlesError`). ✓
- Clean + normalize reference; same normalization both sides → Task 2 `clean_vtt` + Task 1 `normalize` (applied inside `wer`). ✓
- WER with S/I/D → Task 1. ✓
- Prod config Groq turbo + language pinned → Task 3 `MODELS["groq-turbo"]`, `build_request` pins language; testset cases carry `language`. ✓
- Pluggable model list → Task 3 `MODELS`, Task 4 `main` takes `models`, README shows CLI. ✓
- Results JSON per-case + aggregate by tag → Task 4 `main` + `aggregate`. ✓
- Latency captured → Task 3 `transcribe` returns `latency_s`; carried into rows. ✓
- Analysis loop (Claude reads JSON) → produced artifact is the input; no code needed (conversational). ✓
- Keys from env, fixtures/results gitignored → Task 1 `.gitignore`, Task 3 reads env. ✓

**Placeholder scan:** No TBD/TODO; every code step has complete code. ✓

**Type consistency:** `wer()` returns keys `wer/sub/ins/del/ref_words` — consumed identically in `run_case` (note `del` is a Python keyword, handled via `**{"del": ...}` in the dict update and bracket access elsewhere). `transcribe()` returns `text/latency_s` — consumed in `run_case`. `build_request` shape (`url/auth_env/data`) consumed in `transcribe`. `MODELS` keys (`groq-turbo` etc.) used in testset run + README. ✓

**Note on `del`:** `del` is a reserved word, so it can't be a kwarg name. Task 4 Step 3 sets it via `**{"del": score["del"]}` and reads via `row["del"]` / `score["del"]` — never as an attribute. Tests access `r["del"]`. Consistent.
