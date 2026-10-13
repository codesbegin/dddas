# dddas — Agent Workbench for DDD Finance

> 一个让 agent 像用 Codex / OpenCode / DeepSeek Harness (dsh) 那样操作财务领域模型的工作台。

## 定位

dddas 不是传统财务软件。它是一个**以 agent 为一等公民的财务系统**：

- 底层是严格的 DDD 财务核心（Account / JournalEntry / Posting，借贷平衡、状态机、不变量）
- 中层是 agent 循环（接入 reconciliation-loop-skill 的 7 步循环）
- 上层是 agent 工作台 UI（参考 Codex / OpenCode / dsh 的交互范式）

设计哲学：**财务领域模型是骨架，agent 循环是神经，工作台是脸**。

## 技术栈

| 层 | 选型 |
|---|---|
| 领域核心 | TypeScript，纯实体，零 IO 依赖 |
| 持久化 | **插件化 Repository 接口**（参考 dsh 的一切皆插件），默认实现 SQLite，预留 DuckDB / 文件 / 内存 |
| Agent 循环 | 接入 reconciliation-loop-skill |
| 前端 | Vite + React + Ant Design，UI 风格参考 dsh / Codex / OpenCode |
| 运行 | Node.js 单进程，本地优先 |

## 目录

```
src/domain/        DDD 实体 + 类型 + Repository 接口（纯 TS，无 IO）
src/adapters/     具体持久化实现（sqlite / duckdb / memory）+ agent-loop + http
web/               React + AntD 工作台
test/domain/       领域不变量测试 + 内存 Repository 测试
docs/              领域笔记 + 愿景 + 调研
```

## 持久化设计（关键）

参考 DeepSeek Harness 的插件化架构：

1. `domain/repository.ts` 定义 `AccountRepository` / `JournalEntryRepository` 接口
2. `adapters/repo-sqlite/` 是默认实现（事务写）
3. 未来可加 `adapters/repo-duckdb/`（分析查询）、`adapters/repo-memory/`（测试）
4. 领域实体不依赖任何具体实现，只依赖接口

## MVP 路线

1. **领域层 TS 化**：实体 + 类型 + Repository 接口
2. **内存 Repository**：先跑通领域逻辑，不碰 IO
3. **SQLite 实现**：account / journal_entry / posting 三张表
4. **Agent loop 接入**：让 agent 能通过循环建账户、记账、对账
5. **前端工作台**：对话区 + 任务列表 + 账户树 + 分录流

## 不变量（写死在领域层）

1. 一笔分录 debit 合计 = credit 合计（整数分位比较）
2. Account.category 只能是 ASSET/LIABILITY/EQUITY/INCOME/EXPENSE
3. Posting 金额必须为正
4. JournalEntry 状态机：DRAFT → POSTED → LOCKED，只能前进
5. 外部不能直接 set balance，只能通过 Posting 累加
