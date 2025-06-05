# OpenCanapasAgent2025 Frontend

3D VRMアバターを活用した対話型AIエージェントのフロントエンド

## 技術スタック

### フレームワーク・ライブラリ
- **React 19** + **TypeScript**
- **Vite**
- **TanStack Router**
- **TanStack Query**

### スタイリング・UI
- **Tailwind CSS 4**
- **shadcn/ui**
- **Framer Motion**
- **Lucide React**

### 3D・VRM
- **Three.js**
- **@react-three/fiber**
- **@react-three/drei**
- **@pixiv/three-vrm**

### 状態管理
- **Jotai**
- **React Hooks**

### テスト・品質管理
- **Vitest**
- **Testing Library**
- **ESLint** + **Biome**

## 📁 プロジェクト構造

```
frontend/
├── src/
│   ├── components/          # 共通UIコンポーネント
│   │   ├── ui/             # shadcn/uiベースコンポーネント
│   │   └── AppLayout.tsx   # アプリケーション全体のレイアウト
│   ├── features/           # 機能別コンポーネント
│   │   ├── VRM/           # VRMアバター関連
│   │   ├── ChatInterface/ # チャット機能
│   │   ├── VoiceChat/     # 音声チャット
│   │   ├── ScreenManager/ # 画面遷移管理
│   │   └── ...           # その他機能
│   ├── hooks/             # カスタムフック
│   ├── store/             # Jotaiアトム（状態管理）
│   ├── services/          # API・外部サービス連携
│   ├── lib/              # ユーティリティ・設定
│   ├── config/           # アプリケーション設定
│   └── assets/           # 静的ファイル
├── public/               # 公開ファイル
└── docs/                # ドキュメント
```

## セットアップ

### 必要な環境
- **Node.js** 18.0.0 以上
- **pnpm** 8.0.0 以上

### インストール
```bash
# 依存関係のインストール
pnpm install

# 開発サーバー起動
pnpm dev
```

## 利用可能なスクリプト

```bash
# 開発サーバー起動
pnpm dev

# 本番用ビルド
pnpm build

# ビルド結果のプレビュー
pnpm preview

# テスト実行
pnpm test

# リンティング
pnpm lint

# コードフォーマット
pnpm format
```

## 開発ガイドライン

### コンポーネント作成
- **名前付きエクスポート**を使用（デフォルトエクスポート禁止）
- Props は `type` で型定義
- Tailwind CSS でスタイリング
- Framer Motion でアニメーション

```tsx
// 推奨パターン
export type ButtonProps = {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  children 
}) => (
  <motion.button
    className={twMerge(
      'px-4 py-2 rounded-md',
      variant === 'primary' ? 'bg-blue-500' : 'bg-gray-500'
    )}
    whileHover={{ scale: 1.05 }}
  >
    {children}
  </motion.button>
);
```

### 状態管理
- **Jotai** でグローバル状態を管理
- アトムは `store/` ディレクトリで機能別に分類
- ローカル状態は `useState` で十分

```tsx
// store/appStateAtoms.ts
export const showVoiceChatAtom = atom(false);

// コンポーネント内
const [showVoiceChat, setShowVoiceChat] = useAtom(showVoiceChatAtom);
```

### ファイル命名規則
- コンポーネント: `PascalCase.tsx`
- フック: `use + PascalCase.ts`
- ユーティリティ: `camelCase.ts`
- 定数: `SCREAMING_SNAKE_CASE`

## 主要機能

### 3D VRMアバター
- VRMモデルの読み込み・表示
- リップシンク・表情変化
- アニメーション制御

### 対話インターフェース
- テキストチャット
- 音声入力・出力
- カテゴリナビゲーション

### レスポンシブデザイン
- モバイル・デスクトップ対応
- タッチジェスチャーサポート

## テスト

```bash
# 全テスト実行
pnpm test

# ウォッチモード
pnpm test --watch

# カバレッジ確認
pnpm test --coverage
```

## ビルド・デプロイ

```bash
# 本番ビルド
pnpm build

# 静的ファイルは dist/ に出力される
```
