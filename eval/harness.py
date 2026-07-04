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
