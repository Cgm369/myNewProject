# GeekLearn Copilot

一个面向个人成长与学习复盘的前端应用，当前聚焦三个核心场景：

- 首页：展示产品定位与入口
- Dashboard：展示真实学习统计、近 7 天趋势和年度贡献
- Profile：管理学习目标、AI personality，并写入最小学习记录

## 技术栈

- React 19
- TypeScript
- Vite 8
- Tailwind CSS 4
- Clerk
- Supabase
- Framer Motion
- Recharts

## 当前页面结构

- `/`：产品首页
- `/dashboard`：学习数据面板
- `/profile`：个人配置与学习记录入口

## 当前数据策略

- 已配置 Clerk + Supabase 时：
  - Profile 设置会优先写入 `user_settings`
  - 学习记录会优先写入 `user_logs`
  - Copilot 历史会优先写入 `ai_chat_histories`
- 如果缺少云端配置：
  - 应用会自动退回到浏览器本地存储模式
  - 仍然可以完整体验目标配置、打卡记录和 Dashboard 统计

## 建议的数据表

### `user_settings`

- `user_id`
- `daily_algo`
- `daily_words`
- `weekend_rest`
- `ai_personality`
- `updated_at`

### `user_logs`

- `id`
- `user_id`
- `record_date`
- `category`
- `duration_minutes`
- `note`
- `created_at`

### `ai_chat_histories`

- `id`
- `user_id`
- `user_prompt`
- `ai_response`
- `created_at`

## 环境变量

在项目根目录创建 `.env.local`，按需配置：

```bash
VITE_CLERK_PUBLISHABLE_KEY=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_COPILOT_API_URL=
```

说明：

- `VITE_CLERK_PUBLISHABLE_KEY`：开启 Clerk 登录能力
- `VITE_SUPABASE_URL` 与 `VITE_SUPABASE_ANON_KEY`：开启真实数据持久化
- `VITE_COPILOT_API_URL`：可选的 Copilot 服务端接口地址；未配置时自动使用本地上下文回复

## 本地运行

```bash
npm install
npm run dev
```

## 质量校验

```bash
npm run lint
npm run build
```

## Supabase 初始化

- 直接执行 [schema.sql](file:///d:/Workspace/mysite/supabase/schema.sql)
- 按步骤配置参考 [setup.md](file:///d:/Workspace/mysite/supabase/setup.md)

## 当前开发重点

当前代码已经从纯 mock 页面升级为“可产生真实数据闭环”的版本，后续建议继续推进：

- 完善 Supabase 表结构与 RLS
- 为 Dashboard 增加更细的统计维度
- 将 Copilot 服务端接口切换为真实模型代理
- 补充自动化测试与更完整的学习记录页面
