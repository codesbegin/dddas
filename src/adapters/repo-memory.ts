/**
 * 内存 Repository 实现
 *
 * 用于开发/测试，把 Account / JournalEntry 存进 Map。
 * 后续会有 SQLite 实现，接口不变。
 */

import { Account } from '../domain/account.js';
import { JournalEntry } from '../domain/journal-entry.js';
import type { AccountRepository, JournalEntryRepository } from './repository.js';

export class InMemoryAccountRepository implements AccountRepository {
  private readonly accounts = new Map<string, Account>();

  async save(account: Account): Promise<void> {
    this.accounts.set(account.id, account);
  }

  async findById(id: string): Promise<Account | undefined> {
    return this.accounts.get(id);
  }

  async list(): Promise<Account[]> {
    return [...this.accounts.values()];
  }
}

export class InMemoryJournalEntryRepository implements JournalEntryRepository {
  private readonly entries = new Map<string, JournalEntry>();

  async save(entry: JournalEntry): Promise<void> {
    this.entries.set(entry.id, entry);
  }

  async findById(id: string): Promise<JournalEntry | undefined> {
    return this.entries.get(id);
  }

  async list(): Promise<JournalEntry[]> {
    return [...this.entries.values()];
  }
}
