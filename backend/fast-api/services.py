"""
AivisSpeech API サーバーのサービス層

AivisSpeech Engineとの通信や、データの変換処理を行います。
関数型プログラミングの原則に従い、副作用を最小限に抑えた純粋関数を提供します。
"""
import requests
import base64
from typing import Dict, Any, Tuple, Union
from fastapi import HTTPException
from fastapi.responses import Response, HTMLResponse

from config import settings, logger
from models import AudioBase64Response


def get_engine_version() -> Tuple[bool, Dict[str, Any]]:
    """
    AivisSpeech Engineのバージョン情報を取得します。
    
    Returns:
        Tuple[bool, Dict[str, Any]]: 成功フラグとレスポンスデータ
        
    副作用: なし（外部APIへのリードオンリーリクエスト）
    """
    try:
        response = requests.get(f"{settings.aivis_base_url}/version")
        if response.status_code == 200:
            return True, {
                "status": "ok",
                "message": "AivisSpeech Engineが正常に動作しています",
                "engine_info": response.json()
            }
        else:
            return False, {
                "status": "error",
                "message": "AivisSpeech Engineに接続できましたが、正常なレスポンスが返ってきませんでした",
            }
    except requests.exceptions.RequestException as e:
        logger.error(f"AivisSpeech Engineに接続できません: {e}")
        return False, {
            "status": "error",
            "message": f"AivisSpeech Engineに接続できません: {e}",
        }


def get_speakers() -> Dict[str, Any]:
    """
    AivisSpeech Engineから話者一覧を取得します。
    
    Returns:
        Dict[str, Any]: 話者一覧データ
        
    Raises:
        HTTPException: API呼び出しが失敗した場合
        
    副作用: なし（外部APIへのリードオンリーリクエスト）
    """
    try:
        response = requests.get(f"{settings.aivis_base_url}/speakers")
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail="AivisSpeech Engineからスピーカー情報を取得できませんでした"
            )
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"AivisSpeech Engineに接続できません: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"AivisSpeech Engineに接続できません: {e}"
        )


def create_audio_query(text: str, speaker_id: int) -> Dict[str, Any]:
    """
    テキストからaudio_queryを作成します。
    
    Args:
        text: 合成したいテキスト
        speaker_id: 話者ID
        
    Returns:
        Dict[str, Any]: audio_queryデータ
        
    Raises:
        HTTPException: API呼び出しが失敗した場合
        
    副作用: なし（外部APIへのリードオンリーリクエスト）
    """
    try:
        params = {"speaker": speaker_id, "text": text}
        response = requests.post(f"{settings.aivis_base_url}/audio_query", params=params)
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail="AivisSpeech Engineからオーディオクエリを取得できませんでした"
            )
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"AivisSpeech Engineに接続できません: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"AivisSpeech Engineに接続できません: {e}"
        )


def synthesize_speech(query: Dict[str, Any], speaker_id: int) -> bytes:
    """
    audio_queryから音声を合成します。
    
    Args:
        query: audio_queryデータ
        speaker_id: 話者ID
        
    Returns:
        bytes: 合成された音声データ（WAV形式）
        
    Raises:
        HTTPException: API呼び出しが失敗した場合
        
    副作用: なし（外部APIへのリードオンリーリクエスト）
    """
    try:
        params = {"speaker": speaker_id}
        headers = {"Content-Type": "application/json"}
        response = requests.post(
            f"{settings.aivis_base_url}/synthesis",
            params=params,
            headers=headers,
            json=query
        )
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail="AivisSpeech Engineから音声を合成できませんでした"
            )
        return response.content
    except requests.exceptions.RequestException as e:
        logger.error(f"AivisSpeech Engineに接続できません: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"AivisSpeech Engineに接続できません: {e}"
        )


def get_wav_response(audio_content: bytes) -> Response:
    """
    音声データをWAVファイルレスポンスに変換します。
    
    Args:
        audio_content: 音声データ
        
    Returns:
        Response: WAVファイルのレスポンス
        
    副作用: なし（純粋な変換関数）
    """
    return Response(
        content=audio_content,
        media_type="audio/wav",
        headers={"Content-Disposition": "attachment; filename=audio.wav"}
    )


def get_base64_response(audio_content: bytes) -> AudioBase64Response:
    """
    音声データをBase64エンコードされたレスポンスに変換します。
    
    Args:
        audio_content: 音声データ
        
    Returns:
        AudioBase64Response: Base64エンコードされた音声データのレスポンス
        
    副作用: なし（純粋な変換関数）
    """
    audio_base64 = base64.b64encode(audio_content).decode('utf-8')
    return AudioBase64Response(
        base64_audio=audio_base64,
        content_type="audio/wav"
    )


def get_html_response(audio_content: bytes, text: str) -> HTMLResponse:
    """
    音声データを再生可能なHTMLレスポンスに変換します。
    
    Args:
        audio_content: 音声データ
        text: 合成テキスト
        
    Returns:
        HTMLResponse: 再生可能なHTMLページのレスポンス
        
    副作用: なし（純粋な変換関数）
    """
    audio_base64 = base64.b64encode(audio_content).decode('utf-8')
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>音声再生</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }}
            h1 {{
                color: #333;
            }}
            .audio-player {{
                margin: 20px 0;
            }}
            .text {{
                background-color: #f5f5f5;
                padding: 10px;
                border-left: 4px solid #2196F3;
                margin-bottom: 20px;
            }}
        </style>
    </head>
    <body>
        <h1>生成された音声</h1>
        <div class="text">テキスト: {text}</div>
        <div class="audio-player">
            <audio controls autoplay>
                <source src="data:audio/wav;base64,{audio_base64}" type="audio/wav">
                お使いのブラウザは音声再生をサポートしていません。
            </audio>
        </div>
        <p>
            <a href="data:audio/wav;base64,{audio_base64}" download="audio.wav">
            音声ファイルをダウンロード</a>
        </p>
        <p>
            <a href="/docs">API ドキュメントに戻る</a>
        </p>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)


def get_user_dict() -> Dict[str, Any]:
    """
    AivisSpeech Engineからユーザー辞書を取得します。
    
    Returns:
        Dict[str, Any]: ユーザー辞書データ
        
    Raises:
        HTTPException: API呼び出しが失敗した場合
        
    副作用: なし（外部APIへのリードオンリーリクエスト）
    """
    try:
        response = requests.get(f"{settings.aivis_base_url}/user_dict")
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail="AivisSpeech Engineからユーザー辞書を取得できませんでした"
            )
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"AivisSpeech Engineに接続できません: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"AivisSpeech Engineに接続できません: {e}"
        )


def text_to_speech(
    text: str, 
    speaker_id: int, 
    format_type: str
) -> Union[Response, AudioBase64Response, HTMLResponse]:
    """
    テキストから直接音声を生成し、指定された形式で返します。
    
    Args:
        text: 合成したいテキスト
        speaker_id: 話者ID
        format_type: 出力形式（wav, base64, htmlのいずれか）
        
    Returns:
        Union[Response, AudioBase64Response, HTMLResponse]: 
            指定された形式の音声レスポンス
            
    Raises:
        HTTPException: API呼び出しが失敗した場合
        
    副作用: なし（複数の純粋関数の合成）
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
    elif format_type == "html":
        return get_html_response(audio_content, text)
    else:
        # このケースは実際には発生しない（TTSRequestのLiteralで保証）
        raise ValueError(f"Unsupported format: {format_type}")