# inquiry-desk

問い合わせ文を受け取り、仮の分類（料金 / 不具合 / その他）を返す小さなデモです。
Claude Code 研修の題材用リポジトリです。

## できること

- 問い合わせ文を1件貼って分類し、決め手になったキーワードを表示する
- 1行1件で複数の問い合わせをまとめて分類し、カテゴリ別の件数と一覧を表示する
- まとめて分類した結果を CSV で保存する（Excel で開いても文字化けしないよう BOM 付き）
- `samples/inquiries.txt` をボタン一つで読み込む
- 直近の分類履歴をブラウザに保存し（リロードしても残る）、カテゴリで絞り込む

## 必要環境

- Node.js LTS（24 以上）
- Git

## 起動手順

1. このリポジトリを clone する
2. フォルダに移動する
3. 依存関係をインストールする: `npm install`
4. 開発サーバーを起動する:

```bash
npm run dev
```

5. ブラウザで http://localhost:3000 を開く

## テスト

```bash
npm test
```

## API

`POST /api/classify`

```json
{ "text": "料金を教えて" }
```

応答例（`keyword` は分類の決め手になったキーワード。どれにも当たらなければ `null`）:

```json
{ "category": "料金", "keyword": "料金", "text": "料金を教えて" }
```

`POST /api/classify/batch`

1行1件として分類します。空行は無視し、一度に500件まで受け付けます。

```json
{ "text": "料金を教えて\n画面が動かない" }
```

応答例:

```json
{
  "results": [
    { "category": "料金", "keyword": "料金", "text": "料金を教えて" },
    { "category": "不具合", "keyword": "動かない", "text": "画面が動かない" }
  ],
  "counts": { "料金": 1, "不具合": 1, "その他": 0 }
}
```

`GET /api/categories` は分類ラベルの一覧を、`GET /api/samples` は `samples/inquiries.txt` の問い合わせ（`#` で始まる行を除く）を返します。
