import { useEffect, useState } from "react";

/**
 * ブレークポイントの定義
 */
const BREAKPOINTS = {
	mobile: 768,
	tablet: 1024,
} as const;

/**
 * レスポンシブな状態を管理するカスタムフック
 * 画面サイズの変化を検出し、適切なデバイスタイプを返す
 */
export const useResponsive = () => {
	const [windowSize, setWindowSize] = useState({
		width: typeof window !== "undefined" ? window.innerWidth : 0,
		height: typeof window !== "undefined" ? window.innerHeight : 0,
	});

	useEffect(() => {
		const handleResize = () => {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};

		// 初期値設定
		handleResize();

		// リサイズイベントリスナーを追加
		window.addEventListener("resize", handleResize);

		// クリーンアップ
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	const isMobile = windowSize.width < BREAKPOINTS.mobile;
	const isTablet =
		windowSize.width >= BREAKPOINTS.mobile &&
		windowSize.width < BREAKPOINTS.tablet;
	const isDesktop = windowSize.width >= BREAKPOINTS.tablet;

	return {
		windowSize,
		isMobile,
		isTablet,
		isDesktop,
		// ボトムナビゲーションを表示するかどうか
		shouldShowBottomNavigation: isMobile,
	};
};
