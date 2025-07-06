import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type React from "react";
import { useTranslation } from "react-i18next";

type InfoPanelHeaderProps = {
	onClose: () => void;
};

export const InfoPanelHeader: React.FC<InfoPanelHeaderProps> = ({
	onClose,
}) => {
	const { t } = useTranslation("infoPanel");
	return (
		<div className="flex justify-between items-center">
			<h2 className="text-xl font-bold text-white">{t("systemInfo")}</h2>
			<Button
				variant="ghost"
				size="icon"
				onClick={onClose}
				className="text-white hover:bg-white/20 active:bg-white/30 h-12 w-12 sm:h-10 sm:w-10 transition-colors duration-200"
				aria-label={t("closeInfoPanel")}
			>
				<X className="h-6 w-6 sm:h-5 sm:w-5" />
			</Button>
		</div>
	);
};
