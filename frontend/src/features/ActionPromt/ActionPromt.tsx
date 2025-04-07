import type React from "react";
import { useAtom } from "jotai";
import { ActionPromptView } from "./ActionPromtView";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { showQuestionInputAtom, questionAtom } from "./store/actionPromptAtoms";

type ActionPromptProps = {
	categoryTitle: string;
	onSearch: () => void;
	onAskQuestion: (question: string) => void;
};

/**
 * アクションプロンプトコンポーネント
 * カテゴリに関する検索や質問入力を担当
 */
export const ActionPrompt: React.FC<ActionPromptProps> = ({
	categoryTitle,
	onSearch,
	onAskQuestion,
}) => {
	const [showQuestionInput, setShowQuestionInput] = useAtom(
		showQuestionInputAtom,
	);
	const [question, setQuestion] = useAtom(questionAtom);

	/**
	 * カテゴリに関するランダムな質問テキストを生成
	 * テスト用およびプレースホルダーとして使用
	 */
	const getRandomText = () => {
		const randomQuestions = [
			`${categoryTitle}について教えてください`,
			`${categoryTitle}の特徴は何ですか？`,
			`${categoryTitle}に関する最新情報を知りたいです`,
			`${categoryTitle}の利用方法について`,
			`${categoryTitle}に関する質問があります`,
		];
		const randomIndex = Math.floor(Math.random() * randomQuestions.length);
		return randomQuestions[randomIndex];
	};

	// 録音カスタムフックの使用
	const { isRecording, toggleRecording } = useVoiceRecording({
		onRecognizedText: (text) => setQuestion(text),
		getRandomText,
	});

	// 質問入力フォームの表示切り替え
	const handleQuestionClick = () => {
		setShowQuestionInput(true);
	};

	// 質問テキストの変更を処理
	const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setQuestion(e.target.value);
	};

	// 質問送信処理
	const handleSendQuestion = () => {
		const trimmedQuestion = question.trim();
		if (trimmedQuestion) {
			onAskQuestion(trimmedQuestion);
			// 質問送信後は入力をリセットしつつフォームは表示したままにする
			setQuestion("");
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
