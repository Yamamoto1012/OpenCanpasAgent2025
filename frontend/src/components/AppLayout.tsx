import { BottomNavigation } from "@/features/BottomNavigation/BottomNavigation";
import { useResponsive } from "@/hooks/useResponsive";
import {
	currentScreenAtom,
	showBottomNavigationAtom,
} from "@/store/navigationAtoms";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom, useSetAtom } from "jotai";
import type { FC, ReactNode } from "react";
import { useEffect } from "react";

type AppLayoutProps = {
	/**
	 * レイアウト内に表示する子要素
	 */
	children: ReactNode;
};

/**
 * アプリケーション全体のレイアウトを管理するコンポーネント
 */
export const AppLayout: FC<AppLayoutProps> = ({ children }) => {
	const { shouldShowBottomNavigation } = useResponsive();
	const setShowBottomNavigation = useSetAtom(showBottomNavigationAtom);
	const [currentScreen] = useAtom(currentScreenAtom);

	// レスポンシブ状態に応じてボトムナビゲーションの表示を制御
	useEffect(() => {
		setShowBottomNavigation(shouldShowBottomNavigation);
	}, [shouldShowBottomNavigation, setShowBottomNavigation]);

	// AIチャット画面でない場合のみロゴを表示
	const shouldShowLogo = currentScreen !== "simple-chat";

	return (
		<div className="relative w-screen h-screen overflow-hidden">
			{/* ロゴ */}
			<AnimatePresence>
				{shouldShowLogo && (
					<motion.div
						className="absolute top-2 left-2 sm:left-4 p-2 z-50 hover:scale-95 duration-200"
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.3 }}
					>
						<motion.a
							href="https://www.aizawaminori.com/"
							target="_blank"
							rel="noopener noreferrer"
							whileHover={{
								scale: 1.05,
								y: -5,
								transition: { duration: 0.3 },
							}}
						>
							<img
								src="/Logo.png"
								aria-label="Logo"
								className="w-16 sm:w-20 md:w-24"
								alt="OpenCanapasAgent Logo"
							/>
						</motion.a>
					</motion.div>
				)}
			</AnimatePresence>

			{/* メインコンテンツ */}
			<div
				className={`h-full w-full ${
					shouldShowBottomNavigation && currentScreen !== "simple-chat"
						? "pt-24"
						: ""
				}`}
			>
				{children}
			</div>

			{/* ボトムナビゲーション - モバイルのみ表示 */}
			<BottomNavigation />
		</div>
	);
};
