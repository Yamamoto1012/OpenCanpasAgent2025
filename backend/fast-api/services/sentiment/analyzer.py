"""
Sentiment Analyzer

ハイブリッド感情分析（ルールベース＋ONNX)
"""
import os
import re
import math
import statistics
from enum import Enum
from typing import Dict, Any, Tuple, Union, List, Optional

# spacyとginzaのインポートを確認
try:
    import spacy
    from spacy.language import Language
    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False
    print("spacy/ginzaが利用できません。感情分析機能は無効化されます")

from config import settings, logger


class SentimentCategory(str, Enum):
    """感情分類カテゴリ"""
    STRONG_POSITIVE = "strong_positive"
    MILD_POSITIVE = "mild_positive" 
    NEUTRAL = "neutral"
    MILD_NEGATIVE = "mild_negative"
    STRONG_NEGATIVE = "strong_negative"


class SentimentAnalyzer:
    """
    感情分析インターフェース
    
    環境変数に基づいてハイブリッドまたはレガシー実装を使用する。
    - USE_HYBRID_SENTIMENT=true: ハイブリッド実装（デフォルト）
    - USE_HYBRID_SENTIMENT=false: レガシー実装(辞書ベース)
    """
    
    def __init__(self):
        # 設定に基づいて実装を選択
        use_hybrid = os.getenv('USE_HYBRID_SENTIMENT', 'true').lower() == 'true'
        
        if use_hybrid:
            logger.info("ハイブリッド感情分析器を使用")
            self._impl = self._create_hybrid_analyzer()
        else:
            logger.info("レガシー感情分析器を使用")
            self._impl = LegacySentimentAnalyzer()
    
    def _create_hybrid_analyzer(self):
        """ハイブリッド分析器を作成"""
        try:
            from .hybrid_analyzer import HybridSentimentAnalyzer
            
            # 環境変数から設定を読み込み
            confidence_threshold = float(os.getenv('SENTIMENT_CONFIDENCE_THRESHOLD', '0.7'))
            enable_onnx = os.getenv('ENABLE_ONNX_SENTIMENT', 'true').lower() == 'true'
            use_dummy_onnx = os.getenv('USE_DUMMY_ONNX', 'false').lower() == 'true'
            onnx_model_path = os.getenv('ONNX_MODEL_PATH')
            
            return HybridSentimentAnalyzer(
                confidence_threshold=confidence_threshold,
                enable_onnx=enable_onnx,
                onnx_model_path=onnx_model_path,
                use_dummy_onnx=use_dummy_onnx
            )
        except ImportError as e:
            logger.error(f"ハイブリッド分析器のインポートに失敗: {e}")
            logger.info("レガシー分析器にフォールバックします")
            return LegacySentimentAnalyzer()
        except Exception as e:
            logger.error(f"ハイブリッド分析器の初期化に失敗: {e}")
            logger.info("レガシー分析器にフォールバックします")
            return LegacySentimentAnalyzer()
    
    def analyze(self, text: str) -> Tuple[float, SentimentCategory]:
        """
        感情分析を実行する
        
        後方互換性を保つインターフェース
        """
        try:
            if hasattr(self._impl, 'analyze'):
                result = self._impl.analyze(text)
                # ハイブリッドの場合はメタデータを除外
                if len(result) > 2:
                    return result[0], result[1]
                return result
            else:
                # フォールバック
                return 50.0, SentimentCategory.NEUTRAL
        except Exception as e:
            logger.error(f"感情分析エラー: {e}")
            return 50.0, SentimentCategory.NEUTRAL
    
    def analyze_with_metadata(self, text: str) -> Tuple[float, SentimentCategory, Dict[str, Any]]:
        """
        メタデータ付きで感情分析を実行する
        
        新しいインターフェース（ハイブリッド専用）
        """
        if hasattr(self._impl, 'analyze') and hasattr(self._impl, 'get_metrics'):
            # ハイブリッド分析器
            return self._impl.analyze(text)
        else:
            # レガシー分析器
            score, category = self._impl.analyze(text)
            metadata = {
                'method': 'legacy',
                'implementation': type(self._impl).__name__
            }
            return score, category, metadata
    
    def get_analyzer_info(self) -> Dict[str, Any]:
        """分析器の情報を取得"""
        info = {
            'implementation': type(self._impl).__name__,
            'version': '2.0.0'
        }
        
        if hasattr(self._impl, 'get_analyzer_status'):
            # ハイブリッド分析器
            info.update(self._impl.get_analyzer_status())
        elif hasattr(self._impl, 'nlp'):
            # レガシー分析器
            info.update({
                'spacy_available': SPACY_AVAILABLE,
                'ginza_model': str(self._impl.nlp.meta.get('name', 'unknown')) if self._impl.nlp else None,
                'dictionary_size': len(self._impl.sentiment_dict) if hasattr(self._impl, 'sentiment_dict') else 0
            })
        
        return info
    
    def get_metrics(self) -> Dict[str, Any]:
        """パフォーマンスメトリクスを取得（ハイブリッド専用）"""
        if hasattr(self._impl, 'get_metrics'):
            return self._impl.get_metrics()
        else:
            return {'error': 'メトリクスはハイブリッド実装でのみ利用可能です'}


class LegacySentimentAnalyzer:
    """ginza+spacyによる感情分析クラス"""
    
    # 動的閾値設定
    SENTIMENT_THRESHOLDS = {
        'strong_negative': 20,
        'mild_negative': 40,
        'neutral': 60,
        'mild_positive': 80,
        'strong_positive': 90
    }
    
    # 文脈修飾子の重み付け
    CONTEXT_MODIFIERS = {
        'negation': -0.8,
        'intensifier': 1.5,
        'diminisher': 0.6,
        'uncertainty': 0.7
    }
    
    def __init__(self):
        self.nlp: Optional[Language] = None
        self.sentiment_dict: Dict[str, float] = {}
        # SPACYが利用可能な場合のみ初期化
        if SPACY_AVAILABLE:
            self._initialize_ginza()
            self._load_sentiment_dictionary()
    
    def _initialize_ginza(self) -> None:
        """GiNZAモデルを初期化する"""
        try:
            self.nlp = spacy.load('ja_ginza_electra')
            logger.info("ja_ginza_electra モデルを使用")
        except OSError:
            try:
                self.nlp = spacy.load('ja_ginza')
                logger.info("ja_ginza モデルを使用")
            except OSError:
                logger.error("GiNZAモデルが見つかりません pipでginzaをインストールしてください")
                raise RuntimeError("GiNZAモデルが見つかりません pipでginzaをインストールしてください")
    
    def _load_sentiment_dictionary(self) -> None:
        """感情辞書を読み込む"""
        # 辞書ファイルの優先順位: toukou_pn.txt > new_pn_ja.dic > pn_ja.dic
        dict_candidates = [
            ('toukou_pn.txt', 'toukou'),
            ('new_pn_ja.dic', 'pnja'),
            ('pn_ja.dic', 'pnja'),
            ('pn_ja_takamura.dic', 'pnja')
        ]
        
        # 辞書ファイルの検索パス
        dict_base_paths = [
            os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'sentiment_dictionaries'),  # 開発環境
            os.path.join('/app', 'data', 'sentiment_dictionaries'),  # Docker環境
            os.path.join('/app', '..'),  # 旧パス（後方互換性）
        ]
        
        for dict_file, dict_type in dict_candidates:
            for base_path in dict_base_paths:
                dict_path = os.path.join(base_path, dict_file)
                if os.path.exists(dict_path):
                    logger.info(f"{dict_file} を発見しました: {dict_path}")
                    self._load_dictionary_file(dict_path, dict_type)
                    return
        
        logger.warning("辞書ファイルが見つかりません。基本的な感情語彙のみ使用します")
        self._load_fallback_dictionary()
    
    def _load_dictionary_file(self, file_path: str, dict_type: str) -> None:
        """辞書ファイルを読み込む"""
        if dict_type == 'pnja':
            self._load_pnja_dictionary(file_path)
        elif dict_type == 'toukou':
            self._load_toukou_dictionary(file_path)
    
    def _load_pnja_dictionary(self, file_path: str) -> None:
        """pn_ja.dic形式の辞書を読み込む"""
        try:
            with open(file_path, encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line:
                        parts = line.split('\t')
                        if len(parts) >= 2:
                            word = parts[0]
                            sentiment = parts[1]
                            # ポジティブ、ネガティブ、ニュートラルのスコアを設定
                            if sentiment == 'p':
                                self.sentiment_dict[word] = 1.0
                            elif sentiment == 'n':
                                self.sentiment_dict[word] = -1.0
                            elif sentiment == 'e':
                                self.sentiment_dict[word] = 0.0
            logger.info(f"pn_ja.dic辞書を読み込みました: {len(self.sentiment_dict)}語")
        except Exception as e:
            logger.error(f"pn_ja.dic読み込みエラー: {e}")
            self._load_fallback_dictionary()
    
    def _load_toukou_dictionary(self, file_path: str) -> None:
        """東工大感情極性辞書を読み込む"""
        encodings = ['utf-8', 'cp932', 'shift_jis']
        
        for encoding in encodings:
            try:
                with open(file_path, encoding=encoding) as f:
                    for line in f:
                        line = line.strip()
                        if line and ':' in line:
                            parts = line.split(':')
                            if len(parts) >= 4:
                                word = parts[0]
                                reading = parts[1]
                                try:
                                    score = float(parts[3])
                                    self.sentiment_dict[word] = score
                                    # 読みも登録
                                    if reading != '*' and reading != word:
                                        self.sentiment_dict[reading] = score
                                except ValueError:
                                    continue
                logger.info(f"東工大辞書を読み込みました: {len(self.sentiment_dict)}語")
                return
            except UnicodeDecodeError:
                continue
        
        logger.error("東工大辞書の読み込みに失敗しました")
        self._load_fallback_dictionary()
    
    def _load_fallback_dictionary(self) -> None:
        """フォールバック用の基本感情語彙"""
        basic_emotions = {
            # ポジティブ
            '嬉しい': 1.0, 'うれしい': 1.0, '楽しい': 1.0, 'たのしい': 1.0,
            '幸せ': 1.0, 'しあわせ': 1.0, '最高': 1.0, '素晴らしい': 1.0,
            '美しい': 1.0, '可愛い': 1.0, 'かわいい': 1.0, '好き': 1.0,
            'ありがとう': 1.0, '感謝': 1.0, '愛': 1.0, '希望': 1.0,
            
            # ネガティブ
            '悲しい': -1.0, 'かなしい': -1.0, '辛い': -1.0, 'つらい': -1.0,
            '困った': -1.0, '嫌い': -1.0, '嫌': -1.0, '怒り': -1.0,
            '心配': -1.0, '不安': -1.0, '失望': -1.0, '絶望': -1.0,
            
            # ニュートラル
            '普通': 0.0, '通常': 0.0, 'いつも': 0.0
        }
        
        self.sentiment_dict.update(basic_emotions)
        logger.info(f"フォールバック辞書を使用: {len(basic_emotions)}語")
    
    def extract_emotion_bearing_tokens(self, doc) -> List[Tuple[str, str, str]]:
        """感情を表す可能性のあるトークンを抽出"""
        emotion_tokens = []
        
        for sent in doc.sents:
            for token in sent:
                # 品詞フィルタを拡張
                if token.pos_ in ['NOUN', 'PROPN', 'VERB', 'ADJ', 'ADV', 'AUX', 'INTJ']:
                    emotion_tokens.append((token.lemma_, token.text, token.pos_))
                
                # 活用形も考慮（「頑張る」→「頑張ろう」）
                if token.pos_ == 'VERB' and token.text != token.lemma_:
                    emotion_tokens.append((token.text, token.text, 'VERB_CONJUGATED'))
        
        return emotion_tokens
    
    def should_filter_context_dependent(self, word: str, pos: str, sentence: str) -> bool:
        """文脈依存語彙のフィルタリングを改善"""
        # 除外すべき文脈依存語（機能語や一般名詞）
        truly_context_dependent = {
            'よく', 'ところ', 'こと', 'もの', 'ほんと', '人'
        }
        
        # 感情に寄与する可能性がある語は除外しない
        emotion_contributing = {
            '今日', '明日', '気持ち', '一日', '毎日'
        }
        
        if word in truly_context_dependent:
            return True
        
        if word in emotion_contributing:
            # 文の主要な内容語であれば保持
            return False
        
        return False
    
    def calculate_weighted_score(self, word_scores: List[Tuple[str, float, str]]) -> float:
        """品詞による重み付き平均を計算"""
        weights = {
            'ADJ': 1.5,    # 形容詞は感情表現として重要
            'ADV': 1.2,    # 副詞も感情の強度を表す
            'VERB': 1.0,   # 動詞は標準
            'NOUN': 0.8,   # 名詞は補助的
            'PROPN': 0.5,  # 固有名詞は感情への寄与が小さい
            'VERB_CONJUGATED': 1.1  # 活用形は感情表現として重要
        }
        
        weighted_sum = 0.0
        total_weight = 0.0
        
        for word, score, pos in word_scores:
            weight = weights.get(pos, 1.0)
            weighted_sum += score * weight
            total_weight += weight
        
        return weighted_sum / total_weight if total_weight > 0 else 0.0
    
    def integrate_context_score(self, base_score: float, context_score: float) -> float:
        """文脈スコアを適切に統合"""
        # 文脈スコアを0-1の範囲に正規化
        normalized_context = (context_score + 1) / 2  # -1〜1を0〜1に変換
        
        # 重み付き結合（文脈の影響を20%に制限）
        integrated_score = base_score * 0.8 + normalized_context * 0.2
        
        return integrated_score
    
    def normalize_score(self, raw_score: float, intensity: float = 1.0) -> float:
        """統一された正規化処理"""
        # -1〜1の範囲を想定し、0〜100に変換
        # intensityを考慮した非線形変換
        normalized = (math.tanh(raw_score * intensity * 2) + 1) / 2
        
        return normalized * 100
    
    def detect_positive_patterns(self, text: str) -> float:
        """文章全体のポジティブパターンを検出"""
        pattern_scores = {
            # 励まし・決意表現
            r'(頑張|がんば)(ろう|ります|る|って)': 0.7,
            r'(笑顔|えがお)で': 0.8,
            r'(楽し|たのし)(み|もう)': 0.8,
            r'(素敵|すてき)な': 0.7,
            r'(幸せ|しあわせ)に': 0.8,
            
            # 前向きな意図
            r'ように(頑張|がんば|なり|する)': 0.6,
            r'(できる|出来る)(よう|ように)': 0.6,
            
            # 挨拶・祝福
            r'(おはよう|こんにちは|ありがとう)': 0.5,
            r'(おめでとう|お疲れ様)': 0.6,
        }
        
        total_score = 0.0
        match_count = 0
        
        for pattern, score in pattern_scores.items():
            if re.search(pattern, text):
                total_score += score
                match_count += 1
        
        return total_score / max(match_count, 1)
    
    def calculate_expression_weight(self, text: str) -> float:
        """感嘆符や絵文字による感情強度の計算"""
        weight = 1.0
        
        # 感嘆符の数と位置を考慮
        exclamation_count = text.count('!') + text.count('！')
        if exclamation_count > 0:
            # 文末の感嘆符はより重要
            if text.rstrip().endswith(('!', '！')):
                weight *= (1.0 + 0.3 * min(exclamation_count, 3))
            else:
                weight *= (1.0 + 0.1 * exclamation_count)
        
        # 絵文字・顔文字の検出（簡易版）
        positive_emojis = ['😊', '😄', '🙂', '👍', '✨', '🌟', '❤️', '(^_^)', '(^^)']
        for emoji in positive_emojis:
            if emoji in text:
                weight *= 1.2
        
        return weight
    
    def calculate_confidence(self, matched_words: int, total_words: int, text_length: int) -> float:
        """分析の信頼度を計算"""
        # マッチ率
        match_rate = matched_words / total_words if total_words > 0 else 0
        
        # テキスト長による信頼度
        length_confidence = min(1.0, text_length / 50)  # 50文字で最大信頼度
        
        # 総合信頼度
        confidence = (match_rate * 0.7 + length_confidence * 0.3)
        
        return round(confidence * 100, 1)
    
    def _get_word_mapping(self) -> Dict[str, List[str]]:
        """表記揺れマッピング"""
        return {
            'かわいい': ['可愛い', 'かわいらしい', '可愛らしい'],
            'うれしい': ['嬉しい', 'うれしい'], 
            'たのしい': ['楽しい', 'たのしい'],
            'うつくしい': ['美しい', 'うつくしい'],
            'きれい': ['綺麗', 'きれい', '奇麗'],
            'すてき': ['素敵', 'すてき', 'ステキ'],
            'しあわせ': ['幸せ', 'しあわせ', 'シアワセ']
        }
    
    def _get_force_positive_words(self) -> Dict[str, float]:
        """強制的にポジティブとして扱う語彙"""
        return {
            '最高': 1.0, '素晴らしい': 1.0, '感動': 1.0, '幸せ': 1.0,
            'しあわせ': 1.0, '嬉しい': 1.0, 'うれしい': 1.0,
            '楽しい': 1.0, 'たのしい': 1.0, '美しい': 1.0, '美味しい': 1.0
        }
    
    def _apply_context_based_fallback(self, text: str) -> Tuple[float, List[str]]:
        """文脈ベースの感情推定"""
        context_score = 0.0
        detected_patterns = []
        
        # 疑問文の検出
        if '?' in text or '？' in text or re.search(r'[だですか]$', text):
            context_score += 0.2
            detected_patterns.append("疑問文→surprised")
        
        # 感嘆符の検出
        if '!' in text or '！' in text:
            context_score += 0.4
            detected_patterns.append("感嘆符→happy")
        
        # 挨拶の検出
        greetings = ['こんにちは', 'おはよう', 'こんばんは', 'お疲れ', 'ありがとう']
        for greeting in greetings:
            if greeting in text:
                context_score += 0.3
                detected_patterns.append(f"{greeting}→happy")
                break
        
        # 否定的な文脈
        negative_patterns = ['困った', 'だめ', 'ダメ', '無理', '嫌', 'イヤ']
        for pattern in negative_patterns:
            if pattern in text:
                context_score -= 0.4
                detected_patterns.append(f"{pattern}→sad")
                break
        
        return context_score, detected_patterns
    
    def analyze(self, text: str) -> Tuple[float, SentimentCategory]:
        """感情分析を実行する"""
        if not SPACY_AVAILABLE or not self.nlp:
            # フォールバック: 基本的な感情推定
            context_score, _ = self._apply_context_based_fallback(text)
            sentiment_score = self.normalize_score(context_score)
            
            return sentiment_score, self._score_to_category(sentiment_score)
        
        if not text.strip():
            return 50.0, SentimentCategory.NEUTRAL
        
        doc = self.nlp(text)
        
        #　感情トークン抽出
        emotion_tokens = self.extract_emotion_bearing_tokens(doc)
        matched_words = []
        
        word_mapping = self._get_word_mapping()
        force_positive = self._get_force_positive_words()
        
        # 語彙分析と重み付きスコア計算
        for word, surface, pos in emotion_tokens:
            # 文脈依存語彙のフィルタリング
            if self.should_filter_context_dependent(word, pos, text):
                continue
            
            # 感情スコアの取得
            word_score = self._get_word_sentiment_score(
                word, surface, pos, word_mapping, force_positive
            )
            
            if word_score is not None:
                # 改善されたスコア調整
                adjusted_score = self._adjust_score_by_context_improved(
                    word_score, word, pos, text
                )
                matched_words.append((word, adjusted_score, pos))
        
        # 重み付き平均による基本スコア計算
        if matched_words:
            base_score = self.calculate_weighted_score(matched_words)
        else:
            base_score = 0.0
        
        # 文脈ベースの補完とパターン認識
        context_score, _ = self._apply_context_based_fallback(text)
        positive_patterns = self.detect_positive_patterns(text)
        
        # 文脈スコアの統合
        integrated_score = self.integrate_context_score(base_score, context_score)
        integrated_score += positive_patterns * 0.5  # パターンスコアを追加
        
        # 表現重みの適用
        expression_weight = self.calculate_expression_weight(text)
        integrated_score *= expression_weight
        
        # 統一された正規化処理
        sentiment_score = self.normalize_score(integrated_score)
        
        # カテゴリ分類
        category = self._score_to_category(sentiment_score)
        
        return sentiment_score, category
    
    def _get_word_sentiment_score(
        self, 
        word: str, 
        surface: str, 
        pos: str,
        word_mapping: Dict[str, List[str]],
        force_positive: Dict[str, float]
    ) -> Optional[float]:
        """単語の感情スコアを取得する"""
        # 強制ポジティブチェック
        if word in force_positive:
            return force_positive[word]
        if surface in force_positive:
            return force_positive[surface]
        
        # 辞書マッチング
        if word in self.sentiment_dict:
            return self.sentiment_dict[word]
        if surface in self.sentiment_dict:
            return self.sentiment_dict[surface]
        
        # 表記揺れマッピング
        for base_word, variants in word_mapping.items():
            if word == base_word or word in variants:
                for variant in variants:
                    if variant in self.sentiment_dict:
                        return self.sentiment_dict[variant]
        
        # 形容詞の語幹マッチング
        if pos == 'ADJ' and word.endswith('い'):
            stem = word[:-1]
            for suffix in ['', 'さ', 'み', 'らしさ']:
                candidate = stem + suffix
                if candidate in self.sentiment_dict:
                    return self.sentiment_dict[candidate]
        
        return None
    
    def _adjust_score_by_context_improved(self, score: float, word: str, pos: str, 
                                        sentence_context: str = "") -> float:
        """文脈を考慮したスコア調整（改善版）"""
        # 真に文脈依存的で感情価値が低い語のみフィルタ
        truly_neutral_words = {'ところ', 'こと', 'もの', 'よく', 'みる'}
        
        if word in truly_neutral_words and abs(score) < 0.3:
            return 0.0
        
        # 文脈修飾子の適用
        modifier = self._detect_context_modifier(sentence_context, word)
        if modifier:
            score *= self.CONTEXT_MODIFIERS[modifier]
        
        # スコア調整を緩和
        if score < 0:
            # ネガティブスコアの過度な抑制を避ける
            if score >= -0.3:
                return score * 0.5  # 0.2 → 0.5に緩和
            elif score >= -0.7:
                return score * 0.7  # 0.5 → 0.7に緩和
        elif score > 0:
            # ポジティブスコアの適切な強化
            if pos in ['ADJ', 'VERB', 'INTJ']:  # 感情表現として重要な品詞
                return score * 1.2
        
        return score
    
    def _adjust_score_by_context(self, score: float, word: str, pos: str, sentence_context: str = "") -> float:
        """文脈を考慮したスコア調整"""
        return self._adjust_score_by_context_improved(score, word, pos, sentence_context)
    
    def _detect_context_modifier(self, sentence_context: str, word: str) -> Optional[str]:
        """文脈修飾子を検出する"""
        # 否定語の検出
        negation_words = ['ない', 'ではない', 'ではありません', 'くない', 'ずに']
        for neg_word in negation_words:
            if neg_word in sentence_context:
                return 'negation'
        
        # 強調語の検出
        intensifier_words = ['とても', '非常に', '超', 'めちゃ', 'すごく', '本当に', '実に', 'かなり']
        for int_word in intensifier_words:
            if int_word in sentence_context:
                return 'intensifier'
        
        # 弱化語の検出
        diminisher_words = ['少し', 'ちょっと', 'やや', 'わずかに', 'まあまあ', 'そこそこ']
        for dim_word in diminisher_words:
            if dim_word in sentence_context:
                return 'diminisher'
        
        # 不確実性表現の検出
        uncertainty_words = ['たぶん', 'おそらく', 'もしかしたら', 'なんとなく', 'ような気がする']
        for unc_word in uncertainty_words:
            if unc_word in sentence_context:
                return 'uncertainty'
        
        return None
    
    # 旧版メソッドは下位互換性のため保持
    def normalize_score_sigmoid(self, raw_score: float) -> float:
        """シグモイド関数を使用した非線形正規化"""
        sigmoid_score = 1 / (1 + math.exp(-raw_score * 3))
        return sigmoid_score * 100
    
    def normalize_score_tanh(self, raw_score: float) -> float:
        """双曲線正接を使用した正規化（より滑らかな変換）"""
        tanh_score = (math.tanh(raw_score * 2) + 1) / 2
        return tanh_score * 100
    
    def adjust_intensity(self, base_score: float, intensity_factor: float) -> float:
        """感情強度に基づくスコア調整"""
        if base_score > 50:  # ポジティブ
            return base_score + (100 - base_score) * intensity_factor * 0.3
        else:  # ネガティブ
            return base_score - base_score * intensity_factor * 0.3
    
    def statistical_correction(self, raw_score: float, text_length: int) -> float:
        """テキスト長と過去の分析結果を考慮した補正"""
        length_factor = min(1.0, text_length / 100)  # 長文ほど信頼度UP
        corrected_score = raw_score * (0.7 + 0.3 * length_factor)
        return max(0.0, min(100.0, corrected_score))
    
    def _calculate_intensity_factor(self, text: str) -> float:
        """テキストから感情強度を計算"""
        intensity = 0.0
        
        # 感嘆符、疑問符の数
        intensity += (text.count('!') + text.count('！')) * 0.2
        intensity += (text.count('?') + text.count('？')) * 0.1
        
        # 強調表現
        intensifiers = ['とても', '非常に', '超', 'めちゃ', 'すごく', '本当に', '実に']
        for intensifier in intensifiers:
            if intensifier in text:
                intensity += 0.3
        
        # 弱化表現
        diminishers = ['少し', 'ちょっと', 'やや', 'わずかに', 'まあまあ']
        for diminisher in diminishers:
            if diminisher in text:
                intensity -= 0.2
        
        return max(0.0, min(1.0, intensity))
    
    def _score_to_category(self, score: float) -> SentimentCategory:
        """動的閾値を使用してスコアをカテゴリに分類する"""
        if score >= self.SENTIMENT_THRESHOLDS['strong_positive']:
            return SentimentCategory.STRONG_POSITIVE
        elif score >= self.SENTIMENT_THRESHOLDS['mild_positive']:
            return SentimentCategory.MILD_POSITIVE
        elif score >= self.SENTIMENT_THRESHOLDS['neutral']:
            return SentimentCategory.NEUTRAL
        elif score >= self.SENTIMENT_THRESHOLDS['mild_negative']:
            return SentimentCategory.MILD_NEGATIVE
        else:
            return SentimentCategory.STRONG_NEGATIVE 