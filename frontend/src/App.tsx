import { Canvas } from "@react-three/fiber";
import "./App.css";
import { VRMWrapper } from "./features/VRM/VRMWrapper/VRMWrapper";
import {
	ChatInterface,
	type ChatInterfaceHandle,
} from "./features/ChatInterface/ChatInterface";
import { useRef, useState } from "react";
import { Info, Mic2, Volume2, VolumeX, X } from "lucide-react";
import { InfoPanel } from "./features/InfoPanel/InfoPanel";
import { IconButton } from "./features/IconButton/IconButton";
import { CategoryNavigator } from "./features/CategoryNagigator/CategoryNavigator";

import { motion, AnimatePresence } from "framer-motion";
import { ActionPrompt } from "./features/ActionPromt/ActionPromt";
import { SearchResults } from "./features/SearchResult/SearchResult";
import { useAudioContext } from "./features/VRM/hooks/useAudioContext";
import { useCategorySelection } from "./hooks/useCategorySelection";
import { useQuestionHandler } from "./features/VRM/hooks/useQuestionHandler";
import { VoiceChat } from "./features/VoiceChat/VoiceChat";
import { ThinkingIndicator } from "./features/ThinkingIndicator/ThinkingIndicator";

export default function App() {
	const [showInfo, setShowInfo] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [isDirectChatQuestion, setIsDirectChatQuestion] = useState(false);
	const [showVoiceChat, setShowVoiceChat] = useState(false);
	const [isThinking, setIsThinking] = useState(false);

	// カスタムフックから状態とロジックを取得
	const { audioInitialized, vrmWrapperRef, handleTestLipSync } =
		useAudioContext();

	const chatInterfaceRef = useRef<ChatInterfaceHandle>(null);

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
		handleAskQuestion: originalHandleAskQuestion,
		handleBackFromSearch,
	} = useCategorySelection();

	// チャットインターフェースからの質問処理
	const handleChatInterfaceQuestion = (question: string) => {
		// チャットからの直接質問としてフラグを設定
		setIsDirectChatQuestion(true);
		handleAskQuestion(question);
		setIsDirectChatQuestion(false);
	};

	// 音声チャットからの質問処理
	const handleVoiceChatQuestion = (question: string) => {
		setIsDirectChatQuestion(true);

		// 質問を処理する前にVRMモデルを思考モードに切り替え
		if (vrmWrapperRef.current?.startThinking) {
			vrmWrapperRef.current.startThinking();
		}

		handleAskQuestion(question);
		// 音声モーダルはすぐには非表示にせず、一定時間後に閉じる
		setTimeout(() => {
			setShowVoiceChat(false);
			setIsDirectChatQuestion(false);
		}, 1500);
	};

	const { handleAskQuestion } = useQuestionHandler({
		vrmWrapperRef,
		chatInterfaceRef,
		originalHandleAskQuestion,
	});

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
						onThinkingStateChange={setIsThinking}
					/>
					<ambientLight />
					<directionalLight position={[5, 5, 5]} intensity={2} />
				</Canvas>
			</div>

			{/* 思考中インジケーター */}
			<AnimatePresence>
				{isThinking && <ThinkingIndicator visible={true} />}
			</AnimatePresence>

			{/* ロゴ */}
			<div className="absolute top-2 left-4 p-2 z-50 hover:scale-95 duration-200">
				<motion.a
					href="https://old-aizawa-hp.vercel.app/"
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

			{/* VoiceChatが表示されていない時のみ他のUIを表示 */}
			{!showVoiceChat && (
				<>
					{/* カテゴリ、検索結果、ActionPromptを含むコンテナ */}
					<div className="absolute top-1/7 right-2 flex flex-col items-center">
						<div className="relative w-full min-h-[400px] flex justify-end">
							<AnimatePresence mode="wait">
								{showSearchResult && !isDirectChatQuestion ? (
									<motion.div
										key="search-results"
										className="w-full max-w-lg -translate-x-24"
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
						{showChat && (
							<motion.div
								className="absolute top-1/7 left-4 p-4 z-10"
								initial={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -100 }}
								transition={{ duration: 0.3 }}
							>
								<ChatInterface
									ref={chatInterfaceRef}
									onSendQuestion={handleChatInterfaceQuestion}
								/>
							</motion.div>
						)}
					</AnimatePresence>

					{/* 情報・音声コントロール・音声チャットボタン */}
					<div className="absolute bottom-1/12 right-2 p-4 z-10">
						<IconButton icon={Info} onClick={() => setShowInfo(!showInfo)} />
					</div>
					<div className="absolute bottom-2/12 right-2 p-4 z-10">
						<IconButton
							icon={isMuted ? VolumeX : Volume2}
							onClick={() => setIsMuted(!isMuted)}
						/>
					</div>
					<div className="absolute bottom-3/12 right-2 p-4 z-10">
						<IconButton icon={Mic2} onClick={() => setShowVoiceChat(true)} />
					</div>
					{showInfo && <InfoPanel onClose={() => setShowInfo(false)} />}
				</>
			)}

			{/* 音声チャットダイアログ */}
			<AnimatePresence>
				{showVoiceChat && (
					<motion.div
						className="absolute inset-0 flex items-center justify-center bg-transparent z-50"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
					>
						<motion.div
							className="rounded-xl p-6 mx-4 h-full w-full max-w-2xl"
							initial={{ scale: 0.9, y: 20 }}
							animate={{ scale: 1, y: 0 }}
							exit={{ scale: 0.9, y: 20 }}
							transition={{ type: "spring", damping: 25, stiffness: 300 }}
						>
							<div className="flex justify-end mb-2">
								{/* biome-ignore lint/a11y/useButtonType: <explanation> */}
								<button
									onClick={() => setShowVoiceChat(false)}
									className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors"
								>
									<X className="h-5 w-5 text-white" />
								</button>
							</div>
							<VoiceChat
								onClose={() => setShowVoiceChat(false)}
								vrmWrapperRef={vrmWrapperRef}
							/>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
