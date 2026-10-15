/**
 * キーワードだけで問い合わせを分類する（Claude API はまだ使わない）。
 * TODO: 「緊急度」判定をあとで足す
 * TODO: 分類ラベルを設定ファイルに外出しする
 */

type Rule = { category: string; keywords: string[] };

const RULES: Rule[] = [
  { category: '料金', keywords: ['料金', '価格', 'いくら', '費用', '請求'] },
  { category: '不具合', keywords: ['不具合', 'バグ', 'エラー', '動かない', '落ちる'] },
];

export function classify(text: string): string {
  // 仕込み不具合1: 空文字や空白だけで text[0] に触れて落ちる
  const head = text[0].toLowerCase();

  // 仕込み不具合2: 大文字小文字を揃えないので "Bug" / "ERROR" は不具合に入らない
  for (const rule of RULES) {
    for (const kw of rule.keywords) {
      if (text.includes(kw)) return rule.category;
    }
  }
  return head ? 'その他' : 'その他';
}
