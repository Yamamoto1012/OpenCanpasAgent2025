import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	SUPPORTED_LANGUAGES,
	type SupportedLanguage,
} from "@/store/languageAtoms";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Languages, Loader2 } from "lucide-react";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

export type LanguageSelectorViewProps = {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	currentLanguage: SupportedLanguage;
	onLanguageChange: (language: SupportedLanguage) => void;
	isChanging: boolean;
};

/**
 * 言語選択ダイアログのViewコンポーネント
 */
export const LanguageSelectorView: FC<LanguageSelectorViewProps> = ({
	isOpen,
	onOpenChange,
	currentLanguage,
	onLanguageChange,
	isChanging,
}) => {
	const { t } = useTranslation("language");

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Languages className="h-5 w-5" />
						{t("selector.title")}
					</DialogTitle>
					<DialogDescription>{t("selector.description")}</DialogDescription>
				</DialogHeader>

				<div className="grid gap-3 py-4">
					<div className="text-sm font-medium text-muted-foreground">
						{t("selector.current")}: {t(`names.${currentLanguage}`)}
					</div>

					<div className="grid gap-2">
						<AnimatePresence mode="wait">
							{SUPPORTED_LANGUAGES.map((language) => (
								<motion.div
									key={language.code}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ duration: 0.2 }}
								>
									<Button
										variant={
											currentLanguage === language.code ? "default" : "outline"
										}
										className="w-full justify-between h-auto p-4"
										onClick={() => onLanguageChange(language.code)}
										disabled={isChanging}
									>
										<div className="flex flex-col items-start gap-1">
											<div className="font-medium">{language.nativeName}</div>
											<div className="text-xs text-muted-foreground">
												{language.name}
											</div>
										</div>

										<div className="flex items-center">
											{isChanging && currentLanguage !== language.code ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : currentLanguage === language.code ? (
												<Check className="h-4 w-4" />
											) : null}
										</div>
									</Button>
								</motion.div>
							))}
						</AnimatePresence>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
