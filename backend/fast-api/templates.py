"""
AivisSpeech API サーバーのHTMLテンプレート

テスト用のHTMLページなどのテンプレートを管理します。
"""

# テスト用HTMLページのテンプレート
TEST_PAGE_TEMPLATE = """
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