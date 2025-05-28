/**
 * 音声関連のユーティリティ関数
 */

export type AudioFormat = "wav" | "mp3" | "ogg";

export type TTSRequest = {
	text: string;
	speakerId: number;
	format: AudioFormat;
};

export type AudioPlayerOptions = {
	autoplay?: boolean;
	volume?: number;
	loop?: boolean;
};

/**
 * TTS APIリクエストのバリデーション
 * @param request TTSリクエストオブジェクト
 * @returns エラーメッセージの配列
 */
export const validateTTSRequest = (request: Partial<TTSRequest>): string[] => {
	const errors: string[] = [];

	if (!request.text || request.text.trim().length === 0) {
		errors.push("テキストが入力されていません");
	}

	if (request.text && request.text.length > 1000) {
		errors.push("テキストが長すぎます（1000文字以内）");
	}

	if (
		request.speakerId &&
		(request.speakerId < 0 || !Number.isInteger(request.speakerId))
	) {
		errors.push("話者IDが無効です");
	}

	if (request.format && !["wav", "mp3", "ogg"].includes(request.format)) {
		errors.push("音声フォーマットが無効です");
	}

	return errors;
};

/**
 * TTS APIにリクエストを送信する
 * @param request TTSリクエストオブジェクト
 * @returns 音声ファイルのblob(バイナリデータ)
 */
export const requestTTS = async (request: TTSRequest): Promise<Blob> => {
	const errors = validateTTSRequest(request);
	if (errors.length > 0) {
		throw new Error(`バリデーションエラー: ${errors.join(", ")}`);
	}

	const response = await fetch("http://localhost:8000/tts", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			text: request.text,
			speaker_id: request.speakerId,
			format: request.format,
		}),
	});

	if (!response.ok) {
		const errorText = await response.text().catch(() => "Unknown error");
		throw new Error(`TTS APIエラー: ${response.status} - ${errorText}`);
	}

	return response.blob();
};

/**
 * 音声ファイルの推定再生時間を計算する
 * @param text 音声かしたいテキスト
 * @return 推定時間（ミリ秒）
 */
export const estimateAudioDuration = (text: string): number => {
	// 日本語の場合、1文字約200ms + バッファ
	const baseMs = text.length * 200;
	const bufferMs = 1000; // 1秒のバッファ
	return baseMs + bufferMs;
};

/**
 * HTMLAudioElementを作成する
 * @param src 音声ファイルのURL
 * @param options オプション設定
 * @returns 作成されたHTMLAudioElement
 */
export const createAudioElement = (
	src: string,
	options: AudioPlayerOptions = {},
): HTMLAudioElement => {
	const audio = new Audio(src);

	if (options.autoplay !== undefined) {
		audio.autoplay = options.autoplay;
	}

	if (options.volume !== undefined) {
		audio.volume = Math.max(0, Math.min(1, options.volume));
	}

	if (options.loop !== undefined) {
		audio.loop = options.loop;
	}

	return audio;
};

/**
 * Object URLのクリーンアップを行う
 * @param url クリーンアップするObject URL
 * @returns void
 */
export const revokeObjectURL = (url: string): void => {
	try {
		URL.revokeObjectURL(url);
	} catch (error) {
		console.warn("Object URL revoke error:", error);
	}
};

/**
 * Blobから音声URLを作成する
 * @param blob 音声ファイルのBlobオブジェクト
 * @returns 作成された音声URL
 */
export const createAudioURL = (blob: Blob): string => {
	return URL.createObjectURL(blob);
};
