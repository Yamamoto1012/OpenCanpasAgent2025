import type React from "react";
import { InfoSection } from "./InfoSection";

export const ContentSection: React.FC = () => {
	return (
		<InfoSection
			iconType="database"
			title="収録コンテンツ"
			iconColor="text-yellow-400"
		>
			<p className="text-white/80 leading-relaxed mb-4">
				KIT Virtual
				Navigatorには、金沢工業大学に関する幅広い情報が収録されています。
			</p>
			<div className="grid grid-cols-2 gap-3">
				<div className="bg-white/5 p-3 rounded-lg text-center">
					<p className="font-medium">公式Webサイト</p>
					<p className="text-sm text-white/60">1点</p>
				</div>
				<div className="bg-white/5 p-3 rounded-lg text-center">
					<p className="font-medium">こぶし会ホームページ</p>
					<p className="text-sm text-white/60">1点</p>
				</div>
				<div className="bg-white/5 p-3 rounded-lg text-center">
					<p className="font-medium">学友会ホームページ</p>
					<p className="text-sm text-white/60">1点</p>
				</div>
			</div>
		</InfoSection>
	);
};
