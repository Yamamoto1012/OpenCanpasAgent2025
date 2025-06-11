"""
Sentiment analysis service

感情分析のビジネスロジックを提供する。
"""
from typing import Tuple, Optional

from .analyzer import SentimentAnalyzer, SentimentCategory


# グローバルインスタンス
_analyzer_instance: Optional[SentimentAnalyzer] = None


def get_sentiment_analyzer() -> SentimentAnalyzer:
    """
    感情分析インスタンスを取得する
    
    Returns:
        SentimentAnalyzer: 感情分析インスタンス
        
    Note:
        シングルトンパターンにより、アプリケーション全体で
        同一のインスタンスを再利用する。
    """
    global _analyzer_instance
    if _analyzer_instance is None:
        _analyzer_instance = SentimentAnalyzer()
    return _analyzer_instance


def analyze_sentiment(text: str) -> Tuple[float, SentimentCategory]:
    """
    感情分析を実行する関数
    
    Args:
        text: 分析対象のテキスト
        
    Returns:
        Tuple[float, SentimentCategory]: 感情スコア（0-100）とカテゴリ
        
    """
    analyzer = get_sentiment_analyzer()
    return analyzer.analyze(text) 