import { ChatInterfaceView } from "./ChatInterfaceView";
import { ChatMobileView } from "./ChatMobileView";

import { useAtom, useSetAtom } from "jotai";
import type { ChangeEvent, KeyboardEvent } from "react";
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { useTranslation } from "react-i18next";

import {
	type Message,
	addMessageAtom,
	addMessageWithIdAtom,
	audioStreamingStateAtom,
	messagesAtom,
	resetChatAtom,
	startAudioStreamingAtom,
	stopAudioStreamingAtom,
	updateAudioStreamingStateAtom,
	updateMessageAtom,
} from "../../store/chatAtoms";
import { currentLanguageAtom } from "../../store/languageAtoms";
import {
	isRecordingAtom,
	toggleRecordingAtom,
} from "../../store/recordingAtoms";

import { useResponsive } from "../../hooks/useResponsive";
import { useSentiment } from "../../hooks/useSentiment";
import { useStreamingTTS } from "../../hooks/useStreamingTTS";
import { useTextToSpeech } from "../../hooks/useTextToSpeech";

import { buildPrompt, generateTextStream } from "../../services/llmService";

import { AudioMutexManager } from "../../lib/AudioMutexManager";
import { createSentenceDetector } from "../../lib/sentenceDetection";
import type { VRMWrapperHandle } from "../VRM/VRMWrapper/VRMWrapper";

export type ChatInterfaceProps = {
	vrmWrapperRef?: React.RefObject<VRMWrapperHandle | null>;
};

export type ChatInterfaceHandle = {
	sendMessage: (message: string) => void;
	stopGeneration: () => void;
};

/**
 * @param props - チャットインターフェースのプロパティ
 * @param ref - 外部からの参照を受け取るためのref
 */

export const ChatInterface = forwardRef<
	ChatInterfaceHandle,
	React.PropsWithChildren<ChatInterfaceProps>
>((props, ref) => {
	const { isMobile } = useResponsive();
	const [messages, setMessages] = useAtom(messagesAtom);
	const [currentLanguage] = useAtom(currentLanguageAtom);
	const [audioStreamingState] = useAtom(audioStreamingStateAtom);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isRecording] = useAtom(isRecordingAtom);
	const toggleRecording = useSetAtom(toggleRecordingAtom);
	const addMessage = useSetAtom(addMessageAtom);
	const addMessageWithId = useSetAtom(addMessageWithIdAtom);
	const updateMessage = useSetAtom(updateMessageAtom);
	const resetChat = useSetAtom(resetChatAtom);
	const startAudioStreaming = useSetAtom(startAudioStreamingAtom);
	const stopAudioStreaming = useSetAtom(stopAudioStreamingAtom);
	const updateAudioStreamingState = useSetAtom(updateAudioStreamingStateAtom);
	const { t } = useTranslation("chat");

	// タイプライター風表示のためのバッファとアニメーション制御
	const streamBuffer = useRef("");
	const isAnimating = useRef(false);
	const lastMessageId = useRef<number | null>(null);
	// 重複検出用の変数
	const currentDisplayText = useRef("");

	// ストリーミングTTS関連フック
	const streamingTTS = useStreamingTTS({
		vrmWrapperRef: props.vrmWrapperRef,
		splitPattern: /[。！？\n]/,
		maxQueueSize: 20,
	});

	// 従来のTTSフック（フォールバック用）
	const { speak, stop } = useTextToSpeech({
		vrmWrapperRef: props.vrmWrapperRef,
	});

	// 感情分析フック
	const { analyzeSentiment } = useSentiment({
		enabled: true,
		enableDebugLogging: true,
	});

	const messagesEndRef = useRef<HTMLDivElement>(null);

	// 音声再生の排他制御用フラグ
	const isAnyAudioPlayingRef = useRef<boolean>(false);
	const currentAudioTypeRef = useRef<"streaming" | "traditional" | null>(null);

	// 1文字ずつテキストを更新するアニメーションループ
	const animateText = useCallback(() => {
		if (!isAnimating.current || streamBuffer.current.length === 0) {
			isAnimating.current = false;
			return;
		}

		const char = streamBuffer.current.substring(0, 1);
		streamBuffer.current = streamBuffer.current.substring(1);
		currentDisplayText.current += char;

		setMessages((prev) =>
			prev.map((msg) =>
				msg.id === lastMessageId.current
					? { ...msg, text: currentDisplayText.current }
					: msg,
			),
		);

		// アニメーション速度
		setTimeout(() => {
			requestAnimationFrame(animateText);
		}, 30);
	}, [setMessages]);

	// 音声停止処理を統一する関数
	const stopAllAudio = useCallback(() => {
		// 従来のTTSを停止
		stop();
		// ストリーミングTTSを停止
		streamingTTS.stopStreaming();
		// オーディオストリーミング状態を停止
		stopAudioStreaming();

		// 排他制御フラグをリセット
		isAnyAudioPlayingRef.current = false;
		currentAudioTypeRef.current = null;
	}, [stop, streamingTTS, stopAudioStreaming]);

	// ストリーミング音声を安全に開始する関数
	const startStreamingAudioSafely = useCallback(
		(messageId: number) => {
			// 既存の音声を停止
			if (isAnyAudioPlayingRef.current) {
				stopAllAudio();
			}

			// ストリーミング音声を開始
			startAudioStreaming(messageId);
			streamingTTS.clearQueue();
			streamingTTS.startStreaming();

			// 排他制御フラグを設定
			isAnyAudioPlayingRef.current = true;
			currentAudioTypeRef.current = "streaming";
		},
		[stopAllAudio, startAudioStreaming, streamingTTS],
	);

	// 従来のTTSを安全に開始する関数
	const speakSafely = useCallback(
		(text: string) => {
			// 既存の音声を停止
			if (isAnyAudioPlayingRef.current) {
				stopAllAudio();
			}

			// 従来のTTSを開始
			speak(text);

			// 排他制御フラグを設定
			isAnyAudioPlayingRef.current = true;
			currentAudioTypeRef.current = "traditional";
		},
		[stopAllAudio, speak],
	);

	// メッセージIDを採番
	const messageIdCounter = useRef(0);
	const createId = () => {
		messageIdCounter.current += 1;
		return Date.now() * 1000 + messageIdCounter.current;
	};

	// メッセージ送信中断用のref
	const abortRef = useRef<AbortController | null>(null);

	// 重複実行防止フラグ
	const isGeneratingRef = useRef(false);

	// メッセージを入れる
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const pushMessage = useCallback(
		(msg: {
			text: string;
			isUser: boolean;
			speakText?: string;
			isStreaming?: boolean;
		}) => {
			const enriched = { ...msg, id: createId() };
			addMessage(enriched);

			// AIの返答の場合は感情分析を実行
			if (!enriched.isUser && enriched.text && !enriched.isStreaming) {
				analyzeSentiment(enriched.text);
			}

			// 従来のTTS再生（ストリーミング中でない場合のみ）
			// 複数の条件をチェックして重複再生を防ぐ
			if (!enriched.isUser && enriched.speakText && !enriched.isStreaming) {
				// 以下のすべての条件をクリアした場合のみ従来のTTSを使用
				const isStreamingNotActive = !audioStreamingState.isStreamingActive;
				const isNotCurrentlyStreaming =
					currentAudioTypeRef.current !== "streaming";
				const hasValidSpeakText =
					enriched.speakText && enriched.speakText.trim().length > 0;

				if (
					isStreamingNotActive &&
					isNotCurrentlyStreaming &&
					hasValidSpeakText
				) {
					speakSafely(enriched.speakText);
				}
			}
		},
		[addMessage, speakSafely, analyzeSentiment], // 排他制御機能を含む安全な音声再生を使用
	);

	// 外部から呼び出し可能なメソッドを定義
	useImperativeHandle(ref, () => ({
		sendMessage: (text: string) => pushMessage({ text, isUser: true }),
		stopGeneration: () => {
			abortRef.current?.abort();
			stopAllAudio();
			setIsLoading(false);
			// タイプライターアニメーションも停止
			isAnimating.current = false;
			streamBuffer.current = "";
			currentDisplayText.current = "";
		},
	}));

	// メッセージ更新時のスクロール処理
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		// 入力欄からの値更新
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages.length]);

	// 入力欄の値が変わったとき
	const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		setInput(e.target.value);
	};

	// メッセージ送信処理（タイプライター風表示対応）
	const handleSend = async () => {
		const trimmed = input.trim();
		if (!trimmed) return;

		// 重複実行防止チェック
		if (isGeneratingRef.current) {
			console.warn("handleSend already in progress, skipping duplicate call");
			return;
		}

		// 実行フラグを設定
		isGeneratingRef.current = true;

		// ユーザーメッセージを追加
		pushMessage({ text: trimmed, isUser: true });

		// 既存の処理を中断
		if (abortRef.current) {
			abortRef.current.abort();
		}

		// 新しいコントローラーを作成
		const controller = new AbortController();
		abortRef.current = controller;

		// 思考中状態に設定
		setIsLoading(true);

		// AIメッセージのIDを事前に生成
		const aiMessageId = createId();
		lastMessageId.current = aiMessageId; // メッセージIDを保存

		// 表示テキストと重複検出変数をリセット
		currentDisplayText.current = "";
		streamBuffer.current = "";

		// 既存メッセージとの重複チェック
		const existingMessage = messages.find((m) => m.id === aiMessageId);
		if (existingMessage) {
			isGeneratingRef.current = false;
			return;
		}

		// AIメッセージのプレースホルダーを追加
		const aiMessage: Message = {
			id: aiMessageId,
			text: "",
			isUser: false,
			isStreaming: true,
		};

		// メッセージを直接追加
		addMessageWithId(aiMessage);

		// ストリーミング音声の準備（排他制御付き）
		startStreamingAudioSafely(aiMessageId);

		try {
			const payloadQuery = buildPrompt(trimmed, currentLanguage);
			let accumulatedText = "";
			let lastProcessedForTTS = 0;
			const processedSentences = new Set<string>();

			// 改善された文検出器を初期化
			const sentenceDetector = createSentenceDetector({
				sentenceDelimiter: /[。！？\n]/,
				minSentenceLength: 3, // 最小文字数を3に減らす
				prefetchTrigger: 0.7, // 文の70%完成時点で先読み音声生成開始
			});

			await generateTextStream(
				payloadQuery,
				undefined,
				controller.signal,
				(chunk) => {
					if (chunk.type === "content" && chunk.content) {
						// 既に受信したテキスト全体を含むチャンクの場合はスキップ
						if (
							accumulatedText.length > 0 &&
							chunk.content.includes(accumulatedText)
						) {
							console.warn(
								`完全なテキストを含むチャンクを検出してスキップ: "${chunk.content.substring(0, 50)}..."`,
							);
							return;
						}

						// 現在の累積テキストの末尾と新しいチャンクの内容を比較
						if (accumulatedText.endsWith(chunk.content)) {
							console.log(
								`既に追加済みのコンテンツをスキップ: "${chunk.content.substring(0, 30)}..."`,
							);
							return;
						}

						let newContent = chunk.content;

						// チャンクレベルでの重複検出（部分的な重複）
						if (accumulatedText.length > 10 && newContent.length > 0) {
							// 累積テキストの末尾と新しいコンテンツの先頭で重複をチェック
							const checkLength = Math.min(
								accumulatedText.length,
								newContent.length,
								50,
							);
							for (let i = checkLength; i > 0; i--) {
								const endOfAccumulated = accumulatedText.slice(-i);
								if (newContent.startsWith(endOfAccumulated)) {
									console.log(`部分的な重複を検出: "${endOfAccumulated}"`);
									newContent = newContent.substring(i);
									break;
								}
							}
						}

						// 空のコンテンツはスキップ
						if (!newContent) {
							return;
						}

						accumulatedText += newContent;

						// タイプライターアニメーション用のバッファに追加
						streamBuffer.current += newContent;
						if (!isAnimating.current) {
							isAnimating.current = true;
							animateText();
						}

						// 音声生成用の処理（TTSのための文検出）
						const textForTTS = accumulatedText.substring(lastProcessedForTTS);
						if (textForTTS) {
							const detectionResult = sentenceDetector.addChunk(textForTTS);

							// 完成した文を音声キューに追加
							for (const sentence of detectionResult.completeSentences) {
								const trimmedSentence = sentence.trim();
								if (
									trimmedSentence &&
									!processedSentences.has(trimmedSentence)
								) {
									processedSentences.add(trimmedSentence);
									streamingTTS.addToQueue(trimmedSentence);
									updateAudioStreamingState({
										queuedMessageIds: [
											...audioStreamingState.queuedMessageIds,
											aiMessageId,
										],
									});
								}
							}

							lastProcessedForTTS = accumulatedText.length;
						}
					} else if (chunk.type === "done") {
						// 重複チェック（文章全体が2回繰り返されている場合）
						const halfLength = Math.floor(accumulatedText.length / 2);
						if (accumulatedText.length % 2 === 0 && halfLength > 10) {
							const firstHalf = accumulatedText.substring(0, halfLength);
							const secondHalf = accumulatedText.substring(halfLength);
							if (firstHalf === secondHalf) {
								accumulatedText = firstHalf;

								// バッファの内容も調整
								const currentBufferLength = streamBuffer.current.length;
								const currentDisplayLength = currentDisplayText.current.length;
								const totalLength = currentDisplayLength + currentBufferLength;

								if (totalLength > halfLength) {
									// 表示済みとバッファの合計が半分を超えている場合
									const excess = totalLength - halfLength;
									if (excess >= currentBufferLength) {
										// バッファを完全にクリア
										streamBuffer.current = "";
									} else {
										// バッファから超過分を削除
										streamBuffer.current = streamBuffer.current.substring(
											0,
											currentBufferLength - excess,
										);
									}
								}
							}
						}

						// 残りのテキストを音声処理
						const finalSentences = sentenceDetector.finalize();
						for (const sentence of finalSentences) {
							const trimmedSentence = sentence.trim();
							if (trimmedSentence && !processedSentences.has(trimmedSentence)) {
								processedSentences.add(trimmedSentence);
								streamingTTS.addToQueue(trimmedSentence);
							}
						}

						// アニメーション完了を待ってからメッセージを完了状態に更新
						const waitForAnimation = () => {
							if (isAnimating.current || streamBuffer.current.length > 0) {
								setTimeout(waitForAnimation, 100);
								return;
							}

							// メッセージを完了状態に更新
							updateMessage({
								id: aiMessageId,
								updates: {
									isStreaming: false,
									speakText: undefined,
								},
							});
						};

						waitForAnimation();

						setIsLoading(false);
						// 感情分析を実行
						analyzeSentiment(accumulatedText);

						// 実行フラグをリセット
						isGeneratingRef.current = false;

						// AudioMutexManager を使った改善されたフォールバック処理
						let fallbackExecuted = false;
						const audioMutex = AudioMutexManager.getInstance();

						const fallbackTimer = setTimeout(() => {
							if (fallbackExecuted) return;

							const currentState = streamingTTS.state;
							const streamingState = {
								isStreamingStarted: currentState.isStreamingStarted,
								isPlaying: currentState.isPlaying,
								isGenerating: currentState.isGenerating,
								hasQueue: currentState.queue.length > 0,
							};

							if (
								audioMutex.shouldAllowFallback(streamingState) &&
								accumulatedText.trim()
							) {
								fallbackExecuted = true;
								console.warn(
									"ストリーミング音声が開始されませんでした。従来のTTSを使用します。",
								);

								audioMutex
									.playAudio("traditional", "fallback", async () => {
										await speak(accumulatedText);
									})
									.catch((error) => {
										console.error("フォールバック音声再生エラー:", error);
									});
							} else {
								console.log(
									"ストリーミング音声が正常に動作中、またはフォールバック不要です。",
								);
								fallbackExecuted = true;
							}
						}, 5000);

						// クリーンアップ時にタイマーをクリア
						abortRef.current?.signal.addEventListener("abort", () => {
							clearTimeout(fallbackTimer);
							fallbackExecuted = true;
						});
					}
				},
				"/query",
				currentLanguage,
			);
		} catch (err) {
			// エラー時はすべての音声を停止
			stopAllAudio();
			isAnimating.current = false;
			streamBuffer.current = "";
			currentDisplayText.current = "";

			if (err instanceof Error && err.name === "AbortError") {
				updateMessage({
					id: aiMessageId,
					updates: {
						text: t("generationStopped"),
						isStreaming: false,
					},
				});
			} else {
				console.error("テキスト生成エラー:", err);
				setIsLoading(false);
				updateMessage({
					id: aiMessageId,
					updates: {
						text: t("errorGeneratingResponse"),
						isStreaming: false,
					},
				});
			}
		} finally {
			// 実行フラグを必ずリセット
			isGeneratingRef.current = false;
		}
		setInput("");
	};

	// Enter キー送信
	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
			e.preventDefault();
			handleSend();
		}
	};

	// 候補テキスト選択時の処理
	const handleSelect = (value: string) => {
		setInput((prev) => prev + value);
	};

	// チャットリセット処理
	const handleReset = () => {
		resetChat();
		// バッファとカウンターもリセット
		streamBuffer.current = "";
		currentDisplayText.current = "";
		isAnimating.current = false;
	};

	// 音声録音のトグル
	const handleToggleRecording = () => {
		toggleRecording((recognizedText: string) => {
			if (recognizedText) {
				setInput(recognizedText);
			}
		});
	};

	// 共通のprops
	const commonProps = {
		messages,
		inputValue: input,
		isThinking: isLoading,
		isRecording,
		onInputChange: handleInputChange,
		onKeyDown: handleKeyDown,
		onSend: handleSend,
		onToggleRecording: handleToggleRecording,
		messagesEndRef,
	};

	// デスクトップ専用のprops
	const desktopProps = {
		...commonProps,
		onSelect: handleSelect,
		onReset: handleReset,
		onStop: () => {
			abortRef.current?.abort();
			stopAllAudio();
			setIsLoading(false);
			isAnimating.current = false;
			streamBuffer.current = "";
			currentDisplayText.current = "";
		},
	};

	// デバイスに応じて適切なViewを選択
	return isMobile ? (
		<ChatMobileView {...commonProps} />
	) : (
		<ChatInterfaceView {...desktopProps} />
	);
});
