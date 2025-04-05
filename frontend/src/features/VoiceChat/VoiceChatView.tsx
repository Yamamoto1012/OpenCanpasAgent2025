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
	const dataArrayRef = useRef<Uint8Array | null>(null);

	const vibrationX = isListening ? (Math.random() - 0.5) * audioLevel * 15 : 0;
	const vibrationY = isListening ? (Math.random() - 0.5) * audioLevel * 15 : 0;

	useEffect(() => {
		if (!isListening || !waveformCanvasRef.current || !dataArrayRef.current)
			return;

		const drawWaveform = () => {
			const canvas = waveformCanvasRef.current;
			if (!canvas) return;

			const ctx = canvas.getContext("2d");
			if (!ctx || !dataArrayRef.current) return;

			const width = canvas.width;
			const height = canvas.height;

			ctx.clearRect(0, 0, width, height);
			ctx.lineWidth = 2;
			ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
			ctx.beginPath();

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
		<div className="flex flex-col items-center justify-center gap-8 p-4 ">
			<div className="relative flex items-center justify-center h-[350px] w-[350px]">
				{isListening && (
					<>
						<motion.div
							className="absolute rounded-full bg-[#b3cfad]/10"
							initial={{ width: 250, height: 250, opacity: 0.3 }}
							animate={{
								width: 350,
								height: 350,
								opacity: 0,
							}}
							transition={{
								repeat: Number.POSITIVE_INFINITY,
								duration: 2,
								ease: "easeOut",
							}}
						/>
						<motion.div
							className="absolute rounded-full bg-[#9f9579]/20"
							initial={{ width: 250, height: 250, opacity: 0.5 }}
							animate={{
								width: 320,
								height: 320,
								opacity: 0,
							}}
							transition={{
								repeat: Number.POSITIVE_INFINITY,
								duration: 2,
								delay: 0.5,
								ease: "easeOut",
							}}
						/>
					</>
				)}

				<motion.div
					className="relative flex items-center justify-center"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5 }}
				>
					<motion.div
						className="bg-gradient-to-br from-[#9f9579] to-[#d9ca77] rounded-full flex items-center justify-center overflow-hidden"
						initial={{ width: 300, height: 300 }}
						animate={{
							width: circleSize,
							height: circleSize,
							x: vibrationX,
							y: vibrationY,
							opacity: isListening ? 1 : 0.9,
						}}
						transition={{
							type: "spring",
							stiffness: 300,
							damping: 15,
						}}
					>
						{isListening && (
							<canvas
								ref={waveformCanvasRef}
								width={200}
								height={100}
								className="absolute opacity-40"
							/>
						)}
					</motion.div>

					{(isListening || isProcessing) && (
						<motion.div
							className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#282c34] text-xl font-medium max-w-[80%] text-center z-10"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.3 }}
						>
							{isProcessing ? (
								<div className="flex flex-col items-center gap-2">
									<Loader2 className="h-6 w-6 animate-spin" />
									<span className="text-sm text-[#282c34]">処理中...</span>
								</div>
							) : (
								transcript || "話しかけてください..."
							)}
						</motion.div>
					)}

					{isListening && (
						<motion.div
							className="absolute top-[15%] right-[15%] h-3 w-3 rounded-full bg-red-500"
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
				</motion.div>
			</div>

			<div className="text-center text-[#585f6b] flex items-center gap-2">
				{isListening
					? "音声を認識しています"
					: "マイクボタンをクリックして話しかけてください"}
				<Dialog>
					<DialogTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="rounded-full h-6 w-6 text-[#9f9579] hover:text-[#d9ca77]"
						>
							<Info className="h-4 w-4" />
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>音声チャットについて</DialogTitle>
							<DialogDescription>
								このインターフェースでは、マイクボタンをクリックして音声入力を開始できます。
								音声は自動的にテキストに変換され、中央の円内に表示されます。
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
					className="bg-[#9f9579] hover:bg-[#b3cfad] text-white rounded-full h-14 w-14 flex items-center justify-center"
				>
					<Mic className="h-6 w-6" />
				</Button>
				<Button
					onClick={onStopListening}
					disabled={!isListening}
					className="bg-[#d9ca77] hover:bg-[#c3e6d8] text-[#282c34] rounded-full h-14 w-14 flex items-center justify-center"
				>
					<X className="h-6 w-6" />
				</Button>
			</div>
		</div>
	);
};
