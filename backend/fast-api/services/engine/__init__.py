"""
Engine management module

AivisSpeech Engineの管理機能を提供するモジュール。
"""

from .engine_service import get_engine_version, get_speakers, get_user_dict

__all__ = [
    "get_engine_version",
    "get_speakers",
    "get_user_dict",
] 