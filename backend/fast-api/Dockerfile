# ベースイメージの指定
FROM python:3.10-slim-bullseye

# 依存関係のインストール
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    git \
    curl \
    libsndfile1 \
    ffmpeg \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 作業ディレクトリの設定
WORKDIR /app

# 必要なPythonパッケージのインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# AivisSpeech Engineのインストール
RUN mkdir -p /home/user/.local/share/AivisSpeech-Engine-Dev

# アプリケーションのコピー
COPY . .

# ポート公開
EXPOSE 8000

# コンテナ起動時のコマンド
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]