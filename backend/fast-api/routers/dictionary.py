"""
AivisSpeech API サーバーのユーザー辞書関連のエンドポイント

ユーザー辞書に関するエンドポイントを提供する。
"""
from fastapi import APIRouter
from typing import Dict, Any

import services
# APIルートを作成
router = APIRouter(tags=["dictionary"])

# /user_dict エンドポイントの定義
@router.get("/user_dict", summary="ユーザー辞書の取得")
async def get_user_dict() -> Dict[str, Any]:
    """
    AivisSpeech Engineに登録されているユーザー辞書を取得する。
    
    Returns:
        Dict[str, Any]: ユーザー辞書データ
    """
    return services.get_user_dict()