"""
AivisSpeech API サーバーのエントリーポイント

FastAPIアプリケーションを初期化し、各種ルーターを登録する
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings, logger
from routers import health, speech, dictionary, llm, sentiment


def create_application() -> FastAPI:
    """
    FastAPIアプリケーションを作成し、設定を適用する。
    
    Returns:
        FastAPI: 設定済みのFastAPIアプリケーション
    """
    # アプリケーションの作成
    app = FastAPI(
        title=settings.api_title,
        description=settings.api_description,
        version=settings.api_version,
        docs_url=settings.docs_url,
        redoc_url=settings.redoc_url,
        openapi_url=settings.openapi_url
    )
    
    # CORSの設定
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=settings.cors_allow_credentials,
        allow_methods=settings.cors_allow_methods,
        allow_headers=settings.cors_allow_headers,
    )
    
    # ルーターの登録
    app.include_router(health.router, prefix="", tags=["health"])
    app.include_router(speech.router, prefix="", tags=["speech"])
    app.include_router(dictionary.router, prefix="", tags=["dictionary"])
    app.include_router(llm.router, prefix="/llm", tags=["llm"])
    app.include_router(sentiment.router, prefix="", tags=["sentiment"])
    
    logger.info("AivisSpeech API サーバーを初期化しました")
    return app

# アプリケーションのインスタンスを作成
app = create_application()


if __name__ == "__main__":
    """
    開発環境での直接起動用のエントリーポイント
    """
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)