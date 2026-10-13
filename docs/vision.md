# dddas — Agent Workbench for DDD Finance

> 一个让 agent 像用 Codex / OpenCode 那样操作财务领域模型的工作台。

## 定位

dddas 不是传统财务软件。它是一个**以 agent 为一等公民的财务系统**：

- 底层是严格的 DDD 财务核心（Account / JournalEntry / Posting，借贷平衡、状态机、不变量）
- 中层是 agent 循环（接入 reconciliation-loop-skill 的 7 步循环，让 agent 能建账户、记账、对账）
- 上层是 agent 工作台 UI（参考 Codex / OpenCode / opclaw / zcode / DeepSeek Herness 的交互范式）

设计哲学：**财务领域模型是骨架，agent 循环是神经，工作台是脸**。

## 技术栈

| 层 | 选型 |
|---|---|
| 领域核心 | TypeScript，纯实体，零 IO 依赖 |
| 持久化 | SQLite（单文件，agent 友好） |
| Agent 循环 | 接入 [reconciliation-loop-skill](https://github.com/codesbegin/reconciliation-loop-skill) |
| 前端 | Vite + React + Ant Design |
| 运行 | Node.js 单进程，本地可跑 |

## 目录

```
src/domain/        DDD 实体（Account / JournalEntry / Posting），无 IO
src/adapters/      db-sqlite / agent-loop / http 适配器
web/               React + AntD 工作台
test/domain/       领域不变量测试
docs/              领域笔记 + 愿景 + 调研
```

## MVP 路线

1. **领域层 TS 化**：把现有 JS 实体迁成 TS，类型固化（AccountCategory / Direction / PostingStatus）
2. **SQLite 持久化**：account / journal_entry / posting 三张表，事件溯源留口
3. **Agent loop 接入**：让 agent 能通过循环建账户、记账、跑对账
4. **前端工作台**：对话区 + 任务列表 + 账户树 + 分录流

## 参考对象

- **agent UI 范式**：Codex CLI、OpenCode、opclaw、zcode、DeepSeek Herness
- **agent 循环**：本仓库的 reconciliation-loop-skill
- **DDD 财务模式**：ledger / double-entry / bounded context 经典模式

## 不变量（写死在领域层）

1. 一笔分录 debit 合计 = credit 合计（整数分位比较）
2. Account.category 只能是 ASSET/LIABILITY/EQUITY/INCOME/EXPENSE
3. Posting 金额必须为正
4. JournalEntry 状态机：DRAFT → POSTED → LOCKED，只能前进
5. 外部不能直接 set balance，只能通过 Posting 累加
