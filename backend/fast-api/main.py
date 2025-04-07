from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional, Any, Union
import requests
import json
import os
import logging

# ロギングの設定
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AivisSpeech API",
    description="AivisSpeech Engine APIとのインターフェース",
    version="0.1.0",
)

# CORSの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では適切に設定すること
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AivisSpeech EngineのベースURL
AIVIS_BASE_URL = os.getenv("AIVIS_ENGINE_URL", "http://aivis:10101")

class TextRequest(BaseModel):
    text: str
    speaker_id: int = 888753760  # デフォルトのスピーカーID

class AudioQueryRequest(BaseModel):
    query: Dict[str, Any]
    speaker_id: int

@app.get("/")
async def root():
    return {"message": "AivisSpeech API サーバーが稼働中です"}

@app.get("/status")
async def status():
    try:
        # AivisSpeech Engineの状態を確認
        response = requests.get(f"{AIVIS_BASE_URL}/version")
        if response.status_code == 200:
            return {
                "status": "ok",
                "message": "AivisSpeech Engineが正常に動作しています",
                "engine_info": response.json()
            }
        else:
            return {
                "status": "error",
                "message": "AivisSpeech Engineに接続できましたが、正常なレスポンスが返ってきませんでした",
            }
    except requests.exceptions.RequestException as e:
        logger.error(f"AivisSpeech Engineに接続できません: {e}")
        return {
            "status": "error",
            "message": f"AivisSpeech Engineに接続できません: {e}",
        }

@app.get("/speakers")
async def get_speakers():
    try:
        response = requests.get(f"{AIVIS_BASE_URL}/speakers")
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="AivisSpeech Engineからスピーカー情報を取得できませんでした")
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"AivisSpeech Engineに接続できません: {e}")
        raise HTTPException(status_code=503, detail=f"AivisSpeech Engineに接続できません: {e}")

@app.post("/audio_query")
async def create_audio_query(request: TextRequest):
    try:
        params = {"speaker": request.speaker_id, "text": request.text}
        response = requests.post(f"{AIVIS_BASE_URL}/audio_query", params=params)
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail="AivisSpeech Engineからオーディオクエリを取得できませんでした"
            )
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"AivisSpeech Engineに接続できません: {e}")
        raise HTTPException(status_code=503, detail=f"AivisSpeech Engineに接続できません: {e}")

@app.post("/synthesis")
async def synthesis(request: AudioQueryRequest):
    try:
        params = {"speaker": request.speaker_id}
        headers = {"Content-Type": "application/json"}
        response = requests.post(
            f"{AIVIS_BASE_URL}/synthesis",
            params=params,
            headers=headers,
            json=request.query
        )
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail="AivisSpeech Engineから音声を合成できませんでした"
            )
        
        # レスポンスをそのまま返す
        return Response(
            content=response.content,
            media_type="audio/wav",
            headers={"Content-Disposition": "attachment; filename=audio.wav"}
        )
    except requests.exceptions.RequestException as e:
        logger.error(f"AivisSpeech Engineに接続できません: {e}")
        raise HTTPException(status_code=503, detail=f"AivisSpeech Engineに接続できません: {e}")

@app.post("/tts")
async def text_to_speech(request: TextRequest):
    """
    テキストから直接音声を生成するワンステップAPIエンドポイント
    """
    try:
        # 1. audio_queryを取得
        params = {"speaker": request.speaker_id, "text": request.text}
        query_response = requests.post(f"{AIVIS_BASE_URL}/audio_query", params=params)
        if query_response.status_code != 200:
            raise HTTPException(
                status_code=query_response.status_code,
                detail="AivisSpeech Engineからオーディオクエリを取得できませんでした"
            )
        
        query_data = query_response.json()
        
        # 2. 音声合成
        params = {"speaker": request.speaker_id}
        headers = {"Content-Type": "application/json"}
        synthesis_response = requests.post(
            f"{AIVIS_BASE_URL}/synthesis",
            params=params,
            headers=headers,
            json=query_data
        )
        
        if synthesis_response.status_code != 200:
            raise HTTPException(
                status_code=synthesis_response.status_code,
                detail="AivisSpeech Engineから音声を合成できませんでした"
            )
        
        # レスポンスをそのまま返す
        return Response(
            content=synthesis_response.content,
            media_type="audio/wav",
            headers={"Content-Disposition": "attachment; filename=audio.wav"}
        )
    except requests.exceptions.RequestException as e:
        logger.error(f"AivisSpeech Engineに接続できません: {e}")
        raise HTTPException(status_code=503, detail=f"AivisSpeech Engineに接続できません: {e}")

@app.get("/user_dict")
async def get_user_dict():
    try:
        response = requests.get(f"{AIVIS_BASE_URL}/user_dict")
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail="AivisSpeech Engineからユーザー辞書を取得できませんでした"
            )
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"AivisSpeech Engineに接続できません: {e}")
        raise HTTPException(status_code=503, detail=f"AivisSpeech Engineに接続できません: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)