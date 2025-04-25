import { useAtom } from "jotai";
import { ActionPromptView } from "./ActionPromtView";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { actionPromptStateAtom } from "./store/actionPromptAtoms";

type ActionPromptProps = {
	categoryTitle: string;
	onSearch: () => void;
	onAskQuestion: (question: string, answer?: string | null) => void;
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
	// ActionPromptの状態をまとめて管理するatom
	const [state, setState] = useAtom(actionPromptStateAtom);

	// 録音カスタムフックの使用
	const { isRecording, toggleRecording } = useVoiceRecording({
		onRecognizedText: (text) => setState({ question: text }),
	});

	// 質問入力フォームの表示切り替え
	const handleQuestionClick = () => {
		setState({ showQuestionInput: true });
	};

	// 質問テキストの変更処理
	const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setState({ question: e.target.value });
	};

	// 質問送信処理
	const handleSendQuestion = () => {
		const trimmedQuestion = state.question.trim();
		if (trimmedQuestion) {
			onAskQuestion(trimmedQuestion);
			setState({ question: "" });
		}
	};

	return (
		<ActionPromptView
			categoryTitle={categoryTitle}
			showQuestionInput={state.showQuestionInput}
			question={state.question}
			isRecording={isRecording}
			onQuestionClick={handleQuestionClick}
			onQuestionChange={handleQuestionChange}
			onSendQuestion={handleSendQuestion}
			onToggleRecording={toggleRecording}
			onSearch={onSearch}
		/>
	);
};
