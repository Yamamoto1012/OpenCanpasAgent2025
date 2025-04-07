"""
AivisSpeech API サーバーの設定モジュール

環境変数やアプリケーション設定の一元管理を行います。
"""
import os
import logging
from typing import List


# ロギングの設定
def setup_logging() -> logging.Logger:
    """
    アプリケーションのロギング設定を行い、ロガーを返します。
    
    Returns:
        logging.Logger: 設定済みのロガーインスタンス
    """
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    return logging.getLogger(__name__)


# アプリケーション設定
class Settings:
    """アプリケーション設定を管理するクラス"""
    
    def __init__(self) -> None:
        """
        環境変数から設定を読み込み、デフォルト値がある場合は適用します。
        """
        # AivisSpeech EngineのベースURL
        self.aivis_base_url: str = os.getenv("AIVIS_ENGINE_URL", "http://aivis:10101")
        
        # CORSの設定
        self.cors_origins: List[str] = ["*"]  # 本番環境では適切に設定すること
        self.cors_allow_credentials: bool = True
        self.cors_allow_methods: List[str] = ["*"]
        self.cors_allow_headers: List[str] = ["*"]
        
        # FastAPIの設定
        self.api_title: str = "AivisSpeech API"
        self.api_description: str = "AivisSpeech Engine APIとのインターフェース - Swagger UIを使用してAPIをテスト可能"
        self.api_version: str = "0.1.0"
        self.docs_url: str = "/docs"
        self.redoc_url: str = "/redoc"
        self.openapi_url: str = "/openapi.json"


# 設定インスタンスを作成
settings = Settings()
logger = setup_logging()