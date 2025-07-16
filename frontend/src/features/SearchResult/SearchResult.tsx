import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { buildPrompt, generateText } from "@/services/llmService";
import { currentLanguageAtom } from "@/store/languageAtoms";
import { useAtom } from "jotai";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Category } from "../CategoryNavigator/components/CategoryCard";
import { admissionAnswers } from "../CategoryNavigator/const/admissionAnswers";
import { archAnswers } from "../CategoryNavigator/const/archAnswers";
import { bioChemAnswers } from "../CategoryNavigator/const/bioChemAnswers";
import { bunriAnswers } from "../CategoryNavigator/const/bunriAnswers";
import { busAnswers } from "../CategoryNavigator/const/busAnswers";
import { careerAnswers } from "../CategoryNavigator/const/careerAnswers";
import { collabAnswers } from "../CategoryNavigator/const/collabAnswers";
import { curriculumAnswers } from "../CategoryNavigator/const/curriculumAnswers";
import { diningAnswers } from "../CategoryNavigator/const/diningAnswers";
import { dormAnswers } from "../CategoryNavigator/const/dormAnswers";
import { educationMethodAnswers } from "../CategoryNavigator/const/educationMethodAnswers";
import { engAnswers } from "../CategoryNavigator/const/engAnswers";
import { extracurricularAnswers } from "../CategoryNavigator/const/extracurricularAnswers";
import { globalAnswers } from "../CategoryNavigator/const/globalAnswers";
import { infoDesignAnswers } from "../CategoryNavigator/const/infoDesignAnswers";
import { infoTechAnswers } from "../CategoryNavigator/const/infoTechAnswers";
import { internAnswers } from "../CategoryNavigator/const/internAnswers";
import { kyousouAnswers } from "../CategoryNavigator/const/kyousouAnswers";
import { mediaInfoAnswers } from "../CategoryNavigator/const/mediaInfoAnswers";
import { researchAnswers } from "../CategoryNavigator/const/researchAnswers";
import { shakaijissouAnswers } from "../CategoryNavigator/const/shakaijissouAnswers";
import { supportAnswers } from "../CategoryNavigator/const/supportAnswers";
import { sxgxAnswers } from "../CategoryNavigator/const/sxgxAnswers";
import { tuitionAnswers } from "../CategoryNavigator/const/tuitionAnswers";
import type { VRMWrapperHandle } from "../VRM/VRMWrapper/VRMWrapper";
import { SearchResultsView } from "./SearchResultsView";
import { inputValueAtom } from "./store/searchResultAtoms";

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
	const [currentLanguage] = useAtom(currentLanguageAtom);
	const inputRef = useRef<HTMLInputElement>(
		null,
	) as React.RefObject<HTMLInputElement>;
	const { speak } = useTextToSpeech({ vrmWrapperRef });
	const prevGuideMessageRef = useRef<string>("");
	const { t } = useTranslation("search");
	const { t: tCategory } = useTranslation("category");

	// LLMの返答
	const [responseText, setResponseText] = useState<string>("");
	const [detailText, setDetailText] = useState<string>("");
	const [loading, setLoading] = useState(false);

	// AIの返答
	const guideMessage = isQuestion
		? t("infoForQuery", { query })
		: t("infoForCategory", {
				categoryTitle: category?.title ? tCategory(category.title) : "",
			});

	// 初回表示時やquery変更時にテンプレ回答 or LLMへ問い合わせ
	useEffect(() => {
		if (!category && !query) return;
		setLoading(true);

		const currentGuideMessage = isQuestion
			? t("infoForQuery", { query })
			: t("infoForCategory", {
					categoryTitle: category?.title ? tCategory(category.title) : "",
				});

		const guideChanged = prevGuideMessageRef.current !== currentGuideMessage;
		prevGuideMessageRef.current = currentGuideMessage;

		if (!isQuestion && category?.id) {
			// テンプレ回答を表示
			const template =
				getTemplateAnswer(category) || "このカテゴリの概要情報は準備中です。";
			setDetailText(template);
			setResponseText(currentGuideMessage);
			if (guideChanged) speak(currentGuideMessage);
			setLoading(false);
			return;
		}
		if (isQuestion && query) {
			const payloadQuery = buildPrompt(query);
			generateText(
				payloadQuery,
				undefined, // conversationId
				undefined, // signal
				"/api/llm/query", // endpoint
				currentLanguage, // language
			)
				.then((res) => {
					setDetailText(res || t("noAnswer"));
					setResponseText(currentGuideMessage);
					if (guideChanged) speak(currentGuideMessage);
				})
				.finally(() => setLoading(false));
		}
	}, [query, category, isQuestion, speak, currentLanguage, t, tCategory]);

	// 新しい質問を送信する処理
	const handleSendQuestion = async () => {
		if (inputValue.trim()) {
			setLoading(true);
			const newQuestion = inputValue.trim();
			const payloadQuery = buildPrompt(newQuestion);
			const res = await generateText(
				payloadQuery,
				undefined, // conversationId
				undefined, // signal
				"/api/llm/query", // endpoint
				currentLanguage, // language
			);
			setDetailText(res || t("noAnswer"));
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
		: `「${category?.title ? tCategory(category.title) : ""}」の検索結果`;

	return (
		<SearchResultsView
			title={title}
			responseText={loading ? t("retrievingAnswer") : responseText}
			detailText={detailText}
			inputValue={inputValue}
			onInputChange={handleInputChange}
			onSendQuestion={handleSendQuestion}
			onBack={onBack}
			inputRef={inputRef}
		/>
	);
};
