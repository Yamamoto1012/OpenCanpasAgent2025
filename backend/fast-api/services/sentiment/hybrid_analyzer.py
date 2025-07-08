"""
ハイブリッド感情分析器

ルールベース＋ONNXのハイブリッド感情分析器
信頼度に基づく動的切り替えでパフォーマンスと精度を両立する。
"""
import time
import logging
from typing import Tuple, Dict, Optional, Any
import os

from .analyzer import SentimentCategory
from .rule_based_analyzer import RuleBasedSentimentAnalyzer
from .onnx_analyzer import ONNXSentimentAnalyzer, DummyONNXAnalyzer

logger = logging.getLogger(__name__)


class HybridSentimentAnalyzer:
    """ルールベース＋ONNXのハイブリッド感情分析器"""
    
    def __init__(
        self,
        confidence_threshold: float = 0.7,
        enable_onnx: bool = True,
        onnx_model_path: Optional[str] = None,
        use_dummy_onnx: bool = False
    ):
        """
        ハイブリッド分析器を初期化
        
        Args:
            confidence_threshold: ルールベースからONNXに切り替える信頼度の閾値
            enable_onnx: ONNX分析器を有効にするか
            onnx_model_path: ONNXモデルのパス
            use_dummy_onnx: ダミーONNX分析器を使用するか（テスト用）
        """
        self.confidence_threshold = confidence_threshold
        self.enable_onnx = enable_onnx
        self.use_dummy_onnx = use_dummy_onnx
        
        # ルールベースアナライザーは常に初期化
        self.rule_analyzer = RuleBasedSentimentAnalyzer()
        logger.info("ルールベース感情分析器を初期化しました")
        
        # ONNXアナライザーは遅延初期化
        self.onnx_analyzer = None
        self.onnx_model_path = onnx_model_path
        
        # メトリクス収集
        self.metrics = {
            'rule_based_count': 0,
            'onnx_count': 0,
            'hybrid_count': 0,
            'total_processing_time': 0.0,
            'rule_processing_time': 0.0,
            'onnx_processing_time': 0.0,
            'errors': 0
        }
        
        # 設定ログ
        logger.info(f"ハイブリッド分析器設定 - 信頼度閾値: {confidence_threshold}, ONNX有効: {enable_onnx}")
    
    def _ensure_onnx_initialized(self) -> bool:
        """必要に応じてONNXアナライザーを初期化"""
        if self.onnx_analyzer is not None:
            return True
        
        if not self.enable_onnx:
            return False
        
        try:
            if self.use_dummy_onnx:
                self.onnx_analyzer = DummyONNXAnalyzer()
                logger.info("ダミーONNX分析器を初期化しました")
            else:
                self.onnx_analyzer = ONNXSentimentAnalyzer(self.onnx_model_path)
                if not self.onnx_analyzer.is_available():
                    logger.warning("ONNX分析器が利用できません。ダミー分析器にフォールバックします")
                    self.onnx_analyzer = DummyONNXAnalyzer()
                else:
                    logger.info("ONNX分析器を初期化しました")
            
            return True
            
        except Exception as e:
            logger.error(f"ONNX分析器の初期化に失敗: {e}")
            # フォールバック: ダミー分析器
            try:
                self.onnx_analyzer = DummyONNXAnalyzer()
                logger.info("ダミー分析器にフォールバックしました")
                return True
            except Exception as fallback_error:
                logger.error(f"ダミー分析器の初期化も失敗: {fallback_error}")
                self.enable_onnx = False
                return False
    
    def analyze(self, text: str) -> Tuple[float, SentimentCategory, Dict[str, Any]]:
        """ハイブリッド感情分析を実行"""
        start_time = time.time()
        
        try:
            # Step 1: ルールベース分析
            rule_start = time.time()
            rule_score, rule_category, rule_confidence = self.rule_analyzer.analyze_with_confidence(text)
            rule_time = time.time() - rule_start
            
            self.metrics['rule_processing_time'] += rule_time
            
            metadata = {
                'method': 'rule_based',
                'confidence': rule_confidence,
                'rule_score': rule_score,
                'rule_category': rule_category.value,
                'rule_processing_time': rule_time,
                'processing_time': time.time() - start_time,
                'onnx_used': False
            }
            
            # Step 2: 信頼度チェック
            if rule_confidence >= self.confidence_threshold or not self.enable_onnx:
                # 高信頼度 → ルールベース結果を使用
                self.metrics['rule_based_count'] += 1
                metadata['decision_reason'] = f'高信頼度 ({rule_confidence:.3f} >= {self.confidence_threshold})'
                return rule_score, rule_category, metadata
            
            # Step 3: ONNX分析（信頼度が低い場合）
            if not self._ensure_onnx_initialized():
                # ONNX分析器が利用できない場合はルールベース結果を返す
                self.metrics['rule_based_count'] += 1
                metadata['decision_reason'] = 'ONNX分析器が利用できません'
                metadata['warning'] = 'ONNX分析器が初期化できませんでした'
                return rule_score, rule_category, metadata
            
            # ONNX推論実行
            onnx_start = time.time()
            onnx_score, onnx_category, class_probs = self.onnx_analyzer.analyze(text)
            onnx_time = time.time() - onnx_start
            
            self.metrics['onnx_processing_time'] += onnx_time
            
            # Step 4: 結果の統合
            final_score = self._integrate_scores(
                rule_score, rule_confidence,
                onnx_score, class_probs
            )
            
            final_category = self._score_to_category(final_score)
            
            # メタデータ更新
            metadata.update({
                'method': 'hybrid',
                'onnx_score': onnx_score,
                'onnx_category': onnx_category.value,
                'final_score': final_score,
                'final_category': final_category.value,
                'class_probabilities': class_probs,
                'onnx_processing_time': onnx_time,
                'processing_time': time.time() - start_time,
                'decision_reason': f'低信頼度 ({rule_confidence:.3f} < {self.confidence_threshold})',
                'onnx_used': True
            })
            
            self.metrics['hybrid_count'] += 1
            
            return final_score, final_category, metadata
            
        except Exception as e:
            # エラー処理
            logger.error(f"ハイブリッド分析エラー: {e}")
            self.metrics['errors'] += 1
            
            # フォールバック: ルールベース結果
            if 'rule_score' in locals():
                metadata.update({
                    'error': str(e),
                    'fallback_to_rule': True
                })
                return rule_score, rule_category, metadata
            else:
                # 最後の手段: ニュートラル
                return 50.0, SentimentCategory.NEUTRAL, {
                    'method': 'error_fallback',
                    'error': str(e),
                    'processing_time': time.time() - start_time
                }
        
        finally:
            self.metrics['total_processing_time'] += time.time() - start_time
    
    def _integrate_scores(
        self,
        rule_score: float,
        rule_confidence: float,
        onnx_score: float,
        class_probs: Dict[str, float]
    ) -> float:
        """ルールベースとONNXのスコアを統合"""
        
        # ONNXの確信度を計算（最大確率）
        onnx_confidence = max(class_probs.values()) if class_probs else 0.5
        
        # 重み計算（信頼度に基づく）
        rule_weight = rule_confidence
        onnx_weight = onnx_confidence * 1.2  # ONNXを少し優遇
        
        total_weight = rule_weight + onnx_weight
        
        if total_weight > 0:
            # 重み付き平均
            integrated = (
                rule_score * rule_weight + 
                onnx_score * onnx_weight
            ) / total_weight
        else:
            # 単純平均（フォールバック）
            integrated = (rule_score + onnx_score) / 2
        
        # 追加調整: 両者が大きく異なる場合は中庸に寄せる
        score_diff = abs(rule_score - onnx_score)
        if score_diff > 30:  # 30点以上の差
            # 中央値寄りに調整
            center_pull = 0.1 * (score_diff / 100)
            neutral_score = 50.0
            integrated = integrated * (1 - center_pull) + neutral_score * center_pull
        
        return max(0.0, min(100.0, integrated))
    
    def _score_to_category(self, score: float) -> SentimentCategory:
        """スコアをカテゴリに分類"""
        if score >= 80:
            return SentimentCategory.STRONG_POSITIVE
        elif score >= 65:
            return SentimentCategory.MILD_POSITIVE
        elif score >= 35:
            return SentimentCategory.NEUTRAL
        elif score >= 20:
            return SentimentCategory.MILD_NEGATIVE
        else:
            return SentimentCategory.STRONG_NEGATIVE
    
    def get_metrics(self) -> Dict[str, Any]:
        """パフォーマンスメトリクスを取得"""
        total_requests = (
            self.metrics['rule_based_count'] + 
            self.metrics['hybrid_count']
        )
        
        if total_requests == 0:
            return self.metrics.copy()
        
        # 統計計算
        avg_total_time = self.metrics['total_processing_time'] / total_requests
        avg_rule_time = (
            self.metrics['rule_processing_time'] / total_requests 
            if total_requests > 0 else 0
        )
        avg_onnx_time = (
            self.metrics['onnx_processing_time'] / self.metrics['hybrid_count']
            if self.metrics['hybrid_count'] > 0 else 0
        )
        
        rule_usage_rate = self.metrics['rule_based_count'] / total_requests * 100
        hybrid_usage_rate = self.metrics['hybrid_count'] / total_requests * 100
        
        return {
            **self.metrics,
            'total_requests': total_requests,
            'avg_total_processing_time': avg_total_time,
            'avg_rule_processing_time': avg_rule_time,
            'avg_onnx_processing_time': avg_onnx_time,
            'rule_usage_rate': rule_usage_rate,
            'hybrid_usage_rate': hybrid_usage_rate,
            'error_rate': self.metrics['errors'] / total_requests * 100 if total_requests > 0 else 0
        }
    
    def reset_metrics(self):
        """メトリクスをリセット"""
        self.metrics = {
            'rule_based_count': 0,
            'onnx_count': 0,
            'hybrid_count': 0,
            'total_processing_time': 0.0,
            'rule_processing_time': 0.0,
            'onnx_processing_time': 0.0,
            'errors': 0
        }
        logger.info("メトリクスをリセットしました")
    
    def set_confidence_threshold(self, threshold: float):
        """信頼度閾値を動的に変更"""
        if 0.0 <= threshold <= 1.0:
            old_threshold = self.confidence_threshold
            self.confidence_threshold = threshold
            logger.info(f"信頼度閾値を変更: {old_threshold:.3f} → {threshold:.3f}")
        else:
            raise ValueError("信頼度閾値は0.0から1.0の間で設定してください")
    
    def get_analyzer_status(self) -> Dict[str, Any]:
        """分析器の状態を取得"""
        status = {
            'rule_analyzer': {
                'available': True,
                'type': 'RuleBasedSentimentAnalyzer'
            },
            'onnx_analyzer': {
                'available': False,
                'type': None,
                'initialized': False
            },
            'hybrid_config': {
                'confidence_threshold': self.confidence_threshold,
                'enable_onnx': self.enable_onnx,
                'use_dummy_onnx': self.use_dummy_onnx
            }
        }
        
        if self.onnx_analyzer is not None:
            status['onnx_analyzer'].update({
                'available': True,
                'type': type(self.onnx_analyzer).__name__,
                'initialized': True
            })
            
            if hasattr(self.onnx_analyzer, 'get_model_info'):
                try:
                    model_info = self.onnx_analyzer.get_model_info()
                    status['onnx_analyzer']['model_info'] = model_info
                except Exception as e:
                    status['onnx_analyzer']['model_info_error'] = str(e)
        
        return status
    
    def analyze_batch(self, texts: list[str]) -> list[Tuple[float, SentimentCategory, Dict[str, Any]]]:
        """バッチ処理による効率的な分析"""
        results = []
        
        batch_start = time.time()
        logger.info(f"バッチ処理開始: {len(texts)}件")
        
        for i, text in enumerate(texts):
            try:
                result = self.analyze(text)
                results.append(result)
            except Exception as e:
                logger.error(f"バッチ処理エラー (インデックス {i}): {e}")
                # エラー時のフォールバック
                results.append((
                    50.0, 
                    SentimentCategory.NEUTRAL, 
                    {'error': str(e), 'index': i}
                ))
        
        batch_time = time.time() - batch_start
        logger.info(f"バッチ処理完了: {len(results)}件, 処理時間: {batch_time:.3f}秒")
        
        return results 