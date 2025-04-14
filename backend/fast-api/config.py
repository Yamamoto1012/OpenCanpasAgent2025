"""
AivisSpeech API サーバーの設定モジュール

環境変数やアプリケーション設定の一元管理を行います。
"""
import os
import logging
from typing import List
from dotenv import load_dotenv

# .envファイルから環境変数を読み込む
load_dotenv()

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
        self.cors_origins: List[str] = os.getenv("CORS_ORIGINS", "*").split(",")
        self.cors_allow_credentials: bool = os.getenv("CORS_ALLOW_CREDENTIALS", "True").lower() == "true"
        self.cors_allow_methods: List[str] = os.getenv("CORS_ALLOW_METHODS", "*").split(",")
        self.cors_allow_headers: List[str] = os.getenv("CORS_ALLOW_HEADERS", "*").split(",")
        
        # FastAPIの設定
        self.api_title: str = os.getenv("API_TITLE", "AivisSpeech API")
        self.api_description: str = os.getenv("API_DESCRIPTION", "AivisSpeech Engine APIとのインターフェース - Swagger UIを使用してAPIをテスト可能")
        self.api_version: str = os.getenv("API_VERSION", "0.1.0")
        self.docs_url: str = os.getenv("DOCS_URL", "/docs")
        self.redoc_url: str = os.getenv("REDOC_URL", "/redoc")
        self.openapi_url: str = os.getenv("OPENAPI_URL", "/openapi.json")

        # LLM API設定
        self.llm_api_url: str = os.getenv("LLM_API_URL", "https://dbca-202-13-165-80.ngrok-free.app")
        self.llm_endpoint: str = os.getenv("LLM_ENDPOINT", "/answer_query")
        self.llm_timeout: float = float(os.getenv("LLM_TIMEOUT", "30.0"))


# 設定インスタンスを作成
settings = Settings()
logger = setup_logging()