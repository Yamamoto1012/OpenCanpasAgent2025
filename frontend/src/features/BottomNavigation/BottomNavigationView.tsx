import type { FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Mic, Info, MessageSquare } from "lucide-react";
import type { NavigationScreen } from "@/store/navigationAtoms";

export type BottomNavigationViewProps = {
	/**
	 * 現在アクティブな画面
	 */
	currentScreen: NavigationScreen;

	/**
	 * ナビゲーションの表示/非表示
	 */
	isVisible: boolean;

	/**
	 * 画面切り替えのハンドラー
	 */
	onScreenChange: (screen: NavigationScreen) => void;
};

/**
 * ナビゲーションアイテムの定義
 */
const navigationItems = [
	{
		id: "chat" as NavigationScreen,
		label: "対話",
		icon: MessageCircle,
	},
	{
		id: "simple-chat" as NavigationScreen,
		label: "チャット",
		icon: MessageSquare,
	},
	{
		id: "voice" as NavigationScreen,
		label: "音声",
		icon: Mic,
	},
	{
		id: "info" as NavigationScreen,
		label: "情報",
		icon: Info,
	},
];

/**
 * モバイル用ボトムナビゲーションのプレゼンテーションコンポーネント
 * @param currentScreen - 現在アクティブな画面
 * @param isVisible - ナビゲーションの表示状態
 * @param onScreenChange - 画面切り替えのハンドラー
 */
export const BottomNavigationView: FC<BottomNavigationViewProps> = ({
	currentScreen,
	isVisible,
	onScreenChange,
}) => {
	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					className="fixed bottom-0 left-0 right-0 z-50"
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					exit={{ y: 20, opacity: 0 }}
					transition={{ duration: 0.2 }}
				>
					<div className="bg-white border-t border-gray-200 px-2 pb-2 pt-2">
						<div className="flex justify-around items-center max-w-md mx-auto">
							{navigationItems.map((item) => {
								const Icon = item.icon;
								const isActive = currentScreen === item.id;

								return (
									// biome-ignore lint/a11y/useButtonType: <explanation>
									<button
										key={item.id}
										onClick={() => onScreenChange(item.id)}
										className="flex flex-col items-center justify-center p-2 min-w-[70px] flex-1"
										aria-label={item.label}
									>
										<div className="flex flex-col items-center">
											<Icon
												className={`h-5 w-5 mb-1 ${
													isActive ? "text-[#b3cfad]" : "text-gray-500"
												}`}
											/>
											<span
												className={`text-xs ${
													isActive
														? "text-[#b3cfad] font-medium"
														: "text-gray-500"
												}`}
											>
												{item.label}
											</span>
										</div>
									</button>
								);
							})}
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
