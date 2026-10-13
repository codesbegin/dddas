/**
 * Repository 接口（持久化抽象）
 *
 * 参考 DeepSeek Harness 的插件化设计：领域层只依赖接口，
 * 不依赖 SQLite / DuckDB / 内存等具体实现。
 * 未来加新存储后端只要实现这两个接口。
 */

import { Account } from './account.js';
import { JournalEntry } from './journal-entry.js';

export interface AccountRepository {
  save(account: Account): Promise<void>;
  findById(id: string): Promise<Account | null>;
  list(): Promise<Account[]>;
}

export interface JournalEntryRepository {
  save(entry: JournalEntry): Promise<void>;
  findById(id: string): Promise<JournalEntry | null>;
  list(limit?: number): Promise<JournalEntry[]>;
}
