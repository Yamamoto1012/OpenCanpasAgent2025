import type React from "react";
import { useTranslation } from "react-i18next";
import { InfoSection } from "./InfoSection";

export const UsageSection: React.FC = () => {
	const { t } = useTranslation("infoPanel");
	return (
		<InfoSection
			iconType="volume2"
			title={t("usage.title")}
			iconColor="text-purple-400"
		>
			<ol className="list-decimal list-inside space-y-2 text-white/80">
				<li>{t("usage.step1")}</li>
				<li>{t("usage.step2")}</li>
				<li>{t("usage.step3")}</li>
			</ol>
		</InfoSection>
	);
};
