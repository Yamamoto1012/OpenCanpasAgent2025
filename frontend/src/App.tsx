import { Canvas } from "@react-three/fiber";
import "./App.css";
import { VRMWrapper } from "./features/VRM/VRMWrapper/VRMWrapper";
import { ChatInterface } from "./features/ChatInterface/ChatInterface";
import { useState } from "react";
import { Info, Volume2, VolumeX } from "lucide-react";
import { InfoPanel } from "./features/InfoPanel/InfoPanel";
import { IconButton } from "./features/IconButton/IconButton";
import { CategoryNavigator } from "./features/CategoryNagigator/CategoryNavigator";

import { motion, AnimatePresence } from "framer-motion";
import { ActionPrompt } from "./features/ActionPromt/ActionPromt";
import { SearchResults } from "./features/SearchResult/SearchResult";
import { useAudioContext } from "./features/VRM/hooks/useAudioContext";
import { useCategorySelection } from "./hooks/useCategorySelection";

export default function App() {
	const [showInfo, setShowInfo] = useState(false);
	const [isMuted, setIsMuted] = useState(false);

	// カスタムフックから状態とロジックを取得
	const { audioInitialized, vrmWrapperRef, handleTestLipSync } =
		useAudioContext();

	const {
		categoryDepth,
		selectedCategory,
		showActionPrompt,
		showChat,
		showSearchResult,
		searchQuery,
		isQuestion,
		handleCategorySelect,
		handleSearch,
		handleAskQuestion,
		handleBackFromSearch,
	} = useCategorySelection();

	return (
		<div className="relative w-screen h-screen overflow-hidden">
			<div className="absolute inset-0">
				<Canvas
					flat
					camera={{
						fov: 40,
						near: 0.01,
						far: 2000,
						position: [0, 1.45, categoryDepth >= 2 ? -0.5 : 1],
						rotation: [0, categoryDepth >= 2 ? Math.PI / 8 : 0, 0],
					}}
				>
					<gridHelper />
					<VRMWrapper
						categoryDepth={categoryDepth}
						isMuted={isMuted}
						ref={vrmWrapperRef}
					/>
					<ambientLight />
					<directionalLight position={[5, 5, 5]} intensity={2} />
				</Canvas>
			</div>

			{process.env.NODE_ENV === "development" && (
				<div className="absolute top-2 left-2 p-2 z-50">
					{/* biome-ignore lint/a11y/useButtonType: <explanation> */}
					<button
						onClick={handleTestLipSync}
						className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
					>
						リップシンクテスト
					</button>
				</div>
			)}

			{/* カテゴリ、検索結果、ActionPromptを含むコンテナ */}
			<div className="absolute top-1/11 right-2 flex flex-col items-center">
				<div className="relative w-full min-h-[400px] flex justify-end">
					<AnimatePresence mode="wait">
						{showSearchResult ? (
							<motion.div
								key="search-results"
								className="w-full max-w-lg translate-y-20 -translate-x-24"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ duration: 0.3 }}
							>
								<SearchResults
									query={searchQuery}
									category={selectedCategory ?? undefined}
									isQuestion={isQuestion}
									onBack={handleBackFromSearch}
								/>
							</motion.div>
						) : (
							<motion.div
								key="category-navigator"
								initial={{ opacity: 0, y: -20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 20 }}
								transition={{ duration: 0.3 }}
							>
								<CategoryNavigator
									onCategoryDepthChange={handleCategorySelect}
								/>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* アクションプロンプト */}
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

			{/* チャットインターフェース */}
			<AnimatePresence>
				{showChat && !showSearchResult && (
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

			{/* 情報・音声コントロールボタン */}
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
