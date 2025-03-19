import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Clock } from 'three'
import { useVRM } from '../hooks/useVRM'

type Props = {
  url: string
}

/**
 * VRMRender コンポーネント
 * 指定された URL の VRM モデルを読み込み、シーンオブジェクトとしてレンダリングする。
 * モデルのアニメーション更新は useFrame 内で行う。
 *
 * @param url - VRM モデルの URL
 * @returns JSX.Element
 */
export default function VRMRender({ url }: Props) {
  const { vrm, scene } = useVRM(url)
  // コンポーネントのライフサイクル全体で一定の Clock インスタンスを作成
  const clock = useMemo(() => new Clock(true), [])

  // 毎フレーム、VRM モデルの更新を行う
  useFrame(() => {
    vrm?.update(clock.getDelta())
  })

  // シーンが未ロードの場合は早期リターン
  if (!scene) return null

  return <primitive object={scene} dispose={null} />
}
