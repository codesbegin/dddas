/**
 * 领域核心类型定义
 *
 * 这些字面量联合类型是 DDD 不变量的类型层表达：
 * 非法类别 / 非法方向 / 非法状态在编译期就被挡掉。
 */

export type AccountCategory = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';

export type Direction = 'debit' | 'credit';

export type NormalBalance = Direction;

export type JournalEntryStatus = 'DRAFT' | 'POSTED' | 'LOCKED';

/** category → 正常余额方向 的映射表，编译期可知 */
export const CATEGORY_NORMAL_BALANCE: Readonly<Record<AccountCategory, NormalBalance>> = {
  ASSET: 'debit',
  EXPENSE: 'debit',
  LIABILITY: 'credit',
  EQUITY: 'credit',
  INCOME: 'credit',
};
