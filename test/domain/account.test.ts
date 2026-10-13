/**
 * Account 不变量测试（TypeScript 版）
 * 运行：node --experimental-strip-types test/domain/account.test.ts
 */

import assert from 'node:assert/strict';
import { Account } from '../../src/domain/account.js';

let passed = 0;
function test(name: string, fn: () => void) {
  try { fn(); passed++; console.log('  ✅ ' + name); }
  catch (e) { console.error('  ❌ ' + name + ' — ' + (e as Error).message); process.exitCode = 1; }
}

console.log('Account 不变量测试：');

test('合法类别能正常创建', () => {
  const a = new Account({ id: 'asset:cash', name: '现金', category: 'ASSET' });
  assert.equal(a.normalBalance, 'debit');
  assert.equal(a.balance, 0);
});

test('Asset 账户借方增加余额', () => {
  const cash = new Account({ id: 'asset:cash', name: '现金', category: 'ASSET' });
  cash.applyPosting('debit', 100);
  cash.applyPosting('credit', 30);
  assert.equal(cash.balance, 70);
  assert.equal(cash.isNormalDirection, true);
});

test('Liability 账户贷方增加余额', () => {
  const ap = new Account({ id: 'liab:payable', name: '应付账款', category: 'LIABILITY' });
  ap.applyPosting('credit', 500);
  ap.applyPosting('debit', 200);
  assert.equal(ap.balance, 300);
  assert.equal(ap.isNormalDirection, true);
});

test('反方向余额检测为异常', () => {
  const cash = new Account({ id: 'asset:cash', name: '现金', category: 'ASSET' });
  cash.applyPosting('credit', 100);
  assert.equal(cash.isNormalDirection, false);
});

test('过账金额必须为正', () => {
  const a = new Account({ id: 'asset:cash', name: '现金', category: 'ASSET' });
  assert.throws(() => a.applyPosting('debit', 0), /过账金额必须为正数/);
});

test('期初余额按正常方向设置', () => {
  const rev = new Account({ id: 'income:sales', name: '销售收入', category: 'INCOME', openingBalance: 1000 });
  assert.equal(rev.balance, 1000);
  assert.equal(rev.isNormalDirection, true);
});

console.log('\n' + passed + ' 个测试通过');
