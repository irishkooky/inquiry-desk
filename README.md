# inquiry-desk

問い合わせ文を受け取り、仮の分類（料金 / 不具合 / その他）を返す小さなデモです。
Claude Code 研修の題材用リポジトリです。

## 必要環境

- Node.js LTS（20 以上）
- Git

## 起動手順

1. このリポジトリを clone する
2. フォルダに移動する
3. 依存関係はないが、慣例どおり次を実行してよい: （なくても動く）
4. 開発サーバーを起動する:

```bash
npm run dev
```

5. ブラウザで http://127.0.0.1:3000 を開く

## テスト

```bash
npm test
```

## API

`POST /api/classify`

```json
{ "text": "料金を教えて" }
```

応答例:

```json
{ "category": "料金", "text": "料金を教えて" }
```
