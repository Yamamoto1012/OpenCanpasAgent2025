import { Canvas } from "@react-three/fiber";
import "./App.css";
import VRMWrapper from "./features/VRM/VRMWrapper/VRMWrapper";
import { ChatInterface } from "./features/ChatInterface/ChatInterface";
import { useState } from "react";
import { Info, Volume2, VolumeX } from "lucide-react";
import { InfoPanel } from "./features/InfoPanel/InfoPanel";
import { IconButton } from "./features/IconButton/IconButton";
import { CategoryNavigator } from "./features/CategorySelection/CategoryNavigator";

import { motion, AnimatePresence } from "framer-motion";
import { ActionPrompt } from "./features/ActionPromt/ActionPromt";

function App() {
	const [showInfo, setShowInfo] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [categoryDepth, setCategoryDepth] = useState(0);
	const [showChat, setShowChat] = useState(true);
	const [selectedCategory, setSelectedCategory] = useState<{
		title: string;
	} | null>(null);
	const [showActionPrompt, setShowActionPrompt] = useState(false);

	// カテゴリー選択が変更されたときのハンドラー
	const handleCategorySelect = (
		depth: number,
		category?: { title: string },
	) => {
		setCategoryDepth(depth);

		// サブサブカテゴリーが選択されたら
		if (depth >= 2) {
			setShowChat(false);

			if (category) {
				setSelectedCategory(category);
				setShowActionPrompt(true);
			}
		} else {
			setShowChat(true);
			setShowActionPrompt(false);
		}
	};

	// カテゴリで検索するボタンが押されたとき
	const handleSearch = () => {
		console.log(`「${selectedCategory?.title}」で検索実行`);
		setShowActionPrompt(false);
		// 実際の検索処理をここに実装
	};

	// 質問が入力されたとき
	const handleAskQuestion = (question: string) => {
		console.log(`「${selectedCategory?.title}」について質問: ${question}`);
		setShowActionPrompt(false);
		setShowChat(true);
		// チャットインターフェースにメッセージを送信する処理
	};

	return (
		<div className="relative w-screen h-screen overflow-hidden">
			<div className="absolute inset-0">
				<Canvas
					flat
					camera={{
						fov: 45,
						near: 0.1,
						far: 2000,
						position: [0, 1.4, categoryDepth >= 2 ? -0.5 : 1],
						rotation: [0, categoryDepth >= 2 ? Math.PI / 8 : 0, 0],
					}}
				>
					<gridHelper />
					<VRMWrapper categoryDepth={categoryDepth} />
					<ambientLight />
					<directionalLight position={[5, 5, 5]} intensity={2} />
				</Canvas>
			</div>

			{/* カテゴリとActionPromptを含むコンテナ */}
			<div className="absolute top-1/11 right-2 flex flex-col items-center">
				<CategoryNavigator onCategoryDepthChange={handleCategorySelect} />

				<AnimatePresence>
					{showActionPrompt && selectedCategory && (
						<motion.div
							className="mt-4 w-full flex items-center justify-center"
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.3 }}
						>
							<ActionPrompt
								categoryTitle={selectedCategory.title}
								onSearch={handleSearch}
								onAskQuestion={handleAskQuestion}
							/>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			<AnimatePresence>
				{showChat && (
					<motion.div
						className="absolute top-1/11 left-2 p-4 z-10"
						initial={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -100 }}
						transition={{ duration: 0.3 }}
					>
						<ChatInterface />
					</motion.div>
				)}
			</AnimatePresence>

			<div className="absolute bottom-1/12 right-2 p-4 z-10">
				<IconButton icon={Info} onClick={() => setShowInfo(!showInfo)} />
			</div>
			<div className="absolute bottom-2/12 right-2 p-4 z-10">
				<IconButton
					icon={isMuted ? VolumeX : Volume2}
					onClick={() => setIsMuted(!isMuted)}
				/>
			</div>
			{showInfo && <InfoPanel onClose={() => setShowInfo(false)} />}
		</div>
	);
}

export default App;
