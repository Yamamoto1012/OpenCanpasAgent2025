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
    && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Rustのパスを設定
ENV PATH="/root/.cargo/bin:${PATH}"

# 作業ディレクトリの設定
WORKDIR /app

# pipを最新版にアップデート
RUN pip install --upgrade pip

# 必要なPythonパッケージのインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# GiNZAモデルのダウンロード
RUN python -m spacy download ja_ginza_electra || python -m spacy download ja_ginza || echo "GiNZAモデルのダウンロードをスキップしました"

# AivisSpeech Engineのインストール
RUN mkdir -p /home/user/.local/share/AivisSpeech-Engine-Dev

# データディレクトリの作成
RUN mkdir -p /app/data/sentiment_dictionaries

# アプリケーションのコピー
COPY . .

# ポート公開
EXPOSE 8000

# コンテナ起動時のコマンド
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]