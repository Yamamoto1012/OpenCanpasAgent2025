import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Clock } from "three";
import { useVRM } from "../hooks/useVRM";

type VRMRenderProps = {
  vrmUrl: string;
  vrmaUrl?: string;
};

export default function VRMRender({ vrmUrl, vrmaUrl }: VRMRenderProps) {
  // useVRM カスタムフックでVRMデータを取得
  const { vrm, scene, mixer } = useVRM(vrmUrl, vrmaUrl);

  // コンポーネントのライフサイクル全体で一定の Clock インスタンスを生成
  const clock = useMemo(() => new Clock(true), []);

  // 毎フレーム、VRMモデルとアニメーションミキサーを更新
  useFrame(() => {
    const delta = clock.getDelta();
    vrm?.update(delta);
    mixer?.update(delta);
  });

  // シーンが未ロードの場合は何もレンダリングしない
  if (!scene) return null;

  return <primitive object={scene} dispose={null} />;
}
