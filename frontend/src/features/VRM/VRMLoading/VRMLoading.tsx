import {
	vrmLoadErrorMessageAtom,
	vrmLoadProgressAtom,
	vrmLoadingStateAtom,
	vrmLoadingTextAtom,
} from "@/store/vrmLoadingAtoms";
import { useAtom } from "jotai";
import { type FC, useEffect } from "react";
import { VRMLoadingView } from "./VRMLoadingView";

/**
 * VRMLoadingのProps型定義
 */
type VRMLoadingProps = {
	/**
	 * モデルの読み込み完了時に呼び出されるコールバック
	 */
	onLoadComplete?: () => void;

	/**
	 * 「会話を始める」ボタンクリック時の処理
	 */
	onStartChat?: () => void;
};

/**
 * VRMモデルのローディング状態を管理するコンテナコンポーネント
 */
export const VRMLoading: FC<VRMLoadingProps> = ({
	onLoadComplete,
	onStartChat,
}) => {
	// グローバル状態を取得
	const [loadingState, setLoadingState] = useAtom(vrmLoadingStateAtom);
	const [progress, setProgress] = useAtom(vrmLoadProgressAtom);
	const [loadingText, setLoadingText] = useAtom(vrmLoadingTextAtom);
	const [errorMessage, setErrorMessage] = useAtom(vrmLoadErrorMessageAtom);

	// コンポーネントマウント時に初期状態に強制リセット
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		// プライベートモードでも確実にローディング状態を初期化
		setLoadingState("initial");
		setProgress(0);
		setLoadingText("モデルを読み込んでいます...");
	}, []);

	// ローディングシミュレーション
	useEffect(() => {
		// 初期状態からローディング状態へ移行
		if (loadingState === "initial") {
			const timer1 = setTimeout(() => {
				setLoadingState("loading");

				// 擬似的なローディング進捗アニメーション
				const timer2 = setInterval(() => {
					setProgress((prev) => {
						// ランダム要素を加えて自然なローディング感を演出
						const increment = Math.random() * 2 + 0.5;
						const newProgress = Math.min(prev + increment, 100);

						// 進捗状況に応じてテキストを変更
						if (prev < 30 && newProgress >= 30) {
							setLoadingText("モデルデータを解析中...");
						} else if (prev < 60 && newProgress >= 60) {
							setLoadingText("テクスチャを読み込み中...");
						} else if (prev < 80 && newProgress >= 80) {
							setLoadingText("表情とモーションを準備中...");
						} else if (prev < 95 && newProgress >= 95) {
							setLoadingText("もうすぐ準備完了です...");
						}

						// 100%に達したら完了状態に移行
						if (newProgress >= 100) {
							clearInterval(timer2);
							setLoadingState("complete");

							// 完了コールバックを呼び出し
							if (onLoadComplete) {
								onLoadComplete();
							}

							return 100;
						}

						return newProgress;
					});
				}, 100);

				return () => {
					clearInterval(timer2);
				};
			}, 500);

			return () => {
				clearTimeout(timer1);
			};
		}
	}, [
		loadingState,
		onLoadComplete,
		setLoadingState,
		setLoadingText,
		setProgress,
	]);

	/**
	 * 再読み込み処理
	 * エラー状態から再度ローディングを開始
	 */
	const handleRetry = () => {
		setLoadingState("initial");
		setProgress(0);
		setLoadingText("モデルを読み込んでいます...");
		setErrorMessage("");
	};

	return (
		<VRMLoadingView
			loadingState={loadingState}
			progress={Math.round(progress)}
			loadingText={loadingText || "モデルを読み込んでいます..."}
			errorMessage={errorMessage}
			onStartChat={onStartChat}
			onRetry={handleRetry}
		/>
	);
};
