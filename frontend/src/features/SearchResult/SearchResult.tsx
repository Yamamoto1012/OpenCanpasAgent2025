import type React from "react";
import { useRef, useEffect, useState } from "react";
import { useAtom } from "jotai";
import type { Category } from "../CategoryNagigator/components/CategoryCard";
import { SearchResultsView } from "./SearchResultsView";
import { inputValueAtom } from "./store/searchResultAtoms";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import type { VRMWrapperHandle } from "../VRM/VRMWrapper/VRMWrapper";
import { generateText } from "@/services/llmService";

type SearchResultsProps = {
	query: string;
	category?: Category;
	isQuestion?: boolean;
	onBack: () => void;
	onNewQuestion?: (question: string) => void;
	vrmWrapperRef?: React.RefObject<VRMWrapperHandle | null>;
};

export const SearchResults: React.FC<SearchResultsProps> = ({
	query,
	category,
	isQuestion = false,
	onBack,
	onNewQuestion,
	vrmWrapperRef,
}) => {
	const [inputValue, setInputValue] = useAtom(inputValueAtom);
	const inputRef = useRef<HTMLInputElement>(
		null,
	) as React.RefObject<HTMLInputElement>;
	const { speak } = useTextToSpeech(vrmWrapperRef);

	// LLMの返答
	const [responseText, setResponseText] = useState<string>("");
	const [detailText, setDetailText] = useState<string>("");
	const [loading, setLoading] = useState(false);

	// AIの返答
	const guideMessage = isQuestion
		? `${query}についてはこちらです。\n別の質問をしたい場合は、質問を入力してくださいね。`
		: `「${category?.title || ""}」についての情報はこちらです。\n別の質問をしたい場合は、質問を入力してくださいね。`;

	// 初回表示時やquery変更時にLLMへ問い合わせ
	useEffect(() => {
		if (!query) return;
		setLoading(true);
		generateText(query, category ? { category: category.title } : undefined)
			.then((res) => {
				setDetailText(res || "回答が取得できませんでした。");
				setResponseText(guideMessage);
				speak(guideMessage);
			})
			.finally(() => setLoading(false));
	}, [query, category, speak, guideMessage]);

	// 新しい質問を送信する処理
	const handleSendQuestion = async () => {
		if (inputValue.trim()) {
			setLoading(true);
			const newQuestion = inputValue.trim();
			const res = await generateText(
				newQuestion,
				category ? { category: category.title } : undefined,
			);
			setDetailText(res || "回答が取得できませんでした。");
			setResponseText(guideMessage);
			speak(guideMessage);
			setInputValue("");
			if (onNewQuestion) onNewQuestion(newQuestion);
			setLoading(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.nativeEvent.isComposing) return;
		if (e.key !== "Enter") return;
		handleSendQuestion();
	};

	const title = isQuestion
		? `「${query}」の回答`
		: `「${category?.title || ""}」の検索結果`;

	return (
		<SearchResultsView
			title={title}
			responseText={loading ? "回答を取得中です..." : responseText}
			detailText={detailText}
			inputValue={inputValue}
			onInputChange={handleInputChange}
			onKeyDown={handleKeyDown}
			onSendQuestion={handleSendQuestion}
			onBack={onBack}
			inputRef={inputRef}
		/>
	);
};
