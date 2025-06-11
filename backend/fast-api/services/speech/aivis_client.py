"""
AivisSpeech API Client

AivisSpeech Engineとの通信を担うクライアントクラス
"""
import requests
from typing import Dict, Any
from fastapi import HTTPException

from config import settings, logger


class AivisSpeechClient:
    """AivisSpeech Engine APIクライアント"""
    
    def __init__(self, base_url: str = None):
        self.base_url = base_url or settings.aivis_base_url
    
    def create_audio_query(self, text: str, speaker_id: int) -> Dict[str, Any]:
        """
        テキストからaudio_queryを作成する
        
        Args:
            text: 合成したいテキスト
            speaker_id: 話者ID
            
        Returns:
            Dict[str, Any]: audio_queryデータ
            
        Raises:
            HTTPException: API呼び出しが失敗した場合
        """
        try:
            params = {"speaker": speaker_id, "text": text}
            response = requests.post(
                f"{self.base_url}/audio_query", 
                params=params
            )
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
    
    def synthesize_speech(self, query: Dict[str, Any], speaker_id: int) -> bytes:
        """
        audio_queryから音声を合成する
        
        Args:
            query: audio_queryデータ
            speaker_id: 話者ID
            
        Returns:
            bytes: 合成された音声データ（WAV形式）
            
        Raises:
            HTTPException: API呼び出しが失敗した場合
        """
        try:
            params = {"speaker": speaker_id}
            headers = {"Content-Type": "application/json"}
            response = requests.post(
                f"{self.base_url}/synthesis",
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