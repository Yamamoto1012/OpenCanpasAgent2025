import { useState, useEffect } from 'react'
import { VRM, VRMUtils, VRMLoaderPlugin } from '@pixiv/three-vrm'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Scene, Group } from 'three'

/**
 * 指定 URL の VRM モデルを読み込み、VRM インスタンスとそのシーンを返すカスタムフック
 *
 * @param url - VRM モデルの URL
 * @returns { vrm: VRM | null, scene: Scene | Group | null }
 */
export const useVRM = (url: string) => {
  const [vrm, setVRM] = useState<VRM | null>(null)
  const [scene, setScene] = useState<Scene | Group | null>(null)

  useEffect(() => {
    let isMounted = true
    const loader = new GLTFLoader()
    // VRM 用のプラグインを登録
    loader.register((parser) => new VRMLoaderPlugin(parser))
    // 非同期で VRM モデルを読み込む
    loader.loadAsync(
      url,
      // 進捗状況をログ出力
      (xhr) => {
        console.log(`ロード進捗: ${((xhr.loaded / xhr.total) * 100).toFixed(2)}%`)
      }
    )
      .then((gltf) => {
        if (!isMounted) return
        // 読み込み完了時の処理
        const loadedVRM = gltf.userData.vrm as VRM
        console.log('ロード完了')
        // 不要なジョイントの除去
        VRMUtils.removeUnnecessaryJoints(loadedVRM.scene)
        // VRM の向き調整（rotateVRM0 は VRM の回転を初期化するための処理）
        VRMUtils.rotateVRM0(loadedVRM)
        // 状態を更新（不変性を保ちながら更新）
        setVRM(loadedVRM)
        setScene(loadedVRM.scene)
      })
      .catch((error) => {
        console.error('読み込みエラー発生', error)
      })
    return () => {
      isMounted = false
    }
  }, [url])

  return { vrm, scene }
}
