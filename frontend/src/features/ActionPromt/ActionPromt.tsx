import type React from "react";
import { useAtom } from "jotai";
import { ActionPromptView } from "./ActionPromtView";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { showQuestionInputAtom, questionAtom } from "./store/actionPromptAtoms";
import { generateText } from "@/services/llmService";
import { toast } from "sonner";

type ActionPromptProps = {
	categoryTitle: string;
	onSearch: () => void;
	onAskQuestion: (question: string) => void;
};

/**
 * ActionPromptコンポーネント
 *
 * @param categoryTitle - カテゴリのタイトル
 * @param onSearch - 検索ボタンが押された時のコール爆
 * @param onAskQuestion - 質問処理のフローを実行するためのコールバック
 * @returns
 */
export const ActionPrompt: React.FC<ActionPromptProps> = ({
	categoryTitle,
	onSearch,
	onAskQuestion,
}) => {
	// 質問入力フォームの表示状態を管理するatom
	const [showQuestionInput, setShowQuestionInput] = useAtom(
		showQuestionInputAtom,
	);

	// 質問内容を管理するatom
	const [question, setQuestion] = useAtom(questionAtom);

	// 録音カスタムフックの使用
	const { isRecording, toggleRecording } = useVoiceRecording({
		onRecognizedText: (text) => setQuestion(text),
	});

	// 質問入力フォームの表示切り替え(ボタンを押した時に入力フォームを非表示にする)
	const handleQuestionClick = () => {
		setShowQuestionInput(true);
	};

	// 質問テキストの変更処理
	const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setQuestion(e.target.value);
	};

	// 質問送信処理
	const handleSendQuestion = async () => {
		// 入力された文字から空白をトリミング
		const trimmedQuestion = question.trim();

		if (trimmedQuestion) {
			try {
				// カテゴリ情報をコンテキストとして付加
				const context = { category: categoryTitle }; // どのカテゴリに関する質問かという情報

				// LLMを使用して回答を生成
				await generateText(trimmedQuestion, context);

				// 親コンポーネントに質問を渡す
				onAskQuestion(trimmedQuestion);

				// 質問送信後は入力をリセットしつつフォームは表示したままにする
				setQuestion("");
			} catch (error) {
				// エラーメッセージをトースト通知で表示
				toast.error("応答の生成中にエラーが発生しました。もう一度お試しください。", {
					duration: 3000,
					position: "bottom-right",
				});
				// エラー時は元の質問だけを親に渡す
				onAskQuestion(trimmedQuestion);
				setQuestion("");
			}
		}
	};

	// キーボード入力処理
	const handleKeyDown = (e: React.KeyboardEvent) => {
		// 入力中の変換確定時にはEnterを無視
		if (e.nativeEvent.isComposing) return;

		// Enter以外のキーは処理しない
		if (e.key !== "Enter") return;

		// 質問送信処理実行
		handleSendQuestion();
	};

	return (
		<ActionPromptView
			categoryTitle={categoryTitle}
			showQuestionInput={showQuestionInput}
			question={question}
			isRecording={isRecording}
			onQuestionClick={handleQuestionClick}
			onQuestionChange={handleQuestionChange}
			onQuestionKeyDown={handleKeyDown}
			onSendQuestion={handleSendQuestion}
			onToggleRecording={toggleRecording}
			onSearch={onSearch}
		/>
	);
};
