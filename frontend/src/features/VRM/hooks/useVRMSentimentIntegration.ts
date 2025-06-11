/**
 * VRM表情制御と感情分析を統合する
 */
import { useCallback, useEffect, useRef } from "react";
import { useSentiment } from "../../../hooks/useSentiment";
import type { SentimentAnalysisResult } from "../../../types/sentiment";
import type { ExpressionManager } from "../VRMExpression/ExpressionManager";

// 感情分析統合オプションの型定義
type UseVRMSentimentIntegrationOptions = {
	expressionManager?: ExpressionManager | null;
	enableAutoSentiment?: boolean;
	sentimentPollingInterval?: number;
	enableRandomVariations?: boolean;
};
// 感情分析統合フックの戻り値の型定義
type UseVRMSentimentIntegrationReturn = {
	analyzeSentiment: (text: string) => void;
	startSentimentTracking: (text: string) => void;
	stopSentimentTracking: () => void;
	isSentimentTracking: boolean;
	currentSentiment: SentimentAnalysisResult | null;
	isAnalyzing: boolean;
	sentimentError: Error | null;
};

/**
 * 感情分析統合フック
 * @param options - 感情分析統合オプション
 */
export const useVRMSentimentIntegration = (
	options: UseVRMSentimentIntegrationOptions = {},
): UseVRMSentimentIntegrationReturn => {
	const {
		expressionManager,
		enableAutoSentiment = true,
		sentimentPollingInterval = 3000,
		enableRandomVariations = true,
	} = options;

	// 最後に送信された感情を保持するための参照
	const lastSentimentRef = useRef<string | null>(null);

	// 感情変化時の表情更新コールバック
	const handleSentimentChange = useCallback(
		// 感情分析結果を受け取ったときの処理
		(result: SentimentAnalysisResult) => {
			if (!expressionManager || !enableAutoSentiment) {
				return;
			}

			// 同じ感情カテゴリの場合はスキップ
			if (lastSentimentRef.current === result.category) {
				return;
			}

			// VRM表情を更新
			const success = expressionManager.setExpressionBySentiment(
				result.category,
				{
					enableRandomVariation: enableRandomVariations,
					forceUpdate: false,
				},
			);

			if (success) {
				lastSentimentRef.current = result.category;
				console.log(
					`感情に基づく表情更新: ${result.category} (スコア: ${result.score})チュウ!!`,
				);
			} else {
				console.warn(`表情更新に失敗しました: ${result.category}チュウ!!`);
			}
		},
		[expressionManager, enableAutoSentiment, enableRandomVariations],
	);

	// useSentimentフックの設定
	const sentiment = useSentiment({
		enabled: enableAutoSentiment,
		pollingInterval: sentimentPollingInterval,
		onSentimentChange: handleSentimentChange,
		minTextLength: 3, // 3文字以上で感情分析
	});

	// ExpressionManagerの変更時に感情状態をリセット
	useEffect(() => {
		if (expressionManager) {
			// 新しいExpressionManagerが設定された場合、感情状態をリセット
			lastSentimentRef.current = null;
			expressionManager.resetSentiment();
		}
	}, [expressionManager]);

	// クリーンアップ
	useEffect(() => {
		return () => {
			// コンポーネントアンマウント時に感情トラッキングを停止
			sentiment.stopPolling();
			if (expressionManager) {
				expressionManager.resetSentiment();
			}
		};
	}, [expressionManager, sentiment]);

	// 単発の感情分析
	const analyzeSentiment = useCallback(
		(text: string) => {
			sentiment.analyzeSentiment(text);
		},
		[sentiment],
	);

	// 感情トラッキング開始
	const startSentimentTracking = useCallback(
		(initialText: string) => {
			sentiment.startPolling(initialText);
		},
		[sentiment],
	);

	// 感情トラッキング停止
	const stopSentimentTracking = useCallback(() => {
		sentiment.stopPolling();
		lastSentimentRef.current = null;

		// 表情をニュートラルにリセット
		if (expressionManager) {
			expressionManager.resetSentiment();
		}
	}, [sentiment, expressionManager]);

	return {
		analyzeSentiment,
		startSentimentTracking,
		stopSentimentTracking,
		isSentimentTracking: sentiment.isPolling,
		currentSentiment: sentiment.state.data,
		isAnalyzing: sentiment.state.isLoading,
		sentimentError: sentiment.state.error,
	};
};

export default useVRMSentimentIntegration;
