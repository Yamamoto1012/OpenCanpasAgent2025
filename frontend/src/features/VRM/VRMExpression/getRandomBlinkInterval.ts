/**
 * ランダムな瞬きの間隔を取得（2〜6秒）
 */
export function getRandomBlinkInterval(): number {
	// 2〜6秒のランダムな間隔
	return 2000 + Math.random() * 4000;
}
