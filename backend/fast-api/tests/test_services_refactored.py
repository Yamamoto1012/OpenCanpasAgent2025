"""
Tests for refactored services modules

リファクタリング後のservicesモジュールのテスト。
"""
import pytest
from unittest.mock import Mock, patch

# 感情分析モジュールのテスト
from services.sentiment import SentimentCategory, SentimentAnalyzer, analyze_sentiment


class TestSentimentAnalyzer:
    """感情分析クラスのテスト"""
    
    def test_sentiment_category_enum(self):
        """感情カテゴリEnum値のテスト"""
        assert SentimentCategory.STRONG_POSITIVE == "strong_positive"
        assert SentimentCategory.MILD_POSITIVE == "mild_positive"
        assert SentimentCategory.NEUTRAL == "neutral"
        assert SentimentCategory.MILD_NEGATIVE == "mild_negative"
        assert SentimentCategory.STRONG_NEGATIVE == "strong_negative"
    
    @patch('services.sentiment.analyzer.SPACY_AVAILABLE', False)
    def test_sentiment_analyzer_fallback(self):
        """spacy未インストール時のフォールバック動作テスト"""
        analyzer = SentimentAnalyzer()
        score, category = analyzer.analyze("こんにちは")
        assert isinstance(score, float)
        assert isinstance(category, SentimentCategory)
        assert 0 <= score <= 100
    
    def test_analyze_sentiment_function(self):
        """analyze_sentiment関数のテスト"""
        score, category = analyze_sentiment("テストです")
        assert isinstance(score, float)
        assert isinstance(category, SentimentCategory)
        assert 0 <= score <= 100


# エンジン管理モジュールのテスト
from services.engine import get_engine_version, get_speakers, get_user_dict


class TestEngineService:
    """エンジン管理サービスのテスト"""
    
    @patch('services.engine.engine_service.requests.get')
    def test_get_engine_version_success(self, mock_get):
        """エンジンバージョン取得成功ケース"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"version": "1.0.0"}
        mock_get.return_value = mock_response
        
        success, result = get_engine_version()
        assert success is True
        assert result["status"] == "ok"
        assert "engine_info" in result
    
    @patch('services.engine.engine_service.requests.get')
    def test_get_speakers_success(self, mock_get):
        """スピーカー情報取得成功ケース"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = [{"id": 0, "name": "テストスピーカー"}]
        mock_get.return_value = mock_response
        
        result = get_speakers()
        assert isinstance(result, list)


# 音声合成モジュールのテスト
from services.speech import AivisSpeechClient


class TestAivisSpeechClient:
    """AivisSpeech APIクライアントのテスト"""
    
    def test_client_initialization(self):
        """クライアント初期化テスト"""
        client = AivisSpeechClient()
        assert client.base_url is not None
    
    def test_client_with_custom_url(self):
        """カスタムURL指定テスト"""
        custom_url = "http://localhost:50021"
        client = AivisSpeechClient(custom_url)
        assert client.base_url == custom_url


# レスポンス生成モジュールのテスト
from services.response import get_wav_response, get_base64_response


class TestResponseFormatters:
    """レスポンス生成機能のテスト"""
    
    def test_get_wav_response(self):
        """WAVレスポンス生成テスト"""
        audio_data = b"test_audio_data"
        response = get_wav_response(audio_data)
        assert response.media_type == "audio/wav"
        assert "attachment" in response.headers["Content-Disposition"]
    
    def test_get_base64_response(self):
        """Base64レスポンス生成テスト"""
        audio_data = b"test_audio_data"
        response = get_base64_response(audio_data)
        assert response.content_type == "audio/wav"
        assert response.base64_audio is not None


# 後方互換性のテスト
def test_backward_compatibility():
    """後方互換性テスト"""
    # 元のservices.pyからのimportが動作することを確認
    import services
    
    # 主要な関数が利用可能であることを確認
    assert hasattr(services, 'analyze_sentiment')
    assert hasattr(services, 'get_engine_version')
    assert hasattr(services, 'get_speakers')
    assert hasattr(services, 'create_audio_query')
    assert hasattr(services, 'synthesize_speech')
    assert hasattr(services, 'text_to_speech')
    assert hasattr(services, 'get_wav_response')
    assert hasattr(services, 'get_base64_response')