import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

const jaModules = import.meta.glob("@/locales/ja/*.json", { eager: true });
const enModules = import.meta.glob("@/locales/en/*.json", { eager: true });

// 名前空間を動的に抽出
const namespaces = Object.keys(jaModules)
	.map((path) => {
		const match = path.match(/\/ja\/(.+)\.json$/);
		return match ? match[1] : null;
	})
	.filter((namespace): namespace is string => namespace !== null);

// 翻訳リソース
const resources = {
	ja: Object.fromEntries(
		Object.entries(jaModules).map(([path, module]) => {
			const match = path.match(/\/ja\/(.+)\.json$/);
			const namespace = match ? match[1] : "";
			return [
				namespace,
				(module as { default: Record<string, unknown> }).default,
			];
		}),
	),
	en: Object.fromEntries(
		Object.entries(enModules).map(([path, module]) => {
			const match = path.match(/\/en\/(.+)\.json$/);
			const namespace = match ? match[1] : "";
			return [
				namespace,
				(module as { default: Record<string, unknown> }).default,
			];
		}),
	),
};

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		lng: "ja", // デフォルト言語
		fallbackLng: "ja", // フォールバック言語

		// 翻訳リソースを設定
		resources,

		// 名前空間を列挙
		ns: namespaces,
		defaultNS: "common",

		interpolation: {
			escapeValue: false,
		},

		react: {
			useSuspense: false,
		},
	});

export default i18n;
