"use client";
import type React from "react";
import { useState, useRef } from "react";
import type { Category } from "../CategoryNagigator/components/CategoryCard";
import { SearchResultsView } from "./SearchResultsView";

type SearchResultsProps = {
	query: string;
	category?: Category;
	isQuestion?: boolean;
	onBack: () => void;
};

export const SearchResults: React.FC<SearchResultsProps> = ({
	query,
	category,
	isQuestion = false,
	onBack,
}) => {
	// ロジックと状態管理を担当
	const [inputValue, setInputValue] = useState("");
	const inputRef = useRef<HTMLInputElement>(
		null,
	) as React.RefObject<HTMLInputElement>;

	// AIからの回答テキスト（実際のアプリではAPIから取得）
	const mockResponse = isQuestion
		? `${query}についてはこちらです。\n別の質問をしたい場合は、質問を入力してくださいね。`
		: `「${category?.title || ""}」についての情報はこちらです。\n別の質問をしたい場合は、質問を入力してくださいね。`;

	// 詳細情報（実際のアプリではAPIから取得）
	const mockDetails = isQuestion
		? `SX・GX・DXは持続可能な社会への変革を表す3つの概念です。

SX（サステナビリティ・トランスフォーメーション）
・環境保全を重視した経営変革
・社会課題解決と企業価値向上の両立
・長期的な持続可能性を追求する取り組み

GX（グリーン・トランスフォーメーション）
・脱炭素社会実現に向けた産業変革
・再生可能エネルギーへの転換促進
・環境負荷低減技術の開発と普及

DX（デジタル・トランスフォーメーション）
・デジタル技術による業務・組織の変革
・AIやIoTなどの先端技術活用
・新たな価値創造とビジネスモデル革新

KITでは、これら3つの変革を統合的に推進し、次世代の社会課題解決に貢献できる人材育成を目指しています。`
		: `「${category?.title || ""}」に関する情報：

KITでは、SX・GX・DXの3つの変革を重点的に推進しています。

・文理融合型の教育プログラム
・産学連携による実践的な学び
・最先端技術を活用した研究活動
・持続可能な社会の実現に向けた取り組み

詳細については、各分野別の情報をご覧ください。`;

	// タイトル生成
	const title = isQuestion
		? `「${query}」の回答`
		: `「${category?.title || ""}」の検索結果`;

	// 新しい質問を送信する処理
	const handleSendQuestion = () => {
		if (inputValue.trim()) {
			// 実際のアプリではここでAPIリクエストを行う
			console.log("新しい質問:", inputValue);
			setInputValue("");
		}
	};

	// 入力値の変更を処理
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
	};

	// キーボードイベント処理
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.nativeEvent.isComposing) {
			handleSendQuestion();
		}
	};

	return (
		<SearchResultsView
			title={title}
			responseText={mockResponse}
			detailText={mockDetails}
			inputValue={inputValue}
			onInputChange={handleInputChange}
			onKeyDown={handleKeyDown}
			onSendQuestion={handleSendQuestion}
			onBack={onBack}
			inputRef={inputRef}
		/>
	);
};
