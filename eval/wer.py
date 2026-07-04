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
