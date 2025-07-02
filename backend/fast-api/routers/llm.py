"""
外部LLMサービスとの連携を担当するルーター
"""
from fastapi import APIRouter, HTTPException
import httpx
from pydantic import BaseModel
from typing import Dict, Any, Optional

from config import settings, logger

router = APIRouter(
    tags=["llm"],
    responses={404: {"description": "Not found"}},
)

class QueryRequest(BaseModel):
    """ユーザークエリのリクエストモデル"""
    query: str # 質問の文字列
    context: Optional[Dict[str, Any]] = None # 追加のコンテキスト情報（オプション）
    language: Optional[str] = None # 応答言語

class QueryResponse(BaseModel):
    """LLMからの応答モデル"""
    answer: str # LLMからの回答
    metadata: Optional[Dict[str, Any]] = None # 回答に関する追加情報（オプション）

@router.post("/query", response_model=QueryResponse) # Path remains relative to the prefix set in app.py
async def process_query(request: QueryRequest):
    """
    ユーザークエリを外部LLMサービスに転送して回答を取得する
    """
    try:
        payload = {"user_input": request.query}
        
        # 言語が指定されている場合はpayloadに追加
        if request.language:
            payload["language"] = request.language

        # LLMサービスに通信するための準備
        async with httpx.AsyncClient(timeout=settings.llm_timeout) as client:
            response = await client.post(
                f"{settings.llm_api_url}{settings.llm_endpoint}",
                json=payload
            )

            if response.status_code != 200:
                logger.error(f"LLM API returned status code {response.status_code}: {response.text}")
                raise HTTPException(status_code=response.status_code, detail="LLM service error")

            # 外部APIからのレスポンスをパース
            external_response_data = response.json()

            # 外部APIのレスポンス形式 {"response": "..."} から値を取得
            # もしキーが存在しない場合のデフォルト値も考慮
            answer_text = external_response_data.get("response", "外部APIから予期せぬ形式のレスポンスがありました。")

            # QueryResponse モデルの形式 {"answer": "..."} に変換して返す
            return QueryResponse(answer=answer_text)

    except httpx.RequestError as e:
        logger.error(f"LLM API request failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Could not connect to LLM service")
    except Exception as e: # JSONパースエラーなどもキャッチ
        logger.error(f"Error processing LLM response: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing LLM response")

@router.post("/voice_mode_answer", response_model=QueryResponse)
async def process_voice_mode_answer(request: QueryRequest):
    """
    音声モード用のLLMサービス転送
    """
    try:
        payload = {"user_input": request.query}
        
        # 言語が指定されている場合はpayloadに追加
        if request.language:
            payload["language"] = request.language

        async with httpx.AsyncClient(timeout=settings.llm_timeout) as client:
            response = await client.post(
                f"{settings.llm_api_url}/voice_mode_answer",
                json=payload
            )

            if response.status_code != 200:
                logger.error(f"LLM API returned status code {response.status_code}: {response.text}")
                raise HTTPException(status_code=response.status_code, detail="LLM service error")

            external_response_data = response.json()
            answer_text = external_response_data.get("response", "外部APIから予期せぬ形式のレスポンスがありました。")
            return QueryResponse(answer=answer_text)

    except httpx.RequestError as e:
        logger.error(f"LLM API request failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Could not connect to LLM service")
    except Exception as e:
        logger.error(f"Error processing LLM response: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing LLM response")