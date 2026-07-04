import os
from eval.subs import clean_vtt, slice_vtt_by_time

FIX = os.path.join(os.path.dirname(__file__), "fixtures", "sample.en.vtt")

_TIMED_VTT = """WEBVTT

00:00:00.000 --> 00:00:02.000
Intro before the window.

00:01:05.000 --> 00:01:07.000
Inside the window here.

00:02:10.000 --> 00:02:12.000
After the window ends.
"""


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


def test_slice_vtt_by_time_keeps_only_cues_in_window():
    # window [60, 120) -> only the 01:05 cue overlaps (0s and 130s are outside)
    text = slice_vtt_by_time(_TIMED_VTT, start=60, dur=60)
    assert "Inside the window here." in text
    assert "Intro before the window." not in text
    assert "After the window ends." not in text
