import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

// 翻訳リソース
const resources = {
	ja: {
		translation: {
			// 共通
			common: {
				loading: "読み込み中...",
				error: "エラーが発生しました",
				close: "閉じる",
				cancel: "キャンセル",
				confirm: "確認",
				save: "保存",
				delete: "削除",
				edit: "編集",
				back: "戻る",
				next: "次へ",
				previous: "前へ",
				search: "検索",
				clear: "クリア",
			},
			// 言語選択
			language: {
				selector: {
					title: "言語選択",
					description: "表示言語を選択してください",
					current: "現在の言語",
					changeLanguage: "言語を変更",
				},
				names: {
					ja: "日本語",
					en: "English",
				},
			},
			// ナビゲーション
			navigation: {
				home: "ホーム",
				chat: "チャット",
				voice: "音声チャット",
				info: "情報",
				categories: "カテゴリ",
			},
			// チャット
			chat: {
				title: "AI沢みのりとチャット",
				placeholder: "メッセージを入力してください...",
				send: "送信",
				thinking: "考え中...",
				voiceInput: "音声入力",
				stopListening: "音声入力停止",
				startListening: "音声入力開始",
				selectCategory: "カテゴリを選択",
				askQuestion: "質問する",
				newChat: "新しいチャット",
			},
			// カテゴリ
			categories: {
				title: "よくある質問",
				description: "カテゴリを選択してください",
				admission: "入学について",
				curriculum: "カリキュラム",
				facilities: "施設について",
				campus: "キャンパスライフ",
				career: "進路・就職",
				international: "国際交流",
				research: "研究について",
				support: "サポート",
			},
			// 情報パネル
			info: {
				title: "AI沢みのりについて",
				description: "AI沢みのりは金沢工業大学の案内AIアシスタントです",
				features: {
					title: "機能",
					chat: "質問応答",
					voice: "音声対話",
					categories: "カテゴリ別案内",
				},
				technology: {
					title: "技術",
					ai: "大規模言語モデル",
					voice: "音声認識・合成",
					"3d": "3Dアバター",
				},
				usage: {
					title: "使い方",
					step1: "質問を入力または音声で伝える",
					step2: "AI沢みのりが回答します",
					step3: "さらに詳しく聞くことができます",
				},
			},
			// エラーメッセージ
			errors: {
				networkError: "ネットワークエラーが発生しました",
				apiError: "APIエラーが発生しました",
				voiceNotSupported: "お使いのブラウザは音声認識に対応していません",
				microphoneError: "マイクへのアクセスができませんでした",
				speechSynthesisError: "音声合成エラーが発生しました",
			},
			// 成功メッセージ
			success: {
				languageChanged: "言語が変更されました",
				voiceEnabled: "音声機能が有効になりました",
			},
		},
	},
	en: {
		translation: {
			// Common
			common: {
				loading: "Loading...",
				error: "An error occurred",
				close: "Close",
				cancel: "Cancel",
				confirm: "Confirm",
				save: "Save",
				delete: "Delete",
				edit: "Edit",
				back: "Back",
				next: "Next",
				previous: "Previous",
				search: "Search",
				clear: "Clear",
			},
			// Language selector
			language: {
				selector: {
					title: "Language Selection",
					description: "Please select your display language",
					current: "Current Language",
					changeLanguage: "Change Language",
				},
				names: {
					ja: "日本語",
					en: "English",
				},
			},
			// Navigation
			navigation: {
				home: "Home",
				chat: "Chat",
				voice: "Voice Chat",
				info: "Information",
				categories: "Categories",
			},
			// Chat
			chat: {
				title: "Chat with AI Sawaminori",
				placeholder: "Type your message...",
				send: "Send",
				thinking: "Thinking...",
				voiceInput: "Voice Input",
				stopListening: "Stop Listening",
				startListening: "Start Listening",
				selectCategory: "Select Category",
				askQuestion: "Ask Question",
				newChat: "New Chat",
			},
			// Categories
			categories: {
				title: "Frequently Asked Questions",
				description: "Please select a category",
				admission: "Admissions",
				curriculum: "Curriculum",
				facilities: "Facilities",
				campus: "Campus Life",
				career: "Career & Employment",
				international: "International Exchange",
				research: "Research",
				support: "Support",
			},
			// Info panel
			info: {
				title: "About AI Sawaminori",
				description:
					"AI Sawaminori is the AI assistant guide for Kanazawa Institute of Technology",
				features: {
					title: "Features",
					chat: "Q&A Chat",
					voice: "Voice Conversation",
					categories: "Category-based Guidance",
				},
				technology: {
					title: "Technology",
					ai: "Large Language Model",
					voice: "Speech Recognition & Synthesis",
					"3d": "3D Avatar",
				},
				usage: {
					title: "How to Use",
					step1: "Ask questions via text or voice",
					step2: "AI Sawaminori will respond",
					step3: "You can ask follow-up questions",
				},
			},
			// Error messages
			errors: {
				networkError: "A network error occurred",
				apiError: "An API error occurred",
				voiceNotSupported: "Your browser does not support voice recognition",
				microphoneError: "Could not access microphone",
				speechSynthesisError: "A speech synthesis error occurred",
			},
			// Success messages
			success: {
				languageChanged: "Language has been changed",
				voiceEnabled: "Voice features have been enabled",
			},
		},
	},
} as const;

// i18nextの初期化
i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		lng: "ja", // デフォルト言語
		fallbackLng: "ja", // フォールバック言語
		debug: import.meta.env.DEV,

		interpolation: {
			escapeValue: false,
		},

		detection: {
			// ブラウザの言語検出設定
			order: ["localStorage", "navigator", "htmlTag"],
			caches: ["localStorage"],
			lookupLocalStorage: "opencanapas-language",
		},
	});

export default i18n;
