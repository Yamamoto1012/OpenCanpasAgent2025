"""
Speech synthesis service

音声合成のビジネスロジックを提供する。
"""
from typing import Dict, Any, Union
from fastapi.responses import Response

from .aivis_client import AivisSpeechClient
from ..response.formatters import get_wav_response, get_base64_response
from models import AudioBase64Response


# グローバルクライアントインスタンス
_client = AivisSpeechClient()


def create_audio_query(text: str, speaker_id: int) -> Dict[str, Any]:
    """
    テキストからaudio_queryを作成する
    
    Args:
        text: 合成したいテキスト
        speaker_id: 話者ID
        
    Returns:
        Dict[str, Any]: audio_queryデータ
        
    """
    return _client.create_audio_query(text, speaker_id)


def synthesize_speech(query: Dict[str, Any], speaker_id: int) -> bytes:
    """
    audio_queryから音声を合成する
    
    Args:
        query: audio_queryデータ
        speaker_id: 話者ID
        
    Returns:
        bytes: 合成された音声データ（WAV形式）
        
    """
    return _client.synthesize_speech(query, speaker_id)


def text_to_speech(
    text: str, 
    speaker_id: int, 
    format_type: str
) -> Union[Response, AudioBase64Response]:
    """
    テキストから直接音声を生成し、指定された形式で返す
    
    Args:
        text: 合成したいテキスト
        speaker_id: 話者ID
        format_type: 出力形式（wav, base64 のいずれか）
        
    Returns:
        Union[Response, AudioBase64Response]: 
            指定された形式の音声レスポンス
            
    """
    # audio_queryを取得
    query_data = create_audio_query(text, speaker_id)
    
    # 音声合成
    audio_content = synthesize_speech(query_data, speaker_id)
    
    # フォーマットに応じた出力
    if format_type == "wav":
        return get_wav_response(audio_content)
    elif format_type == "base64":
        return get_base64_response(audio_content)
    else:
        # このケースは実際には発生しない
        raise ValueError(f"Unsupported format: {format_type}") 