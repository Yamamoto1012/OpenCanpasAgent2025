"""
AivisSpeech API サーバーのサービス層のテスト

servicesモジュールの関数をテスト。
"""
import pytest
from unittest.mock import patch, MagicMock
from fastapi import HTTPException
import base64

from services import (
    get_engine_version,
    get_speakers,
    get_wav_response,
    get_base64_response,
)


class TestEngineVersionService:
    """get_engine_versionサービス関数のテスト"""
    
    @patch('services.requests.get')
    def test_get_engine_version_success(self, mock_get):
        """正常系: エンジンのバージョン情報が取得できる場合"""
        # モックの設定
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"version": "1.0.0"}
        mock_get.return_value = mock_response
        
        # 関数の実行
        success, data = get_engine_version()
        
        # アサーション
        assert success is True
        assert data["status"] == "ok"
        assert data["message"] == "AivisSpeech Engineが正常に動作しています"
        assert data["engine_info"] == {"version": "1.0.0"}
    
    @patch('services.requests.get')
    def test_get_engine_version_error_status(self, mock_get):
        """異常系: エンジンからエラーステータスが返ってくる場合"""
        # モックの設定
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_get.return_value = mock_response
        
        # 関数の実行
        success, data = get_engine_version()
        
        # アサーション
        assert success is False
        assert data["status"] == "error"
        assert "正常なレスポンスが返ってきませんでした" in data["message"]
    
    @patch('services.requests.get')
    def test_get_engine_version_connection_error(self, mock_get):
        """異常系: エンジンに接続できない場合"""
        # モックの設定
        mock_get.side_effect = Exception("Connection refused")
        
        # 関数の実行
        success, data = get_engine_version()
        
        # アサーション
        assert success is False
        assert data["status"] == "error"
        assert "AivisSpeech Engineに接続できません" in data["message"]


class TestSpeakersService:
    """get_speakersサービス関数のテスト"""
    
    @patch('services.requests.get')
    def test_get_speakers_success(self, mock_get):
        """正常系: 話者一覧が取得できる場合"""
        # モックの設定
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_speakers = [
            {"name": "話者1", "styles": [{"id": 1, "name": "通常"}]}
        ]
        mock_response.json.return_value = mock_speakers
        mock_get.return_value = mock_response
        
        # 関数の実行
        result = get_speakers()
        
        # アサーション
        assert result == mock_speakers
    
    @patch('services.requests.get')
    def test_get_speakers_error_status(self, mock_get):
        """異常系: エンジンからエラーステータスが返ってくる場合"""
        # モックの設定
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_get.return_value = mock_response
        
        # 関数の実行と例外の確認
        with pytest.raises(HTTPException) as excinfo:
            get_speakers()
        
        # アサーション
        assert excinfo.value.status_code == 500
        assert "スピーカー情報を取得できませんでした" in excinfo.value.detail


# 以下、他の関数のテストも同様に実装
class TestConversionServices:
    """レスポンス変換サービス関数のテスト"""
    
    def test_get_wav_response(self):
        """WAVレスポンスの変換テスト"""
        # テストデータ
        audio_content = b"dummy audio data"
        
        # 関数の実行
        response = get_wav_response(audio_content)
        
        # アサーション
        assert response.body == audio_content
        assert response.media_type == "audio/wav"
        assert "attachment; filename=audio.wav" in response.headers["Content-Disposition"]
    
    def test_get_base64_response(self):
        """Base64レスポンスの変換テスト"""
        # テストデータ
        audio_content = b"dummy audio data"
        expected_base64 = base64.b64encode(audio_content).decode('utf-8')
        
        # 関数の実行
        response = get_base64_response(audio_content)
        
        # アサーション
        assert response.base64_audio == expected_base64
        assert response.content_type == "audio/wav"