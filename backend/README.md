# OpenCanapasAgent2025 Backend

金沢工業大学情報工学科の3D VRMアバター対話型AIエージェントのバックエンドAPI

## アーキテクチャ

### システム構成
```
Backend Services (Docker Compose)
├── FastAPI Service (Port 8000)
│   ├── LLM Integration & RAG
│   ├── 感情分析 (spaCy + ginza)
│   ├── ONNX Runtime ML推論
│   └── API エンドポイント
└── Aivis Speech Engine (Port 10101)
    ├── Text-to-Speech 合成
    ├── Speech-to-Text 認識  
    └── ストリーミング音声処理
```

### 技術スタック

#### Webフレームワーク
- **FastAPI** - 高性能非同期APIフレームワーク
- **Uvicorn** - ASGI Webサーバー
- **Pydantic** - データバリデーション・シリアライゼーション

#### AI・機械学習
- **spaCy + ginza** - 日本語自然言語処理・感情分析
- **ONNX Runtime** - 機械学習モデル推論
- **transformers** - Hugging Face Transformersライブラリ
- **torch** - PyTorch機械学習フレームワーク

#### 音声処理
- **Aivis Speech Engine** - 高品質TTS/STT（Docker image）
- **soundfile** - 音声ファイル処理
- **numpy** - 数値計算・音声データ処理

#### 外部API・通信
- **httpx** - 非同期HTTPクライアント（LLM API統合）
- **requests** - HTTPクライアントライブラリ
- **python-multipart** - マルチパートデータ処理

#### 開発・テスト
- **pytest** - テストフレームワーク
- **pytest-asyncio** - 非同期テスト対応

## 📁 プロジェクト構造

```
backend/
├── compose.yaml              # Docker Compose 設定
├── CLAUDE.md                 # Claude Code 開発ガイド
├── docs/                     # ドキュメント・設計資料
│   ├── backend-architecture-summary.md
│   ├── LLM統合/             # LLM統合関連ドキュメント
│   └── 感情分析/            # 感情分析関連ドキュメント
├── fast-api/                # FastAPI アプリケーション
│   ├── app.py               # アプリケーションエントリーポイント
│   ├── main.py              # サーバー起動スクリプト
│   ├── config.py            # 設定・環境変数管理
│   ├── models.py            # Pydanticモデル定義
│   ├── requirements.txt     # Python依存関係
│   ├── Dockerfile           # FastAPIコンテナ定義
│   ├── routers/             # APIルーター（エンドポイント定義）
│   │   ├── health.py        # ヘルスチェック
│   │   ├── llm.py          # LLM統合エンドポイント
│   │   ├── sentiment.py    # 感情分析エンドポイント
│   │   ├── speech.py       # 音声合成エンドポイント
│   │   └── dictionary.py   # 辞書管理エンドポイント
│   ├── services/            # ビジネスロジック・サービス層
│   │   ├── sentiment/       # 感情分析サービス
│   │   │   ├── analyzer.py           # 感情分析エンジン
│   │   │   ├── hybrid_analyzer.py   # ハイブリッド感情分析
│   │   │   ├── rule_based_analyzer.py # ルールベース分析
│   │   │   ├── onnx_analyzer.py      # ONNX ML分析
│   │   │   └── models/              # 学習済みモデル・トークナイザー
│   │   ├── speech/          # 音声処理サービス
│   │   │   ├── aivis_client.py      # Aivis Engine クライアント
│   │   │   └── speech_service.py    # 音声サービス抽象化
│   │   ├── engine/          # エンジン統合サービス
│   │   ├── response/        # レスポンス形式化
│   │   └── streaming/       # ストリーミング処理
│   ├── data/               # データファイル
│   │   └── sentiment_dictionaries/ # 感情分析辞書
│   ├── middleware/         # ミドルウェア
│   ├── scripts/           # ユーティリティスクリプト
│   └── tests/             # テストファイル
└── tests/                 # 統合テスト
```

## セットアップ

### 必要な環境
- **Docker** 20.10+ & **Docker Compose** v2
- **Python** 3.9+ （ローカル開発時）

### 環境変数設定
`.env` ファイルを作成（任意）:
```bash
# LLM統合設定
DIFY_API_URL=your_llm_api_url
DIFY_API_KEY=your_api_key
DIFY_WORKFLOW_ID=your_workflow_id
DIFY_VOICE_WORKFLOW_ID=your_voice_workflow_id

# ストリーミング設定
ENABLE_STREAMING=true
STREAM_CHUNK_SIZE=1024
STREAM_TIMEOUT=60.0
VERIFY_SSL=false
```

### 起動手順

#### Docker Compose（推奨）
```bash
# バックエンドディレクトリに移動
cd backend

# 全サービス起動（FastAPI + Aivis Engine）
docker compose up -d

# ログ監視
docker compose logs -f

# サービス停止
docker compose down

# 強制リビルド
docker compose build --no-cache
```

#### ローカル開発
```bash
# FastAPIのみローカル実行（Aivis Engineはコンテナ）
cd backend
docker compose up -d aivis

cd fast-api
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API エンドポイント

### ヘルスチェック
- `GET /health` - サービス稼働状況
- `GET /api/llm/health` - LLM統合ヘルスチェック

### LLM 統合
- `POST /api/llm/query` - テキスト質問処理
  ```json
  {
    "query": "質問内容",
    "context": "コンテキスト", 
    "language": "ja"
  }
  ```
- `POST /api/llm/voice_mode_answer` - 音声モード質問処理

### 感情分析
- `POST /sentiment/analyze` - 日本語テキスト感情分析
  ```json
  {
    "text": "分析対象テキスト",
    "method": "hybrid"  // "rule_based", "onnx", "hybrid"
  }
  ```

### 音声合成（Aivis Engine プロキシ）
- `POST /speech/synthesize` - Text-to-Speech
- その他 Aivis Engine エンドポイントへのプロキシ

## 開発ガイドライン

### コード構造
- **ルーター**: `routers/` - FastAPI エンドポイント定義
- **サービス**: `services/` - ビジネスロジック・外部API統合
- **モデル**: `models.py` - Pydantic データモデル
- **設定**: `config.py` - 環境変数・アプリケーション設定

### 非同期処理
```python
# 推奨パターン: httpx非同期クライアント
async def call_external_api():
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=data)
        return response.json()
```

### エラーハンドリング
```python
from fastapi import HTTPException

# 統一エラーレスポンス
if not result:
    raise HTTPException(
        status_code=404, 
        detail="リソースが見つかりません"
    )
```

### 感情分析
3つの手法をサポート:
```python
# ハイブリッド分析（推奨）
result = await sentiment_service.analyze_hybrid(text)

# ルールベース分析（高速）
result = await sentiment_service.analyze_rule_based(text)

# ONNX ML分析（高精度）
result = await sentiment_service.analyze_onnx(text)
```

## テスト

### テスト実行
```bash
# FastAPIコンテナ内でテスト実行
docker compose exec fastapi pytest tests/

# ローカル環境でテスト実行
cd fast-api
python -m pytest tests/ -v

# カバレッジ付きテスト
python -m pytest tests/ --cov=.
```

### テスト構造
```
tests/
├── test_routes.py           # APIエンドポイントテスト
├── test_services.py         # サービス層テスト
├── test_hybrid_sentiment.py # 感情分析テスト
├── unit/                   # ユニットテスト
└── rag/                    # RAG機能テスト
```

### テストのベストプラクティス
- **非同期テスト**: `@pytest.mark.asyncio` デコレーター使用
- **モックAPI**: `httpx.MockTransport` でLLM API応答モック
- **設定分離**: テスト専用環境変数設定

## パフォーマンス・スケーリング

### Aivis Engine 最適化
```yaml
# GPU加速版（compose.yaml）
aivis:
  image: ghcr.io/aivis-project/aivisspeech-engine:nvidia-latest
  runtime: nvidia
```

### ストリーミング設定
```python
# 環境変数でチューニング
ENABLE_STREAMING=true
STREAM_CHUNK_SIZE=1024    # レスポンスチャンクサイズ
STREAM_TIMEOUT=60.0       # ストリームタイムアウト
```

### モニタリング
- **ヘルスチェック**: Docker Compose ヘルスチェック設定済み
- **ログ**: 構造化ロギング（JSON形式）
- **メトリクス**: 今後OpenTelemetry統合予定

## トラブルシューティング

### サービス起動エラー
```bash
# サービス状態確認
docker compose ps

# ログ確認
docker compose logs fastapi
docker compose logs aivis

# ポート競合確認
netstat -tulpn | grep -E ':(8000|10101)'
```

### Aivis Engine 接続エラー
```bash
# Aivis Engine ヘルスチェック
curl http://localhost:10101/version

# FastAPI から Aivis への接続確認
docker compose exec fastapi curl http://aivis:10101/version
```

### 感情分析エラー
```bash
# spaCy モデル確認
docker compose exec fastapi python -c "import spacy; spacy.load('ja_ginza_electra')"

# ONNX モデル確認  
docker compose exec fastapi ls -la services/sentiment/models/
```

### メモリ・CPU不足
- **Aivis Engine**: CPU版使用時は4GB RAM推奨
- **spaCy + ginza**: 初回起動時モデルダウンロードで時間要
- **ONNX Runtime**: モデル読み込み時メモリ使用量増加

## 本番運用

### セキュリティ
- CORS設定: フロントエンドドメインのみ許可
- API Key管理: 環境変数での秘匿情報管理  
- SSL/TLS: プロキシサーバーでHTTPS終端

### デプロイメント
```bash
# 本番ビルド
docker compose -f compose.yaml -f compose.prod.yaml up -d

# ヘルスチェック確認
curl http://localhost:8000/health
curl http://localhost:10101/version
```

### バックアップ
- **モデルファイル**: `services/sentiment/models/` 
- **辞書ファイル**: `data/sentiment_dictionaries/`
- **設定ファイル**: `config.py`, `compose.yaml`