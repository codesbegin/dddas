/**
 * JournalEntry — 会计分录实体骨架
 *
 * 对应 docs/ledger.md 里的 JournalEntry 概念：一次不可分割的财务事件。
 * 核心不变量：一条分录的 debit 合计 = credit 合计。
 *
 * 状态机：DRAFT → POSTED → LOCKED
 */

const { Account } = require('./account');

class Posting {
  /**
   * @param {object} opts
   * @param {Account} opts.account
   * @param {'debit'|'credit'} opts.direction
   * @param {number} opts.amount  正数
   * @param {string} [opts.memo]
   */
  constructor({ account, direction, amount, memo = '' }) {
    if (!(account instanceof Account)) throw new Error('Posting.account 必须是 Account 实例');
    if (amount <= 0) throw new Error('Posting.amount 必须为正数');
    if (direction !== 'debit' && direction !== 'credit') throw new Error('Posting.direction 必须是 debit/credit');
    this.account = account;
    this.direction = direction;
    this.amount = amount;
    this.memo = memo;
  }
}

class JournalEntry {
  /**
   * @param {object} opts
   * @param {string} opts.id          业务编号，如 "JE-2026-10-001"
   * @param {string} opts.description 业务摘要
   * @param {Date}   [opts.date]      分录日期，默认今天
   */
  constructor({ id, description, date = new Date() }) {
    this.id = id;
    this.description = description;
    this.date = date;
    this.postings = [];
    this.status = 'DRAFT';
  }

  /**
   * 添加一行过账。只有 DRAFT 状态能加。
   */
  addPosting(posting) {
    if (this.status !== 'DRAFT') throw new Error('只有 DRAFT 状态的分录能加过账行');
    if (!(posting instanceof Posting)) throw new Error('必须传入 Posting 实例');
    this.postings.push(posting);
  }

  /** debit 合计 */
  get totalDebit() {
    return this.postings
      .filter(p => p.direction === 'debit')
      .reduce((sum, p) => sum + p.amount, 0);
  }

  /** credit 合计 */
  get totalCredit() {
    return this.postings
      .filter(p => p.direction === 'credit')
      .reduce((sum, p) => sum + p.amount, 0);
  }

  /** 是否借贷平衡 */
  get isBalanced() {
    // 用整数 cents 比较避免浮点误差
    return Math.round(this.totalDebit * 100) === Math.round(this.totalCredit * 100);
  }

  /**
   * 提交分录。必须平衡且至少两行过账。
   * 提交后把金额应用到各 Account。
   */
  post() {
    if (this.status !== 'DRAFT') throw new Error('只有 DRAFT 状态能提交');
    if (this.postings.length < 2) throw new Error('分录至少需要两行过账');
    if (!this.isBalanced) throw new Error(`借贷不平衡：debit ${this.totalDebit} != credit ${this.totalCredit}`);
    for (const p of this.postings) {
      p.account.applyPosting(p.direction, p.amount);
    }
    this.status = 'POSTED';
  }

  /**
   * 锁定（所属会计期间关闭）。
   */
  lock() {
    if (this.status !== 'POSTED') throw new Error('只有 POSTED 状态能锁定');
    this.status = 'LOCKED';
  }
}

module.exports = { JournalEntry, Posting };
