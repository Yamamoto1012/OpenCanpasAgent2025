import type { FC, ReactNode } from "react";
import { motion } from "framer-motion";

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
	return (
		<div className="relative w-screen h-screen overflow-hidden">
			{/* ロゴ */}
			<div className="absolute top-2 left-4 p-2 z-50 hover:scale-95 duration-200">
				<motion.a
					href="https://www.aizawaminori.com/"
					target="_blank"
					rel="noopener noreferrer"
					whileHover={{
						scale: 1.05,
						y: -5,
						transition: { duration: 0.3 },
					}}
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<img
						src="/Logo.png"
						aria-label="Logo"
						className="w-24"
						alt="OpenCanapasAgent Logo"
					/>
				</motion.a>
			</div>

			{/* メインコンテンツ */}
			{children}
		</div>
	);
};
