# dddas

> 用领域驱动设计（DDD）的思路做一个可演进的财务系统。当前处于领域建模阶段，代码骨架尚未落地。

## 这是什么

一个以**复式记账（double-entry bookkeeping）**为核心、按领域边界拆分的财务系统雏形。目标不是再做一个后台管理模板，而是先把财务领域的语言、规则、边界想清楚，再决定用什么技术栈落地。

设计原则：

1. **先有 ubiquitous language，再有表结构** —— 同一个业务名词在不同 bounded context 里的含义必须显式标注，不能靠猜。
2. **领域模型优先于技术框架** —— 聚合根、实体、值对象、领域事件先定义清楚，ORM / RPC / Web 框架是后面的事。
3. **记账不可变（immutable ledger）** —— 分录一旦入账不能修改，只能通过红冲或反向分录纠正。
4. **可测试的领域规则** —— 借贷必相等、期间关闭后不可再入分录这类 invariant 要落在领域代码里，不是靠数据库约束硬撑。

## 候选 Bounded Context（待建模）

| Context | 职责 | 关键概念（初步） |
|---|---|---|
| **Ledger 总账** | 维护科目余额、复式记账 | Account, JournalEntry, Posting, FiscalPeriod |
| **Invoice 账单** | 应收/应付账单生命周期 | Invoice, InvoiceLine, Issued/Paid/Overdue 状态机 |
| **Payment 支付** | 收付款指令与核销 | Payment, Allocation, Settlement |
| **Accounting Period 会计期间** | 期间开关、结账锁定 | PeriodStatus, CloseProcess, PostingCutoff |
| **Reporting 报表** | 资产负债表、利润表、试算平衡 | TrialBalance, BalanceSheet, IncomeStatement |

目前这些边界还很粗，会在 `docs/` 下逐篇细化。

## 仓库结构（规划中）

```
dddas/
├── docs/                    # 领域建模笔记（先写这里）
│   ├── bounded-contexts.md
│   ├── ledger.md
│   ├── invoice.md
│   └── payment.md
├── src/                     # 代码骨架（暂未落地）
└── README.md
```

技术栈暂未敲定，候选方向：

- 语言：TypeScript（Node）或 Python，取决于领域模型表达的顺手程度
- 持久化：PostgreSQL，事件溯源（event sourcing）作为可选演进路径
- 不引入重型框架，先把领域层写干净

## 路线图

- [x] 立项，明确 DDD 导向
- [ ] 写第一篇领域笔记：复式记账的 ubiquitous language
- [ ] 锁定 Ledger 上下文的聚合与不变量
- [ ] 搭最小可运行骨架（仅领域层 + 单元测试）
- [ ] 接 PostgreSQL 做持久化
- [ ] 接入 Invoice / Payment 上下文

## 状态

领域建模阶段。任何讨论都欢迎从这里这个名词在你的语境里是什么意思开始。
