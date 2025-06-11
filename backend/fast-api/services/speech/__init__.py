"""
Speech synthesis module

AivisSpeech APIとの通信および音声合成機能を提供するモジュールです。
"""

from .aivis_client import AivisSpeechClient
from .speech_service import create_audio_query, synthesize_speech, text_to_speech

__all__ = [
    "AivisSpeechClient",
    "create_audio_query",
    "synthesize_speech",
    "text_to_speech",
] 