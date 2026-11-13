import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { classify, matchedKeyword, splitInquiries, CATEGORIES } from './classify.ts';

describe('classify', () => {
  it('料金キーワードを料金に分類する', () => {
    assert.equal(classify('月額料金を教えて'), '料金');
  });

  it('不具合キーワードを不具合に分類する', () => {
    assert.equal(classify('画面が動かない'), '不具合');
  });

  it('どれにも当てはまらなければその他', () => {
    assert.equal(classify('資料を送ってください'), 'その他');
  });

  // TODO: 空文字・空白のみの入力のテストを足す
  // TODO: 大文字小文字のゆれ（Bug / ERROR）のテストを足す
});

describe('matchedKeyword', () => {
  it('分類の決め手になったキーワードを返す', () => {
    assert.equal(matchedKeyword('先月の請求が高い'), '請求');
    assert.equal(matchedKeyword('ログインでエラーが出る'), 'エラー');
  });

  it('どのキーワードにも当たらなければ null', () => {
    assert.equal(matchedKeyword('資料を送ってください'), null);
  });

  it('classify と同じ順でキーワードを見る（先に当たったルールが勝つ）', () => {
    const text = '請求画面でエラーが出る';
    assert.equal(classify(text), '料金');
    assert.equal(matchedKeyword(text), '請求');
  });
});

describe('splitInquiries', () => {
  it('1行1件に分け、前後の空白を落とす', () => {
    assert.deepEqual(splitInquiries('  料金を教えて \r\n画面が動かない'), ['料金を教えて', '画面が動かない']);
  });

  it('空行・空白だけの行（全角スペースを含む）は除く', () => {
    assert.deepEqual(splitInquiries('\n料金\n   \n\u3000\u3000\n'), ['料金']);
  });
});

describe('CATEGORIES', () => {
  it('分類ラベルの一覧に その他 を含む', () => {
    assert.deepEqual(CATEGORIES, ['料金', '不具合', 'その他']);
  });
});
