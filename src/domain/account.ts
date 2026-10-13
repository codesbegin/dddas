/**
 * Account — 账户实体（DDD 领域核心）
 *
 * 不变量：
 * 1. category 只能是 ASSET/LIABILITY/EQUITY/INCOME/EXPENSE
 * 2. normalBalance 与 category 一致（类型层保证）
 * 3. balance 只能通过 Posting 累加，外部不能直接 set
 */

import { AccountCategory, Direction, NormalBalance, CATEGORY_NORMAL_BALANCE } from './types.js';

export interface AccountProps {
  id: string;
  name: string;
  category: AccountCategory;
  openingBalance?: number;
}

export class Account {
  readonly id: string;
  readonly name: string;
  readonly category: AccountCategory;
  readonly normalBalance: NormalBalance;

  /** 内部签名余额：正数=正常方向，负数=反方向 */
  private _signedBalance: number;

  constructor({ id, name, category, openingBalance = 0 }: AccountProps) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.normalBalance = CATEGORY_NORMAL_BALANCE[category];
    this._signedBalance = this.normalBalance === 'debit' ? openingBalance : -openingBalance;
  }

  /** 应用一笔过账 */
  applyPosting(direction: Direction, amount: number): void {
    if (amount <= 0) throw new Error('过账金额必须为正数');
    this._signedBalance += direction === 'debit' ? amount : -amount;
  }

  /** 展示余额（正数），自动按正常方向取绝对值 */
  get balance(): number {
    return Math.abs(this._signedBalance);
  }

  /** 当前余额是否处于正常方向 */
  get isNormalDirection(): boolean {
    return this._signedBalance >= 0;
  }
}
