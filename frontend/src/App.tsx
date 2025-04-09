import { useRef, useEffect } from "react";
import "./App.css";
import { useAtom } from "jotai";
import {
	showVoiceChatAtom,
	isDirectChatQuestionAtom,
	isActionPromptQuestionAtom,
} from "./store/appStateAtoms";
import { useAudioContext } from "./features/VRM/hooks/useAudioContext";
import { useCategorySelection } from "./hooks/useCategorySelection";
import { useQuestionHandler } from "./features/VRM/hooks/useQuestionHandler";
import { useTextToSpeech } from "./hooks/useTextToSpeech";
import type { ChatInterfaceHandle } from "./features/ChatInterface/ChatInterface";
import { AppLayout } from "./components/AppLayout";
import { VRMContainer } from "./features/VRM/VRMContainer/VRMContainer";
import { CategorySection } from "./features/CategorySection/CategorySection";
import { ChatSection } from "./features/ChatInterface/ChatSection";
import { ControlButtons } from "./features/ControlButtons/ControlButtons";
import { VoiceChatDialog } from "./features/VoiceChat/VoiceChatDialog";
import { generateMockResponse } from "./features/ChatInterface/generateMockResponse";

export default function App() {
	// グローバル状態の取得
	const [isDirectChatQuestion, setIsDirectChatQuestion] = useAtom(
		isDirectChatQuestionAtom,
	);
	const [showVoiceChat, setShowVoiceChat] = useAtom(showVoiceChatAtom);
	const [isActionPromptQuestion, setIsActionPromptQuestion] = useAtom(
		isActionPromptQuestionAtom,
	);

	// カスタムフックの利用
	const { vrmWrapperRef } = useAudioContext();
	const { speak } = useTextToSpeech(vrmWrapperRef);
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
		handleBackFromSearch: originalHandleBackFromSearch,
	} = useCategorySelection();

	/**
	 * 検索結果から戻る際の処理
	 * useCategorySelectionの処理に加えて、ActionPromptQuestion状態をリセット
	 */
	const handleBackFromSearch = () => {
		originalHandleBackFromSearch();
		setIsActionPromptQuestion(false);
	};

	/**
	 * チャットから質問が送信された時の処理
	 */
	const handleChatInterfaceQuestion = async (question: string) => {
		// 思考モード開始
		if (vrmWrapperRef.current?.startThinking) {
			vrmWrapperRef.current.startThinking();
		}

		// モック回答を生成
		const mockResponse = generateMockResponse(question);

		try {
			// StandingIdleアニメーションに切り替え
			if (vrmWrapperRef.current?.crossFadeAnimation) {
				vrmWrapperRef.current.crossFadeAnimation("/Motion/StandingIdle.vrma");
			}

			// 音声生成を開始し、完了するまで待機
			// useTextToSpeechフックのspeak関数は非同期で音声生成とリップシンク付き再生を行う
			await speak(mockResponse);

			// 思考モード終了
			if (vrmWrapperRef.current?.stopThinking) {
				vrmWrapperRef.current.stopThinking();
			}

			// 音声が再生開始されたタイミングでChatInterfaceに結果を表示
			if (chatInterfaceRef.current) {
				chatInterfaceRef.current.addMessage(mockResponse, false, undefined);
			}
		} catch (error) {
			console.error("音声生成エラー:", error);

			// 思考モード終了
			if (vrmWrapperRef.current?.stopThinking) {
				vrmWrapperRef.current.stopThinking();
			}

			// エラー時も結果だけは表示
			if (chatInterfaceRef.current) {
				chatInterfaceRef.current.addMessage(mockResponse, false, undefined);
			}
		}
	};

	/**
	 * ActionPromptからの質問処理をラップ
	 * 思考モードの制御とフラグ設定を行う
	 */
	const wrappedHandleAskQuestion = (question: string) => {
		// 思考モード開始
		if (vrmWrapperRef.current?.startThinking) {
			vrmWrapperRef.current.startThinking();
		}

		// フラグ設定
		setIsActionPromptQuestion(true);
		setIsDirectChatQuestion(false);

		// 元の質問処理実行
		originalHandleAskQuestion(question);

		// 一定時間後に思考モード終了
		setTimeout(() => {
			if (vrmWrapperRef.current?.stopThinking) {
				vrmWrapperRef.current.stopThinking();
			}
		}, 5500);
	};

	// 質問処理のカスタムフックを利用
	const { handleAskQuestion } = useQuestionHandler({
		vrmWrapperRef,
		chatInterfaceRef,
		originalHandleAskQuestion: wrappedHandleAskQuestion,
	});

	/**
	 * 音声チャットを開く処理
	 * モーション状態の保存と切り替えを行う
	 */
	const handleOpenVoiceChat = () => {
		setShowVoiceChat(true);

		// 現在のモーションを保存
		if (vrmWrapperRef.current?.getLastMotion) {
			vrmWrapperRef.current.getLastMotion();
		}

		// モーション切り替え
		if (vrmWrapperRef.current?.crossFadeAnimation) {
			vrmWrapperRef.current.crossFadeAnimation("/Motion/StandingIdle.vrma");
		}
	};

	/**
	 * 音声チャットを閉じる処理
	 * 保存していたモーション状態に戻す
	 */
	const handleCloseVoiceChat = () => {
		setShowVoiceChat(false);

		// 元のモーションに戻す
		if (vrmWrapperRef.current?.restoreLastMotion) {
			vrmWrapperRef.current.restoreLastMotion();
		}
	};

	// 音声チャット表示時のモーション制御
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (showVoiceChat && vrmWrapperRef.current?.crossFadeAnimation) {
			vrmWrapperRef.current.crossFadeAnimation("/Motion/StandingIdle.vrma");
		}
	}, [showVoiceChat]);

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
						onSendQuestion={handleChatInterfaceQuestion}
					/>

					{/* コントロールボタン群 */}
					<ControlButtons onOpenVoiceChat={handleOpenVoiceChat} />
				</>
			)}

			{/* 音声チャットダイアログ */}
			<VoiceChatDialog
				isVisible={showVoiceChat}
				onClose={handleCloseVoiceChat}
				vrmWrapperRef={vrmWrapperRef}
			/>
		</AppLayout>
	);
}
