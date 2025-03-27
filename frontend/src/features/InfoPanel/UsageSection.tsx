"use client";
import React from "react";
import { InfoSection } from "./InfoSection";

export const UsageSection: React.FC = () => {
	return (
		<InfoSection iconType="volume2" title="使い方" iconColor="text-purple-400">
			<ol className="list-decimal list-inside space-y-2 text-white/80">
				<li>左側のテキストボックスに質問を入力します。</li>
				<li>AIがリアルタイムで回答を生成します。</li>
				<li>
					情報アイコンをクリックすると、システムの詳細情報が表示されます。
				</li>
			</ol>
		</InfoSection>
	);
};
