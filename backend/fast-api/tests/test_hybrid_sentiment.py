"""
ハイブリッド感情分析システムのテストスイート
"""
import pytest
import os
import sys
import time
from unittest.mock import patch, MagicMock

# パスの設定
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from services.sentiment.rule_based_analyzer import RuleBasedSentimentAnalyzer, EmotionRule
from services.sentiment.onnx_analyzer import DummyONNXAnalyzer
from services.sentiment.hybrid_analyzer import HybridSentimentAnalyzer
from services.sentiment.analyzer import SentimentAnalyzer, SentimentCategory, LegacySentimentAnalyzer


class TestRuleBasedAnalyzer:
    """ルールベース感情分析器のテスト"""
    
    def setup_method(self):
        """各テストメソッドの前に実行"""
        self.analyzer = RuleBasedSentimentAnalyzer()
    
    def test_positive_emotion_detection(self):
        """ポジティブ感情の検出テスト"""
        test_cases = [
            ("今日は楽しい一日でした！", True),
            ("最高の気分です", True),
            ("嬉しくて仕方ありません", True),
            ("素晴らしい結果でした", True),
        ]
        
        for text, should_be_positive in test_cases:
            score, category, confidence = self.analyzer.analyze_with_confidence(text)
            if should_be_positive:
                assert score > 60, f"'{text}' should be positive, got {score}"
                assert category in [SentimentCategory.MILD_POSITIVE, SentimentCategory.STRONG_POSITIVE]
            assert confidence > 0, f"Confidence should be > 0, got {confidence}"
    
    def test_negative_emotion_detection(self):
        """ネガティブ感情の検出テスト"""
        test_cases = [
            ("とても悲しい気持ちです", True),
            ("辛くて困っています", True),
            ("嫌な出来事でした", True),
            ("絶望的な状況です", True),
        ]
        
        for text, should_be_negative in test_cases:
            score, category, confidence = self.analyzer.analyze_with_confidence(text)
            if should_be_negative:
                assert score < 40, f"'{text}' should be negative, got {score}"
                assert category in [SentimentCategory.MILD_NEGATIVE, SentimentCategory.STRONG_NEGATIVE]
            assert confidence > 0, f"Confidence should be > 0, got {confidence}"
    
    def test_neutral_emotion_detection(self):
        """ニュートラル感情の検出テスト"""
        test_cases = [
            "今日は普通の一日でした",
            "特に何もありませんでした",
            "通常通りの業務です",
        ]
        
        for text in test_cases:
            score, category, confidence = self.analyzer.analyze_with_confidence(text)
            # ニュートラルは範囲が広いので緩めの条件
            assert 20 <= score <= 80, f"'{text}' should be neutral-ish, got {score}"
    
    def test_negation_handling(self):
        """否定語の処理テスト"""
        positive_text = "楽しいです"
        negative_text = "楽しくないです"
        
        pos_score, _, _ = self.analyzer.analyze_with_confidence(positive_text)
        neg_score, _, _ = self.analyzer.analyze_with_confidence(negative_text)
        
        # 否定語があると感情が反転するはず
        assert pos_score > neg_score, f"Negation not working: {pos_score} vs {neg_score}"
    
    def test_intensifier_handling(self):
        """強調語の処理テスト"""
        normal_text = "楽しいです"
        intensified_text = "とても楽しいです"
        
        normal_score, _, _ = self.analyzer.analyze_with_confidence(normal_text)
        intensified_score, _, _ = self.analyzer.analyze_with_confidence(intensified_text)
        
        # 強調語があるとスコアが上がるはず
        assert intensified_score >= normal_score, f"Intensifier not working: {normal_score} vs {intensified_score}"
    
    def test_confidence_calculation(self):
        """信頼度計算のテスト"""
        high_confidence_text = "最高です！素晴らしい！"
        low_confidence_text = "まあ、そうですね"
        
        _, _, high_conf = self.analyzer.analyze_with_confidence(high_confidence_text)
        _, _, low_conf = self.analyzer.analyze_with_confidence(low_confidence_text)
        
        assert high_conf > low_conf, f"Confidence calculation error: {high_conf} vs {low_conf}"
        assert 0 <= high_conf <= 1, f"Confidence out of range: {high_conf}"
        assert 0 <= low_conf <= 1, f"Confidence out of range: {low_conf}"
    
    def test_empty_text_handling(self):
        """空文字列の処理テスト"""
        score, category, confidence = self.analyzer.analyze_with_confidence("")
        
        assert score == 50.0, f"Empty text should return neutral score, got {score}"
        assert category == SentimentCategory.NEUTRAL
        assert confidence == 0.0, f"Empty text confidence should be 0, got {confidence}"
    
    def test_analysis_details(self):
        """詳細分析結果のテスト"""
        text = "とても楽しい一日でした！"
        details = self.analyzer.get_analysis_details(text)
        
        assert 'score' in details
        assert 'category' in details
        assert 'confidence' in details
        assert 'matched_rules' in details
        assert 'has_negation' in details
        assert 'intensifier_factor' in details
        assert 'text_length' in details
        
        # マッチしたルールがあるはず
        assert len(details['matched_rules']) > 0


class TestDummyONNXAnalyzer:
    """ダミーONNX分析器のテスト"""
    
    def setup_method(self):
        """各テストメソッドの前に実行"""
        self.analyzer = DummyONNXAnalyzer()
    
    def test_basic_analysis(self):
        """基本的な分析機能のテスト"""
        text = "今日は楽しい一日でした"
        score, category, probs = self.analyzer.analyze(text)
        
        assert 0 <= score <= 100, f"Score out of range: {score}"
        assert isinstance(category, SentimentCategory)
        assert isinstance(probs, dict)
        assert 'positive' in probs
        assert 'negative' in probs
        assert 'neutral' in probs
    
    def test_availability(self):
        """利用可能性チェックのテスト"""
        assert self.analyzer.is_available() == True
    
    def test_model_info(self):
        """モデル情報取得のテスト"""
        info = self.analyzer.get_model_info()
        assert 'available' in info
        assert info['available'] == True
        assert info['type'] == 'dummy'


class TestHybridAnalyzer:
    """ハイブリッド感情分析器のテスト"""
    
    def setup_method(self):
        """各テストメソッドの前に実行"""
        # テスト用の設定でハイブリッド分析器を初期化
        self.analyzer = HybridSentimentAnalyzer(
            confidence_threshold=0.7,
            enable_onnx=True,
            use_dummy_onnx=True  # テストではダミーを使用
        )
    
    def test_high_confidence_rule_based(self):
        """高信頼度時のルールベース処理テスト"""
        # 明確にポジティブな文章（高信頼度が期待される）
        text = "最高です！素晴らしい！"
        score, category, metadata = self.analyzer.analyze(text)
        
        assert score > 70, f"High confidence text should be positive, got {score}"
        assert metadata['method'] == 'rule_based'
        assert metadata['confidence'] >= 0.7
        assert not metadata['onnx_used']
    
    def test_low_confidence_hybrid(self):
        """低信頼度時のハイブリッド処理テスト"""
        # 曖昧な文章（低信頼度が期待される）
        text = "まあ、そうですね"
        score, category, metadata = self.analyzer.analyze(text)
        
        # 曖昧な文章なので、どちらの手法でもおかしくない
        assert 0 <= score <= 100
        assert 'method' in metadata
        
        # 信頼度が低い場合はハイブリッドまたはルールベース（ONNX無効の場合）
        assert metadata['method'] in ['hybrid', 'rule_based']
    
    def test_score_integration(self):
        """スコア統合機能のテスト"""
        # 内部メソッドのテスト
        rule_score = 80.0
        rule_confidence = 0.5
        onnx_score = 60.0
        class_probs = {'positive': 0.7, 'neutral': 0.2, 'negative': 0.1}
        
        integrated_score = self.analyzer._integrate_scores(
            rule_score, rule_confidence, onnx_score, class_probs
        )
        
        assert 0 <= integrated_score <= 100
        # 統合スコアは両者の中間的な値になるはず
        assert min(rule_score, onnx_score) <= integrated_score <= max(rule_score, onnx_score)
    
    def test_performance_tracking(self):
        """パフォーマンス追跡のテスト"""
        initial_metrics = self.analyzer.get_metrics()
        
        # 複数回分析実行
        texts = [
            "楽しい一日でした",
            "悲しい出来事です",
            "普通の日常です"
        ]
        
        for text in texts:
            self.analyzer.analyze(text)
        
        final_metrics = self.analyzer.get_metrics()
        
        # リクエスト数が増加しているはず
        assert final_metrics['total_requests'] > initial_metrics['total_requests']
        assert final_metrics['total_processing_time'] > initial_metrics['total_processing_time']
    
    def test_confidence_threshold_setting(self):
        """信頼度閾値の動的変更テスト"""
        original_threshold = self.analyzer.confidence_threshold
        new_threshold = 0.5
        
        self.analyzer.set_confidence_threshold(new_threshold)
        assert self.analyzer.confidence_threshold == new_threshold
        
        # 無効な値での例外テスト
        with pytest.raises(ValueError):
            self.analyzer.set_confidence_threshold(1.5)
        
        with pytest.raises(ValueError):
            self.analyzer.set_confidence_threshold(-0.1)
    
    def test_analyzer_status(self):
        """分析器ステータス取得のテスト"""
        status = self.analyzer.get_analyzer_status()
        
        assert 'rule_analyzer' in status
        assert 'onnx_analyzer' in status
        assert 'hybrid_config' in status
        
        assert status['rule_analyzer']['available'] == True
        assert status['hybrid_config']['confidence_threshold'] == self.analyzer.confidence_threshold
    
    def test_batch_processing(self):
        """バッチ処理のテスト"""
        texts = [
            "楽しい一日でした",
            "悲しい出来事です",
            "普通の日常です",
            "",  # 空文字列
            "とても素晴らしい！最高！",  # 高信頼度
        ]
        
        results = self.analyzer.analyze_batch(texts)
        
        assert len(results) == len(texts)
        
        for i, (score, category, metadata) in enumerate(results):
            assert 0 <= score <= 100, f"Score out of range for text {i}: {score}"
            assert isinstance(category, SentimentCategory)
            assert isinstance(metadata, dict)


class TestSentimentAnalyzerIntegration:
    """統合SentimentAnalyzerのテスト"""
    
    def test_hybrid_mode(self):
        """ハイブリッドモードのテスト"""
        with patch.dict(os.environ, {'USE_HYBRID_SENTIMENT': 'true', 'USE_DUMMY_ONNX': 'true'}):
            analyzer = SentimentAnalyzer()
            
            score, category = analyzer.analyze("楽しい一日でした")
            assert 0 <= score <= 100
            assert isinstance(category, SentimentCategory)
            
            # メタデータ付き分析
            score, category, metadata = analyzer.analyze_with_metadata("楽しい一日でした")
            assert 'method' in metadata
    
    def test_legacy_mode(self):
        """レガシーモードのテスト"""
        with patch.dict(os.environ, {'USE_HYBRID_SENTIMENT': 'false'}):
            analyzer = SentimentAnalyzer()
            
            # レガシー実装が使われているかチェック
            info = analyzer.get_analyzer_info()
            assert info['implementation'] == 'LegacySentimentAnalyzer'
    
    def test_analyzer_info(self):
        """分析器情報取得のテスト"""
        with patch.dict(os.environ, {'USE_HYBRID_SENTIMENT': 'true', 'USE_DUMMY_ONNX': 'true'}):
            analyzer = SentimentAnalyzer()
            info = analyzer.get_analyzer_info()
            
            assert 'implementation' in info
            assert 'version' in info
            assert info['version'] == '2.0.0'
    
    def test_metrics_access(self):
        """メトリクス取得のテスト"""
        with patch.dict(os.environ, {'USE_HYBRID_SENTIMENT': 'true', 'USE_DUMMY_ONNX': 'true'}):
            analyzer = SentimentAnalyzer()
            
            # 分析実行
            analyzer.analyze("テストテキスト")
            
            metrics = analyzer.get_metrics()
            assert isinstance(metrics, dict)
            assert 'total_requests' in metrics


class TestPerformance:
    """パフォーマンステスト"""
    
    def test_rule_based_speed(self):
        """ルールベース分析の速度テスト"""
        analyzer = RuleBasedSentimentAnalyzer()
        text = "今日は楽しい一日でした！とても素晴らしい体験でした。"
        
        start_time = time.time()
        for _ in range(100):
            analyzer.analyze(text)
        end_time = time.time()
        
        avg_time = (end_time - start_time) / 100
        assert avg_time < 0.001, f"Rule-based analysis too slow: {avg_time:.4f}s"
    
    def test_hybrid_speed(self):
        """ハイブリッド分析の速度テスト"""
        analyzer = HybridSentimentAnalyzer(use_dummy_onnx=True)
        
        # 高信頼度テキスト（ルールベースで処理されるはず）
        high_conf_text = "最高です！素晴らしい！"
        
        start_time = time.time()
        for _ in range(50):
            analyzer.analyze(high_conf_text)
        end_time = time.time()
        
        avg_time = (end_time - start_time) / 50
        assert avg_time < 0.005, f"Hybrid analysis too slow for high confidence: {avg_time:.4f}s"


def test_environment_variable_handling():
    """環境変数処理のテスト"""
    # 各種環境変数の組み合わせテスト
    test_configs = [
        {'USE_HYBRID_SENTIMENT': 'true', 'SENTIMENT_CONFIDENCE_THRESHOLD': '0.8'},
        {'USE_HYBRID_SENTIMENT': 'false'},
        {'USE_HYBRID_SENTIMENT': 'true', 'USE_DUMMY_ONNX': 'true'},
    ]
    
    for config in test_configs:
        with patch.dict(os.environ, config):
            try:
                analyzer = SentimentAnalyzer()
                score, category = analyzer.analyze("テストテキスト")
                assert 0 <= score <= 100
                assert isinstance(category, SentimentCategory)
            except Exception as e:
                pytest.fail(f"Configuration {config} failed: {e}")


if __name__ == "__main__":
    # テスト実行
    pytest.main([__file__, "-v"]) 