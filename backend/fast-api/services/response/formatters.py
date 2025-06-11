"""
Response formatters

各種形式での音声レスポンス生成機能を提供する。
"""
import base64
from fastapi.responses import Response

from models import AudioBase64Response


def get_wav_response(audio_content: bytes) -> Response:
    """
    音声データをWAVファイルレスポンスに変換する
    
    Args:
        audio_content: 音声データ
        
    Returns:
        Response: WAVファイルのレスポンス

    """
    return Response(
        content=audio_content,
        media_type="audio/wav",
        headers={"Content-Disposition": "attachment; filename=audio.wav"}
    )


def get_base64_response(audio_content: bytes) -> AudioBase64Response:
    """
    音声データをBase64エンコードされたレスポンスに変換する
    
    Args:
        audio_content: 音声データ
        
    Returns:
        AudioBase64Response: Base64エンコードされた音声データのレスポンス
        
    """
    audio_base64 = base64.b64encode(audio_content).decode('utf-8')
    return AudioBase64Response(
        base64_audio=audio_base64,
        content_type="audio/wav"
    )