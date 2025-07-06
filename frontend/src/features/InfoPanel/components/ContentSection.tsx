import type React from "react";
import { useTranslation } from "react-i18next";
import { InfoSection } from "./InfoSection";

export const ContentSection: React.FC = () => {
	const { t } = useTranslation("infoPanel");
	return (
		<InfoSection
			iconType="database"
			title={t("content.title")}
			iconColor="text-yellow-400"
		>
			<p className="text-white/80 leading-relaxed mb-4">
				{t("content.description")}
			</p>
			<div className="grid grid-cols-2 gap-3">
				<div className="bg-white/5 p-3 rounded-lg text-center">
					<p className="font-medium">{t("content.officialWebsite")}</p>
					<p className="text-sm text-white/60">
						{t("content.itemCount", { count: 1 })}
					</p>
				</div>
				<div className="bg-white/5 p-3 rounded-lg text-center">
					<p className="font-medium">{t("content.kobushikaiWebsite")}</p>
					<p className="text-sm text-white/60">
						{t("content.itemCount", { count: 1 })}
					</p>
				</div>
				<div className="bg-white/5 p-3 rounded-lg text-center">
					<p className="font-medium">{t("content.gakuyukaiWebsite")}</p>
					<p className="text-sm text-white/60">
						{t("content.itemCount", { count: 1 })}
					</p>
				</div>
			</div>
		</InfoSection>
	);
};
