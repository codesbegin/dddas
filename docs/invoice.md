# Invoice 上下文 — 领域语言初稿

> 续 ledger.md。本文钉死发票（Invoice）这个 bounded context 的语言和状态机。

## 核心概念

### Invoice（发票）

一张发票代表一次**向客户收钱的承诺**。它不是会计分录本身，而是会触发分录的业务事件源头。

字段：

- `invoiceNumber`：业务编号（不是数据库自增 ID），按期间唯一
- `customer`：欠款方引用（不内联客户详情，引用 Customer 上下文的 ID）
- `issueDate`：开票日
- `dueDate`：到期日 = issueDate + 付款条件
- `lineItems[]`：行项目（描述、数量、单价、税率）
- `status`：状态机，见下

### LineItem（行项目）

发票上的一行。不独立存在，只属于某张 Invoice。

- `description`
- `quantity`
- `unitPrice`
- `taxRate`（可选，默认取客户默认税率）
- 行小计 = quantity * unitPrice * (1 + taxRate)

### Payment（收款）

一次实际到账的钱。一张 Invoice 可以被多次 Payment 部分付清。

- `amount`
- `receivedAt`
- `method`（银行转账 / 现金 / 其他）

## 状态机

```
DRAFT ──issue()──▶ ISSUED ──send()──▶ SENT
  ▲                  │
  │                  ▼
  │              PARTIALLY_PAID ◀──pay(部分)
  │                  │
  │                  ▼
  │                PAID ──▶ (终态)
  │
  └── void() ◀── OVERDUE ── (dueDate 过了仍未付清)
```

状态含义：

| 状态 | 含义 | 能做什么 |
|---|---|---|
| DRAFT | 还没开给客户，可任意改 | 编辑行项目、issue、void |
| ISSUED | 已开但还没发送 | 发送、void |
| SENT | 已发给客户，等钱到 | 收款 |
| PARTIALLY_PAID | 到了一部分钱 | 继续收款、void（需先退已收） |
| PAID | 全款到账 | 终态，只能退款冲销 |
| OVERDUE | 过了 dueDate 仍未付清 | 催收、继续收款、void |
| VOID | 作废，不产生影响 | 终态 |

## 与 Ledger 上下文的关系

发票**本身不直接记账**，但它的状态变化会触发 Ledger 上下文产生分录：

- `issue()` 时：借 AccountsReceivable，贷 Revenue + TaxPayable
- 收到 Payment 时：借 Cash，贷 AccountsReceivable
- `void()` 时：开反向分录冲销之前的分录

这是一个**跨上下文的事件协作**：Invoice 上下文发领域事件（`InvoiceIssued`、`PaymentReceived`），Ledger 上下文订阅并自己决定怎么入账。Invoice 不知道 Ledger 存在。

## 不变量

1. `amountDue = sum(lineItems.subtotal) - sum(appliedPayments)`，任何状态下都不能为负。
2. `issue()` 之后不能改 lineItems。
3. `PAID` 状态不能再收新 Payment（要退款走单独流程）。
4. `VOID` 状态的发票不产生任何 Ledger 分录（或冲销已有分录）。
5. `overdueDate` 不是手动设的，是从 dueDate 派生的。

## 开放问题（留给后续）

- 信用备忘录（Credit Note / 退款）是独立实体还是 Invoice 的一种特殊状态？
- 多币种发票：lineItems 用什么币种记录，汇率何时锁定？
- 分期付款：一张发票多个 dueDate 怎么建模？
