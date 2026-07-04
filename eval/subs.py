import glob
import os
import re
import subprocess
import urllib.parse


def _video_id(url: str) -> str:
    """Extract the YouTube video id from a watch or youtu.be URL."""
    u = urllib.parse.urlparse(url)
    if u.hostname and "youtu.be" in u.hostname:
        return u.path.lstrip("/")
    return urllib.parse.parse_qs(u.query).get("v", [""])[0]


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


# Matches a VTT/SRT cue timing line, capturing both timestamps.
# Accepts HH:MM:SS.mmm and MM:SS.mmm (comma or dot for the ms separator).
_CUE_TIMING_RE = re.compile(
    r"(\d{1,2}:\d{2}(?::\d{2})?[.,]\d{3})\s*-->\s*(\d{1,2}:\d{2}(?::\d{2})?[.,]\d{3})"
)


def _parse_ts(ts: str) -> float | None:
    """Parse a VTT timestamp (HH:MM:SS.mmm or MM:SS.mmm) to seconds."""
    parts = ts.replace(",", ".").split(":")
    try:
        nums = [float(p) for p in parts]
    except ValueError:
        return None
    if len(nums) == 3:
        h, m, s = nums
    elif len(nums) == 2:
        h, m, s = 0.0, nums[0], nums[1]
    else:
        return None
    return h * 3600 + m * 60 + s


def slice_vtt_by_time(vtt_text: str, start: float, dur: float) -> str:
    """Return cleaned text for only the cues overlapping [start, start+dur).

    Reference span must match the transcribed audio segment, or WER is
    meaningless (a 2-min transcript vs a full-talk reference = all deletions).
    """
    end = start + dur
    kept: list[str] = []
    keep_current = False
    for raw in vtt_text.splitlines():
        line = raw.strip()
        m = _CUE_TIMING_RE.search(line)
        if m:
            cs, ce = _parse_ts(m.group(1)), _parse_ts(m.group(2))
            keep_current = (
                cs is not None and ce is not None and cs < end and ce > start
            )
            continue
        if not line or line.startswith("WEBVTT") or line.startswith("NOTE") or line.isdigit():
            continue
        if keep_current:
            kept.append(line)
    return clean_vtt("\n".join(kept))


def fetch_reference(url: str, out_dir: str, segment: dict | None = None) -> str:
    """Download the MANUAL English subtitle track and return cleaned text.

    Never fetches auto-captions. Raises NoHumanSubtitlesError if none exist.
    When `segment` ({"start", "dur"}) is given, the reference is sliced to that
    time window so it matches the transcribed audio segment.
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
    # Glob for THIS video's subs only — the fixtures dir is shared across cases,
    # so an unfiltered glob would pick another video's file (cross-contamination).
    vid = _video_id(url)
    matches = sorted(glob.glob(os.path.join(out_dir, f"{vid}.en*.vtt")), key=len)
    if not matches:
        raise NoHumanSubtitlesError(f"No manual English subtitles for {url}")
    with open(matches[0], encoding="utf-8") as fh:
        text = fh.read()
    if segment:
        return slice_vtt_by_time(text, float(segment["start"]), float(segment["dur"]))
    return clean_vtt(text)
