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
