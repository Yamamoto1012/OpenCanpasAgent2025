"""
外部LLMサービスとの連携を担当するルーター
"""
from fastapi import APIRouter, HTTPException
import httpx
from pydantic import BaseModel
from typing import Dict, Any, Optional

from config import settings, logger

router = APIRouter(
    # prefix="/llm", # Remove prefix from here
    tags=["llm"],
    responses={404: {"description": "Not found"}},
)

class QueryRequest(BaseModel):
    """ユーザークエリのリクエストモデル"""
    query: str
    context: Optional[Dict[str, Any]] = None

class QueryResponse(BaseModel):
    """LLMからの応答モデル"""
    answer: str
    metadata: Optional[Dict[str, Any]] = None

@router.post("/query", response_model=QueryResponse) # Path remains relative to the prefix set in app.py
async def process_query(request: QueryRequest):
    """
    ユーザークエリを外部LLMサービスに転送して回答を取得します
    """
    try:
        # 送信するペイロードを外部APIの期待する形式に合わせる
        payload = {"user_input": request.query}
        # もしコンテキストも送信する必要があれば、外部APIの仕様に合わせて payload に追加する
        # 例: payload["context"] = request.context

        async with httpx.AsyncClient(timeout=settings.llm_timeout) as client:
            response = await client.post(
                f"{settings.llm_api_url}{settings.llm_endpoint}",
                json=payload  # 修正: request.model_dump() の代わりに作成した payload を使用
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