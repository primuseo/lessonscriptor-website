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
