<h1 style="text-align: center;">easy-commit-util</h1>
<p style="text-align: center;"><span><a href="./README.md">English</a> | 中文</span></p>

<p align="center">
  <a href="https://typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.0-blue.svg" alt="TypeScript"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-%3E%3D16-green.svg" alt="Node.js"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-ISC-blue.svg" alt="License"></a>
</p>

<p style="display: flex; justify-content: center; align-item: center;">
<img src="./screen.png" width="70%"/>
</p>

> **版本 2.0** - 使用 TypeScript 完全重写，改进了架构和用户体验

easy-commit-util 是一个使用 TypeScript 编写的强大命令行工具，通过约定式提交格式验证和增强的交互式体验来简化 git 提交过程。

## ✨ v2.0 新功能

- **🚀 TypeScript 支持** - 完全使用 TypeScript 重写，具有类型安全
- **🎨 增强的 UI** - 美观的 CLI 界面，包含颜色、加载动画和交互式提示
- **🔧 模块化架构** - 清晰的关注点分离，更好的可维护性
- **⚡ 智能验证** - 实时提交消息验证和有用的反馈
- **🎯 交互模式** - 通过类型选择指导提交创建
- **⚙️ 配置系统** - 通过配置文件自定义设置
- **📊 状态监控** - 详细的仓库状态显示
- **🧪 全面测试** - 核心功能的单元测试

## 📦 安装

### 全局安装（推荐）
```bash
pnpm install -g easy-commit-util
# 或
pnpm install -g easy-commit-util
# 或
yarn global add easy-commit-util
```

### 开发安装
```bash
git clone https://github.com/yaolifeng0629/simple_push.git
cd easy-commit-util
pnpm install
pnpm run build
pnpm link
```

## 🚀 使用方法

### 快速开始
```bash
easy-commit          # 交互模式
easy-commit commit   # 同上
easy-commit c        # 简写形式
```

### 命令别名
```bash
# 现在支持多个命令别名
easy-commit          # 原始命令
ecg                  # 简短别名
eg                  # 超短别名
```

### 命令选项
```bash
# 快速提交消息
easy-commit -m "feat: 添加登录功能"

# 交互模式选项
easy-commit --interactive

# 跳过推送到远程
easy-commit --no-push

# 跳过添加所有文件
easy-commit --no-add

# 验证消息格式
easy-commit validate "feat(auth): 添加用户认证"

# 显示仓库状态
easy-commit status

# 管理配置
easy-commit config --sample
```

## 🎯 交互模式

新的交互模式提供引导式体验：

1. **仓库状态** - 显示当前分支和文件更改
2. **提交类型选择** - 带有描述的可视列表
3. **作用域输入** - 可选作用域验证
4. **描述输入** - 实时长度和格式验证
5. **破坏性更改** - 可选破坏性更改指示器
6. **确认** - 提交前预览

## ⚙️ 配置

在你的主目录中创建配置文件：

```bash
easy-commit config --sample
```

### 配置选项 (`~/.easy-commit.json`)
```json
{
  "commitTypes": ["feat", "fix", "docs", ...],
  "maxDescriptionLength": 50,
  "allowBreakingChanges": true,
  "pushAfterCommit": true,
  "addAllFiles": true
}
```

## 📋 提交类型

| 类型 | 描述 | 示例 |
|------|-------------|---------|
| `feat` | 新功能 | `feat: 添加用户登录` |
| `fix` | 错误修复 | `fix(auth): 解决令牌问题` |
| `docs` | 文档 | `docs: 更新API文档` |
| `style` | 代码风格 | `style: 使用prettier格式化代码` |
| `refactor` | 代码重构 | `refactor: 简化认证逻辑` |
| `perf` | 性能 | `perf: 优化数据库查询` |
| `test` | 测试 | `test: 添加认证单元测试` |
| `chore` | 维护 | `chore: 更新依赖` |

## 🛠️ 开发

### 设置
```bash
pnpm install
```

### 开发命令
```bash
pnpm run dev          # 监视模式编译
pnpm run build        # 构建TypeScript
pnpm run lint         # ESLint
pnpm run format       # Prettier
pnpm start           # 运行CLI
```

## 📄 许可证

本项目采用 ISC 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 🙌 致谢

- 受 [约定式提交](https://www.conventionalcommits.org/) 启发
- 使用现代 TypeScript 和 Node.js 构建
- 感谢所有为改进此工具做出贡献的人！

---

**由 <a href="https://yaolifeng.com">Immerse</a> 用 ❤️ 制作**
