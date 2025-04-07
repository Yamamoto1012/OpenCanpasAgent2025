"""
AivisSpeech API サーバーの音声合成関連のエンドポイント

音声合成に関するエンドポイントを提供します。
"""
from fastapi import APIRouter, Response
from fastapi.responses import HTMLResponse
from typing import Dict, Any, List, Union

import services
from models import TextRequest, AudioQueryRequest, TTSRequest, AudioBase64Response
from templates import TEST_PAGE_TEMPLATE


router = APIRouter(tags=["speech"])


@router.get("/speakers", summary="話者一覧の取得")
async def get_speakers() -> List[Dict[str, Any]]:
    """
    利用可能な話者（スピーカー）の一覧を取得します。
    
    Returns:
        List[Dict[str, Any]]: 利用可能な話者の一覧
    """
    return services.get_speakers()


@router.post("/audio_query", summary="音声合成用のクエリを作成")
async def create_audio_query(request: TextRequest) -> Dict[str, Any]:
    """
    テキストから音声合成用のクエリを作成します。
    
    Args:
        request: テキストと話者IDを含むリクエスト
        
    Returns:
        Dict[str, Any]: 音声合成用のクエリデータ
    """
    return services.create_audio_query(request.text, request.speaker_id)


@router.post("/synthesis", summary="音声合成の実行")
async def synthesis(request: AudioQueryRequest) -> Response:
    """
    audio_queryを使用して音声を合成します。
    
    Args:
        request: audio_queryと話者IDを含むリクエスト
        
    Returns:
        Response: 合成された音声データ（WAVファイル）
    """
    audio_content = services.synthesize_speech(request.query, request.speaker_id)
    return services.get_wav_response(audio_content)


@router.post("/tts", summary="テキストから音声を直接生成", response_class=Response)
async def text_to_speech(
    request: TTSRequest
) -> Union[Response, AudioBase64Response, HTMLResponse]:
    """
    テキストから直接音声を生成するワンステップAPIエンドポイント。
    フォーマットを指定して異なる形式で受け取ることができます。
    
    Args:
        request: テキスト、話者ID、出力フォーマットを含むリクエスト
        
    Returns:
        Union[Response, AudioBase64Response, HTMLResponse]: 
            指定されたフォーマットの音声データ
            - wav: 直接ダウンロード可能な音声ファイル
            - base64: Base64エンコードされたJSON
            - html: ブラウザで再生可能なHTMLページ
    """
    return services.text_to_speech(request.text, request.speaker_id, request.format)


@router.get("/test", summary="音声合成テスト用のHTMLページ", response_class=HTMLResponse)
async def test_page() -> HTMLResponse:
    """
    音声合成をテストするためのHTMLページを提供します。
    
    Returns:
        HTMLResponse: テスト用のHTMLページ
    """
    return HTMLResponse(content=TEST_PAGE_TEMPLATE)