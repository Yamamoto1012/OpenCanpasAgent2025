"""
AivisSpeech API サーバーのユーザー辞書関連のエンドポイント

ユーザー辞書に関するエンドポイントを提供します。
"""
from fastapi import APIRouter
from typing import Dict, Any

import services


router = APIRouter(tags=["dictionary"])


@router.get("/user_dict", summary="ユーザー辞書の取得")
async def get_user_dict() -> Dict[str, Any]:
    """
    AivisSpeech Engineに登録されているユーザー辞書を取得します。
    
    Returns:
        Dict[str, Any]: ユーザー辞書データ
    """
    return services.get_user_dict()