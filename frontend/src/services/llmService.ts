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
};

type QueryResponse = {
	answer: string;
	metadata?: Record<string, unknown>;
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
 * LLM APIにテキストクエリを送信し、生成されたテキストを取得する
 * @param query ユーザーからの入力テキスト
 * @param context 必要に応じて追加のコンテキスト情報
 * @param signal APIリクエストを中止するためのAbortSingal
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
	try {
		const response = await fetch(`${API_BASE_URL}/llm${endpoint}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				query,
				context,
				language,
			} as QueryRequest),
			signal,
		});

		if (!response.ok) {
			// APIエラー時の処理
			if (retries > 0 && (response.status === 503 || response.status === 504)) {
				console.warn(
					`API一時利用不可 (${response.status})、${RETRY_DELAY / 1000}秒後に再試行します...残り${retries}回`,
				);
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

		const data: QueryResponse = await response.json();
		return data.answer;
	} catch (error) {
		// ネットワークエラーなどの場合も再試行
		if (retries > 0 && error instanceof TypeError) {
			console.warn(
				`ネットワークエラー、${RETRY_DELAY / 1000}秒後に再試行します...残り${retries}回`,
			);
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
		console.error("Error generating text:", error);
		throw error;
	}
};
