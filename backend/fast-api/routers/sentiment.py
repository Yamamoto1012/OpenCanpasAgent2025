"""sentiment.py
感情分析API ルーター
"""
from fastapi import APIRouter, HTTPException, status

import services
from models import SentimentRequest, SentimentResponse

# APIルートを作成
router = APIRouter(tags=["sentiment"])


@router.post(
    "/sentiment",
    response_model=SentimentResponse,
    summary="日本語テキストの感情スコアを取得する",
)
async def sentiment_endpoint(payload: SentimentRequest) -> SentimentResponse:  # noqa: D401
    """テキストを受け取り感情スコアを返却する"""
    if not payload.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="text フィールドは空ではいけません",
        )

    try:
        # analyze_sentimentメソッドを呼び出して感情分析を実行
        score, category = services.analyze_sentiment(payload.text)
        return SentimentResponse(score=score, category=category.value, text=payload.text)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"感情分析処理でエラーが発生しました: {str(e)}"
        ) 