/**
 * Account — 账户实体骨架
 *
 * 对应 docs/ledger.md 里的 Account 概念：一个有名的余额桶。
 * 本文件是领域模型的第一个代码 stub，只表达核心不变量，
 * 不接 ORM / DB / HTTP。
 *
 * 不变量：
 * 1. category 只能是 ASSET/LIABILITY/EQUITY/INCOME/EXPENSE 之一
 * 2. normalBalance 必须和 category 一致（见下表）
 * 3. balance 由所有 Posting 累加得出，外部不能直接 set
 */

const CATEGORIES = {
  ASSET:     { normalBalance: 'debit'  },
  EXPENSE:   { normalBalance: 'debit'  },
  LIABILITY: { normalBalance: 'credit' },
  EQUITY:    { normalBalance: 'credit' },
  INCOME:    { normalBalance: 'credit' },
};

class Account {
  /**
   * @param {object} opts
   * @param {string} opts.id        业务编号，如 "asset:cash"
   * @param {string} opts.name      人类可读名，如 "现金"
   * @param {string} opts.category  ASSET | LIABILITY | EQUITY | INCOME | EXPENSE
   * @param {number} [opts.openingBalance=0] 期初余额（正数）
   */
  constructor({ id, name, category, openingBalance = 0 }) {
    if (!CATEGORIES[category]) {
      throw new Error(`未知账户类别: ${category}，必须是 ${Object.keys(CATEGORIES).join('/')}`);
    }
    this.id = id;
    this.name = name;
    this.category = category;
    this.normalBalance = CATEGORIES[category].normalBalance;
    // 内部余额：正数表示正常方向，负数表示反方向
    this._signedBalance = this.normalBalance === 'debit'
      ? openingBalance
      : -openingBalance;
  }

  /**
   * 应用一笔过账行。
   * @param {'debit'|'credit'} direction
   * @param {number} amount   必须为正
   */
  applyPosting(direction, amount) {
    if (amount <= 0) throw new Error('过账金额必须为正数');
    if (direction !== 'debit' && direction !== 'credit') {
      throw new Error(`过账方向必须是 debit/credit，收到 ${direction}`);
    }
    // debit 增加 signedBalance，credit 减少；
    // 这样 normalBalance=debit 的账户，正常情况下 signedBalance > 0
    this._signedBalance += direction === 'debit' ? amount : -amount;
  }

  /**
   * 展示余额（正数），自动按正常方向取绝对值。
   */
  get balance() {
    return Math.abs(this._signedBalance);
  }

  /**
   * 当前余额是否处于正常方向。
   * 资产/费用为负、负债/权益/收入为正 = 异常。
   */
  get isNormalDirection() {
    return this._signedBalance >= 0;
  }
}

module.exports = { Account, CATEGORIES };
