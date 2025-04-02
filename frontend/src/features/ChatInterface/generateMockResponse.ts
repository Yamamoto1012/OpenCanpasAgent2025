/**
 * 質問からモック回答を生成する関数
 * @param question ユーザーの質問
 * @returns 質問内容に応じた回答テキスト
 */
export const generateMockResponse = (question: string): string => {
	// 質問に基づいたシンプルなモック回答
	if (question.includes("学部") || question.includes("学科")) {
		return "金沢工業大学には工学部、情報フロンティア学部、建築学部があります。特に人気なのはAI専攻やロボティクス専攻などがある情報フロンティア学部です。";
	}
	if (question.includes("キャンパス") || question.includes("施設")) {
		return "金沢工業大学のキャンパスは最新設備が整っています。ライブラリーセンターやプロジェクト活動のためのスペースも充実しています。";
	}
	if (question.includes("就職") || question.includes("進路")) {
		return "就職率は99%を超えており、大手企業への就職実績も多数あります。特に製造業やIT業界への就職が多いです。";
	}
	return `「${question}」についてですね。金沢工業大学では学生が主体となって学べる環境が整っています。詳細な情報をお求めでしたら、もう少し具体的にお聞かせください。`;
};
