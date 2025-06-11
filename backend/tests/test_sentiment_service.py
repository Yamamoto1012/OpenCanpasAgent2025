"""test_sentiment_service.py
感情分析サービスのテスト
"""
import pytest
from services.sentiment_service import SentimentAnalyzer, SentimentCategory, analyze_sentiment


class TestSentimentAnalyzer:
    """SentimentAnalyzerクラスのテスト"""
    
    def test_basic_positive_sentiment(self):
        """基本的なポジティブ感情のテスト"""
        analyzer = SentimentAnalyzer()
        score, category = analyzer.analyze("嬉しいです！ありがとうございます！")
        
        assert score > 50.0  # ポジティブなスコア
        assert category in [SentimentCategory.MILD_POSITIVE, SentimentCategory.STRONG_POSITIVE]
    
    def test_basic_negative_sentiment(self):
        """基本的なネガティブ感情のテスト"""
        analyzer = SentimentAnalyzer()
        score, category = analyzer.analyze("悲しいです。とても困っています。")
        
        assert score < 50.0  # ネガティブなスコア
        assert category in [SentimentCategory.MILD_NEGATIVE, SentimentCategory.STRONG_NEGATIVE]
    
    def test_neutral_sentiment(self):
        """ニュートラル感情のテスト"""
        analyzer = SentimentAnalyzer()
        score, category = analyzer.analyze("今日は普通の日です。")
        
        assert 30.0 <= score <= 70.0  # ニュートラル範囲
        assert category == SentimentCategory.NEUTRAL
    
    def test_empty_text(self):
        """空のテキストのテスト"""
        analyzer = SentimentAnalyzer()
        score, category = analyzer.analyze("")
        
        assert score == 50.0
        assert category == SentimentCategory.NEUTRAL
    
    def test_context_based_fallback(self):
        """文脈ベースの補完機能のテスト"""
        analyzer = SentimentAnalyzer()
        
        # 疑問文
        score1, category1 = analyzer.analyze("元気ですか？")
        assert score1 >= 50.0  # わずかにポジティブ
        
        # 感嘆符
        score2, category2 = analyzer.analyze("すごい！")
        assert score2 > 50.0  # ポジティブ
        
        # 挨拶
        score3, category3 = analyzer.analyze("こんにちは")
        assert score3 > 50.0  # ポジティブ
    
    def test_strong_positive_expressions(self):
        """強いポジティブ表現のテスト"""
        analyzer = SentimentAnalyzer()
        score, category = analyzer.analyze("最高です！素晴らしい！感動しました！")
        
        assert score > 70.0
        assert category == SentimentCategory.STRONG_POSITIVE
    
    def test_strong_negative_expressions(self):
        """強いネガティブ表現のテスト"""
        analyzer = SentimentAnalyzer()
        score, category = analyzer.analyze("絶望しています。とても辛いです。")
        
        assert score < 30.0
        assert category == SentimentCategory.STRONG_NEGATIVE
    
    def test_score_range(self):
        """スコア範囲のテスト"""
        analyzer = SentimentAnalyzer()
        
        test_texts = [
            "嬉しい",
            "悲しい", 
            "普通",
            "最高",
            "絶望"
        ]
        
        for text in test_texts:
            score, category = analyzer.analyze(text)
            assert 0.0 <= score <= 100.0  # スコアが範囲内
            assert category in SentimentCategory  # 有効なカテゴリ


class TestAnalyzeSentimentFunction:
    """analyze_sentiment関数のテスト"""
    
    def test_function_call(self):
        """関数呼び出しのテスト"""
        score, category = analyze_sentiment("テストです")
        
        assert isinstance(score, float)
        assert isinstance(category, SentimentCategory)
        assert 0.0 <= score <= 100.0
    
    def test_singleton_behavior(self):
        """シングルトンの動作テスト"""
        # 複数回呼び出しても同じインスタンスが使用されることを確認
        result1 = analyze_sentiment("テスト1")
        result2 = analyze_sentiment("テスト2")
        
        # 両方とも正常に実行されることを確認
        assert isinstance(result1[0], float)
        assert isinstance(result2[0], float)


class TestSentimentCategory:
    """SentimentCategoryのテスト"""
    
    def test_category_values(self):
        """カテゴリ値のテストチュウ!!"""
        categories = [
            SentimentCategory.STRONG_POSITIVE,
            SentimentCategory.MILD_POSITIVE,
            SentimentCategory.NEUTRAL,
            SentimentCategory.MILD_NEGATIVE,
            SentimentCategory.STRONG_NEGATIVE,
        ]
        
        expected_values = [
            "strong_positive",
            "mild_positive", 
            "neutral",
            "mild_negative",
            "strong_negative",
        ]
        
        for category, expected in zip(categories, expected_values):
            assert category == expected
    
    def test_score_to_category_mapping(self):
        """スコアからカテゴリへのマッピングテスト"""
        analyzer = SentimentAnalyzer()
        
        # 各カテゴリの境界値をテスト
        test_cases = [
            (90.0, SentimentCategory.STRONG_POSITIVE),
            (70.0, SentimentCategory.MILD_POSITIVE),
            (50.0, SentimentCategory.NEUTRAL),
            (30.0, SentimentCategory.MILD_NEGATIVE),
            (10.0, SentimentCategory.STRONG_NEGATIVE),
        ]
        
        for score, expected_category in test_cases:
            category = analyzer._score_to_category(score)
            assert category == expected_category


# パフォーマンステスト
class TestPerformance:
    """パフォーマンステスト"""
    
    def test_analysis_speed(self):
        """分析速度のテスト"""
        import time
        
        analyzer = SentimentAnalyzer()
        text = "これはパフォーマンステスト用のテキスト。感情分析の処理速度を確認する。"
        
        start_time = time.time()
        analyzer.analyze(text)
        end_time = time.time()
        
        processing_time = end_time - start_time
        assert processing_time < 1.0  # 1秒以内で処理完了
    
    def test_multiple_analyses(self):
        """複数回分析のテスト"""
        analyzer = SentimentAnalyzer()
        texts = [
            "嬉しいです",
            "悲しいです", 
            "普通です",
            "最高です",
            "困っています"
        ]
        
        results = []
        for text in texts:
            result = analyzer.analyze(text)
            results.append(result)
        
        # すべて正常に処理されることを確認
        assert len(results) == len(texts)
        for score, category in results:
            assert 0.0 <= score <= 100.0
            assert category in SentimentCategory


if __name__ == "__main__":
    pytest.main([__file__]) 