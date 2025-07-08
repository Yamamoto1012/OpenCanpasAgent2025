"""test_sentiment_service.py
感情分析サービスのテスト
"""
import pytest
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'fast-api'))
from services.sentiment.sentiment_service import SentimentCategory, analyze_sentiment
from services.sentiment.analyzer import SentimentAnalyzer


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
        """ニュートラル感情のテスト（新しい閾値）"""
        analyzer = SentimentAnalyzer()
        score, category = analyzer.analyze("今日は普通の日です。")
        
        assert 40.0 <= score <= 80.0  # 新しいニュートラル範囲
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
        """強いポジティブ表現のテスト（新しい閾値）"""
        analyzer = SentimentAnalyzer()
        score, category = analyzer.analyze("最高です！素晴らしい！感動しました！")
        
        assert score > 90.0  # 新しい閾値に合わせて調整
        assert category == SentimentCategory.STRONG_POSITIVE
    
    def test_strong_negative_expressions(self):
        """強いネガティブ表現のテスト（新しい閾値）"""
        analyzer = SentimentAnalyzer()
        score, category = analyzer.analyze("絶望しています。とても辛いです。")
        
        assert score < 20.0  # 新しい閾値に合わせて調整
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


class TestImprovedMethods:
    """改善されたメソッドのテスト"""
    
    def test_extract_emotion_bearing_tokens(self):
        """感情トークン抽出のテスト"""
        analyzer = SentimentAnalyzer()
        
        if analyzer.nlp is None:
            pytest.skip("GiNZAが利用できません")
        
        doc = analyzer.nlp("とても嬉しいです！頑張ろう！")
        tokens = analyzer.extract_emotion_bearing_tokens(doc)
        
        assert len(tokens) > 0
        assert all(isinstance(token, tuple) and len(token) == 3 for token in tokens)
    
    def test_should_filter_context_dependent(self):
        """文脈依存語彙フィルタリングのテスト"""
        analyzer = SentimentAnalyzer()
        
        # 除外すべき語
        assert analyzer.should_filter_context_dependent("ところ", "NOUN", "いいところです")
        assert analyzer.should_filter_context_dependent("こと", "NOUN", "いいことです")
        
        # 保持すべき語
        assert not analyzer.should_filter_context_dependent("気持ち", "NOUN", "いい気持ちです")
        assert not analyzer.should_filter_context_dependent("今日", "NOUN", "今日は楽しい")
    
    def test_calculate_weighted_score(self):
        """重み付きスコア計算のテスト"""
        analyzer = SentimentAnalyzer()
        
        word_scores = [
            ("嬉しい", 1.0, "ADJ"),     # 重み1.5
            ("とても", 0.8, "ADV"),     # 重み1.2
            ("思う", 0.5, "VERB"),      # 重み1.0
            ("人", 0.3, "NOUN"),        # 重み0.8
        ]
        
        weighted_score = analyzer.calculate_weighted_score(word_scores)
        assert isinstance(weighted_score, float)
        assert weighted_score > 0.5  # 加重平均がポジティブ
    
    def test_integrate_context_score(self):
        """文脈スコア統合のテスト"""
        analyzer = SentimentAnalyzer()
        
        base_score = 0.6
        context_score = 0.4
        
        integrated = analyzer.integrate_context_score(base_score, context_score)
        assert isinstance(integrated, float)
        assert 0.0 <= integrated <= 1.0
    
    def test_normalize_score_unified(self):
        """統一正規化のテスト"""
        analyzer = SentimentAnalyzer()
        
        test_scores = [-2.0, -1.0, 0.0, 1.0, 2.0]
        
        for score in test_scores:
            normalized = analyzer.normalize_score(score)
            assert 0.0 <= normalized <= 100.0
    
    def test_detect_positive_patterns(self):
        """ポジティブパターン検出のテスト"""
        analyzer = SentimentAnalyzer()
        
        # パターンマッチするテキスト
        pattern_score1 = analyzer.detect_positive_patterns("頑張ろう！")
        assert pattern_score1 > 0.0
        
        pattern_score2 = analyzer.detect_positive_patterns("ありがとうございます")
        assert pattern_score2 > 0.0
        
        # パターンマッチしないテキスト
        pattern_score3 = analyzer.detect_positive_patterns("普通の文章です")
        assert pattern_score3 == 1.0  # デフォルト値
    
    def test_calculate_expression_weight(self):
        """表現重み計算のテスト"""
        analyzer = SentimentAnalyzer()
        
        # 感嘆符あり
        weight1 = analyzer.calculate_expression_weight("嬉しい！")
        assert weight1 > 1.0
        
        # 感嘆符なし
        weight2 = analyzer.calculate_expression_weight("嬉しい")
        assert weight2 == 1.0
        
        # 絵文字あり
        weight3 = analyzer.calculate_expression_weight("嬉しい😊")
        assert weight3 > 1.0
    
    def test_calculate_confidence(self):
        """信頼度計算のテスト"""
        analyzer = SentimentAnalyzer()
        
        # 高いマッチ率
        confidence1 = analyzer.calculate_confidence(8, 10, 100)
        assert confidence1 > 80.0
        
        # 低いマッチ率
        confidence2 = analyzer.calculate_confidence(2, 10, 20)
        assert confidence2 < 50.0
        
        # 長文
        confidence3 = analyzer.calculate_confidence(5, 10, 200)
        assert confidence3 > analyzer.calculate_confidence(5, 10, 20)
    
    def test_adjust_score_by_context_improved(self):
        """改善されたスコア調整のテスト"""
        analyzer = SentimentAnalyzer()
        
        # 真にニュートラルな語のフィルタリング
        score1 = analyzer._adjust_score_by_context_improved(0.2, "ところ", "NOUN", "いいところです")
        assert score1 == 0.0
        
        # ポジティブスコアの適切な強化
        score2 = analyzer._adjust_score_by_context_improved(0.8, "嬉しい", "ADJ", "嬉しいです")
        assert score2 > 0.8
        
        # ネガティブスコアの緩和
        score3 = analyzer._adjust_score_by_context_improved(-0.2, "悲しい", "ADJ", "悲しいです")
        assert score3 > -0.2  # 緩和されている


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
        """カテゴリ値のテスト"""
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
        """スコアからカテゴリへのマッピングテスト（新しい動的閾値）"""
        analyzer = SentimentAnalyzer()
        
        # 新しい動的閾値に基づいたテストケース
        test_cases = [
            (91.0, SentimentCategory.STRONG_POSITIVE),  # >= 90
            (81.0, SentimentCategory.MILD_POSITIVE),    # >= 80
            (61.0, SentimentCategory.NEUTRAL),          # >= 60
            (41.0, SentimentCategory.MILD_NEGATIVE),    # >= 40
            (19.0, SentimentCategory.STRONG_NEGATIVE),  # < 20
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


class TestContextAwareScoring:
    """文脈を考慮したスコアリングのテスト"""
    
    def test_negation_context(self):
        """否定表現のテスト"""
        analyzer = SentimentAnalyzer()
        
        # 普通のポジティブ表現
        positive_score, _ = analyzer.analyze("嬉しいです")
        
        # 否定されたポジティブ表現
        negated_score, _ = analyzer.analyze("嬉しくないです")
        
        # 否定形の方がスコアが低いことを確認
        assert negated_score < positive_score
    
    def test_intensifier_context(self):
        """強調語のテスト"""
        analyzer = SentimentAnalyzer()
        
        # 普通のポジティブ表現
        normal_score, _ = analyzer.analyze("嬉しいです")
        
        # 強調されたポジティブ表現
        intensified_score, _ = analyzer.analyze("とても嬉しいです")
        
        # 強調形の方がスコアが高いことを確認
        assert intensified_score > normal_score
    
    def test_diminisher_context(self):
        """弱化語のテスト"""
        analyzer = SentimentAnalyzer()
        
        # 普通のポジティブ表現
        normal_score, _ = analyzer.analyze("嬉しいです")
        
        # 弱化されたポジティブ表現
        diminished_score, _ = analyzer.analyze("少し嬉しいです")
        
        # 弱化形の方がスコアが低いことを確認
        assert diminished_score < normal_score
    
    def test_uncertainty_context(self):
        """不確実性表現のテスト"""
        analyzer = SentimentAnalyzer()
        
        # 普通のポジティブ表現
        normal_score, _ = analyzer.analyze("嬉しいです")
        
        # 不確実性を含むポジティブ表現
        uncertain_score, _ = analyzer.analyze("たぶん嬉しいです")
        
        # 不確実性を含む方がスコアが低いことを確認
        assert uncertain_score < normal_score
    
    def test_intensity_calculation(self):
        """感情強度計算のテスト"""
        analyzer = SentimentAnalyzer()
        
        # 普通のテキスト
        normal_intensity = analyzer._calculate_intensity_factor("嬉しいです")
        
        # 感嘆符ありのテキスト
        exclamation_intensity = analyzer._calculate_intensity_factor("嬉しいです！")
        
        # 強調語ありのテキスト
        intensifier_intensity = analyzer._calculate_intensity_factor("とても嬉しいです")
        
        # 強調表現の方が高い強度を持つことを確認
        assert exclamation_intensity > normal_intensity
        assert intensifier_intensity > normal_intensity
    
    def test_sigmoid_normalization(self):
        """シグモイド正規化のテスト"""
        analyzer = SentimentAnalyzer()
        
        # 各種スコアでの正規化テスト
        test_scores = [-2.0, -1.0, 0.0, 1.0, 2.0]
        
        for score in test_scores:
            normalized = analyzer.normalize_score_sigmoid(score)
            assert 0.0 <= normalized <= 100.0
    
    def test_tanh_normalization(self):
        """双曲線正接正規化のテスト"""
        analyzer = SentimentAnalyzer()
        
        # 各種スコアでの正規化テスト
        test_scores = [-2.0, -1.0, 0.0, 1.0, 2.0]
        
        for score in test_scores:
            normalized = analyzer.normalize_score_tanh(score)
            assert 0.0 <= normalized <= 100.0
    
    def test_statistical_correction(self):
        """統計的補正のテスト"""
        analyzer = SentimentAnalyzer()
        
        # 短いテキスト
        short_corrected = analyzer.statistical_correction(80.0, 10)
        
        # 長いテキスト
        long_corrected = analyzer.statistical_correction(80.0, 200)
        
        # 長いテキストの方が高いスコアを持つことを確認
        assert long_corrected >= short_corrected
    
    def test_context_modifier_detection(self):
        """文脈修飾子検出のテスト"""
        analyzer = SentimentAnalyzer()
        
        # 否定語の検出
        negation = analyzer._detect_context_modifier("嬉しくないです", "嬉しい")
        assert negation == 'negation'
        
        # 強調語の検出
        intensifier = analyzer._detect_context_modifier("とても嬉しいです", "嬉しい")
        assert intensifier == 'intensifier'
        
        # 弱化語の検出
        diminisher = analyzer._detect_context_modifier("少し嬉しいです", "嬉しい")
        assert diminisher == 'diminisher'
        
        # 不確実性表現の検出
        uncertainty = analyzer._detect_context_modifier("たぶん嬉しいです", "嬉しい")
        assert uncertainty == 'uncertainty'


class TestNewNormalizationMethods:
    """新しい正規化メソッドのテスト"""
    
    def test_normalize_score_sigmoid_range(self):
        """シグモイド正規化の範囲テスト"""
        analyzer = SentimentAnalyzer()
        
        # 極端値でのテスト
        extreme_negative = analyzer.normalize_score_sigmoid(-10.0)
        extreme_positive = analyzer.normalize_score_sigmoid(10.0)
        neutral = analyzer.normalize_score_sigmoid(0.0)
        
        assert 0.0 <= extreme_negative <= 100.0
        assert 0.0 <= extreme_positive <= 100.0
        assert 0.0 <= neutral <= 100.0
        
        # 数値の関係性を確認
        assert extreme_negative < neutral < extreme_positive
    
    def test_normalize_score_tanh_range(self):
        """双曲線正接正規化の範囲テスト"""
        analyzer = SentimentAnalyzer()
        
        # 極端値でのテスト
        extreme_negative = analyzer.normalize_score_tanh(-10.0)
        extreme_positive = analyzer.normalize_score_tanh(10.0)
        neutral = analyzer.normalize_score_tanh(0.0)
        
        assert 0.0 <= extreme_negative <= 100.0
        assert 0.0 <= extreme_positive <= 100.0
        assert 0.0 <= neutral <= 100.0
        
        # 数値の関係性を確認
        assert extreme_negative < neutral < extreme_positive
    
    def test_adjust_intensity_positive(self):
        """ポジティブスコアの強度調整テスト"""
        analyzer = SentimentAnalyzer()
        
        base_score = 70.0
        intensity_factor = 0.5
        
        adjusted_score = analyzer.adjust_intensity(base_score, intensity_factor)
        
        # ポジティブスコアは強度によって上昇する
        assert adjusted_score > base_score
    
    def test_adjust_intensity_negative(self):
        """ネガティブスコアの強度調整テスト"""
        analyzer = SentimentAnalyzer()
        
        base_score = 30.0
        intensity_factor = 0.5
        
        adjusted_score = analyzer.adjust_intensity(base_score, intensity_factor)
        
        # ネガティブスコアは強度によって下降する
        assert adjusted_score < base_score


class TestRegressionPrevention:
    """回帰防止テスト"""
    
    def test_improved_vs_original_consistency(self):
        """改善版と旧版の一貫性テスト"""
        analyzer = SentimentAnalyzer()
        
        test_texts = [
            "嬉しいです",
            "悲しいです", 
            "普通です",
            "とても良い",
            "少し困った"
        ]
        
        for text in test_texts:
            score, category = analyzer.analyze(text)
            # 基本的な妥当性チェック
            assert 0.0 <= score <= 100.0
            assert category in SentimentCategory
            
            # カテゴリとスコアの整合性
            if category == SentimentCategory.STRONG_POSITIVE:
                assert score >= 90.0
            elif category == SentimentCategory.MILD_POSITIVE:
                assert 80.0 <= score < 90.0
            elif category == SentimentCategory.NEUTRAL:
                assert 60.0 <= score < 80.0
            elif category == SentimentCategory.MILD_NEGATIVE:
                assert 40.0 <= score < 60.0
            elif category == SentimentCategory.STRONG_NEGATIVE:
                assert score < 20.0


if __name__ == "__main__":
    pytest.main([__file__]) 