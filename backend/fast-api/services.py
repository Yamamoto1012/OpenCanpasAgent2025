"""
AivisSpeech API サーバーのサービス層

このファイルは後方互換性のために維持される
"""
import warnings

# 後方互換性のための re-export

from services.sentiment import SentimentCategory, analyze_sentiment
from services.engine import get_engine_version, get_speakers, get_user_dict
from services.speech import create_audio_query, synthesize_speech, text_to_speech
from services.response import get_wav_response, get_base64_response


# Deprecated functions - 後方互換性のため残しています
def get_sentiment_analyzer():
    """
    Deprecated: services.sentiment.get_sentiment_analyzer を使用してください
    """
    from services.sentiment import get_sentiment_analyzer as _get_sentiment_analyzer
    return _get_sentiment_analyzer()


# 警告：このファイルは将来的に削除される予定
warnings.warn(
    "services.py からの直接importは非推奨です。"
    "services パッケージ内の適切なモジュールを使用してください。",
    DeprecationWarning,
    stacklevel=2
) 