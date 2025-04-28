# OpenCanpasAgent2025
金沢工業大学の春のオープンキャンパス2025の情報工学科ブースで展示予定

## 起動方法
フロントエンドとバックエンドをそれぞれ起動してください。

```bash
# フロントエンド
$ cd frontend
$ pnpm run dev      # http://localhost:5173/

# バックエンド
$ cd ../backend
$ docker compose up -d    # FastAPI は :8001 で待機
```
アクセス後、ブラウザで `http://localhost:5173` を開くと 利用可能です。

