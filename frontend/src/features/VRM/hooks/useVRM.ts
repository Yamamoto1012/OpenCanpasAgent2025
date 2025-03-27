import { useState, useEffect } from "react";
import * as THREE from "three";
import type { Scene, Group } from "three";
import { type VRM, VRMUtils, VRMLoaderPlugin } from "@pixiv/three-vrm";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
	VRMAnimationLoaderPlugin,
	createVRMAnimationClip,
} from "@pixiv/three-vrm-animation";

type UseVRMReturn = {
	vrm: VRM | null;
	scene: Scene | Group | null;
	mixer: THREE.AnimationMixer | null;
};

export const useVRM = (vrmUrl: string, vrmaUrl?: string): UseVRMReturn => {
	const [vrm, setVRM] = useState<VRM | null>(null);
	const [scene, setScene] = useState<Scene | Group | null>(null);
	const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);

	useEffect(() => {
		// GLTFLoader のインスタンス生成
		const loader = new GLTFLoader();

		// VRM および VRMA の読み込みを可能にするプラグインの登録
		loader.register((parser) => new VRMLoaderPlugin(parser));
		loader.register((parser) => new VRMAnimationLoaderPlugin(parser));

		// VRMファイルの読み込み
		loader.load(
			vrmUrl,
			(gltf) => {
				const loadedVRM: VRM = gltf.userData.vrm;
				if (!loadedVRM) {
					console.warn("VRMが読み込めませんでした");
					return;
				}

				// モデルの向きを調整
				VRMUtils.rotateVRM0(loadedVRM);
				setVRM(loadedVRM);
				setScene(loadedVRM.scene);

				// VRMAファイルが指定されていない場合はここで処理終了
				if (!vrmaUrl) return;

				// VRMAファイルの読み込み処理
				loader.load(
					vrmaUrl,
					(vrmaGltf) => {
						const vrmAnimations = vrmaGltf.userData.vrmAnimations;
						if (!vrmAnimations || vrmAnimations.length === 0) {
							console.warn(
								"VRMAファイル内にアニメーションが見つかりませんでした",
							);
							return;
						}

						// AnimationMixer を初期化し、最初のアニメーションクリップを再生
						const newMixer = new THREE.AnimationMixer(loadedVRM.scene);
						const clip = createVRMAnimationClip(vrmAnimations[0], loadedVRM);
						newMixer.clipAction(clip).play();
						setMixer(newMixer);
					},
					undefined,
					(error) => {
						console.error("VRMAファイル読み込みエラー:", error);
					},
				);
			},
			undefined,
			(error) => {
				console.error("VRMファイル読み込みエラー:", error);
			},
		);
	}, [vrmUrl, vrmaUrl]);

	return { vrm, scene, mixer };
};
