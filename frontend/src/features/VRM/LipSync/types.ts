// リップシンクの分析結果の型定義
export type LipSyncAnalyzeResult = {
	volume: number;
	frequencyData?: Float32Array;
	phoneme?: string;
	confidence?: number;
};
