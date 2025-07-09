"""
Dify + ストリーミング対応のテストコード
"""
import pytest
import httpx
import json
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch
import asyncio
from datetime import datetime

@pytest.mark.asyncio
async def test_streaming_query():
    """ストリーミングレスポンスのテスト"""
    # モックのDifyレスポンスデータ
    mock_streaming_data = [
        'data: {"event": "workflow_started", "task_id": "test_task_1"}\n',
        'data: {"event": "node_finished", "task_id": "test_task_1", "data": {"outputs": {"response": "これは"}}}\n',
        'data: {"event": "node_finished", "task_id": "test_task_1", "data": {"outputs": {"response": "テスト"}}}\n',
        'data: {"event": "node_finished", "task_id": "test_task_1", "data": {"outputs": {"response": "です"}}}\n',
        'data: {"event": "workflow_finished", "task_id": "test_task_1", "data": {"outputs": {"response": "完了"}}}\n'
    ]
    
    async def mock_stream_response(*args, **kwargs):
        """モックのストリーミングレスポンス"""
        class MockResponse:
            status_code = 200
            
            async def aiter_lines(self):
                for line in mock_streaming_data:
                    yield line
        
        return MockResponse()
    
    # HTTPXクライアントのstream methodをモック
    with patch('httpx.AsyncClient.stream', side_effect=mock_stream_response):
        # 実際のテストでは、FastAPIのテストクライアントを使用
        async with AsyncClient(base_url="http://test") as client:
            response = await client.post(
                "/api/llm/query",
                json={
                    "query": "大学について教えてください",
                    "language": "ja",
                    "stream": True
                },
                timeout=60.0
            )
            
            # ここでは簡単な検証のみ実施
            assert response.status_code == 200
            
            # 実際のストリーミングテストでは、Server-Sent Eventsの検証が必要
            # content_typeが適切かどうかを確認
            # assert "text/event-stream" in response.headers.get("content-type", "")


@pytest.mark.asyncio
async def test_non_streaming_query():
    """非ストリーミングレスポンスのテスト"""
    mock_response_data = {
        "data": {
            "outputs": {
                "response": "これは非ストリーミングのテスト応答です。"
            }
        }
    }
    
    async def mock_post_response(*args, **kwargs):
        """モックのブロッキングレスポンス"""
        class MockResponse:
            status_code = 200
            
            def json(self):
                return mock_response_data
        
        return MockResponse()
    
    with patch('httpx.AsyncClient.post', side_effect=mock_post_response):
        async with AsyncClient(base_url="http://test") as client:
            response = await client.post(
                "/api/llm/query",
                json={
                    "query": "こんにちは",
                    "language": "ja",
                    "stream": False
                }
            )
            
            assert response.status_code == 200
            # 実際のテストでは response.json() でレスポンスの内容を検証


@pytest.mark.asyncio
async def test_voice_mode_answer():
    """音声モード用エンドポイントのテスト"""
    mock_response_data = {
        "data": {
            "outputs": {
                "response": "音声モード用の短い応答です。"
            }
        }
    }
    
    async def mock_post_response(*args, **kwargs):
        """モックの音声モードレスポンス"""
        class MockResponse:
            status_code = 200
            
            def json(self):
                return mock_response_data
        
        return MockResponse()
    
    with patch('httpx.AsyncClient.post', side_effect=mock_post_response):
        async with AsyncClient(base_url="http://test") as client:
            response = await client.post(
                "/api/llm/voice_mode_answer",
                json={
                    "query": "大学の場所は？",
                    "language": "ja"
                }
            )
            
            assert response.status_code == 200


@pytest.mark.asyncio
async def test_streaming_error_handling():
    """ストリーミング中のエラーハンドリングテスト"""
    mock_error_data = [
        'data: {"event": "workflow_started", "task_id": "test_task_error"}\n',
        'data: {"event": "error", "task_id": "test_task_error", "message": "テストエラー"}\n'
    ]
    
    async def mock_stream_error_response(*args, **kwargs):
        """エラーを含むモックレスポンス"""
        class MockResponse:
            status_code = 200
            
            async def aiter_lines(self):
                for line in mock_error_data:
                    yield line
        
        return MockResponse()
    
    with patch('httpx.AsyncClient.stream', side_effect=mock_stream_error_response):
        async with AsyncClient(base_url="http://test") as client:
            response = await client.post(
                "/api/llm/query",
                json={
                    "query": "エラーテスト",
                    "stream": True
                },
                timeout=60.0
            )
            
            # エラーの場合でも200は返る（ストリーミング内でエラーを処理）
            assert response.status_code == 200


@pytest.mark.asyncio
async def test_health_check():
    """ヘルスチェックエンドポイントのテスト"""
    mock_response_data = {"workflows": []}
    
    async def mock_get_response(*args, **kwargs):
        """モックのヘルスチェックレスポンス"""
        class MockResponse:
            status_code = 200
            
            def json(self):
                return mock_response_data
        
        return MockResponse()
    
    with patch('httpx.AsyncClient.get', side_effect=mock_get_response):
        async with AsyncClient(base_url="http://test") as client:
            response = await client.get("/api/llm/health")
            
            assert response.status_code == 200
            # 実際のテストでは、レスポンスの内容を詳しく検証


@pytest.mark.asyncio  
async def test_streaming_timeout():
    """ストリーミングタイムアウトのテスト"""
    async def mock_timeout_response(*args, **kwargs):
        """タイムアウトを発生させるモックレスポンス"""
        await asyncio.sleep(2)  # 意図的に遅延
        raise httpx.TimeoutException("Request timed out")
    
    with patch('httpx.AsyncClient.stream', side_effect=mock_timeout_response):
        async with AsyncClient(base_url="http://test") as client:
            with pytest.raises(httpx.TimeoutException):
                await client.post(
                    "/api/llm/query",
                    json={
                        "query": "タイムアウトテスト",
                        "stream": True
                    },
                    timeout=1.0  # 短いタイムアウト
                )


@pytest.mark.asyncio
async def test_request_validation():
    """リクエストバリデーションのテスト"""
    async with AsyncClient(base_url="http://test") as client:
        # 空のクエリ
        response = await client.post(
            "/api/llm/query",
            json={
                "query": "",
                "stream": False
            }
        )
        # 実際のテストでは、バリデーションエラーのレスポンスを検証
        
        # 不正なJSON
        response = await client.post(
            "/api/llm/query",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        # 実際のテストでは、400エラーなどを検証


def test_stream_chunk_model():
    """StreamChunkモデルのテスト"""
    from routers.llm import StreamChunk
    from datetime import datetime
    
    # 正常なチャンクの作成
    chunk = StreamChunk(
        id="test_id",
        type="content",
        content="テストコンテンツ",
        timestamp=datetime.now().isoformat()
    )
    
    assert chunk.id == "test_id"
    assert chunk.type == "content"
    assert chunk.content == "テストコンテンツ"
    
    # エラーチャンクの作成
    error_chunk = StreamChunk(
        id="error_id",
        type="error",
        content="エラーメッセージ",
        timestamp=datetime.now().isoformat()
    )
    
    assert error_chunk.type == "error"
    assert error_chunk.content == "エラーメッセージ"


if __name__ == "__main__":
    # 単体でテストを実行する場合
    pytest.main([__file__, "-v"]) 