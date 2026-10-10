# Ledger 上下文 — 领域语言初稿

> 本文是 dddas 的第一篇领域笔记，目标是把复式记账里最容易混淆的名词先钉死。代码还没写，语言先对齐。

## 核心概念

### Account（账户）

账户是一个**有名的余额桶**。每笔 Posting 必须落到某个账户上，账户只关心两件事：

1. **它属于哪个类别**：Asset（资产）/ Liability（负债）/ Equity（权益）/ Income（收入）/ Expense（费用）。类别决定了它的正常余额方向。
2. **它的当前余额**：不是一个随便的数字，而是该账户下所有 Posting 按方向累加后的结果。

账户**不持有交易逻辑**，它只是一个被记账的对象。

### JournalEntry（分录）

一条分录代表一次**不可分割的财务事件**：一笔销售、一次付款、一笔转账。

关键不变量：

- **一条分录必须借贷平衡**：所有 Posting 的 debit 金额之和 = credit 金额之和。这不是约定，是领域规则，代码里必须强制。
- **分录不可变**：一旦 posted，不能修改、不能删除。发现错误只能开一条反向分录（红冲）纠正。
- 分录有状态机：`PENDING`（草稿）→ `POSTED`（已入账）→ `LOCKED`（所属会计期间关闭后锁定）。

### Posting（过账行）

一条分录由两条或更多 Posting 组成。每个 Posting 只做一件事：

- 指定一个账户
- 指定一个方向（debit 或 credit）
- 指定一个金额

**没有单笔 Posting 能独立存在**，它必须属于某条 JournalEntry。

## 方向约定

| 账户类别 | 正常余额 | 增加方向 | 减少方向 |
|---|---|---|---|
| Asset 资产 | 借方（debit） | debit | credit |
| Expense 费用 | 借方 | debit | credit |
| Liability 负债 | 贷方（credit） | credit | debit |
| Equity 权益 | 贷方 | credit | debit |
| Income 收入 | 贷方 | credit | debit |

记忆口诀：**借方资产费用增，贷方负债权益收入增。**

## 一个具体例子

用现金 100 元买了办公用品：

```
JournalEntry #1001 — 用现金购买办公用品
├── Posting 1: Expense:OfficeSupplies  debit   100
└── Posting 2: Asset:Cash              credit  100
```

校验：debit 总和 100 = credit 总和 100 ✅

## 关键不变量（必须在领域代码里强制）

1. **借贷平衡**：任何 POSTED 的分录，debit 合计 = credit 合计。
2. **不可变性**：POSTED 状态的分录任何字段不可改。
3. **期间锁定**：LOCKED 状态的分录不允许再产生新 Posting。
4. **非负可选**：某些账户类型（如现金）可以要求余额不为负，由账户类型声明，不是全局规则。

## 还没决定的事（留给后续笔记）

- 分录和发票（Invoice）的关系：是先有发票再产生分录，还是分录独立于发票？
- 多币种：汇率写在 Posting 上还是 JournalEntry 上？
- 账户的层级（子账户/汇总账户）怎么建模？

这些问题在后续 `invoice.md`、`payment.md` 里再展开。
