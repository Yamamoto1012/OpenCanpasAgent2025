import { atom } from "jotai";

/**
 * VRMモデルのローディング状態を管理するアトム
 * - initial: 初期状態
 * - loading: ロード中
 * - complete: ロード完了
 * - error: エラー発生
 */
export const vrmLoadingStateAtom = atom<
	"initial" | "loading" | "complete" | "error"
>("initial");

/**
 * VRMモデルのロード進捗を管理するアトム
 */
export const vrmLoadProgressAtom = atom<number>(0);

/**
 * VRMモデルのロード進捗テキストを管理するアトム
 */
export const vrmLoadingTextAtom = atom<string>("モデルを読み込んでいます...");

/**
 * VRMモデルのロードエラーメッセージを管理するアトム
 */
export const vrmLoadErrorMessageAtom = atom<string>("");
