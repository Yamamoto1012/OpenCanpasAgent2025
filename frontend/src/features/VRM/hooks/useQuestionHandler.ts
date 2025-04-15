import { useCallback, useRef, useEffect } from "react";
import type { ChatInterfaceHandle } from "@/features/ChatInterface/ChatInterface";
import type { VRMWrapperHandle } from "@/features/VRM/VRMWrapper/VRMWrapper";
import { generateText } from "@/services/llmService";

type UseQuestionHandlerProps = {
	vrmWrapperRef: React.RefObject<VRMWrapperHandle | null>;
	chatInterfaceRef: React.RefObject<ChatInterfaceHandle | null>;
	originalHandleAskQuestion: (question: string) => void;
};

export const useQuestionHandler = ({
	vrmWrapperRef,
	chatInterfaceRef,
	originalHandleAskQuestion,
}: UseQuestionHandlerProps) => {
	// タイムアウトIDを保存するための参照を作成
	const motionTimeoutRef = useRef<number | null>(null);

	// クリーンアップ関数
	useEffect(() => {
		// コンポーネントのアンマウント時にすべてのタイムアウトをクリア
		return () => {
			if (motionTimeoutRef.current !== null) {
				window.clearTimeout(motionTimeoutRef.current);
			}
		};
	}, []);

	// 質問処理ハンドラー
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const handleAskQuestion = useCallback(
		(question: string) => {
			try {
				// まずChatInterfaceにメッセージを追加（信頼性重視）
				if (chatInterfaceRef.current) {
					chatInterfaceRef.current.addMessage(
						"検索しますね！少々お待ちください。",
						false,
					);
				} else {
					console.warn(
						"QuestionHandler: ChatInterface の ref が見つかりません",
					);
				}

				// 既存のタイムアウトがあれば解除
				if (motionTimeoutRef.current !== null) {
					window.clearTimeout(motionTimeoutRef.current);
				}

				// VRMの思考モーションへ移行
				motionTimeoutRef.current = window.setTimeout(() => {
					if (vrmWrapperRef.current?.startThinking) {
						vrmWrapperRef.current.startThinking();
					} else if (vrmWrapperRef.current?.crossFadeAnimation) {
						// フォールバック：直接モーション変更を試みる
						console.warn("QuestionHandler: 代替手段でモーション変更を試みます");
						vrmWrapperRef.current.crossFadeAnimation("/Motion/Thinking.vrma");
					} else {
						console.warn(
							"QuestionHandler: VRMWrapper の機能にアクセスできません",
						);
					}
					// タイムアウト完了後に参照をクリア
					motionTimeoutRef.current = null;
				}, 100);

				originalHandleAskQuestion(question);

				// LLM APIを呼び出して回答を取得
				(async () => {
					try {
						// LLM APIから回答を取得
						const apiResponse = await generateText(question);

						// 思考モーションから通常モーションに戻す
						if (vrmWrapperRef.current?.crossFadeAnimation) {
							vrmWrapperRef.current.crossFadeAnimation(
								"/Motion/StandingIdle.vrma",
							);
						}

						// API応答をChatInterfaceに追加
						if (chatInterfaceRef.current) {
							chatInterfaceRef.current.addMessage(
								apiResponse,
								false,
								apiResponse, // 音声合成用のテキストも同じものを使用
							);
						}

						// 思考状態を明示的に終了
						if (vrmWrapperRef.current?.stopThinking) {
							vrmWrapperRef.current.stopThinking();
						} else {
							console.warn("QuestionHandler: stopThinking関数が利用できません");
						}
					} catch (responseError) {
						console.error(
							"QuestionHandler: API応答取得中にエラー:",
							responseError,
						);

						// エラー時は汎用メッセージを表示
						if (chatInterfaceRef.current) {
							const errorMessage =
								"申し訳ありません、応答の取得中に問題が発生しました。もう一度お試しください。";
							chatInterfaceRef.current.addMessage(errorMessage, false);
						}

						// エラー発生時も必ず思考状態を解除
						if (vrmWrapperRef.current?.stopThinking) {
							vrmWrapperRef.current.stopThinking();
						}

						// 通常モーションに戻す
						if (vrmWrapperRef.current?.crossFadeAnimation) {
							vrmWrapperRef.current.crossFadeAnimation(
								"/Motion/StandingIdle.vrma",
							);
						}
					}
				})();
			} catch (error) {
				console.error("QuestionHandler: handleAskQuestion エラー:", error);
				// 主要エラー時も念のため思考状態を解除
				if (vrmWrapperRef.current?.stopThinking) {
					vrmWrapperRef.current.stopThinking();
				}
			}
		},
		[vrmWrapperRef, chatInterfaceRef, originalHandleAskQuestion],
	);

	return {
		handleAskQuestion,
	};
};
