#!/usr/bin/env python3
"""
改善された感情分析システムのテストスクリプト
"""
import sys
import os

# パスの追加
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'fast-api'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'fast-api', 'services'))

# 必要なモジュールのインポート
try:
    from services.sentiment.analyzer import SentimentAnalyzer, SentimentCategory
    print("✓ SentimentAnalyzer のインポートに成功しました")
except ImportError as e:
    print(f"✗ インポートエラー: {e}")
    sys.exit(1)


def test_basic_functionality():
    """基本機能のテスト"""
    print("\n=== 基本機能テスト ===")
    analyzer = SentimentAnalyzer()
    
    test_cases = [
        ("嬉しいです！ありがとうございます！", "ポジティブ"),
        ("悲しいです。とても困っています。", "ネガティブ"),
        ("今日は普通の日です。", "ニュートラル"),
        ("最高です！素晴らしい！感動しました！", "強いポジティブ"),
        ("絶望しています。とても辛いです。", "強いネガティブ"),
    ]
    
    for text, expected in test_cases:
        score, category = analyzer.analyze(text)
        print(f"テキスト: '{text}'")
        print(f"スコア: {score:.2f}, カテゴリ: {category.value}")
        print(f"期待値: {expected}")
        print("---")


def test_new_methods():
    """新しいメソッドのテスト"""
    print("\n=== 新機能テスト ===")
    analyzer = SentimentAnalyzer()
    
    # 重み付きスコア計算のテスト
    print("1. 重み付きスコア計算テスト")
    word_scores = [
        ("嬉しい", 1.0, "ADJ"),
        ("とても", 0.8, "ADV"),
        ("思う", 0.5, "VERB"),
        ("人", 0.3, "NOUN"),
    ]
    weighted_score = analyzer.calculate_weighted_score(word_scores)
    print(f"重み付きスコア: {weighted_score:.3f}")
    
    # 文脈依存語彙フィルタリングのテスト
    print("\n2. 文脈依存語彙フィルタリングテスト")
    test_words = [
        ("ところ", "NOUN", True),
        ("こと", "NOUN", True),
        ("気持ち", "NOUN", False),
        ("今日", "NOUN", False),
    ]
    for word, pos, should_filter in test_words:
        result = analyzer.should_filter_context_dependent(word, pos, f"いい{word}です")
        print(f"'{word}' -> フィルタ: {result} (期待値: {should_filter})")
    
    # ポジティブパターン検出のテスト
    print("\n3. ポジティブパターン検出テスト")
    pattern_texts = [
        "頑張ろう！",
        "ありがとうございます",
        "普通の文章です",
        "笑顔で頑張ります"
    ]
    for text in pattern_texts:
        pattern_score = analyzer.detect_positive_patterns(text)
        print(f"'{text}' -> パターンスコア: {pattern_score:.3f}")
    
    # 表現重み計算のテスト
    print("\n4. 表現重み計算テスト")
    expression_texts = [
        "嬉しい",
        "嬉しい！",
        "嬉しい😊",
        "とても嬉しい！！！"
    ]
    for text in expression_texts:
        weight = analyzer.calculate_expression_weight(text)
        print(f"'{text}' -> 表現重み: {weight:.3f}")
    
    # 信頼度計算のテスト
    print("\n5. 信頼度計算テスト")
    confidence_cases = [
        (8, 10, 100, "高マッチ率・長文"),
        (2, 10, 20, "低マッチ率・短文"),
        (5, 10, 200, "中マッチ率・長文"),
    ]
    for matched, total, length, description in confidence_cases:
        confidence = analyzer.calculate_confidence(matched, total, length)
        print(f"{description}: 信頼度 {confidence}%")


def test_normalization_methods():
    """正規化メソッドのテスト"""
    print("\n=== 正規化メソッドテスト ===")
    analyzer = SentimentAnalyzer()
    
    test_scores = [-2.0, -1.0, 0.0, 1.0, 2.0]
    
    print("1. 統一正規化 (normalize_score)")
    for score in test_scores:
        normalized = analyzer.normalize_score(score)
        print(f"入力: {score:4.1f} -> 出力: {normalized:6.2f}")
    
    print("\n2. シグモイド正規化 (normalize_score_sigmoid)")
    for score in test_scores:
        normalized = analyzer.normalize_score_sigmoid(score)
        print(f"入力: {score:4.1f} -> 出力: {normalized:6.2f}")
    
    print("\n3. 線形正規化")
    for score in test_scores:
        # 現在の実装では normalize_score メソッドが線形正規化を使用
        normalized = analyzer.normalize_score(score)
        print(f"入力: {score:4.1f} -> 出力: {normalized:6.2f}")


def test_threshold_changes():
    """閾値変更のテスト"""
    print("\n=== 閾値変更テスト ===")
    analyzer = SentimentAnalyzer()
    
    print(f"新しい閾値設定:")
    for key, value in analyzer.SENTIMENT_THRESHOLDS.items():
        print(f"  {key}: {value}")
    
    # 閾値境界付近のテスト
    test_scores = [19, 20, 39, 40, 59, 60, 79, 80, 89, 90, 91]
    print("\n閾値境界付近の分類テスト:")
    for score in test_scores:
        category = analyzer._score_to_category(score)
        print(f"スコア {score:2d} -> {category.value}")


def test_context_modifier_detection():
    """文脈修飾子検出のテスト"""
    print("\n=== 文脈修飾子検出テスト ===")
    analyzer = SentimentAnalyzer()
    
    test_contexts = [
        ("嬉しくないです", "嬉しい", "negation"),
        ("とても嬉しいです", "嬉しい", "intensifier"),
        ("少し嬉しいです", "嬉しい", "diminisher"),
        ("たぶん嬉しいです", "嬉しい", "uncertainty"),
        ("普通に嬉しいです", "嬉しい", None),
    ]
    
    for context, word, expected in test_contexts:
        modifier = analyzer._detect_context_modifier(context, word)
        print(f"'{context}' -> 修飾子: {modifier} (期待値: {expected})")


def main():
    """メイン関数"""
    print("改善された感情分析システムのテスト開始")
    print("=" * 50)
    
    try:
        test_basic_functionality()
        test_new_methods()
        test_normalization_methods()
        test_threshold_changes()
        test_context_modifier_detection()
        
        print("\n" + "=" * 50)
        print("✓ すべてのテストが完了しました！")
        
    except Exception as e:
        print(f"\n✗ テスト中にエラーが発生しました: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main()) 