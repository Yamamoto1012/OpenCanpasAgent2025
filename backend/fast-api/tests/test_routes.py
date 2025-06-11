"""
AivisSpeech API サーバーのルーターのテスト

APIエンドポイントの機能をテストする。
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

from app import app


client = TestClient(app)


class TestHealthRoutes:
    """ヘルスチェック関連のエンドポイントのテスト"""
    
    def test_root_endpoint(self):
        """ルートエンドポイントのテスト"""
        response = client.get("/")
        assert response.status_code == 200
        assert response.json() == {"message": "AivisSpeech API サーバーが稼働中です"}
    
    @patch('services.get_engine_version')
    def test_status_endpoint_success(self, mock_get_engine_version):
        """ステータスエンドポイントの正常系テスト"""
        # モックの設定
        mock_get_engine_version.return_value = (True, {
            "status": "ok",
            "message": "AivisSpeech Engineが正常に動作しています",
            "engine_info": {"version": "1.0.0"}
        })
        
        # リクエストの送信
        response = client.get("/status")
        
        # アサーション
        assert response.status_code == 200
        assert response.json()["status"] == "ok"
        assert response.json()["engine_info"] == {"version": "1.0.0"}
    
    @patch('services.get_engine_version')
    def test_status_endpoint_error(self, mock_get_engine_version):
        """ステータスエンドポイントのエラー系テスト"""
        # モックの設定
        mock_get_engine_version.return_value = (False, {
            "status": "error",
            "message": "AivisSpeech Engineに接続できません: Connection refused"
        })
        
        # リクエストの送信
        response = client.get("/status")
        
        # アサーション
        assert response.status_code == 200  # エラーでも200を返す設計
        assert response.json()["status"] == "error"
        assert "接続できません" in response.json()["message"]


class TestSpeechRoutes:
    """音声合成関連のエンドポイントのテスト"""
    
    @patch('services.get_speakers')
    def test_get_speakers(self, mock_get_speakers):
        """話者一覧取得エンドポイントのテスト"""
        # モックの設定
        mock_speakers = [
            {"name": "話者1", "styles": [{"id": 1, "name": "通常"}]}
        ]
        mock_get_speakers.return_value = mock_speakers
        
        # リクエストの送信
        response = client.get("/speakers")
        
        # アサーション
        assert response.status_code == 200
        assert response.json() == mock_speakers
    
    @patch('services.create_audio_query')
    def test_create_audio_query(self, mock_create_audio_query):
        """audio_query作成エンドポイントのテスト"""
        # モックの設定
        mock_query = {"accent_phrases": [], "speedScale": 1.0}
        mock_create_audio_query.return_value = mock_query
        
        # リクエストの送信
        request_data = {"text": "こんにちは", "speaker_id": 1}
        response = client.post("/audio_query", json=request_data)
        
        # アサーション
        assert response.status_code == 200
        assert response.json() == mock_query
        mock_create_audio_query.assert_called_once_with("こんにちは", 1)
    
    @patch('services.text_to_speech')
    def test_tts_endpoint_wav(self, mock_text_to_speech):
        """TTSエンドポイント（WAV形式）のテスト"""
        # リクエストの送信
        request_data = {
            "text": "こんにちは", 
            "speaker_id": 1, 
            "format": "wav"
        }
        client.post("/tts", json=request_data)
        
        # モックの呼び出し確認
        mock_text_to_speech.assert_called_once_with("こんにちは", 1, "wav")

class TestDictionaryRoutes:
    """ユーザー辞書関連のエンドポイントのテスト"""
    
    @patch('services.get_user_dict')
    def test_get_user_dict(self, mock_get_user_dict):
        """ユーザー辞書取得エンドポイントのテスト"""
        # モックの設定
        mock_dict = {"entries": [{"surface": "単語", "pronunciation": "たんご"}]}
        mock_get_user_dict.return_value = mock_dict
        
        # リクエストの送信
        response = client.get("/user_dict")
        
        # アサーション
        assert response.status_code == 200
        assert response.json() == mock_dict