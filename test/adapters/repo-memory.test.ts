/**
 * InMemory Repository 行为测试
 * 运行：node --experimental-strip-types test/adapters/repo-memory.test.ts
 */

import assert from 'node:assert/strict';
import { Account } from '../../src/domain/account.js';
import { JournalEntry, Posting } from '../../src/domain/journal-entry.js';
import { InMemoryAccountRepository, InMemoryJournalEntryRepository } from '../../src/adapters/repo-memory.js';

let passed = 0;
function test(name: string, fn: () => void) {
  try { fn(); passed++; console.log('  ✅ ' + name); }
  catch (e) { console.error('  ❌ ' + name + ' — ' + (e as Error).message); process.exitCode = 1; }
}

console.log('InMemory Repository 测试：');

test('账户 save 后能 findById 和 list', async () => {
  const repo = new InMemoryAccountRepository();
  const cash = new Account({ id: 'a1', name: '现金', category: 'ASSET' });
  await repo.save(cash);
  const found = await repo.findById('a1');
  assert.equal(found?.name, '现金');
  const list = await repo.list();
  assert.equal(list.length, 1);
});

test('分录 save 后能查询，余额已被正确应用', async () => {
  const acctRepo = new InMemoryAccountRepository();
  const jeRepo = new InMemoryJournalEntryRepository();
  const cash = new Account({ id: 'a2', name: '现金', category: 'ASSET' });
  const rev = new Account({ id: 'a3', name: '收入', category: 'INCOME' });
  await acctRepo.save(cash);
  await acctRepo.save(rev);
  const je = new JournalEntry({ id: 'je1', description: '收款' });
  je.addPosting(new Posting({ account: cash, direction: 'debit', amount: 50 }));
  je.addPosting(new Posting({ account: rev, direction: 'credit', amount: 50 }));
  je.post();
  await jeRepo.save(je);
  const found = await jeRepo.findById('je1');
  assert.equal(found?.status, 'POSTED');
  assert.equal(cash.balance, 50);
});

test('重复 save 是 upsert（同 id 覆盖）', async () => {
  const repo = new InMemoryAccountRepository();
  const a = new Account({ id: 'a4', name: '旧名', category: 'ASSET' });
  await repo.save(a);
  assert.equal((await repo.findById('a4'))?.name, '旧名');
  const b = new Account({ id: 'a4', name: '新名', category: 'ASSET' });
  await repo.save(b);
  assert.equal((await repo.findById('a4'))?.name, '新名');
  assert.equal((await repo.list()).length, 1);
});

console.log('\n' + passed + ' 个测试通过');
