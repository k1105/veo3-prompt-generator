# YAML Scene Generator

映画シーンの YAML 形式での詳細な記述を生成するツールです。

## 機能

- 基本情報（タイトル、シノプシス）の入力
- Gemini 2.5 Fast を使用した自動生成機能
- 視覚・音響要素の詳細設定
- 空間レイアウトの設定
- タイムライン編集機能
- YAML 形式での出力

## セットアップ

1. 依存関係のインストール:

```bash
npm install
```

2. Gemini API キーの設定:
   - [Google AI Studio](https://makersuite.google.com/app/apikey) で API キーを取得
   - プロジェクトルートに `.env.local` ファイルを作成:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

3. 開発サーバーの起動:

```bash
npm run dev
```

## 使用方法

1. Basic Information セクションでタイトルとシノプシスを入力
2. "Generate"ボタンをクリックして他の項目を自動生成
3. 必要に応じて生成された内容を編集
4. "Generate YAML"ボタンで YAML 形式の出力を生成

## 技術スタック

- Next.js 14
- React
- TypeScript
- Gemini 2.5 Fast API

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
