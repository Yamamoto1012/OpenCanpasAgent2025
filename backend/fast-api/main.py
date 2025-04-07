from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field
from typing import Dict, Any, Literal
import requests
import os
import logging
import base64


# ロギングの設定
logging.basicConfig(
    level=logging.INFO,  # 一般的な情報メッセージ(ログのレベル)
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


app = FastAPI(
    title="AivisSpeech API",
    description="AivisSpeech Engine APIとのインターフェース - Swagger UIを使用してAPIをテスト可能",
    version="0.1.0",
    docs_url="/docs",       # Swagger UI用のURL
    redoc_url="/redoc",     # ReDoc用のURL
    openapi_url="/openapi.json"  # OpenAPIスキーマ用のURL
)


# CORSの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # すべてのオリジンからのリクエストを許可(本番で変更)
    allow_credentials=True,  # Cookieの送信を許可
    allow_methods=["*"],  # すべてのHTTPメソッドを許可
    allow_headers=["*"],  # すべてのHTTPヘッダーを許可
)


# AivisSpeech EngineのベースURL
AIVIS_BASE_URL = os.getenv("AIVIS_ENGINE_URL", "http://aivis:10101")


class TextRequest(BaseModel):
    text: str = Field(..., description="合成したいテキスト", example="こんにちは、世界")
    speaker_id: int = Field(888753760, description="話者ID。/speakers で取得可能")


class AudioQueryRequest(BaseModel):
    query: Dict[str, Any] = Field(
        ..., description="audio_queryエンドポイントで取得したクエリ"
    )
    speaker_id: int = Field(..., description="話者ID。/speakers で取得可能")


class TTSRequest(BaseModel):
    text: str = Field(..., description="合成したいテキスト", example="こんにちは、世界")
    speaker_id: int = Field(888753760, description="話者ID。/speakers で取得可能")
    format: Literal["wav", "base64", "html"] = Field(
        "wav", 
        description="出力形式。wav: 音声ファイル、base64: Base64エンコード、html: 再生可能なHTML"
    )


class AudioBase64Response(BaseModel):
    base64_audio: str = Field(..., description="Base64エンコードされた音声データ")
    content_type: str = Field("audio/wav", description="音声のMIMEタイプ")


@app.get("/")
async def root():
    return {"message": "AivisSpeech API サーバーが稼働中です"}


@app.get("/status")
async def status():
    try:
        # AivisSpeech Engineの状態を確認
        response = requests.get(f"{AIVIS_BASE_URL}/version")
        if response.status_code == 200:
            return {
                "status": "ok",
                "message": "AivisSpeech Engineが正常に動作しています",
                "engine_info": response.json()
            }
        else:
            return {
                "status": "error",
                "message": "AivisSpeech Engineに接続できましたが、正常なレスポンスが返ってきませんでした",
            }
    except requests.exceptions.RequestException as e:
        logger.error(f"AivisSpeech Engineに接続できません: {e}")
        return {
            "status": "error",
            "message": f"AivisSpeech Engineに接続できません: {e}",
        }


@app.get("/speakers")
async def get_speakers():
    try:
        response = requests.get(f"{AIVIS_BASE_URL}/speakers")
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail="AivisSpeech Engineからスピーカー情報を取得できませんでした"
            )
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"AivisSpeech Engineに接続できません: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"AivisSpeech Engineに接続できません: {e}"
        )


@app.post("/audio_query")
async def create_audio_query(request: TextRequest):
    try:
        params = {"speaker": request.speaker_id, "text": request.text}
        response = requests.post(f"{AIVIS_BASE_URL}/audio_query", params=params)
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail="AivisSpeech Engineからオーディオクエリを取得できませんでした"
            )
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"AivisSpeech Engineに接続できません: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"AivisSpeech Engineに接続できません: {e}"
        )


@app.post("/synthesis")
async def synthesis(request: AudioQueryRequest):
    try:
        params = {"speaker": request.speaker_id}
        headers = {"Content-Type": "application/json"}
        response = requests.post(
            f"{AIVIS_BASE_URL}/synthesis",
            params=params,
            headers=headers,
            json=request.query
        )
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail="AivisSpeech Engineから音声を合成できませんでした"
            )
        
        # レスポンスをそのまま返す
        return Response(
            content=response.content,
            media_type="audio/wav",
            headers={"Content-Disposition": "attachment; filename=audio.wav"}
        )
    except requests.exceptions.RequestException as e:
        logger.error(f"AivisSpeech Engineに接続できません: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"AivisSpeech Engineに接続できません: {e}"
        )


@app.post("/tts", response_class=Response)
async def text_to_speech(request: TTSRequest):
    """
    テキストから直接音声を生成するワンステップAPIエンドポイント。
    フォーマットを指定して異なる形式で受け取ることができます。
    - wav: 直接ダウンロード可能な音声ファイル
    - base64: Base64エンコードされたJSON
    - html: ブラウザで再生可能なHTMLページ
    """
    try:
        # audio_queryを取得
        params = {"speaker": request.speaker_id, "text": request.text}
        query_response = requests.post(
            f"{AIVIS_BASE_URL}/audio_query", params=params
        )
        if query_response.status_code != 200:
            raise HTTPException(
                status_code=query_response.status_code,
                detail="AivisSpeech Engineからオーディオクエリを取得できませんでした"
            )
        
        query_data = query_response.json()
        
        # 音声合成
        params = {"speaker": request.speaker_id}
        headers = {"Content-Type": "application/json"}
        synthesis_response = requests.post(
            f"{AIVIS_BASE_URL}/synthesis",
            params=params,
            headers=headers,
            json=query_data
        )
        
        if synthesis_response.status_code != 200:
            raise HTTPException(
                status_code=synthesis_response.status_code,
                detail="AivisSpeech Engineから音声を合成できませんでした"
            )
        
        # フォーマットに応じた出力
        if request.format == "wav":
            # WAVファイルとして直接返す
            return Response(
                content=synthesis_response.content,
                media_type="audio/wav",
                headers={"Content-Disposition": "attachment; filename=audio.wav"}
            )
        elif request.format == "base64":
            # Base64エンコードされたJSONとして返す
            audio_base64 = base64.b64encode(
                synthesis_response.content
            ).decode('utf-8')
            return AudioBase64Response(
                base64_audio=audio_base64,
                content_type="audio/wav"
            )
        elif request.format == "html":
            # 再生可能なHTMLページとして返す
            audio_base64 = base64.b64encode(
                synthesis_response.content
            ).decode('utf-8')
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>音声再生</title>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }}
                    h1 {{
                        color: #333;
                    }}
                    .audio-player {{
                        margin: 20px 0;
                    }}
                    .text {{
                        background-color: #f5f5f5;
                        padding: 10px;
                        border-left: 4px solid #2196F3;
                        margin-bottom: 20px;
                    }}
                </style>
            </head>
            <body>
                <h1>生成された音声</h1>
                <div class="text">テキスト: {request.text}</div>
                <div class="audio-player">
                    <audio controls autoplay>
                        <source src="data:audio/wav;base64,{audio_base64}" type="audio/wav">
                        お使いのブラウザは音声再生をサポートしていません。
                    </audio>
                </div>
                <p>
                    <a href="data:audio/wav;base64,{audio_base64}" download="audio.wav">
                    音声ファイルをダウンロード</a>
                </p>
                <p>
                    <a href="/docs">API ドキュメントに戻る</a>
                </p>
            </body>
            </html>
            """
            return HTMLResponse(content=html_content)
        
    except requests.exceptions.RequestException as e:
        logger.error(f"AivisSpeech Engineに接続できません: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"AivisSpeech Engineに接続できません: {e}"
        )


@app.get("/user_dict")
async def get_user_dict():
    try:
        response = requests.get(f"{AIVIS_BASE_URL}/user_dict")
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail="AivisSpeech Engineからユーザー辞書を取得できませんでした"
            )
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"AivisSpeech Engineに接続できません: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"AivisSpeech Engineに接続できません: {e}"
        )


# HTMLページのテンプレート
HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AivisSpeech テスト</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }
        label {
            display: block;
            margin-top: 15px;
            font-weight: bold;
        }
        textarea, select, button {
            width: 100%;
            padding: 8px;
            margin-top: 5px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
        }
        button {
            background-color: #4CAF50;
            color: white;
            border: none;
            cursor: pointer;
            margin-top: 20px;
            padding: 10px;
            font-size: 16px;
            transition: background-color 0.3s;
        }
        button:hover {
            background-color: #45a049;
        }
        .audio-player {
            margin-top: 20px;
            width: 100%;
        }
        .loading {
            display: none;
            color: #666;
            margin-top: 10px;
        }
        #speakerSelect {
            height: 40px;
        }
        #apiLinks {
            margin-top: 30px;
            text-align: center;
        }
        #apiLinks a {
            margin: 0 10px;
            color: #2196F3;
            text-decoration: none;
        }
        #apiLinks a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>AivisSpeech 音声合成テスト</h1>
        
        <label for="speakerSelect">話者選択:</label>
        <select id="speakerSelect">
            <option value="loading">読み込み中...</option>
        </select>
        
        <label for="textInput">テキスト入力:</label>
        <textarea id="textInput" rows="5" placeholder="合成したいテキストを入力してください">こんにちは</textarea>
        
        <button id="generateBtn">音声生成</button>
        
        <div id="loading" class="loading">処理中...</div>
        
        <div class="audio-player">
            <audio id="audioPlayer" controls style="width:100%; display:none;"></audio>
        </div>
        
        <div id="apiLinks">
            <a href="/docs" target="_blank">API ドキュメント (Swagger UI)</a>
            <a href="/redoc" target="_blank">API ドキュメント (ReDoc)</a>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const speakerSelect = document.getElementById('speakerSelect');
            const textInput = document.getElementById('textInput');
            const generateBtn = document.getElementById('generateBtn');
            const loading = document.getElementById('loading');
            const audioPlayer = document.getElementById('audioPlayer');
            
            // 話者一覧を取得
            fetch('/speakers')
                .then(response => response.json())
                .then(data => {
                    speakerSelect.innerHTML = '';
                    data.forEach(speaker => {
                        speaker.styles.forEach(style => {
                            const option = document.createElement('option');
                            option.value = style.id;
                            option.textContent = `${speaker.name} (${style.name})`;
                            speakerSelect.appendChild(option);
                        });
                    });
                    
                    if (speakerSelect.options.length === 0) {
                        const option = document.createElement('option');
                        option.value = "888753760";
                        option.textContent = "デフォルト話者";
                        speakerSelect.appendChild(option);
                    }
                })
                .catch(error => {
                    console.error('話者情報の取得に失敗しました:', error);
                    const option = document.createElement('option');
                    option.value = "888753760";
                    option.textContent = "デフォルト話者";
                    speakerSelect.appendChild(option);
                });
            
            // 音声生成
            generateBtn.addEventListener('click', async () => {
                const text = textInput.value.trim();
                const speakerId = speakerSelect.value;
                
                if (!text) {
                    alert('テキストを入力してください');
                    return;
                }
                
                audioPlayer.style.display = 'none';
                loading.style.display = 'block';
                
                try {
                    // /tts エンドポイントを使って音声生成
                    const response = await fetch('/tts', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            text: text,
                            speaker_id: parseInt(speakerId),
                            format: "html"
                        })
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const html = await response.text();
                    const newWindow = window.open();
                    newWindow.document.write(html);
                } catch (error) {
                    console.error('音声生成に失敗しました:', error);
                    alert('音声生成に失敗しました: ' + error.message);
                } finally {
                    loading.style.display = 'none';
                }
            });
        });
    </script>
</body>
</html>
"""


@app.get("/test", response_class=HTMLResponse)
async def test_page():
    """
    音声合成をテストするためのHTMLページを提供します
    """
    return HTMLResponse(content=HTML_TEMPLATE)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)