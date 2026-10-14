const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { classify } = require('./classify.js');

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
