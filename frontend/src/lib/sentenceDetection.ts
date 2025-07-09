/**
 * 文検出と文バッファリングのためのユーティリティ関数
 */

export type SentenceDetectionConfig = {
	/** 文の区切り文字パターン */
	sentenceDelimiter: RegExp;
	/** 最小文長（文字数） */
	minSentenceLength: number;
	/** 先読み音声生成の閾値（0.0-1.0） */
	prefetchTrigger: number;
};

export type SentenceDetectionResult = {
	/** 完成された文の配列 */
	completeSentences: string[];
	/** 残りの不完全なテキスト */
	remainingText: string;
	/** 最後の文の完成度（0.0-1.0） */
	completeness: number;
	/** 先読み音声生成が必要かどうか */
	shouldStartPrefetch: boolean;
};

export type SentenceDetectorState = {
	buffer: string;
	lastProcessedIndex: number;
	remainingText: string;
};

export type SentenceDetectorInstance = {
	addChunk: (chunk: string) => SentenceDetectionResult;
	reset: () => void;
	finalize: () => string[];
	getState: () => SentenceDetectorState;
};

/**
 * 文の完成度を予測計算する純粋関数
 * @param text - 判定対象のテキスト
 * @param minSentenceLength - 最小文長
 * @returns 完成度（0.0-1.0）
 */
const calculateCompleteness = (
	text: string,
	minSentenceLength: number,
): number => {
	if (!text.trim()) return 0;

	// 複数の指標を組み合わせて完成度を判定
	const indicators = [
		// 1. 最小文長に達している
		text.length >= minSentenceLength ? 0.3 : 0,

		// 2. 読点や接続詞が含まれている（文の構造が形成されている）
		/[、，]/.test(text) ? 0.2 : 0,

		// 3. 助詞や語尾が含まれている（日本語の文として自然）
		/[はがをにへとでもの]/.test(text) ? 0.2 : 0,

		// 4. 文長が適切な範囲内（長すぎない）
		text.length >= 10 && text.length <= 50 ? 0.2 : 0,

		// 5. 文の終端が近い可能性（語尾の特徴）
		/[です|ます|である|だ|た|る]$/.test(text.trim()) ? 0.1 : 0,
	];

	return Math.min(
		indicators.reduce((sum, score) => sum + score, 0),
		1.0,
	);
};

/**
 * 文の検出と完成度判定を実行する純粋関数
 * @param buffer - 全体のテキストバッファ
 * @param lastProcessedIndex - 最後に処理した位置
 * @param config - 設定
 * @returns 検出結果と新しい処理位置
 */
const detectSentences = (
	buffer: string,
	lastProcessedIndex: number,
	config: SentenceDetectionConfig,
): { result: SentenceDetectionResult; newLastProcessedIndex: number } => {
	const newText = buffer.slice(lastProcessedIndex);
	const completeSentences: string[] = [];
	let searchIndex = 0;
	let currentLastProcessedIndex = lastProcessedIndex;

	// 文の区切りを検索
	while (true) {
		const match = config.sentenceDelimiter.exec(newText.slice(searchIndex));
		// 区切りが見つからない場合ループ
		if (match === null) break;

		const matchIndex = match.index;
		if (matchIndex !== undefined) {
			const fullMatchIndex = lastProcessedIndex + searchIndex + matchIndex + 1;
			const sentence = buffer
				.slice(currentLastProcessedIndex, fullMatchIndex)
				.trim();

			if (sentence.length >= config.minSentenceLength) {
				completeSentences.push(sentence);
				currentLastProcessedIndex = fullMatchIndex;
				searchIndex = 0; // リセットして次の文を検索
			} else {
				searchIndex += matchIndex + 1;
			}
		} else {
			break;
		}
	}

	// 残りのテキストと完成度を計算
	const remainingText = buffer.slice(currentLastProcessedIndex);
	const completeness = calculateCompleteness(
		remainingText,
		config.minSentenceLength,
	);
	const shouldStartPrefetch = completeness >= config.prefetchTrigger;

	return {
		result: {
			completeSentences,
			remainingText,
			completeness,
			shouldStartPrefetch,
		},
		newLastProcessedIndex: currentLastProcessedIndex,
	};
};

/**
 * 文検出器のインスタンスを作成する関数
 * @param partialConfig - 部分的な設定
 * @returns 文検出器のインスタンス
 */
export const createSentenceDetector = (
	partialConfig: Partial<SentenceDetectionConfig> = {},
): SentenceDetectorInstance => {
	// 設定のデフォルト値を適用
	const config: SentenceDetectionConfig = {
		sentenceDelimiter: /[。！？\n]/,
		minSentenceLength: 5,
		prefetchTrigger: 0.7,
		...partialConfig,
	};

	// 内部状態
	let buffer = "";
	let lastProcessedIndex = 0;

	/**
	 * テキストチャンクを追加して文検出を実行
	 */
	const addChunk = (chunk: string): SentenceDetectionResult => {
		buffer += chunk;
		const { result, newLastProcessedIndex } = detectSentences(
			buffer,
			lastProcessedIndex,
			config,
		);
		lastProcessedIndex = newLastProcessedIndex;
		return result;
	};

	/**
	 * 現在のバッファをリセット
	 */
	const reset = (): void => {
		buffer = "";
		lastProcessedIndex = 0;
	};

	/**
	 * 残りのテキストを完全な文として扱う
	 */
	const finalize = (): string[] => {
		const remaining = buffer.slice(lastProcessedIndex);
		if (remaining.trim().length >= config.minSentenceLength) {
			lastProcessedIndex = buffer.length;
			return [remaining.trim()];
		}
		return [];
	};

	/**
	 * 現在のバッファの状態を取得
	 */
	const getState = (): SentenceDetectorState => ({
		buffer,
		lastProcessedIndex,
		remainingText: buffer.slice(lastProcessedIndex),
	});

	return {
		addChunk,
		reset,
		finalize,
		getState,
	};
};

export default createSentenceDetector;
