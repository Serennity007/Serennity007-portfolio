# 我如何用 AI 做了 45+ 个开源项目

*2026-08-19 · 开源*

半年前，我的 GitHub 还是空的。现在，45+ 个开源项目，全部中英双语，全部免费。

这篇文章分享我是怎么做到的。

## 工具链

| 工具 | 用途 | 推荐度 |
|------|------|--------|
| **Cursor** | 写代码主力 | ⭐⭐⭐⭐⭐ |
| **Kimi Code** | 长对话、复杂任务 | ⭐⭐⭐⭐ |
| **Claude Code** | 精细代码修改 | ⭐⭐⭐⭐ |
| **agent-trace** | 分析 Agent 花费 | 自产自用 |
| **token-meter** | 实时监控 Token | 自产自用 |

## 方法论

### 1. 找痛点

好的开源项目解决真实问题。我观察到：

- AI 编程助手越来越普及，但配置规则分散
- 开发者不知道自己的 Agent 花了多少钱
- 论文审稿意见质量参差不齐

这些都是可以做成工具的痛点。

### 2. 快速验证

不追求完美，先做出 MVP：

```bash
# 第一天：目录结构 + README
mkdir my-project && cd my-project
npm init -y
echo "# My Project" > README.md

# 第二天：核心功能
# 用 AI 写代码，自己测试

# 第三天：发布
npm publish
```

### 3. 持续迭代

发布后根据用户反馈改进。每个项目我至少迭代了 3 个版本。

## 实际案例：agent-trace

agent-trace 是一个 AI Agent 轨迹分析工具。起因是我发现自己用 Kimi Code 一跑就是几个小时，完全不知道花了多少钱。

### Day 1：原型

```
agent-trace/
├── bin/cli.js
├── src/
│   ├── parsers/
│   │   └── opencode.js
│   ├── analyzers/
│   │   └── session.js
│   └── reporters/
│       └── terminal.js
├── package.json
└── README.md
```

### Day 2：加入 Kimi Code 支持

Kimi Code 的会话存储在 `~/.kimi-code/sessions/` 下，格式是 JSONL。我解析了 `wire.jsonl` 文件，提取了消息、工具调用和 Token 使用量。

### Day 3：发布

```bash
npm publish
git push origin main
```

## 效果

- **45+ 项目**：覆盖 AI 工具、科研资源、开发者工具
- **agent-trace**：64 个会话，$4681 的 Token 消耗被追踪
- **token-meter**：实时监控，再也不怕 Agent 烧钱

## 建议

1. **不要追求完美** — 先发布，再迭代
2. **写好 README** — 这是项目的门面
3. **中英双语** — 扩大受众面
4. **用 AI 写代码** — 这就是 AI 时代的工作方式
5. **做自己需要的工具** — 痛点最真实

---

*如果你对 AI 编程感兴趣，欢迎关注我的 [GitHub](https://github.com/liangzhengtao)。*
