import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import type { Scene, Group } from "three";
import type { VRM } from "@pixiv/three-vrm";
import { VRMLoaderPlugin } from "@pixiv/three-vrm";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
	VRMAnimationLoaderPlugin,
	createVRMAnimationClip,
} from "@pixiv/three-vrm-animation";

type UseVRMReturn = {
	vrm: VRM | null; // ロードされたVRMモデル
	scene: Scene | Group | null; // シーングラフ
	mixer: THREE.AnimationMixer | null; // アニメーション制御用ミキサー
	crossFadeAnimation: (vrmaUrl: string, duration?: number) => void; // アニメーション切替関数
};

/**
 * VRMモデルとアニメーションを管理するカスタムフック
 * @param vrmUrl ロードするVRMモデルのURL
 * @param initialVrmaUrl 初期アニメーションのURL
 * @returns VRMモデル、シーン、アニメーションミキサー、クロスフェード関数を含むオブジェクト
 */

export const useVRM = (
	vrmUrl: string,
	initialVrmaUrl?: string,
): UseVRMReturn => {
	// モデルとシーンの状態
	const [vrm, setVRM] = useState<VRM | null>(null);
	const [scene, setScene] = useState<Scene | Group | null>(null);
	const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);

	// 永続的な参照（レンダリング間で保持）
	const currentActionRef = useRef<THREE.AnimationAction | null>(null); // 現在再生中のアニメーション
	const loaderRef = useRef<GLTFLoader | null>(null); // GLTFローダーのインスタンス

	/**
	 * VRMAアニメーションを読み込み、適用する関数
	 * @param vrmaUrl ロードするアニメーションファイルのパス
	 * @param targetVRM アニメーションを適用するVRMモデル
	 * @param targetMixer 使用するAnimationMixer
	 */
	const loadAnimation = (
		vrmaUrl: string,
		targetVRM: VRM,
		targetMixer: THREE.AnimationMixer,
	) => {
		if (!loaderRef.current) return;

		// VRMAファイルの読み込み
		loaderRef.current.load(
			vrmaUrl,
			(vrmaGltf) => {
				// アニメーションデータの取得
				const vrmAnimations = vrmaGltf.userData.vrmAnimations;
				if (!vrmAnimations || vrmAnimations.length === 0) {
					console.warn("VRMAファイル内にアニメーションが見つかりません");
					return;
				}

				// VRM用アニメーションクリップの作成
				const clip = createVRMAnimationClip(vrmAnimations[0], targetVRM);

				// 現在のアニメーションをフェードアウト（存在する場合）
				currentActionRef.current?.fadeOut(0.2);

				// 新しいアニメーションを作成してフェードイン
				const newAction = targetMixer.clipAction(clip);
				newAction.reset().fadeIn(0.2).play();
				currentActionRef.current = newAction;
			},
			undefined,
			(error) => console.error("VRMA読み込みエラー:", error),
		);
	};

	// VRMモデルのロードと初期設定
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		// GLTFローダーの初期化とプラグイン登録
		const loader = new GLTFLoader();
		loader.register((parser) => new VRMLoaderPlugin(parser));
		loader.register((parser) => new VRMAnimationLoaderPlugin(parser));
		loaderRef.current = loader;

		// VRMモデルのロード
		loader.load(
			vrmUrl,
			(gltf) => {
				const loadedVRM: VRM = gltf.userData.vrm;
				if (!loadedVRM) {
					console.warn("VRMが読み込めませんでした");
					return;
				}

				// 状態を更新
				setVRM(loadedVRM);
				setScene(loadedVRM.scene);

				// アニメーションミキサーを初期化
				const newMixer = new THREE.AnimationMixer(loadedVRM.scene);
				setMixer(newMixer);

				// 初期アニメーションがある場合は読み込み
				if (initialVrmaUrl) {
					loadAnimation(initialVrmaUrl, loadedVRM, newMixer);
				}
			},
			undefined,
			(error) => console.error("VRM読み込みエラー:", error),
		);

		// クリーンアップ関数 - アニメーションを停止
		return () => {
			mixer?.stopAllAction();
		};
	}, [vrmUrl, initialVrmaUrl]);

	/**
	 * アニメーションをクロスフェードで切り替える関数
	 * @param vrmaUrl 新しいアニメーションファイルのパス
	 */
	const crossFadeAnimation = (vrmaUrl: string) => {
		if (vrm && mixer) {
			loadAnimation(vrmaUrl, vrm, mixer);
		}
	};

	// フックの戻り値
	return { vrm, scene, mixer, crossFadeAnimation };
};
