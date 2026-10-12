/**
 * Account 不变量测试
 *
 * 直接用 node:assert 跑：node test/account.test.js
 * 不依赖任何测试框架。
 */

const assert = require('node:assert');
const { Account } = require('../src/account');

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ✅ ' + name); }
  catch (e) { console.error('  ❌ ' + name + ' — ' + e.message); process.exitCode = 1; }
}

console.log('Account 不变量测试：');

test('合法类别能正常创建', () => {
  const a = new Account({ id: 'asset:cash', name: '现金', category: 'ASSET' });
  assert.strictEqual(a.normalBalance, 'debit');
  assert.strictEqual(a.balance, 0);
});

test('非法类别抛错', () => {
  assert.throws(() => new Account({ id: 'x', name: 'x', category: 'FOO' }), /未知账户类别/);
});

test('Asset 账户借方增加余额', () => {
  const cash = new Account({ id: 'asset:cash', name: '现金', category: 'ASSET' });
  cash.applyPosting('debit', 100);
  cash.applyPosting('credit', 30);
  assert.strictEqual(cash.balance, 70);
  assert.strictEqual(cash.isNormalDirection, true);
});

test('Liability 账户贷方增加余额', () => {
  const ap = new Account({ id: 'liab:payable', name: '应付账款', category: 'LIABILITY' });
  ap.applyPosting('credit', 500);
  ap.applyPosting('debit', 200);
  assert.strictEqual(ap.balance, 300);
  assert.strictEqual(ap.isNormalDirection, true);
});

test('反方向余额检测为异常', () => {
  const cash = new Account({ id: 'asset:cash', name: '现金', category: 'ASSET' });
  cash.applyPosting('credit', 100); // 资产被贷了 100
  assert.strictEqual(cash.isNormalDirection, false);
});

test('过账金额必须为正', () => {
  const a = new Account({ id: 'asset:cash', name: '现金', category: 'ASSET' });
  assert.throws(() => a.applyPosting('debit', 0), /过账金额必须为正数/);
  assert.throws(() => a.applyPosting('debit', -5), /过账金额必须为正数/);
});

test('期初余额按正常方向设置', () => {
  const rev = new Account({ id: 'income:sales', name: '销售收入', category: 'INCOME', openingBalance: 1000 });
  assert.strictEqual(rev.balance, 1000);
  assert.strictEqual(rev.isNormalDirection, true);
});

console.log('\n' + passed + ' 个测试通过');
