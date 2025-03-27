import { useMemo, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Clock, Object3D } from "three";
import { useVRM } from "../hooks/useVRM";

type VRMRenderProps = {
	vrmUrl: string;
	vrmaUrl?: string;
	position?: [number, number, number];
	rotation?: [number, number, number];
	lookAtCamera?: boolean;
};

export default function VRMRender({
	vrmUrl,
	vrmaUrl,
	position = [0, 0, 0],
	rotation = [0, 0, 0],
	lookAtCamera = false,
}: VRMRenderProps) {
	// useVRM カスタムフックでVRMデータを取得
	const { vrm, scene, mixer } = useVRM(vrmUrl, vrmaUrl);

	// 視線のターゲット
	const lookAtTarget = useMemo(() => {
		const target = new Object3D();
		target.position.set(0, 1.4, 1); // カメラと同じ位置
		return target;
	}, []);

	// コンポーネントのライフサイクル全体で一定の Clock インスタンスを生成
	const clock = useMemo(() => new Clock(true), []);

	// positionとrotationが変更されたときにシーンの位置と回転を更新
	useEffect(() => {
		if (scene) {
			scene.position.set(position[0], position[1], position[2]);
			scene.rotation.set(rotation[0], rotation[1], rotation[2]);
		}
	}, [scene, position, rotation]);

	// VRMのルックアット機能を設定
	useEffect(() => {
		// biome-ignore lint/complexity/useOptionalChain: <explanation>
		if (vrm && vrm.lookAt) {
			// ルックアット機能の有効化
			vrm.lookAt.target = lookAtTarget;
		}
	}, [vrm, lookAtTarget]);

	// 毎フレーム、VRMモデルとアニメーションミキサーを更新
	useFrame(() => {
		const delta = clock.getDelta();

		// カメラ目線の制御（lookAtCameraがtrueのときのみ適用）
		if (!lookAtCamera && vrm && vrm.lookAt) {
			// lookAtCameraがfalseの場合は目線を前方に戻す
			lookAtTarget.position.set(
				position[0],
				position[1] + 1.4,
				position[2] + 1,
			);
		}

		vrm?.update(delta);
		mixer?.update(delta);
	});

	// シーンが未ロードの場合は何もレンダリングしない
	if (!scene) return null;

	return <primitive object={scene} dispose={null} />;
}
