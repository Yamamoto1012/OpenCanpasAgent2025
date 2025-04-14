# app.py から create_application 関数をインポート
from app import app  # create_application ではなく、appインスタンス自体をインポート
import uvicorn
import logging # logging は必要に応じて残す

# ロギングの設定 (必要であれば残す)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# FastAPIインスタンスの作成やルート定義はここで行わない
# app.py で定義されたものが使われる

# 開発環境での直接起動用のエントリーポイント (コンテナ外での実行用)
# Dockerコンテナ内では compose.yaml の CMD が優先される
if __name__ == "__main__":
    # uvicorn.run に渡すのは "ファイル名:変数名" の文字列
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)