"""
AivisSpeech API サーバーのヘルスチェック関連のエンドポイント

サーバーとAivisSpeech Engineの状態を確認するためのエンドポイントを提供する。
"""
from fastapi import APIRouter
from typing import Dict, Any

import services
from models import StatusResponse

# APIルートを作成
router = APIRouter(tags=["health"])


@router.get("/", summary="API サーバーのステータス確認")
async def root() -> Dict[str, str]:
    """
    AivisSpeech API サーバーが稼働中かどうかを確認する。
    
    Returns:
        Dict[str, str]: サーバー稼働状態のメッセージ
    """
    return {"message": "AivisSpeech API サーバーが稼働中です"}


@router.get("/status", summary="AivisSpeech Engineの状態確認", response_model=StatusResponse)
async def status() -> Dict[str, Any]:
    """
    AivisSpeech Engineの状態を確認する。
    
    Returns:
        Dict[str, Any]: エンジンの状態情報を含むレスポンス
    """
    success, response_data = services.get_engine_version()
    return response_data