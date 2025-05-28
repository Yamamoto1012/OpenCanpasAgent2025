import type { LipSyncAnalyzeResult } from "./types";

const TIME_DOMAIN_DATA_LENGTH = 2048;

export class LipSync {
	public readonly audio: AudioContext;
	public readonly analyser: AnalyserNode;
	public readonly timeDomainData: Float32Array;
	private isInitialized = false;

	public constructor(audio: AudioContext) {
		try {
			this.audio = audio;
			this.analyser = audio.createAnalyser();
			this.timeDomainData = new Float32Array(TIME_DOMAIN_DATA_LENGTH);
			this.isInitialized = true;
		} catch (error) {
			console.error("LipSync初期化エラー:", error);
			throw new Error("LipSyncの初期化に失敗しました");
		}
	}

	public update(): LipSyncAnalyzeResult {
		if (!this.isInitialized) {
			return { volume: 0 };
		}

		try {
			this.analyser.getFloatTimeDomainData(this.timeDomainData);

			let volume = 0.0;
			for (let i = 0; i < TIME_DOMAIN_DATA_LENGTH; i++) {
				volume = Math.max(volume, Math.abs(this.timeDomainData[i]));
			}

			// 音量を正規化（シグモイド関数を使用）
			volume = 1 / (1 + Math.exp(-45 * volume + 5));
			if (volume < 0.1) volume = 0;

			return { volume };
		} catch (error) {
			console.warn("音量解析エラー:", error);
			return { volume: 0 };
		}
	}

	public async playFromArrayBuffer(
		buffer: ArrayBuffer,
		onAnalyze?: (result: LipSyncAnalyzeResult) => void,
		onEnded?: () => void,
	): Promise<void> {
		if (!this.isInitialized) {
			console.warn("LipSyncが初期化されていません");
			if (onEnded) onEnded();
			return;
		}

		try {
			const audioBuffer = await this.audio.decodeAudioData(buffer);

			const bufferSource = this.audio.createBufferSource();
			bufferSource.buffer = audioBuffer;

			// 音声出力と解析器への接続を確実に行う
			bufferSource.connect(this.audio.destination);
			bufferSource.connect(this.analyser);

			// 音声のステータスを継続的にモニター
			const monitorInterval = setInterval(() => {
				try {
					const result = this.update();
					if (onAnalyze) {
						onAnalyze(result);
					}
				} catch (error) {
					console.warn("リップシンク解析エラー:", error);
				}
			}, 50); // 50ミリ秒ごとに更新

			bufferSource.start();

			if (onEnded) {
				bufferSource.addEventListener("ended", () => {
					clearInterval(monitorInterval);
					onEnded();
				});
			}
		} catch (error) {
			console.error("音声再生エラー:", error);
			if (onEnded) onEnded();
		}
	}

	public async playFromURL(
		url: string,
		onAnalyze?: (result: LipSyncAnalyzeResult) => void,
		onEnded?: () => void,
	): Promise<void> {
		if (!this.isInitialized) {
			console.warn("LipSyncが初期化されていません");
			if (onEnded) onEnded();
			return;
		}

		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`音声ファイルの取得に失敗: ${response.status}`);
			}

			const arrayBuffer = await response.arrayBuffer();
			await this.playFromArrayBuffer(arrayBuffer, onAnalyze, onEnded);
		} catch (error) {
			console.error("音声URL再生エラー:", error);
			if (onEnded) onEnded();
		}
	}

	/**
	 * LipSyncが正常に初期化されているかチェック
	 */
	public isReady(): boolean {
		return this.isInitialized && this.audio.state === "running";
	}

	/**
	 * AudioContextの状態を確認
	 */
	public getAudioContextState(): AudioContextState {
		return this.audio.state;
	}
}
