import { motion } from "framer-motion";
import { Mic, X, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useRef } from "react";

type VoiceChatViewProps = {
	isListening: boolean;
	transcript: string;
	circleSize: number;
	audioLevel: number;
	isProcessing: boolean;
	onStartListening: () => void;
	onStopListening: () => void;
};

export const VoiceChatView = ({
	isListening,
	transcript,
	circleSize,
	audioLevel,
	isProcessing,
	onStartListening,
	onStopListening,
}: VoiceChatViewProps) => {
	const waveformCanvasRef = useRef<HTMLCanvasElement>(null);

	// Canvas波形のアニメーション
	useEffect(() => {
		if (!isListening || !waveformCanvasRef.current) return;

		const drawWaveform = () => {
			const canvas = waveformCanvasRef.current;
			if (!canvas) return;

			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			const width = canvas.width;
			const height = canvas.height;

			ctx.clearRect(0, 0, width, height);
			ctx.lineWidth = 2;
			ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
			ctx.beginPath();

			// 簡易的な波形生成
			const sliceWidth = width / 50;
			let x = 0;

			for (let i = 0; i < 50; i++) {
				const v = 0.5 + Math.random() * audioLevel * 0.5;
				const y = v * height;

				if (i === 0) {
					ctx.moveTo(x, y);
				} else {
					ctx.lineTo(x, y);
				}

				x += sliceWidth;
			}

			ctx.lineTo(width, height / 2);
			ctx.stroke();
		};

		const animationId = setInterval(drawWaveform, 50);
		return () => clearInterval(animationId);
	}, [isListening, audioLevel]);

	return (
		<div className="flex flex-col items-center justify-between w-full h-full py-8 px-6 relative rounded-2xl">
			{/* 録音インジケーター - 点滅する赤い丸 */}
			{isListening && (
				<motion.div
					className="absolute top-4 right-4 h-3 w-3 rounded-full bg-red-500"
					animate={{
						opacity: [0.5, 1, 0.5],
						scale: [0.8, 1.2, 0.8],
					}}
					transition={{
						repeat: Number.POSITIVE_INFINITY,
						duration: 1.5,
						ease: "easeInOut",
					}}
				/>
			)}

			{/* 中央部分 - テキスト表示と波形表示 */}
			<div className="flex-1 flex flex-col items-center justify-end w-full max-w-md mx-auto my-4">
				{/* 波形の可視化 */}
				{isListening && (
					<div className="w-full max-w-[280px]">
						<canvas
							ref={waveformCanvasRef}
							width={280}
							height={80}
							className="w-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg opacity-80"
						/>
					</div>
				)}

				{/* テキスト表示エリア */}
				<motion.div
					className="text-center px-10 pt-3"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}
				>
					{isProcessing ? (
						<div className="flex flex-col items-center gap-2">
							<Loader2 className="h-6 w-6 animate-spin text-purple-500" />
							<span className="text-sm text-gray-400">処理中...</span>
						</div>
					) : isListening ? (
						<p className="text-md font-medium text-gray-500">
							{transcript || "話しかけてください..."}
						</p>
					) : (
						<div className="flex flex-col items-center w-full">
							<p className="text-gray-500">マイクボタンをクリックして、</p>
							<p className="text-gray-500">話しかけてください</p>
						</div>
					)}
				</motion.div>
			</div>

			{/* 下部エリア - 説明とボタン */}
			<div className="mt-auto flex flex-col items-center gap-6 w-full pb-6">
				<div className="flex items-center justify-center gap-2 text-sm text-gray-300">
					<span>{isListening ? "音声を認識しています" : ""}</span>
					<Dialog>
						<DialogTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="rounded-full h-6 w-6 text-gray-300 hover:text-white"
							>
								<Info className="h-4 w-4" />
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-md">
							<DialogHeader>
								<DialogTitle>音声チャットについて</DialogTitle>
								<DialogDescription>
									このインターフェースでは、マイクボタンをクリックして音声入力を開始できます。
									音声は自動的にテキストに変換されます。
									キャンセルするには、Xボタンをクリックしてください。
								</DialogDescription>
							</DialogHeader>
						</DialogContent>
					</Dialog>
				</div>

				<div className="flex gap-4">
					<Button
						onClick={onStartListening}
						disabled={isListening}
						className="bg-[#b3cfad] hover:bg-[#c3e6d8] text-white rounded-full h-14 w-14 flex items-center justify-center"
					>
						<Mic className="h-6 w-6" />
					</Button>

					<Button
						onClick={onStopListening}
						disabled={!isListening}
						className="bg-gray-800 hover:bg-gray-700 text-white rounded-full h-14 w-14 flex items-center justify-center"
					>
						<X className="h-6 w-6" />
					</Button>
				</div>
			</div>
		</div>
	);
};
