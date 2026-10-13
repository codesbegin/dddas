/**
 * JournalEntry 不变量测试
 * 运行：node --experimental-strip-types test/domain/journal-entry.test.ts
 */

import assert from 'node:assert/strict';
import { Account } from '../../src/domain/account.js';
import { JournalEntry, Posting } from '../../src/domain/journal-entry.js';

let passed = 0;
function test(name: string, fn: () => void) {
  try { fn(); passed++; console.log('  ✅ ' + name); }
  catch (e) { console.error('  ❌ ' + name + ' — ' + (e as Error).message); process.exitCode = 1; }
}

console.log('JournalEntry 不变量测试：');

test('平衡分录能提交，账户余额被正确应用', () => {
  const cash = new Account({ id: 'asset:cash', name: '现金', category: 'ASSET' });
  const ap = new Account({ id: 'liab:payable', name: '应付账款', category: 'LIABILITY' });
  const je = new JournalEntry({ id: 'JE-001', description: '赊购' });
  je.addPosting(new Posting({ account: cash, direction: 'debit', amount: 100 }));
  je.addPosting(new Posting({ account: ap, direction: 'credit', amount: 100 }));
  je.post();
  assert.equal(je.status, 'POSTED');
  assert.equal(cash.balance, 100);
  assert.equal(ap.balance, 100);
});

test('不平衡分录抛错', () => {
  const cash = new Account({ id: 'asset:cash', name: '现金', category: 'ASSET' });
  const je = new JournalEntry({ id: 'JE-002', description: '不平' });
  je.addPosting(new Posting({ account: cash, direction: 'debit', amount: 100 }));
  je.addPosting(new Posting({ account: cash, direction: 'credit', amount: 90 }));
  assert.throws(() => je.post(), /借贷不平衡/);
});

test('少于两行过账抛错', () => {
  const cash = new Account({ id: 'asset:cash', name: '现金', category: 'ASSET' });
  const je = new JournalEntry({ id: 'JE-003', description: '单行' });
  je.addPosting(new Posting({ account: cash, direction: 'debit', amount: 100 }));
  assert.throws(() => je.post(), /至少需要两行/);
});

test('状态机只能前进', () => {
  const cash = new Account({ id: 'asset:cash', name: '现金', category: 'ASSET' });
  const ap = new Account({ id: 'liab:payable', name: '应付', category: 'LIABILITY' });
  const je = new JournalEntry({ id: 'JE-004', description: '状态机' });
  je.addPosting(new Posting({ account: cash, direction: 'debit', amount: 10 }));
  je.addPosting(new Posting({ account: ap, direction: 'credit', amount: 10 }));
  je.post();
  je.lock();
  assert.equal(je.status, 'LOCKED');
  assert.throws(() => je.addPosting(new Posting({ account: cash, direction: 'debit', amount: 1 })), /DRAFT/);
});

test('整数分位平衡（浮点容错）', () => {
  const cash = new Account({ id: 'asset:cash', name: '现金', category: 'ASSET' });
  const ap = new Account({ id: 'liab:payable', name: '应付', category: 'LIABILITY' });
  const je = new JournalEntry({ id: 'JE-005', description: '浮点' });
  je.addPosting(new Posting({ account: cash, direction: 'debit', amount: 0.1 }));
  je.addPosting(new Posting({ account: ap, direction: 'credit', amount: 0.1 }));
  assert.equal(je.isBalanced, true);
});

console.log('\n' + passed + ' 个测试通过');
