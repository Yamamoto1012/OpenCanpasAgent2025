"""sentiment.py
感情分析API ルーター
"""
import time
from typing import List
from fastapi import APIRouter, HTTPException, status

from config import sentiment_config
from models import SentimentRequest, SentimentResponse, SentimentResult
from services.sentiment import get_sentiment_analyzer, SentimentCategory

# APIルートを作成
router = APIRouter(tags=["sentiment"])


@router.post("/sentiment", response_model=SentimentResponse)
async def analyze_sentiment(request: SentimentRequest) -> SentimentResponse:
    """
    テキストの感情分析を実行
    
    - **texts**: 分析するテキスト
    戻り値:
    - **results**: 分析結果のリスト
    - **metadata**: 処理に関するメタデータ
    """
    start_time = time.time()
    
    # 入力を正規化（単一テキストもリストに変換）
    texts = request.texts if isinstance(request.texts, list) else [request.texts]
    
    # 入力検証
    if not texts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="テキストが指定されていません"
        )
    
    # バッチサイズの検証
    if len(texts) > sentiment_config.max_batch_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"バッチサイズが上限（{sentiment_config.max_batch_size}）を超えています"
        )
    
    for text in texts:
        if not text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="空のテキストは分析できません"
            )
        if len(text) > sentiment_config.max_text_length:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"テキストが長すぎます（最大{sentiment_config.max_text_length}文字）"
            )
    
    try:
        # 分析実行
        analyzer = get_sentiment_analyzer()
        results = []
        
        for text in texts:
            score, category, metadata = analyzer.analyze_with_metadata(text)
            results.append(SentimentResult(
                text=text,
                score=score,
                category=category.value,
                confidence=metadata.get('confidence', 0.0),
                method=metadata.get('method', 'unknown')
            ))
        
        processing_time = time.time() - start_time
        
        return SentimentResponse(
            results=results,
            metadata={
                "total_count": len(results),
                "processing_time": processing_time,
                "api_version": "2.0.0",
                "batch_size": len(texts)
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"感情分析処理でエラーが発生しました: {str(e)}"
        )