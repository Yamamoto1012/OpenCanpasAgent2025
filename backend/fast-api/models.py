"""
AivisSpeech API サーバーのデータモデル

リクエストとレスポンスのデータ構造を定義します。
"""
from pydantic import BaseModel, Field
from typing import Dict, Any, Literal, Optional


class TextRequest(BaseModel):
    """テキストから音声合成するためのリクエストモデル"""
    text: str = Field(..., description="合成したいテキスト", example="こんにちは、世界")
    speaker_id: int = Field(888753760, description="話者ID。/speakers で取得可能")


class AudioQueryRequest(BaseModel):
    """audio_queryを使用して音声合成するためのリクエストモデル"""
    query: Dict[str, Any] = Field(
        ..., description="audio_queryエンドポイントで取得したクエリ"
    )
    speaker_id: int = Field(..., description="話者ID。/speakers で取得可能")


class TTSRequest(BaseModel):
    """テキストから直接音声を生成するワンステップ用のリクエストモデル"""
    text: str = Field(..., description="合成したいテキスト", example="こんにちは、世界")
    speaker_id: int = Field(888753760, description="話者ID。/speakers で取得可能")
    format: Literal["wav", "base64", "html"] = Field(
        "wav", 
        description="出力形式。wav: 音声ファイル、base64: Base64エンコード、html: 再生可能なHTML"
    )


class AudioBase64Response(BaseModel):
    """Base64エンコードされた音声データのレスポンスモデル"""
    base64_audio: str = Field(..., description="Base64エンコードされた音声データ")
    content_type: str = Field("audio/wav", description="音声のMIMEタイプ")


class StatusResponse(BaseModel):
    """システムステータスのレスポンスモデル"""
    status: str = Field(..., description="ステータス（ok または error）")
    message: str = Field(..., description="ステータスメッセージ")
    engine_info: Optional[Dict[str, Any]] = Field(None, description="エンジン情報（存在する場合）")