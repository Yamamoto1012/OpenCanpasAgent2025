import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// サポートする言語の型定義
export type SupportedLanguage = "ja" | "en";

// 言語データの型定義
export type LanguageOption = {
	code: SupportedLanguage;
	name: string;
	nativeName: string;
};

// サポートする言語の一覧
export const SUPPORTED_LANGUAGES: LanguageOption[] = [
	{
		code: "ja",
		name: "Japanese",
		nativeName: "日本語",
	},
	{
		code: "en",
		name: "English",
		nativeName: "English",
	},
];

// 現在選択されている言語（ローカルストレージに永続化）
export const currentLanguageAtom = atomWithStorage<SupportedLanguage>(
	"opencanapas-language",
	"ja", // デフォルトは日本語
);

// 言語選択ダイアログの表示状態
export const languageSelectorOpenAtom = atom<boolean>(false);

// 言語が変更されたかどうかのフラグ
export const isLanguageChangingAtom = atom<boolean>(false);
