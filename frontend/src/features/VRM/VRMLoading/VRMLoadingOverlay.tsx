import { vrmLoadingStateAtom } from "@/store/vrmLoadingAtoms";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { VRMLoadingIndicator } from "./VRMLoadingIndicator";

type VRMLoadingOverlayProps = {
	/** ローディング完了時に呼び出されるコールバック */
	onComplete?: () => void;
	/** エラー発生時のリトライコールバック */
	onRetry?: () => void;
	/** 子要素 */
	children: React.ReactNode;
	/** コンポーネントのスタイル */
	className?: string;
	/** オーバーレイのスタイル */
	overlayClassName?: string;
	/** アニメーション付きで表示/非表示 */
	animated?: boolean;
};

/**
 * VRMモデルのローディング状態を管理するオーバーレイコンポーネント
 *
 * モデルが読み込まれるまでの間、指定された子要素の上にローディングUIを表示。
 * モデルの読み込みが完了すると、オーバーレイは自動的に非表示になり、子要素が表示。
 */
export const VRMLoadingOverlay = ({
	onComplete,
	onRetry,
	children,
	className = "",
	overlayClassName = "",
	animated = true,
}: VRMLoadingOverlayProps) => {
	// モデルのローディング状態を取得
	const loadingState = useAtomValue(vrmLoadingStateAtom);
	// オーバーレイの表示状態
	const [visible, setVisible] = useState(true);

	// 読み込み完了時の処理
	useEffect(() => {
		if (loadingState === "complete") {
			if (animated) {
				// アニメーション付きで非表示にする場合は遅延を入れる
				const timer = setTimeout(() => {
					setVisible(false);
					if (onComplete) onComplete();
				}, 800);
				return () => clearTimeout(timer);
				// biome-ignore lint/style/noUselessElse: <explanation>
			} else {
				// アニメーションなしですぐに非表示
				setVisible(false);
				if (onComplete) onComplete();
			}
		} else {
			// ローディング中またはエラー時は表示
			setVisible(true);
		}
	}, [loadingState, animated, onComplete]);

	// オーバーレイのスタイル決定
	const overlayStyle = visible
		? `fixed inset-0 flex items-center justify-center z-50 bg-black/70 ${
				animated ? "transition-opacity duration-800" : ""
			} ${overlayClassName}`
		: "hidden";

	return (
		<div className={`relative ${className}`}>
			{children}

			{/* ローディングオーバーレイ */}
			<div className={overlayStyle}>
				<div className="bg-white/90 rounded-lg shadow-lg p-6 max-w-md mx-auto">
					<VRMLoadingIndicator onRetry={onRetry} />
				</div>
			</div>
		</div>
	);
};
