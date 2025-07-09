"""
パフォーマンスモニタリング用ミドルウェア
"""
from fastapi import Request
import time
import logging
import json
from typing import Optional

# Prometheusクライアントは通常の環境では利用できない場合があるため、
# インポートエラーを処理
try:
    from prometheus_client import Counter, Histogram, Gauge
    PROMETHEUS_AVAILABLE = True
except ImportError:
    PROMETHEUS_AVAILABLE = False
    Counter = Histogram = Gauge = None

# ロガーの設定
logger = logging.getLogger(__name__)

# Prometheusメトリクス（利用可能な場合のみ）
if PROMETHEUS_AVAILABLE:
    request_count = Counter(
        'llm_requests_total', 
        'Total LLM requests',
        ['endpoint', 'stream_mode', 'status']
    )

    request_duration = Histogram(
        'llm_request_duration_seconds',
        'LLM request duration',
        ['endpoint', 'stream_mode']
    )

    active_streams = Gauge(
        'llm_active_streams',
        'Number of active streaming connections'
    )

    response_size = Histogram(
        'llm_response_size_bytes',
        'LLM response size in bytes',
        ['endpoint', 'stream_mode']
    )
else:
    # モック用の空のクラス
    class MockMetric:
        def labels(self, **kwargs):
            return self
        def inc(self):
            pass
        def observe(self, value):
            pass
    
    request_count = MockMetric()
    request_duration = MockMetric()
    active_streams = MockMetric()
    response_size = MockMetric()


async def monitoring_middleware(request: Request, call_next):
    """
    リクエストのモニタリング用ミドルウェア
    """
    start_time = time.time()
    endpoint = request.url.path
    
    # ストリーミングかどうかを判定
    is_streaming = False
    request_body = None
    
    if request.url.path.startswith("/api/llm/") and request.method == "POST":
        try:
            # リクエストボディを読み取り（一度だけ）
            body = await request.body()
            request._body = body  # ボディを再利用可能にする
            
            if body:
                data = json.loads(body.decode())
                is_streaming = data.get("stream", False)
                request_body = data
        except (json.JSONDecodeError, UnicodeDecodeError):
            logger.warning(f"Failed to parse request body for {endpoint}")
    
    # アクティブストリーム数を更新
    if is_streaming and PROMETHEUS_AVAILABLE:
        active_streams.inc()
    
    # レスポンス情報を記録する変数
    status_code = 500
    response_size_bytes = 0
    
    try:
        response = await call_next(request)
        status_code = response.status_code
        
        # レスポンスサイズを計算（ストリーミングでない場合）
        if hasattr(response, 'body') and not is_streaming:
            try:
                response_size_bytes = len(response.body)
            except:
                pass
        
        # メトリクスを記録
        duration = time.time() - start_time
        stream_mode = "streaming" if is_streaming else "blocking"
        status_label = "success" if 200 <= status_code < 400 else "error"
       
        if PROMETHEUS_AVAILABLE:
            request_count.labels(
                endpoint=endpoint, 
                stream_mode=stream_mode,
                status=status_label
            ).inc()
            
            request_duration.labels(
                endpoint=endpoint, 
                stream_mode=stream_mode
            ).observe(duration)
            
            if not is_streaming:
                response_size.labels(
                    endpoint=endpoint,
                    stream_mode=stream_mode
                ).observe(response_size_bytes)
        
        # 詳細ログ出力
        log_data = {
            "timestamp": time.time(),
            "endpoint": endpoint,
            "method": request.method,
            "status_code": status_code,
            "duration_ms": round(duration * 1000, 2),
            "stream_mode": stream_mode,
            "response_size_bytes": response_size_bytes,
            "user_agent": request.headers.get("user-agent", ""),
            "request_id": request.headers.get("x-request-id", ""),
        }
        
        # リクエストボディの一部をログに含める（センシティブ情報を除く）
        if request_body:
            log_data["query_length"] = len(request_body.get("query", ""))
            log_data["language"] = request_body.get("language", "")
        
        # パフォーマンス警告
        if duration > 10.0:  # 10秒以上
            logger.warning(f"Slow request detected: {json.dumps(log_data)}")
        elif duration > 30.0:  # 30秒以上
            logger.error(f"Very slow request detected: {json.dumps(log_data)}")
        else:
            logger.info(f"Request completed: {json.dumps(log_data)}")
        
        return response
        
    except Exception as e:
        # エラーが発生した場合
        duration = time.time() - start_time
        stream_mode = "streaming" if is_streaming else "blocking"
        
        if PROMETHEUS_AVAILABLE:
            request_count.labels(
                endpoint=endpoint,
                stream_mode=stream_mode,
                status="error"
            ).inc()
            
            request_duration.labels(
                endpoint=endpoint,
                stream_mode=stream_mode
            ).observe(duration)
        
        # エラーログ
        error_data = {
            "timestamp": time.time(),
            "endpoint": endpoint,
            "method": request.method,
            "duration_ms": round(duration * 1000, 2),
            "stream_mode": stream_mode,
            "error": str(e),
            "error_type": type(e).__name__
        }
        
        logger.error(f"Request failed: {json.dumps(error_data)}")
        raise
        
    finally:
        # アクティブストリーム数を減らす
        if is_streaming and PROMETHEUS_AVAILABLE:
            active_streams.dec()


def get_metrics_summary() -> dict:
    """
    現在のメトリクス情報を取得する関数
    """
    if not PROMETHEUS_AVAILABLE:
        return {
            "prometheus_available": False,
            "message": "Prometheus client not available"
        }
    
    try:
        # 現在のメトリクス値を取得（簡略版）
        return {
            "prometheus_available": True,
            "active_streams": active_streams._value.get(),
            "timestamp": time.time()
        }
    except Exception as e:
        return {
            "prometheus_available": True,
            "error": str(e),
            "timestamp": time.time()
        }


class RequestLoggingMiddleware:
    """
    リクエストログ専用のミドルウェアクラス
    """
    
    def __init__(self, 
                 log_level: str = "INFO",
                 log_body: bool = False,
                 max_body_size: int = 1000):
        self.log_level = getattr(logging, log_level.upper())
        self.log_body = log_body
        self.max_body_size = max_body_size
        self.logger = logging.getLogger(f"{__name__}.RequestLogging")
        self.logger.setLevel(self.log_level)
    
    async def __call__(self, request: Request, call_next):
        """ミドルウェアの実行"""
        start_time = time.time()
        
        # リクエスト情報をログ
        request_log = {
            "type": "request_start",
            "method": request.method,
            "url": str(request.url),
            "headers": dict(request.headers),
            "timestamp": start_time
        }
        
        # ボディのログ（オプション）
        if self.log_body and request.method in ["POST", "PUT", "PATCH"]:
            try:
                body = await request.body()
                request._body = body
                if len(body) <= self.max_body_size:
                    request_log["body"] = body.decode()[:self.max_body_size]
                else:
                    request_log["body_truncated"] = True
                    request_log["body_size"] = len(body)
            except Exception as e:
                request_log["body_error"] = str(e)
        
        self.logger.log(self.log_level, f"Request: {json.dumps(request_log)}")
        
        try:
            response = await call_next(request)
            
            # レスポンス情報をログ
            end_time = time.time()
            response_log = {
                "type": "request_complete",
                "method": request.method,
                "url": str(request.url),
                "status_code": response.status_code,
                "duration_ms": round((end_time - start_time) * 1000, 2),
                "timestamp": end_time
            }
            
            self.logger.log(self.log_level, f"Response: {json.dumps(response_log)}")
            return response
            
        except Exception as e:
            # エラー情報をログ
            end_time = time.time()
            error_log = {
                "type": "request_error",
                "method": request.method,
                "url": str(request.url),
                "error": str(e),
                "error_type": type(e).__name__,
                "duration_ms": round((end_time - start_time) * 1000, 2),
                "timestamp": end_time
            }
            
            self.logger.error(f"Request Error: {json.dumps(error_log)}")
            raise 