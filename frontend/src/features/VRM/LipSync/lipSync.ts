import type { LipSyncAnalyzeResult } from "./types";

const TIME_DOMAIN_DATA_LENGTH = 2048;

export class LipSync {
	public readonly audio: AudioContext;
	public readonly analyser: AnalyserNode;
	public readonly timeDomainData: Float32Array;

	public constructor(audio: AudioContext) {
		this.audio = audio;

		this.analyser = audio.createAnalyser();
		this.timeDomainData = new Float32Array(TIME_DOMAIN_DATA_LENGTH);
	}

	public update(): LipSyncAnalyzeResult {
		this.analyser.getFloatTimeDomainData(this.timeDomainData);

		let volume = 0.0;
		for (let i = 0; i < TIME_DOMAIN_DATA_LENGTH; i++) {
			volume = Math.max(volume, Math.abs(this.timeDomainData[i]));
		}

		// cook
		volume = 1 / (1 + Math.exp(-45 * volume + 5));
		if (volume < 0.1) volume = 0;

		return {
			volume,
		};
	}

	public async playFromArrayBuffer(
		buffer: ArrayBuffer,
		onAnalyze?: (result: LipSyncAnalyzeResult) => void,
		onEnded?: () => void,
	) {
		const audioBuffer = await this.audio.decodeAudioData(buffer);

		const bufferSource = this.audio.createBufferSource();
		bufferSource.buffer = audioBuffer;

		// 音声出力と解析器への接続を確実に行う
		bufferSource.connect(this.audio.destination);
		bufferSource.connect(this.analyser);

		// デバッグログを追加
		console.log("音声バッファー接続完了", {
			duration: audioBuffer.duration,
			sampleRate: audioBuffer.sampleRate,
			numberOfChannels: audioBuffer.numberOfChannels,
		});

		// 音声のステータスを継続的にモニター
		const monitorInterval = setInterval(() => {
			const result = this.update();
			if (result.volume > 0) {
				console.log(`リアルタイム音量: ${result.volume.toFixed(3)}`);
			}
			if (onAnalyze) {
				onAnalyze(result);
			}
		}, 50); // 50ミリ秒ごとに更新

		bufferSource.start();

		if (onEnded) {
			bufferSource.addEventListener("ended", () => {
				clearInterval(monitorInterval);
				onEnded();
			});
		}
	}

	public async playFromURL(
		url: string,
		onAnalyze?: (result: LipSyncAnalyzeResult) => void,
		onEnded?: () => void,
	) {
		try {
			console.log(`音声ファイル読み込み開始: ${url}`);
			const res = await fetch(url);
			if (!res.ok) {
				throw new Error(
					`音声ファイルの取得に失敗: ${res.status} ${res.statusText}`,
				);
			}
			const buffer = await res.arrayBuffer();
			console.log(`音声ファイル読み込み完了: ${buffer.byteLength}バイト`);
			await this.playFromArrayBuffer(buffer, onAnalyze, onEnded);
		} catch (error) {
			console.error("音声ファイル処理エラー:", error);
			if (onEnded) onEnded();
		}
	}
}
