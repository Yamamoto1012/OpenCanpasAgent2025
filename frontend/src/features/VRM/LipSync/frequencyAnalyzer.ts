/**
 * 周波数解析による音素推定クラス
 * フォルマント周波数の分析を通じて音素を特定する
 */
export class FrequencyAnalyzer {
	private readonly analyser: AnalyserNode; // 音を周波数に分解する
	private readonly frequencyData: Float32Array; // 周波数データを格納するバッファ

	constructor(analyser: AnalyserNode) {
		this.analyser = analyser;
		// 周波数解析用のデータバッファ
		this.frequencyData = new Float32Array(analyser.frequencyBinCount);
	}

	/**
	 * 現在の周波数データを取得(音素を当てる)
	 */
	public getFrequencyData(): Float32Array {
		this.analyser.getFloatFrequencyData(this.frequencyData);
		return this.frequencyData;
	}

	/**
	 * 周波数データから音素を推定
	 * フォルマント周波数の分析により母音を判定
	 * @param frequencyData 周波数解析データ
	 * @param sampleRate サンプリングレート
	 * @returns 推定された音素と信頼度
	 */
	public estimatePhoneme(
		frequencyData: Float32Array,
		sampleRate = 44100,
	): { phoneme: string; confidence: number } {
		// 周波数帯域の定義
		const nyquist = sampleRate / 2; // ナイキスト周波数
		const binWidth = nyquist / frequencyData.length; // 角周波数の幅

		// フォルマント周波数の範囲（Hz）
		const F1_RANGE = { min: 200, max: 1000 }; // 第1フォルマント
		const F2_RANGE = { min: 800, max: 2500 }; // 第2フォルマント

		// 各帯域のピークを検出
		const f1Peak = this.findPeakInRange(frequencyData, F1_RANGE, binWidth);
		const f2Peak = this.findPeakInRange(frequencyData, F2_RANGE, binWidth);

		// エネルギーが低い場合は無音として扱う
		const totalEnergy = this.calculateTotalEnergy(frequencyData);
		if (totalEnergy < -40) {
			// -40dB以下は無音
			return { phoneme: "", confidence: 0 };
		}

		// フォルマント周波数による音素判定
		const phoneme = this.classifyPhoneme(f1Peak.frequency, f2Peak.frequency);

		// 信頼度の計算（ピークの明瞭さに基づく）
		const confidence = this.calculateConfidence(f1Peak, f2Peak, totalEnergy);

		return { phoneme, confidence };
	}

	/**
	 * 指定した周波数範囲内でピークを検出
	 * @param frequencyData - 周波数データ
	 * @param range - 周波数の範囲
	 * @param binWidth - 周波数のピンの幅
	 * @returns - ピークの周波数とマグニチュード
	 */
	private findPeakInRange(
		frequencyData: Float32Array,
		range: { min: number; max: number },
		binWidth: number,
	): { frequency: number; magnitude: number } {
		const startBin = Math.floor(range.min / binWidth);
		const endBin = Math.min(
			Math.floor(range.max / binWidth),
			frequencyData.length - 1,
		);

		let maxMagnitude = Number.NEGATIVE_INFINITY;
		let peakBin = startBin;

		for (let i = startBin; i <= endBin; i++) {
			if (frequencyData[i] > maxMagnitude) {
				maxMagnitude = frequencyData[i];
				peakBin = i;
			}
		}

		return {
			frequency: peakBin * binWidth,
			magnitude: maxMagnitude,
		};
	}

	/**
	 * 総エネルギー(音のボリューム)を計算
	 */
	private calculateTotalEnergy(frequencyData: Float32Array): number {
		let totalEnergy = 0;
		for (let i = 0; i < frequencyData.length; i++) {
			totalEnergy += 10 ** (frequencyData[i] / 20); // dBからリニアに変換
		}
		return 20 * Math.log10(totalEnergy / frequencyData.length); // 平均をdBに戻す
	}

	/**
	 * フォルマント周波数から音素を分類
	 * 日本語の5母音（あいうえお）に対応
	 * @param f1 - 第一フォルマント周波数
	 * @param f2 - 第二フォルマント周波数
	 * @returns - 推定される音素
	 */
	private classifyPhoneme(f1: number, f2: number): string {
		// 日本語母音のフォルマント周波数（概算値）
		const vowelFormants = {
			a: { f1: 730, f2: 1090 }, // あ
			i: { f1: 240, f2: 2400 }, // い
			u: { f1: 300, f2: 870 }, // う
			e: { f1: 530, f2: 1840 }, // え
			o: { f1: 500, f2: 1000 }, // お
		};

		let minDistance = Number.POSITIVE_INFINITY;
		let bestMatch = "a";

		// 各母音との距離を計算（ユークリッド距離）
		for (const [vowel, formants] of Object.entries(vowelFormants)) {
			const distance = Math.sqrt(
				(f1 - formants.f1) ** 2 + (f2 - formants.f2) ** 2,
			);

			if (distance < minDistance) {
				minDistance = distance;
				bestMatch = vowel;
			}
		}

		return bestMatch;
	}

	/**
	 * 推定の信頼度を計算
	 * ピークの明瞭さと総エネルギーに基づく
	 */
	private calculateConfidence(
		f1Peak: { frequency: number; magnitude: number },
		f2Peak: { frequency: number; magnitude: number },
		totalEnergy: number,
	): number {
		// エネルギーが高いほど信頼度が高い
		const energyFactor = Math.min(1.0, Math.max(0.0, (totalEnergy + 60) / 40)); // -60dB～0dBを0～1に正規化

		// ピークの明瞭さ（マグニチュードの平均）
		const avgPeakMagnitude = (f1Peak.magnitude + f2Peak.magnitude) / 2;
		const clarityFactor = Math.min(
			1.0,
			Math.max(0.0, (avgPeakMagnitude + 60) / 40),
		); // -60dB～0dBを0～1に正規化

		// 最終的な信頼度（0～1の範囲）
		return (energyFactor + clarityFactor) / 2;
	}
}
