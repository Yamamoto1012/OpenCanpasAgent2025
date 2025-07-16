import { useEffect, useRef } from "react";
import "./App.css";
import { useAtom, useSetAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { AppLayout } from "./components/AppLayout";
import {
	SentimentDebugToggle,
	SentimentDebugView,
} from "./components/debug/SentimentDebugView";
import type { ChatInterfaceHandle } from "./features/ChatInterface/ChatInterface";
import { ControlButtons } from "./features/ControlButtons/ControlButtons";
import { ScreenManager } from "./features/ScreenManager/ScreenManager";
import { VRMContainer } from "./features/VRM/VRMContainer/VRMContainer";
import { useAudioContext } from "./features/VRM/hooks/useAudioContext";
import { VoiceChatDialog } from "./features/VoiceChat/VoiceChatDialog";
import { useCategorySelection } from "./hooks/useCategorySelection";
import { showVoiceChatAtom } from "./store/appStateAtoms";
import { currentLanguageAtom } from "./store/languageAtoms";
import {
	currentScreenAtom,
	showBottomNavigationAtom,
} from "./store/navigationAtoms";

/**
 * アプリケーションのメインコンポーネント
 */
export default function App() {
	const [showVoiceChat] = useAtom(showVoiceChatAtom);
	const [showBottomNavigation] = useAtom(showBottomNavigationAtom);
	const [currentLanguage] = useAtom(currentLanguageAtom);
	const setCurrentScreen = useSetAtom(currentScreenAtom);
	const { i18n } = useTranslation();

	// アプリ起動時に保存された言語設定とi18nextを同期
	useEffect(() => {
		if (currentLanguage && i18n.language !== currentLanguage) {
			i18n.changeLanguage(currentLanguage);
		}
	}, [currentLanguage, i18n]);

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

			{/* 感情分析デバッグ機能 */}
			<SentimentDebugToggle />
			<SentimentDebugView />
		</AppLayout>
	);
}
