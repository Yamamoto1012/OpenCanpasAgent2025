import { useRef } from "react";
import "./App.css";
import { useAtom, useSetAtom } from "jotai";
import { showVoiceChatAtom } from "./store/appStateAtoms";
import { addMessageAtom } from "./store/chatAtoms";
import { showBottomNavigationAtom, currentScreenAtom } from "./store/navigationAtoms";
import { useAudioContext } from "./features/VRM/hooks/useAudioContext";
import { useCategorySelection } from "./hooks/useCategorySelection";
import type { ChatInterfaceHandle } from "./features/ChatInterface/ChatInterface";
import { AppLayout } from "./components/AppLayout";
import { VRMContainer } from "./features/VRM/VRMContainer/VRMContainer";
import { ScreenManager } from "./features/ScreenManager/ScreenManager";
import { ControlButtons } from "./features/ControlButtons/ControlButtons";
import { VoiceChatDialog } from "./features/VoiceChat/VoiceChatDialog";

/**
 * アプリケーションのメインコンポーネント
 */
export default function App() {
	const [showVoiceChat] = useAtom(showVoiceChatAtom);
	const [showBottomNavigation] = useAtom(showBottomNavigationAtom);
	const addMessage = useSetAtom(addMessageAtom);
	const setCurrentScreen = useSetAtom(currentScreenAtom);

	// カスタムフックの利用
	const { vrmWrapperRef } = useAudioContext();
	const chatInterfaceRef = useRef<ChatInterfaceHandle>(null);

	// カテゴリ選択関連の状態とロジックを取得
	const { state, actions } = useCategorySelection();
	const {
		categoryDepth,
		selectedCategory,
		showActionPrompt,
		showChat,
		showSearchResult,
		searchQuery,
		isQuestion,
	} = state;
	const {
		handleCategorySelect,
		handleSearch,
		handleAskQuestion: originalHandleAskQuestion,
		handleBackFromSearch,
	} = actions;

	const handleAskQuestion = (question: string) => {
		addMessage({ text: question, isUser: true });
		originalHandleAskQuestion(question);
	};

	const handleCloseInfo = () => {
		// 情報パネルを閉じて、ホーム画面に戻る
		setCurrentScreen("home");
	};

	return (
		<AppLayout>
			{/* 3Dモデル表示領域 */}
			<VRMContainer
				categoryDepth={categoryDepth}
				vrmWrapperRef={vrmWrapperRef}
			/>

			{/* 音声チャットが非表示の時のみUIを表示 */}
			{!showVoiceChat && (
				<>
					{/* 画面管理 */}
					<ScreenManager
						categoryDepth={categoryDepth}
						selectedCategory={selectedCategory}
						showActionPrompt={showActionPrompt}
						showSearchResult={showSearchResult}
						searchQuery={searchQuery}
						isQuestion={isQuestion}
						onCategorySelect={handleCategorySelect}
						onSearch={handleSearch}
						onAskQuestion={handleAskQuestion}
						onBackFromSearch={handleBackFromSearch}
						showChat={showChat}
						chatInterfaceRef={chatInterfaceRef}
						vrmWrapperRef={vrmWrapperRef}
						onCloseInfo={handleCloseInfo}
					/>

					{/* コントロールボタン群*/}
					{!showBottomNavigation && <ControlButtons />}
				</>
			)}

			{/* 音声チャットダイアログ */}
			<VoiceChatDialog vrmWrapperRef={vrmWrapperRef} />
		</AppLayout>
	);
}
