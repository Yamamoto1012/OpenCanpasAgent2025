import { useCallback, useRef, useEffect } from "react";
import type { ChatInterfaceHandle } from "@/features/ChatInterface/ChatInterface";
import type { VRMWrapperHandle } from "@/features/VRM/VRMWrapper/VRMWrapper";
import { generateMockResponse } from "@/features/ChatInterface/generateMockResponse";

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
	const responseTimeoutRef = useRef<number | null>(null);

	// クリーンアップ関数
	useEffect(() => {
		// コンポーネントのアンマウント時にすべてのタイムアウトをクリア
		return () => {
			if (motionTimeoutRef.current !== null) {
				window.clearTimeout(motionTimeoutRef.current);
			}
			if (responseTimeoutRef.current !== null) {
				window.clearTimeout(responseTimeoutRef.current);
			}
		};
	}, []);

	// 質問処理ハンドラー
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const handleAskQuestion = useCallback(
		(question: string) => {
			console.log(
				"QuestionHandler: handleAskQuestion が呼び出されました",
				question,
			);

			try {
				// まずChatInterfaceにメッセージを追加（信頼性重視）
				if (chatInterfaceRef.current) {
					console.log(
						"QuestionHandler: ChatInterface の addMessage を呼び出します",
					);
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
				if (responseTimeoutRef.current !== null) {
					window.clearTimeout(responseTimeoutRef.current);
				}

				// VRMの思考モーションへ移行
				motionTimeoutRef.current = window.setTimeout(() => {
					if (vrmWrapperRef.current?.startThinking) {
						console.log(
							"QuestionHandler: VRMWrapper の startThinking を呼び出します",
						);
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

				// モック回答のための5秒タイマー（実際はバックエンドからのレスポンスで置き換え）
				responseTimeoutRef.current = window.setTimeout(() => {
					console.log("QuestionHandler: モック回答を表示します（5秒経過）");

					// 思考モーションから通常モーションに戻す
					if (vrmWrapperRef.current?.crossFadeAnimation) {
						vrmWrapperRef.current.crossFadeAnimation(
							"/Motion/StandingIdle.vrma",
						);
					}

					// モック回答をChatInterfaceに追加
					if (chatInterfaceRef.current) {
						const mockResponse = generateMockResponse(question);
						chatInterfaceRef.current.addMessage(mockResponse, false);
					}

					// タイムアウト完了後に参照をクリア
					responseTimeoutRef.current = null;
				}, 5000);
			} catch (error) {
				console.error("QuestionHandler: handleAskQuestion エラー:", error);
			}
		},
		[vrmWrapperRef, chatInterfaceRef, originalHandleAskQuestion],
	);

	return {
		handleAskQuestion,
	};
};
