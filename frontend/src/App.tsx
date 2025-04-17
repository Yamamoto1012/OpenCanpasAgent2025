import { useRef } from "react";
import "./App.css";
import { useAtom } from "jotai";
import { showVoiceChatAtom } from "./store/appStateAtoms";
import { useAudioContext } from "./features/VRM/hooks/useAudioContext";
import { useCategorySelection } from "./hooks/useCategorySelection";
import { useQuestionHandler } from "./features/VRM/hooks/useQuestionHandler";
import type { ChatInterfaceHandle } from "./features/ChatInterface/ChatInterface";
import { AppLayout } from "./components/AppLayout";
import { VRMContainer } from "./features/VRM/VRMContainer/VRMContainer";
import { CategorySection } from "./features/CategorySection/CategorySection";
import { ChatSection } from "./features/ChatInterface/ChatSection";
import { ControlButtons } from "./features/ControlButtons/ControlButtons";
import { VoiceChatDialog } from "./features/VoiceChat/VoiceChatDialog";

export default function App() {
	const [showVoiceChat, _setShowVoiceChat] = useAtom(showVoiceChatAtom);

	// カスタムフックの利用
	const { vrmWrapperRef } = useAudioContext();
	// speak関数は直接使用しないため削除
	const chatInterfaceRef = useRef<ChatInterfaceHandle>(null);

	// カテゴリ選択関連の状態とロジックを取得
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

	// 質問処理のカスタムフックを利用
	const { handleAskQuestion } = useQuestionHandler({
		vrmWrapperRef,
		chatInterfaceRef,
		originalHandleAskQuestion,
	});

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
					{/* カテゴリナビゲーションと検索結果 */}
					<CategorySection
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
						vrmWrapperRef={vrmWrapperRef}
					/>

					{/* チャットインターフェース */}
					<ChatSection
						isVisible={showChat}
						chatInterfaceRef={chatInterfaceRef}
					/>

					{/* コントロールボタン群 */}
					<ControlButtons />
				</>
			)}

			{/* 音声チャットダイアログ */}
			<VoiceChatDialog vrmWrapperRef={vrmWrapperRef} />
		</AppLayout>
	);
}
