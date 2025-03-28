"use client";
import type React from "react";
import { useState } from "react";
import { ActionPromptView } from "./ActionPromtView";

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
			onQuestionClick={handleQuestionClick}
			onQuestionChange={handleQuestionChange}
			onQuestionKeyDown={handleKeyDown}
			onSendQuestion={handleSendQuestion}
			onSearch={onSearch}
		/>
	);
};
