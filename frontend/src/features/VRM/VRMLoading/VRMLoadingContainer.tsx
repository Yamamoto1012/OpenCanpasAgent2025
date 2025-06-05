import { vrmLoadErrorMessageAtom } from "@/store/vrmLoadingAtoms";
import type { VRM } from "@pixiv/three-vrm";
import { useAtom } from "jotai";
import { useCallback } from "react";
import { useVRM } from "../hooks/useVRM";
import { VRMLoadingOverlay } from "./VRMLoadingOverlay";

type VRMLoadingContainerProps = {
	/** VRMモデルのURL */
	modelUrl: string;
	/** 初期アニメーションURL（オプション） */
	initialAnimationUrl?: string;
	/** モデル読み込み完了時のコールバック */
	onLoadComplete?: (vrm: VRM) => void;
	/** コンテナのクラス名 */
	className?: string;
	/** モデル表示コンテナのクラス名 */
	modelContainerClassName?: string;
	/** オーバーレイのクラス名 */
	overlayClassName?: string;
	/** 子要素（VRMモデルの上に表示する要素） */
	children?: React.ReactNode;
};

/**
 * VRMモデルのローディングとレンダリングを統合的に管理するコンテナコンポーネント
 */
export const VRMLoadingContainer = ({
	modelUrl,
	initialAnimationUrl,
	onLoadComplete,
	className = "",
	modelContainerClassName = "",
	overlayClassName = "",
	children,
}: VRMLoadingContainerProps) => {
	const [, setErrorMessage] = useAtom(vrmLoadErrorMessageAtom);
	// カスタムフックを使用してVRMモデルをロード
	const {
		vrm,
		scene,
		mixer: _mixer, // eslint-disable-line @typescript-eslint/no-unused-vars
		crossFadeAnimation: _crossFadeAnimation, // eslint-disable-line @typescript-eslint/no-unused-vars
		isLoaded,
		hasError,
		retryLoading,
	} = useVRM(modelUrl, initialAnimationUrl);

	// モデル読み込み完了時の処理
	const handleLoadComplete = useCallback(() => {
		if (vrm && onLoadComplete) {
			onLoadComplete(vrm);
		}
	}, [vrm, onLoadComplete]);

	// エラー時のリトライ処理
	const handleRetry = useCallback(() => {
		setErrorMessage("");
		retryLoading();
	}, [retryLoading, setErrorMessage]);

	return (
		<div className={`relative ${className}`}>
			{/* モデル表示コンテナ */}
			<div
				className={`w-full h-full ${modelContainerClassName}`}
				data-vrm-loaded={isLoaded}
				data-vrm-error={hasError}
			>
				{/* ここにThree.jsのレンダラーやキャンバスを配置する */}
				{scene && (
					<div className="vrm-scene-wrapper">
						{/* ここでThree.jsのシーンをレンダリング */}
					</div>
				)}

				{/* 追加の子要素（コントロールUIなど） */}
				{children}
			</div>

			{/* ローディングオーバーレイ */}
			<VRMLoadingOverlay
				onComplete={handleLoadComplete}
				onRetry={handleRetry}
				overlayClassName={overlayClassName}
			>
				<div className="vrm-content-container">
					{/* オーバーレイの下に表示されるコンテンツ */}
				</div>
			</VRMLoadingOverlay>
		</div>
	);
};

/**
 * VRMモデルのローディング情報を扱うContextの型定義
 */
export type VRMLoadingContextType = {
	/** VRMモデルのインスタンス */
	vrm: VRM | null;
	/** アニメーションをクロスフェードで切り替える関数 */
	crossFadeAnimation: (animationUrl: string, duration?: number) => void;
	/** モデルが正常にロードされたかどうか */
	isLoaded: boolean;
	/** エラーが発生したかどうか */
	hasError: boolean;
	/** 読み込みを再試行する関数 */
	retryLoading: () => void;
};
