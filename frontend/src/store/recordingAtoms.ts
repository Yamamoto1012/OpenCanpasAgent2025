import { atom } from "jotai";

/**
 * 録音中かどうかの状態を管理するアトム
 */
export const isRecordingAtom = atom<boolean>(false);

/**
 * 録音タイマー（秒数）を管理するアトム
 * 録音の経過時間を示すために使用
 */
export const recordingTimerAtom = atom<number>(0);

/**
 * 録音の最大時間（ミリ秒）を管理する定数アトム
 * 将来的に設定画面から変更できるようにする場合はwritableアトムに変更
 */
export const recordingDurationAtom = atom<number>(5000);

/**
 * 録音の間隔を管理するアトム（ミリ秒）
 * タイマーの精度を決定
 */
export const recordingIntervalAtom = atom<number>(100);

/**
 * モック音声認識の結果を管理するアトム
 * 実際の音声認識APIを連携する際のプレースホルダー
 */
export const recognizedTextAtom = atom<string>("");

/**
 * ランダムテキスト生成関数を保持するアトム
 * 書き込み可能なプライムアトムとして実装
 */
export const randomTextGeneratorAtom = atom<((text?: string) => string) | null>(
	null,
);

/**
 * 録音の開始/停止を切り替えるアクション
 */
export const toggleRecordingAtom = atom(
	null, // 読み取り側は必要ないのでnullを設定
	async (get, set, onRecognizedText?: (text: string) => void) => {
		const currentlyRecording = get(isRecordingAtom);

		// 録音中なら停止
		if (currentlyRecording) {
			set(isRecordingAtom, false);
			set(recordingTimerAtom, 0);
			return;
		}

		try {
			// マイクへのアクセス許可を取得
			await navigator.mediaDevices.getUserMedia({ audio: true });

			// 録音開始
			set(isRecordingAtom, true);

			// タイマーをセット
			const duration = get(recordingDurationAtom);

			// 実際のプロジェクトではここで録音処理を実装
			// ここではモックの実装として、指定時間後に録音を停止
			setTimeout(() => {
				// 録音停止時の処理
				set(isRecordingAtom, false);
				set(recordingTimerAtom, 0);

				// 録音結果を処理する仮のテキスト
				if (onRecognizedText) {
					// ランダムテキスト生成関数を取得して実行
					const textGenerator = get(randomTextGeneratorAtom);
					const randomText = textGenerator
						? textGenerator()
						: "音声が認識できませんでした";

					// 認識テキストを更新
					set(recognizedTextAtom, randomText);

					// コールバック関数を呼び出す
					onRecognizedText(randomText);
				}
			}, duration);
		} catch (error) {
			console.error("マイクの使用許可が得られませんでした:", error);
			alert("マイクへのアクセスを許可してください。");
			set(isRecordingAtom, false);
		}
	},
);

/**
 * 録音タイマーを更新するアトム
 * 録音中は定期的に呼び出され、録音時間を更新する
 */
export const updateRecordingTimerAtom = atom(null, (get, set) => {
	if (get(isRecordingAtom)) {
		const currentTime = get(recordingTimerAtom);
		const interval = get(recordingIntervalAtom) / 1000; // 秒単位に変換
		set(recordingTimerAtom, currentTime + interval);
	}
});
