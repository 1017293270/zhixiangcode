# ZXCode

ZXCode 是基于 OpenCode 的产品级 fork，目标是做一套面向中文团队和企业内部场景的 AI 编码 CLI。当前分支先完成了 TUI 首屏品牌、中文提示、启动文案和本地开发说明，底层仍沿用 OpenCode 的 agent、session、model、tool、permission 等核心架构。

> ZXCode is derived from OpenCode and keeps the original MIT license attribution. It is not affiliated with or endorsed by the OpenCode maintainers.

## 当前状态

- 产品名：`ZXCode`
- 目标命令名：`zxcode`
- 当前开发启动命令：`bun run dev`
- 默认界面文案：`你好呀，我是小智，您的企业级豆包！`
- 当前默认模型配置仍放在本机全局配置里，不提交任何 API Key 到仓库
- 内部包名和部分兼容标识暂时仍保留 `opencode`，后续按计划逐步收敛

## 快速启动

依赖 Bun，仓库推荐版本见 `package.json` 的 `packageManager` 字段。

```powershell
cd D:\coding\zhixiangcode
bun install
bun run dev
```

如果已经有旧窗口在运行，先按 `Ctrl+C` 退出，再重新执行 `bun run dev`。

## 常用命令

```powershell
# 启动 TUI
bun run dev

# 启动桌面端开发
bun run dev:desktop

# 启动 Web/App 开发
bun run dev:web

# 类型检查
bun run typecheck
```

注意：根目录的 `test` 脚本会主动退出。需要测试时进入具体 package，例如：

```powershell
cd packages\opencode
bun test
```

## 模型配置

本机全局配置文件通常位于：

```powershell
$HOME\.config\opencode\opencode.jsonc
```

当前可以通过 OpenAI-compatible provider 接入火山 Ark、Ollama 或其他兼容服务。不要把真实 API Key 提交到仓库。

示例结构：

```jsonc
{
  "model": "volcengine/glm-5.1",
  "provider": {
    "volcengine": {
      "name": "Volcengine Ark (Coding)",
      "npm": "@ai-sdk/openai-compatible",
      "options": {
        "apiKey": "YOUR_API_KEY",
        "baseURL": "https://example.com/v1"
      },
      "models": {
        "glm-5.1": {
          "name": "GLM 5.1"
        }
      }
    },
    "ollama": {
      "name": "Ollama Remote",
      "npm": "@ai-sdk/openai-compatible",
      "options": {
        "apiKey": "not-needed",
        "baseURL": "http://your-ollama-host:11434/v1"
      },
      "models": {
        "qwen3-32b": {
          "id": "qwen3:32b",
          "name": "Qwen3 32B"
        }
      }
    }
  }
}
```

启动后可在界面输入：

```text
/models
```

切换当前使用的模型。

## 已完成的品牌化改动

- 首页大字 Logo 改为 `ZXCode`
- 终端标题改为 `ZXCode` / `ZX`
- 首页输入框提示改为中文
- 首页随机 Tip 改为中文，并将可见命令提示改为 `zxcode`
- direct run 的 splash 和继续命令改为 `ZXCode` / `zxcode`

## 后续计划

完整产品化目标记录在：

- `docs/superpowers/specs/2026-06-11-zxcode-product-fork-design.md`
- `docs/superpowers/plans/2026-06-11-zxcode-product-fork.md`

后续重点：

- 增加统一产品身份模块
- 将可安装 CLI 从 `opencode` 迁移到 `zxcode`
- 新配置目录优先使用 `.zxcode` / `~/.zxcode`
- 保留对旧 OpenCode 配置的只读兼容
- 更新安装脚本、包元数据、发布产物和帮助快照

## 许可证与来源

本项目基于 OpenCode 修改，保留原项目 MIT License。ZXCode 是独立 fork，不代表 OpenCode 官方团队。
