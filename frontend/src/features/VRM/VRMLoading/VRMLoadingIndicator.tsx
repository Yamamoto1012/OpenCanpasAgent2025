import {
	vrmLoadErrorMessageAtom,
	vrmLoadProgressAtom,
	vrmLoadingStateAtom,
	vrmLoadingTextAtom,
} from "@/store/vrmLoadingAtoms";
import { useAtomValue } from "jotai";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

// ローディング状態に基づくアニメーションテキストを生成するカスタムフック
const useLoadingAnimation = (isLoading: boolean) => {
	const [dots, setDots] = useState("");

	useEffect(() => {
		if (!isLoading) return;

		// 300msごとにドットを増やす
		const interval = setInterval(() => {
			// biome-ignore lint/style/useTemplate: <explanation>
			setDots((prev) => (prev.length < 3 ? prev + "." : ""));
		}, 300);

		return () => clearInterval(interval);
	}, [isLoading]);

	return dots;
};

// プログレスバーのスタイル定義
const progressBarStyles = {
	container: "w-full h-2 bg-gray-200 rounded-full overflow-hidden",
	bar: "h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300 ease-out",
};

// ローディング状態による表示メッセージの定義

type VRMLoadingIndicatorProps = {
	/** ローディング完了時のコールバック */
	onComplete?: () => void;
	/** エラー時のリトライコールバック */
	onRetry?: () => void;
	/** カスタムスタイル */
	className?: string;
};

/**
 * VRMモデルのローディング状態を表示するコンポーネント
 *
 * 3Dモデルのロード進捗、状態、エラーメッセージを視覚的に表示
 */
export const VRMLoadingIndicator = ({
	onComplete,
	onRetry,
	className = "",
}: VRMLoadingIndicatorProps) => {
	const loadingState = useAtomValue(vrmLoadingStateAtom);
	const loadProgress = useAtomValue(vrmLoadProgressAtom);
	const loadingText = useAtomValue(vrmLoadingTextAtom);
	const errorMessage = useAtomValue(vrmLoadErrorMessageAtom);
	const { t } = useTranslation("vrm");

	// ローディング中のアニメーションドット
	const dots = useLoadingAnimation(loadingState === "loading");

	// ローディング完了時のコールバック実行
	useEffect(() => {
		if (loadingState === "complete" && onComplete) {
			// 微小な遅延を入れて、UIアニメーションが完了してから次の処理へ
			const timer = setTimeout(onComplete, 500);
			return () => clearTimeout(timer);
		}
	}, [loadingState, onComplete]);

	// リトライハンドラー
	const handleRetry = useCallback(() => {
		if (onRetry) onRetry();
	}, [onRetry]);

	// 現在の状態に応じたメッセージを取得
	const statusMessage = (() => {
		switch (loadingState) {
			case "initial":
				return t("preparing");
			case "loading":
				return t("loadingModel");
			case "error":
				return t("failedToLoad");
			case "complete":
				return t("loadComplete");
			default:
				return "";
		}
	})();

	// エラー表示コンポーネント
	if (loadingState === "error") {
		return (
			<div
				className={`flex flex-col items-center p-4 rounded-lg bg-red-50 ${className}`}
			>
				<div className="text-red-600 font-bold mb-2">{statusMessage}</div>
				<div className="text-sm text-red-500 mb-4">{errorMessage}</div>
				{/* biome-ignore lint/a11y/useButtonType: <explanation> */}
				<button
					onClick={handleRetry}
					className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
				>
					{t("retry")}
				</button>
			</div>
		);
	}

	// 通常のローディングインジケーター
	return (
		<div className={`flex flex-col items-center p-4 ${className}`}>
			<div className="mb-2 font-medium">
				{statusMessage}
				{dots}
			</div>

			<div className="text-sm text-gray-600 mb-2">{loadingText}</div>

			<div className={progressBarStyles.container}>
				<div
					className={progressBarStyles.bar}
					style={{ width: `${loadProgress}%` }}
				/>
			</div>

			<div className="text-xs text-gray-500 mt-1">{loadProgress}%</div>
		</div>
	);
};
