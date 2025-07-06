import type React from "react";
import { useTranslation } from "react-i18next";
import { InfoSection } from "./InfoSection";

type TechCard = {
	title: string;
	description: string;
};

export const TechSection: React.FC = () => {
	const { t } = useTranslation("infoPanel");
	const techCards: TechCard[] = [
		{
			title: t("techStack.localLLM.title"),
			description: t("techStack.localLLM.description"),
		},
		{
			title: t("techStack.rag.title"),
			description: t("techStack.rag.description"),
		},
		{
			title: t("techStack.aiVoiceSynthesis.title"),
			description: t("techStack.aiVoiceSynthesis.description"),
		},
		{
			title: t("techStack.3dCharacter.title"),
			description: t("techStack.3dCharacter.description"),
		},
	];

	return (
		<InfoSection
			iconType="cpu"
			title={t("techStack.title")}
			iconColor="text-green-400"
		>
			<div className="space-y-4">
				{techCards.map((card) => (
					<div key={card.title} className="bg-white/5 p-4 rounded-lg">
						<h4 className="font-medium mb-2">{card.title}</h4>
						<p className="text-white/80 text-sm">{card.description}</p>
					</div>
				))}
			</div>
		</InfoSection>
	);
};
