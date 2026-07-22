
# 咳をしても一人じゃない

匿名で咳を録音・投稿・再生できる Web アプリケーションです。

## 機能

* **録音**: ブラウザ上で咳を録音し、録音後にプレビュー・再録音が可能
* **投稿**: 録音した咳をサーバーへアップロードして保存
* **再生**: 投稿された咳を一覧から選択して再生

## 技術スタック

| 分類              | 技術                      |
| --------------- | ----------------------- |
| Framework       | Next.js 16 (App Router) |
| Language        | TypeScript              |
| Runtime         | React 19 / Bun          |
| Styling         | Tailwind CSS v4         |
| UI              | shadcn/ui (Radix UI)    |
| Audio Recording | react-media-recorder    |
| Storage         | Vercel Blob             |
| Testing         | Vitest                  |

## ディレクトリ構成

```text
.
├── app/              # ページ・レイアウト・API
│   └── api/          # 音声アップロード・取得 API
├── components/       # UI コンポーネント
│   └── ui/           # shadcn/ui コンポーネント
├── lib/              # 共通ユーティリティ
├── public/           # 静的ファイル
└── README.md         # プロジェクト概要
```