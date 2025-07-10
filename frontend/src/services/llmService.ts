/**
 * LLMサービスへのAPI呼び出しを管理するモジュール
 */

import type { SupportedLanguage } from "@/store/languageAtoms";

const API_BASE_URL = "http://localhost:8000";
const MAX_RETRIES = 3; // 最大再試行回数
const RETRY_DELAY = 1000; // 再試行間隔（ミリ秒）

type QueryRequest = {
	query: string;
	context?: Record<string, unknown>;
	language?: SupportedLanguage;
	stream?: boolean;
};

// ストリーミングレスポンスの型定義
type StreamChunk = {
	id: string;
	type: "start" | "content" | "done" | "error";
	content?: string;
	metadata?: Record<string, unknown>;
	timestamp: string;
};

/**
 * 言語設定に応じてプロンプトを構築する
 * @param query ユーザーからの入力テキスト
 * @param lang 言語設定 ('ja' | 'en')
 * @returns 言語に応じて加工されたプロンプト
 */
export const buildPrompt = (query: string, lang: "ja" | "en") =>
	lang === "en" ? `Please answer in English.\n\n${query}` : query;

/**
 * 指定した時間だけ待機する
 * @param ms 待機時間（ミリ秒）
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * ストリーミング対応のgenerateText関数
 * @param query ユーザーからの入力テキスト
 * @param context 必要に応じて追加のコンテキスト情報
 * @param signal APIリクエストを中止するためのAbortSignal
 * @param onChunk ストリーミングチャンクを受信した際のコールバック
 * @param endpoint APIのエンドポイント
 * @param language 応答言語
 * @returns 生成されたテキスト応答
 */
export async function generateTextStream(
	query: string,
	context?: Record<string, unknown>,
	signal?: AbortSignal,
	onChunk?: (chunk: StreamChunk) => void,
	endpoint = "/query",
	language?: SupportedLanguage,
): Promise<string> {
	const payload: QueryRequest = {
		query,
		context,
		language: language || "ja",
		stream: true,
	};

	try {
		// ストリーミング対応のAPIエンドポイントにリクエストを送信
		const response = await fetch(`${API_BASE_URL}/llm${endpoint}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
			signal,
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const reader = response.body?.getReader();
		const decoder = new TextDecoder();
		let fullText = "";
		let buffer = ""; // 不完全な行を保持するバッファ
		const processedChunkIds = new Set<string>(); // 処理済みチャンクIDを記録

		if (!reader) {
			throw new Error("Response body is not readable");
		}

		while (true) {
			const { done, value } = await reader.read();

			if (done) {
				// 最後にバッファに残っているデータを処理
				if (buffer.trim()) {
					try {
						const data: StreamChunk = JSON.parse(buffer);

						// 重複チェック
						if (data.id && processedChunkIds.has(data.id)) {
							// ignore duplicate chunk
						} else {
							if (data.id) processedChunkIds.add(data.id);

							if (data.type === "content" && data.content) {
								fullText += data.content;
								onChunk?.(data);
							} else if (data.type === "done") {
								onChunk?.(data);
							}
						}
					} catch {
						// ignore parse errors for final buffer
					}
				}
				break;
			}

			// 新しいチャンクをバッファに追加
			const chunk = decoder.decode(value, { stream: true });
			buffer += chunk;

			// 改行で分割して処理
			const lines = buffer.split("\n");

			// 最後の要素は不完全な可能性があるので、バッファに残す
			buffer = lines.pop() || "";

			for (const line of lines) {
				if (line.trim()) {
					try {
						const data: StreamChunk = JSON.parse(line);

						// デバッグログ

						// チャンクIDとコンテンツの組み合わせで重複チェック
						const chunkKey = `${data.id}_${data.content || ""}`;
						if (
							data.type === "content" &&
							data.content &&
							processedChunkIds.has(chunkKey)
						) {
							continue;
						}

						if (data.type === "content" && data.content) {
							processedChunkIds.add(chunkKey);

							// コンテンツの重複チェック（同じ内容が連続して来た場合）
							const lastContent = fullText.slice(-data.content.length);
							if (lastContent === data.content && data.content.length > 10) {
								continue;
							}

							fullText += data.content;
							onChunk?.(data);
						} else if (data.type === "error") {
							throw new Error(data.content || "Stream error");
						} else if (data.type === "done") {
							onChunk?.(data);
						}
					} catch {
						// ignore parse errors when parsing stream chunk
					}
				}
			}
		}

		return fullText;
	} catch (error) {
		if (error instanceof Error && error.name === "AbortError") {
			throw error;
		}
		throw new Error("Failed to generate response");
	}
}

/**
 * LLM APIにテキストクエリを送信し、生成されたテキストを取得する
 * @param query ユーザーからの入力テキスト
 * @param context 必要に応じて追加のコンテキスト情報
 * @param signal APIリクエストを中止するためのAbortSignal
 * @param retries 残りの再試行回数（内部使用）
 * @param endpoint APIのエンドポイント
 * @param language 応答言語
 * @returns 生成されたテキスト応答
 */
export const generateText = async (
	query: string,
	context?: Record<string, unknown>,
	signal?: AbortSignal,
	retries = MAX_RETRIES,
	endpoint = "/query",
	language?: SupportedLanguage,
): Promise<string> => {
	// 音声モードはストリーミング対応
	if (endpoint === "/voice_mode_answer") {
		const payload: QueryRequest = {
			query,
			context,
			language: language || "ja",
			stream: true,
		};

		try {
			const response = await fetch(`${API_BASE_URL}/llm${endpoint}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
				signal,
			});

			if (!response.ok) {
				if (
					retries > 0 &&
					(response.status === 503 || response.status === 504)
				) {
					await sleep(RETRY_DELAY);
					return generateText(
						query,
						context,
						signal,
						retries - 1,
						endpoint,
						language,
					);
				}
				throw new Error(`API error: ${response.status}`);
			}

			// ストリーミングレスポンスの処理
			const reader = response.body?.getReader();
			if (!reader) {
				throw new Error("Response body is not readable");
			}

			const decoder = new TextDecoder();
			let fullText = "";
			let buffer = ""; // 不完全なラインを保持するバッファ

			try {
				while (true) {
					const { done, value } = await reader.read();
					if (done) {
						// 残りのバッファを処理
						if (buffer.trim()) {
							if (buffer.startsWith("data:")) {
								try {
									const jsonData = buffer.substring(5).trim();
									const data = JSON.parse(jsonData);

									if (data.type === "content" && data.content) {
										fullText += data.content;
									}
								} catch {
									// ignore parse errors in final buffer
								}
							}
						}
						break;
					}

					const chunk = decoder.decode(value, { stream: true });
					buffer += chunk;

					// 改行で分割して処理
					const lines = buffer.split("\n");
					// 最後の要素は不完全な可能性があるので、バッファに残す
					buffer = lines.pop() || "";

					for (const line of lines) {
						const trimmedLine = line.trim();
						if (trimmedLine?.startsWith("data:")) {
							try {
								const jsonData = trimmedLine.substring(5).trim();
								const data = JSON.parse(jsonData);

								if (data.type === "content" && data.content) {
									fullText += data.content;
								} else if (data.type === "error") {
									throw new Error(data.content || "Server streaming error");
								}
							} catch {
								// ignore parse errors in streaming data
							}
						}
					}
				}
			} finally {
				reader.releaseLock();
			}

			return fullText;
		} catch (e) {
			if (retries > 0 && e instanceof TypeError) {
				await sleep(RETRY_DELAY);
				return generateText(
					query,
					context,
					signal,
					retries - 1,
					endpoint,
					language,
				);
			}
			throw e;
		}
	}

	// 通常モードはストリーミングを使用
	return generateTextStream(
		query,
		context,
		signal,
		undefined,
		endpoint,
		language,
	);
};
