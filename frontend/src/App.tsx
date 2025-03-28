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
import { SearchResults } from "./features/SearchResult/SearchResult";
import type { Category } from "./features/CategorySelection/CategoryCard";

function App() {
	const [showInfo, setShowInfo] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [categoryDepth, setCategoryDepth] = useState(0);
	const [showChat, setShowChat] = useState(true);
	const [selectedCategory, setSelectedCategory] = useState<Category | null>(
		null,
	);
	const [showActionPrompt, setShowActionPrompt] = useState(false);

	// 検索結果の表示状態を管理する変数を追加
	const [showSearchResult, setShowSearchResult] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [isQuestion, setIsQuestion] = useState(false);

	// カテゴリー選択が変更されたときのハンドラー
	const handleCategorySelect = (depth: number, category?: Category) => {
		setCategoryDepth(depth);

		// 検索結果表示中なら閉じる
		if (showSearchResult) {
			setShowSearchResult(false);
		}

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
		if (!selectedCategory) return;

		console.log(`「${selectedCategory.title}」で検索実行`);
		setShowActionPrompt(false);
		setShowChat(false);

		// 検索結果を表示
		setIsQuestion(false);
		setSearchQuery("");
		setShowSearchResult(true);
	};

	// 質問が入力されたとき
	const handleAskQuestion = (question: string) => {
		if (!selectedCategory) return;

		console.log(`「${selectedCategory.title}」について質問: ${question}`);
		setShowActionPrompt(false);
		setShowChat(false);

		// 質問として検索結果を表示
		setIsQuestion(true);
		setSearchQuery(question);
		setShowSearchResult(true);
	};

	// 検索結果から戻るときの処理
	const handleBackFromSearch = () => {
		setShowSearchResult(false);
		setShowChat(true);
		setCategoryDepth(0); // カテゴリ選択をリセット
	};

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
					<VRMWrapper categoryDepth={categoryDepth} />
					<ambientLight />
					<directionalLight position={[5, 5, 5]} intensity={2} />
				</Canvas>
			</div>

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

export default App;
