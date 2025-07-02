import {
	type SupportedLanguage,
	currentLanguageAtom,
	isLanguageChangingAtom,
	languageSelectorOpenAtom,
} from "@/store/languageAtoms";
import { useAtom } from "jotai";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { LanguageSelectorView } from "./LanguageSelectorView";

/**
 * 言語選択のロジックを管理するコンテナコンポーネント
 */
export const LanguageSelector: FC = () => {
	const { i18n, t } = useTranslation();
	const [currentLanguage, setCurrentLanguage] = useAtom(currentLanguageAtom);
	const [isOpen, setIsOpen] = useAtom(languageSelectorOpenAtom);
	const [isChanging, setIsChanging] = useAtom(isLanguageChangingAtom);

	const handleLanguageChange = async (language: SupportedLanguage) => {
		if (language === currentLanguage) {
			setIsOpen(false);
			return;
		}

		try {
			setIsChanging(true);

			// i18nextの言語を変更
			await i18n.changeLanguage(language);

			// Jotai atomの状態を更新
			setCurrentLanguage(language);

			// ダイアログを閉じる
			setIsOpen(false);

			// 成功通知
			toast.success(t("success.languageChanged"));
		} catch (error) {
			console.error("Language change failed:", error);
			toast.error(t("common.error"));
		} finally {
			setIsChanging(false);
		}
	};

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
	};

	return (
		<LanguageSelectorView
			isOpen={isOpen}
			onOpenChange={handleOpenChange}
			currentLanguage={currentLanguage}
			onLanguageChange={handleLanguageChange}
			isChanging={isChanging}
		/>
	);
};
