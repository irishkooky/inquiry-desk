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

/**
 * 分類の決め手になったキーワードを返す（どれにも当たらなければ null）。
 * classify と同じ RULES・同じ照合方法を使うので、結果は classify と食い違わない。
 */
export function matchedKeyword(text: string): string | null {
  for (const rule of RULES) {
    for (const kw of rule.keywords) {
      if (text.includes(kw)) return kw;
    }
  }
  return null;
}

/** 画面の絞り込みなどで使う分類ラベルの一覧（RULES の順 + その他） */
export const CATEGORIES: string[] = [...RULES.map((r) => r.category), 'その他'];

/**
 * 複数行のテキストを 1 行 1 件として分けて返す。
 * 空行（空白だけの行も含む）は問い合わせではないので除く。
 */
export function splitInquiries(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '');
}
