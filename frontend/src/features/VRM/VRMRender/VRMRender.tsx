import { useMemo, useEffect, forwardRef, useImperativeHandle } from "react";
import { useFrame } from "@react-three/fiber";
import { Clock, Object3D } from "three";
import { useVRM } from "../hooks/useVRM";
import * as THREE from "three";
import { useVRMExpression } from "../hooks/useVRMExpression";

type VRMRenderProps = {
	vrmUrl: string; // VRMモデルのURL
	vrmaUrl?: string; // アニメーションファイルのURL（省略可）
	position?: [number, number, number]; // 3D空間での位置
	rotation?: [number, number, number]; // 回転（オイラー角）
	lookAtCamera?: boolean; // カメラを見るかどうか
	isMuted: boolean; // 音声ミュートの状態
};

const VRMRender = forwardRef(
	(
		{
			vrmUrl,
			vrmaUrl,
			position = [0, 0, 0],
			rotation = [0, 0, 0],
			lookAtCamera = false,
			isMuted,
		}: VRMRenderProps,
		ref,
	) => {
		// VRMモデルとアニメーションの読み込み
		const { vrm, scene, mixer, crossFadeAnimation } = useVRM(vrmUrl, vrmaUrl);

		// 瞬きと呼吸アニメーション + リップシンク
		const expressions = useVRMExpression(vrm, isMuted);

		// refを通じて親コンポーネントにcrossFadeAnimation関数を公開
		useImperativeHandle(ref, () => ({
			crossFadeAnimation,
			setExpression: expressions.setExpression,
			setExpressionForMotion: expressions.setExpressionForMotion,
			playAudio: expressions.playAudio,
			isAudioInitialized: expressions.isAudioInitialized,
		}));

		// 初期モーション読み込み時に表情も設定
		// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
		useEffect(() => {
			if (vrm && vrmaUrl) {
				// モデルとモーションの両方がロードされたら表情を設定
				expressions.setExpressionForMotion(vrmaUrl);
			}
		}, [vrm, vrmaUrl]);

		// 視線のターゲットとなるオブジェクト
		const lookAtTarget = useMemo(() => {
			const target = new Object3D();
			target.position.set(0, 1.4, 1); // デフォルトはカメラ位置（正面）
			return target;
		}, []);

		// 時間計測用のクロック
		const clock = useMemo(() => new Clock(true), []);

		/**
		 * 位置と回転の滑らかな補間
		 * モデルの移動をアニメーション化し、唐突な移動を防止
		 */
		useEffect(() => {
			if (!scene) return;
			// 開始位置と目標位置
			const startPos = scene.position.clone();
			const startRot = scene.rotation.clone();
			const targetPos = { x: position[0], y: position[1], z: position[2] };
			const targetRot = { x: rotation[0], y: rotation[1], z: rotation[2] };

			// アニメーション制御変数
			let progress = 0;
			const duration = 0.05; // 短い時間でスムーズに移動（50ミリ秒）

			// 位置と回転を更新する関数
			const update = () => {
				if (progress >= duration) return;

				progress += clock.getDelta();
				const t = Math.min(progress / duration, 1);

				// 位置の線形補間（Vector3.lerpVectors使用）
				scene.position.lerpVectors(
					startPos,
					new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z),
					t,
				);

				// 回転の線形補間
				scene.rotation.x = startRot.x + (targetRot.x - startRot.x) * t;
				scene.rotation.y = startRot.y + (targetRot.y - startRot.y) * t;
				scene.rotation.z = startRot.z + (targetRot.z - startRot.z) * t;

				// アニメーションが終わるまで再帰呼び出し
				if (t < 1) requestAnimationFrame(update);
			};

			// アニメーション開始
			update();
		}, [scene, position, rotation, clock]);

		/**
		 * VRMのルックアット機能の設定
		 * モデルの視線制御を行う
		 */
		useEffect(() => {
			// biome-ignore lint/complexity/useOptionalChain: <explanation>
			if (vrm && vrm.lookAt) {
				vrm.lookAt.target = lookAtTarget;
			}
		}, [vrm, lookAtTarget]);

		/**
		 * フレームごとの更新処理
		 * アニメーションの更新や視線の制御を行う
		 */
		useFrame(() => {
			const delta = clock.getDelta();

			// カメラ目線の制御
			if (!lookAtCamera && vrm && vrm.lookAt) {
				// lookAtCameraがfalseの場合、モデルの前方を見る
				lookAtTarget.position.set(
					position[0],
					position[1] + 1.4,
					position[2] + 1,
				);
			}

			// 瞬きと呼吸アニメーションの更新 + リップシンク
			expressions.update(delta);

			// VRMモデルとアニメーションの更新
			vrm?.update(delta);
			mixer?.update(delta);
		});

		// シーンが未ロードの場合は何も表示しない
		if (!scene) return null;

		// シーンをThree.jsのプリミティブとして描画
		return <primitive object={scene} dispose={null} />;
	},
);

export default VRMRender;
