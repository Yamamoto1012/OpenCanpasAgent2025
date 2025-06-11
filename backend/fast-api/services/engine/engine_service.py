"""
Engine management service

AivisSpeech Engineの管理機能を提供する。
"""
import requests
from typing import Dict, Any, Tuple
from fastapi import HTTPException

from config import settings, logger


def get_engine_version() -> Tuple[bool, Dict[str, Any]]:
    """
    AivisSpeech Engineのバージョン情報を取得する
    
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
    AivisSpeech Engineから話者一覧を取得する
    
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


def get_user_dict() -> Dict[str, Any]:
    """
    AivisSpeech Engineからユーザー辞書を取得する
    
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