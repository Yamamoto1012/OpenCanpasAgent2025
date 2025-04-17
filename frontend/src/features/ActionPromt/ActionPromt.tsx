import { useAtom } from "jotai";
import { ActionPromptView } from "./ActionPromtView";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { actionPromptStateAtom } from "./store/actionPromptAtoms";
import { generateText } from "@/services/llmService";
import { toast } from "sonner";

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
	const handleSendQuestion = async () => {
		const trimmedQuestion = state.question.trim();
		if (trimmedQuestion) {
			try {
				const context = { category: categoryTitle };
				const llmResponse = await generateText(trimmedQuestion, context);
				onAskQuestion(trimmedQuestion, llmResponse);
				setState({ question: "" });
			} catch (error) {
				// エラーメッセージをトースト通知で表示
				toast.error(
					"応答の生成中にエラーが発生しました。もう一度お試しください。",
					{
						duration: 3000,
						position: "bottom-right",
					},
				);
				onAskQuestion(trimmedQuestion, null);
				setState({ question: "" });
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
			showQuestionInput={state.showQuestionInput}
			question={state.question}
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
