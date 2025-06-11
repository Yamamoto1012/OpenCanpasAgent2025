"""
Sentiment Analyzer

ginza+spacyを使用した日本語感情分析機能を提供する。
"""
import os
import re
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
    """ginza+spacyによる感情分析クラス"""
    
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
            sentiment_score = (context_score + 1.0) * 50.0
            sentiment_score = max(0.0, min(100.0, sentiment_score))
            return sentiment_score, self._score_to_category(sentiment_score)
        
        if not text.strip():
            return 50.0, SentimentCategory.NEUTRAL
        
        doc = self.nlp(text)
        analyzed_words = []
        matched_words = []
        score = 0.0
        
        word_mapping = self._get_word_mapping()
        force_positive = self._get_force_positive_words()
        
        # 形態素解析による語彙分析
        for sent in doc.sents:
            for token in sent:
                if token.pos_ in ['NOUN', 'PROPN', 'VERB', 'ADJ', 'ADV']:
                    word = token.lemma_
                    surface = token.text
                    analyzed_words.append((word, surface, token.pos_))
                    
                    # 感情スコアの取得
                    word_score = self._get_word_sentiment_score(
                        word, surface, token.pos_, word_mapping, force_positive
                    )
                    
                    if word_score is not None:
                        adjusted_score = self._adjust_score_by_context(
                            word_score, word, token.pos_
                        )
                        score += adjusted_score
                        matched_words.append((word, adjusted_score, token.pos_))
        
        # 基本スコア計算
        if len(analyzed_words) > 0:
            avg_score = score / len(analyzed_words)
        else:
            avg_score = 0.0
        
        # 文脈ベースの補完
        context_score, context_patterns = self._apply_context_based_fallback(text)
        avg_score += context_score
        
        # 0-100スケールに正規化
        sentiment_score = (avg_score + 1.0) * 50.0
        sentiment_score = max(0.0, min(100.0, sentiment_score))
        
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
    
    def _adjust_score_by_context(self, score: float, word: str, pos: str) -> float:
        """文脈を考慮したスコア調整"""
        # 文脈依存語彙のフィルタリング
        context_dependent = [
            'よく', 'ところ', 'すぎる', 'なる', 'いく', 'みる', '見る',
            '人', 'こと', 'もの', 'ほんと', '超', 'とても', '日', '映画',
            '料理', '本当', '今日', '気持ち', 'いっぱい'
        ]
        
        if word in context_dependent and score < 0:
            return 0.0  # ネガティブスコアを無効化
        
        # スコア調整
        if score < 0:
            if score >= -0.3:
                return score * 0.2  # 微弱ネガティブは大幅軽減
            elif score >= -0.7:
                return score * 0.5  # 中程度ネガティブは軽減
        elif score > 0.5:
            # ポジティブスコアの強化
            if pos == 'ADJ':  # 形容詞は感情表現として重要
                if score > 0.9:
                    return score * 1.5
                else:
                    return score * 1.3
            elif score > 0.9:
                return score * 1.2
            else:
                return score * 1.1
        
        return score
    
    def _score_to_category(self, score: float) -> SentimentCategory:
        """スコアをカテゴリに分類する"""
        if score >= 81:
            return SentimentCategory.STRONG_POSITIVE
        elif score >= 61:
            return SentimentCategory.MILD_POSITIVE
        elif score >= 40:
            return SentimentCategory.NEUTRAL
        elif score >= 21:
            return SentimentCategory.MILD_NEGATIVE
        else:
            return SentimentCategory.STRONG_NEGATIVE 