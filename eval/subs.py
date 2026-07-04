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
            "yt-dlp", "--skip-download", "--write-subs", "--no-write-auto-subs",
            "--sub-langs", "en.*", "--sub-format", "vtt",
            "-o", template, url,
        ],
        check=True, capture_output=True, text=True,
    )
    matches = sorted(glob.glob(os.path.join(out_dir, "*.en*.vtt")), key=len)
    if not matches:
        raise NoHumanSubtitlesError(f"No manual English subtitles for {url}")
    with open(matches[0], encoding="utf-8") as fh:
        text = fh.read()
    return clean_vtt(text)
