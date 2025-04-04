"use client";
import type React from "react";
import { useState } from "react";
import { ActionPromptView } from "./ActionPromtView";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";

type ActionPromptProps = {
	categoryTitle: string;
	onSearch: () => void;
	onAskQuestion: (question: string) => void;
};

export const ActionPrompt: React.FC<ActionPromptProps> = ({
	categoryTitle,
	onSearch,
	onAskQuestion,
}) => {
	const [showQuestionInput, setShowQuestionInput] = useState(false);
	const [question, setQuestion] = useState("");

	// カテゴリに関するランダムなテキスト生成
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

	const handleQuestionClick = () => {
		setShowQuestionInput(true);
	};

	const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setQuestion(e.target.value);
	};

	const handleSendQuestion = () => {
		if (question.trim()) {
			onAskQuestion(question.trim());
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.nativeEvent.isComposing) {
			handleSendQuestion();
		}
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
