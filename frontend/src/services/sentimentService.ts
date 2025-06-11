/**
 * 感情分析APIサービス
 */
import type { SentimentRequest, SentimentResponse } from "../types/sentiment";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

class SentimentService {
	private baseUrl: string;

	constructor() {
		this.baseUrl = API_BASE_URL;
	}

	/**
	 * テキストの感情分析を実行するチュウ!!
	 */
	async analyzeSentiment(text: string): Promise<SentimentResponse> {
		const requestData: SentimentRequest = { text };

		try {
			const response = await fetch(`${this.baseUrl}/sentiment`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestData),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(
					errorData.detail ||
						`感情分析APIエラー: ${response.status} ${response.statusText}`,
				);
			}

			const result: SentimentResponse = await response.json();

			// レスポンスデータの検証
			if (typeof result.score !== "number" || !result.category) {
				throw new Error("不正なレスポンス形式");
			}

			return result;
		} catch (error) {
			if (error instanceof Error) {
				throw error;
			}
			throw new Error("感情分析中に予期しないエラーが発生しました");
		}
	}

	/**
	 * ヘルスチェック（API接続確認）
	 */
	async checkHealth(): Promise<boolean> {
		try {
			const response = await fetch(`${this.baseUrl}/health`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});
			return response.ok;
		} catch {
			return false;
		}
	}
}

// シングルトンインスタンス
export const sentimentService = new SentimentService();

export default sentimentService;
