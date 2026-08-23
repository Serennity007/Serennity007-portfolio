# AI 编程助手配置指南：让 AI 写出更好的代码

*2026-06-20 · 工具*

用 AI 写代码已经成了日常，但你有没有发现：同样的工具，别人用起来效果好 10 倍？

秘密在于配置。

## 为什么配置很重要

AI 编程助手需要上下文才能写出好代码。没有配置的 AI 就像一个刚入职的新人——不知道项目规范、不知道技术栈、不知道你的偏好。

好的配置就是给 AI 一份"入职手册"。

## 主流工具配置方式

### Cursor

在项目根目录创建 `.cursorrules` 文件：

```markdown
# Project Context
This is a Next.js 14 project with TypeScript and Tailwind CSS.

# Code Style
- Use functional components with hooks
- Prefer const over let
- Use TypeScript strict mode
- Follow Airbnb style guide

# Naming Conventions
- Components: PascalCase (e.g., UserProfile)
- Functions: camelCase (e.g., getUserData)
- Constants: UPPER_SNAKE_CASE (e.g., API_BASE_URL)

# Don'ts
- Don't use any type
- Don't use console.log in production
- Don't use inline styles
```

### Claude Code

在项目根目录创建 `CLAUDE.md`：

```markdown
# Project Rules

## Tech Stack
- Language: Python 3.11+
- Framework: FastAPI
- Database: PostgreSQL with SQLAlchemy
- Testing: pytest

## Code Guidelines
- Type hints required for all functions
- Docstrings in Google style
- Maximum function length: 30 lines
- Maximum file length: 300 lines

## Git Conventions
- Commit format: type(scope): description
- Types: feat, fix, docs, style, refactor, test, chore
```

### Kimi Code

在项目根目录创建 `AGENTS.md`：

```markdown
# Agent Instructions

## Project Overview
AI-powered research paper analysis tool.

## Key Files
- src/main.py: Entry point
- src/models/: ML models
- src/api/: API endpoints
- tests/: Test files

## Development Workflow
1. Write tests first
2. Implement feature
3. Run tests: pytest
4. Check linting: ruff check
5. Commit with descriptive message

## Important Notes
- Always use type hints
- Never commit API keys
- Run tests before pushing
```

## 通用配置模板

我整理了 20 个框架的配置模板，放在 [awesome-ai-rules](https://github.com/Serennity007/awesome-ai-rules) 仓库里：

| 框架 | 配置文件 | 特点 |
|------|---------|------|
| React | `.cursorrules` | Hooks 优先、组件规范 |
| Next.js | `CLAUDE.md` | SSR/SSG、路由规范 |
| Vue 3 | `.cursorrules` | Composition API、TypeScript |
| FastAPI | `CLAUDE.md` | 异步、Pydantic、依赖注入 |
| Django | `.cursorrules` | MTV 模型、ORM 规范 |
| Go | `AGENTS.md` | 错误处理、并发规范 |
| Rust | `.cursorrules` | 所有权、生命周期 |

## 效果对比

配置前：
```python
# AI 生成的代码
def process(data):
    result = []
    for item in data:
        if item['status'] == 'active':
            result.append(item)
    return result
```

配置后（加了"使用类型提示和列表推导"）：
```python
# AI 生成的代码
def process_active_items(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Filter and return active items from the input list."""
    return [item for item in items if item.get('status') == 'active']
```

## 进阶技巧

### 1. 项目特定规则

不要只写通用规则，加入项目特定的：

```markdown
# Project Specific Rules
- Our auth module uses JWT with RS256
- All API responses must follow the standard envelope format
- Database migrations use Alembic
```

### 2. 常见错误提醒

把团队常犯的错误写进配置：

```markdown
# Common Mistakes to Avoid
- Don't forget to handle the case when user is None
- Don't use synchronous requests in async functions
- Don't hardcode magic numbers, use constants
```

### 3. 测试规范

明确测试要求：

```markdown
# Testing Requirements
- Unit tests for all utility functions
- Integration tests for API endpoints
- Use fixtures for test data
- Mock external services
```

## 总结

好的配置 = 好的 AI 输出。花 10 分钟写配置，省 10 小时改代码。

所有配置模板：[awesome-ai-rules](https://github.com/Serennity007/awesome-ai-rules)

---

*觉得有用的话，给个 Star 吧 ⭐*
