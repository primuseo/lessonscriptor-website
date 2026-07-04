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
