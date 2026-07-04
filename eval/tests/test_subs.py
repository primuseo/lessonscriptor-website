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
