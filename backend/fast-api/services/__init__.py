"""
Services package for AivisSpeech API

このパッケージは責務ごとに分離されたサービス層を提供する。
"""

# 後方互換性のためのre-export（段階的に移行）
from .sentiment.sentiment_service import analyze_sentiment
from .engine.engine_service import get_engine_version, get_speakers, get_user_dict
from .speech.speech_service import (
    create_audio_query,
    synthesize_speech,
    text_to_speech
)
from .response.formatters import (
    get_wav_response,
    get_base64_response,
)

__all__ = [
    "analyze_sentiment",
    "get_engine_version",
    "get_speakers", 
    "get_user_dict",
    "create_audio_query",
    "synthesize_speech",
    "text_to_speech",
    "get_wav_response",
    "get_base64_response",
] 