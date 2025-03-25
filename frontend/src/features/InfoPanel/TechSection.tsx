"use client";
import React from "react";
import { InfoSection } from "./InfoSection";

type TechCard = {
  title: string;
  description: string;
}

const techCards: TechCard[] = [
  {
    title: "ローカルLLM",
    description: "Ollama（DeepSeek）を使用し、プライバシーを保護しながら高品質な応答を生成します。",
  },
  {
    title: "RAG（検索拡張生成）",
    description: "ChromaDBとLangChainを組み合わせることで、ドキュメント知識を活用した正確な回答を提供します。",
  },
  {
    title: "AI音声合成",
    description: "RVCまたはVITSベースのAIボイスチェンジャーを用いて、自然で表現豊かな音声を生成します。",
  },
  {
    title: "3Dキャラクター",
    description: "Three.jsを使用し、ウェブブラウザ上でインタラクティブな3Dキャラクターを表示します。",
  },
];

export const TechSection: React.FC = () => {
  return (
    <InfoSection iconType="cpu" title="使用技術" iconColor="text-green-400">
      <div className="space-y-4">
        {techCards.map((card, index) => (
          <div key={index} className="bg-white/5 p-4 rounded-lg">
            <h4 className="font-medium mb-2">{card.title}</h4>
            <p className="text-white/80 text-sm">{card.description}</p>
          </div>
        ))}
      </div>
    </InfoSection>
  );
};
