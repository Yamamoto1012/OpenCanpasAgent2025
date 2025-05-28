import type React from "react";
import { useRef, useEffect, useState } from "react";
import { useAtom } from "jotai";
import type { Category } from "../CategoryNavigator/components/CategoryCard";
import { SearchResultsView } from "./SearchResultsView";
import { inputValueAtom } from "./store/searchResultAtoms";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import type { VRMWrapperHandle } from "../VRM/VRMWrapper/VRMWrapper";
import { generateText } from "@/services/llmService";
import { archAnswers } from "../CategoryNavigator/const/archAnswers";
import { admissionAnswers } from "../CategoryNavigator/const/admissionAnswers";
import { diningAnswers } from "../CategoryNavigator/const/diningAnswers";
import { supportAnswers } from "../CategoryNavigator/const/supportAnswers";
import { dormAnswers } from "../CategoryNavigator/const/dormAnswers";
import { busAnswers } from "../CategoryNavigator/const/busAnswers";
import { extracurricularAnswers } from "../CategoryNavigator/const/extracurricularAnswers";
import { kyousouAnswers } from "../CategoryNavigator/const/kyousouAnswers";
import { bunriAnswers } from "../CategoryNavigator/const/bunriAnswers";
import { bioChemAnswers } from "../CategoryNavigator/const/bioChemAnswers";
import { careerAnswers } from "../CategoryNavigator/const/careerAnswers";
import { engAnswers } from "../CategoryNavigator/const/engAnswers";
import { globalAnswers } from "../CategoryNavigator/const/globalAnswers";
import { infoDesignAnswers } from "../CategoryNavigator/const/infoDesignAnswers";
import { infoTechAnswers } from "../CategoryNavigator/const/infoTechAnswers";
import { mediaInfoAnswers } from "../CategoryNavigator/const/mediaInfoAnswers";
import { researchAnswers } from "../CategoryNavigator/const/researchAnswers";
import { shakaijissouAnswers } from "../CategoryNavigator/const/shakaijissouAnswers";
import { sxgxAnswers } from "../CategoryNavigator/const/sxgxAnswers";
import { tuitionAnswers } from "../CategoryNavigator/const/tuitionAnswers";
import { collabAnswers } from "../CategoryNavigator/const/collabAnswers";
import { curriculumAnswers } from "../CategoryNavigator/const/curriculumAnswers";
import { educationMethodAnswers } from "../CategoryNavigator/const/educationMethodAnswers";
import { internAnswers } from "../CategoryNavigator/const/internAnswers";

type SearchResultsProps = {
	query: string;
	category?: Category;
	isQuestion?: boolean;
	onBack: () => void;
	onNewQuestion?: (question: string) => void;
	vrmWrapperRef?: React.RefObject<VRMWrapperHandle | null>;
};

const getTemplateAnswer = (category?: Category) => {
	if (!category) return undefined;
	// サブサブカテゴリID優先
	if (admissionAnswers[category.id ?? ""])
		return admissionAnswers[category.id ?? ""];
	if (archAnswers[category.id ?? ""]) return archAnswers[category.id ?? ""];
	if (bioChemAnswers[category.id ?? ""])
		return bioChemAnswers[category.id ?? ""];
	if (bunriAnswers[category.id ?? ""]) return bunriAnswers[category.id ?? ""];
	if (busAnswers[category.id ?? ""]) return busAnswers[category.id ?? ""];
	if (careerAnswers[category.id ?? ""]) return careerAnswers[category.id ?? ""];
	if (diningAnswers[category.id ?? ""]) return diningAnswers[category.id ?? ""];
	if (dormAnswers[category.id ?? ""]) return dormAnswers[category.id ?? ""];
	if (engAnswers[category.id ?? ""]) return engAnswers[category.id ?? ""];
	if (extracurricularAnswers[category.id ?? ""])
		return extracurricularAnswers[category.id ?? ""];
	if (globalAnswers[category.id ?? ""]) return globalAnswers[category.id ?? ""];
	if (infoDesignAnswers[category.id ?? ""])
		return infoDesignAnswers[category.id ?? ""];
	if (infoTechAnswers[category.id ?? ""])
		return infoTechAnswers[category.id ?? ""];
	if (kyousouAnswers[category.id ?? ""])
		return kyousouAnswers[category.id ?? ""];
	if (mediaInfoAnswers[category.id ?? ""])
		return mediaInfoAnswers[category.id ?? ""];
	if (researchAnswers[category.id ?? ""])
		return researchAnswers[category.id ?? ""];
	if (shakaijissouAnswers[category.id ?? ""])
		return shakaijissouAnswers[category.id ?? ""];
	if (supportAnswers[category.id ?? ""])
		return supportAnswers[category.id ?? ""];
	if (sxgxAnswers[category.id ?? ""]) return sxgxAnswers[category.id ?? ""];
	if (tuitionAnswers[category.id ?? ""])
		return tuitionAnswers[category.id ?? ""];
	if (collabAnswers[category.id ?? ""]) return collabAnswers[category.id ?? ""];
	if (curriculumAnswers[category.id ?? ""])
		return curriculumAnswers[category.id ?? ""];
	if (educationMethodAnswers[category.id ?? ""])
		return educationMethodAnswers[category.id ?? ""];
	if (internAnswers[category.id ?? ""]) return internAnswers[category.id ?? ""];
	return undefined;
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
	const { speak } = useTextToSpeech({ vrmWrapperRef });
	const prevGuideMessageRef = useRef<string>("");

	// LLMの返答
	const [responseText, setResponseText] = useState<string>("");
	const [detailText, setDetailText] = useState<string>("");
	const [loading, setLoading] = useState(false);

	// AIの返答
	const guideMessage = isQuestion
		? `${query}についてはこちらです。\n別の質問をしたい場合は、質問を入力してくださいね。`
		: `「${category?.title || ""}」についての情報はこちらです。\n別の質問をしたい場合は、質問を入力してくださいね。`;

	// 初回表示時やquery変更時にテンプレ回答 or LLMへ問い合わせ
	useEffect(() => {
		if (!category && !query) return;
		setLoading(true);

		const guideChanged = prevGuideMessageRef.current !== guideMessage;
		prevGuideMessageRef.current = guideMessage;

		if (!isQuestion && category?.id) {
			// テンプレ回答を表示
			const template =
				getTemplateAnswer(category) || "このカテゴリの概要情報は準備中です。";
			setDetailText(template);
			setResponseText(guideMessage);
			if (guideChanged) speak(guideMessage);
			setLoading(false);
			return;
		}
		if (isQuestion && query) {
			generateText(query, category ? { category: category.title } : undefined)
				.then((res) => {
					setDetailText(res || "回答が取得できませんでした。");
					setResponseText(guideMessage);
					if (guideChanged) speak(guideMessage);
				})
				.finally(() => setLoading(false));
		}
	}, [query, category, isQuestion, guideMessage, speak]);

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
			setInputValue("");
			if (onNewQuestion) onNewQuestion(newQuestion);
			setLoading(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
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
			onSendQuestion={handleSendQuestion}
			onBack={onBack}
			inputRef={inputRef}
		/>
	);
};
