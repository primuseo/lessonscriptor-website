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
