import type { TuiPluginApi } from "@opencode-ai/plugin/tui"
import { createMemo, For, type Accessor } from "solid-js"
import { DEFAULT_THEMES, useTheme } from "../../context/theme"
import { useCommandShortcut } from "../../keymap"

const themeCount = Object.keys(DEFAULT_THEMES).length

type TipPart = { text: string; highlight: boolean }
type TipShortcut = Accessor<string>
type Shortcuts = {
  agentCycle: TipShortcut
  childFirst: TipShortcut
  childNext: TipShortcut
  childPrevious: TipShortcut
  commandList: TipShortcut
  editorOpen: TipShortcut
  helpShow: TipShortcut
  inputClear: TipShortcut
  inputNewline: TipShortcut
  inputPaste: TipShortcut
  inputUndo: TipShortcut
  leader: TipShortcut
  messagesCopy: TipShortcut
  messagesFirst: TipShortcut
  messagesLast: TipShortcut
  messagesPageDown: TipShortcut
  messagesPageUp: TipShortcut
  messagesToggleConceal: TipShortcut
  modelCycleRecent: TipShortcut
  modelList: TipShortcut
  sessionExport: TipShortcut
  sessionInterrupt: TipShortcut
  sessionList: TipShortcut
  sessionNew: TipShortcut
  sessionParent: TipShortcut
  sessionPinToggle: TipShortcut
  sessionQuickSwitch1: TipShortcut
  sessionQuickSwitch9: TipShortcut
  sessionSidebarToggle: TipShortcut
  sessionTimeline: TipShortcut
  statusView: TipShortcut
  terminalSuspend: TipShortcut
  themeList: TipShortcut
}
type Tip = string | ((shortcuts: Shortcuts) => string | undefined)

function parse(tip: string): TipPart[] {
  const parts: TipPart[] = []
  const regex = /\{highlight\}(.*?)\{\/highlight\}/g
  const found = Array.from(tip.matchAll(regex))
  const state = found.reduce(
    (acc, match) => {
      const start = match.index ?? 0
      if (start > acc.index) {
        acc.parts.push({ text: tip.slice(acc.index, start), highlight: false })
      }
      acc.parts.push({ text: match[1], highlight: true })
      acc.index = start + match[0].length
      return acc
    },
    { parts, index: 0 },
  )

  if (state.index < tip.length) {
    parts.push({ text: tip.slice(state.index), highlight: false })
  }

  return parts
}

const NO_MODELS_TIP = "运行 {highlight}/connect{/highlight} 添加 AI 服务商，然后开始编码"
const NO_MODELS_PARTS = parse(NO_MODELS_TIP)

function shortcutText(value: string) {
  return `{highlight}${value}{/highlight}`
}

function commandText(command: string, shortcut: string) {
  if (!shortcut) return shortcutText(command)
  return `${shortcutText(command)} 或 ${shortcutText(shortcut)}`
}

function press(shortcut: string, text: string) {
  if (!shortcut) return undefined
  return `按下 ${shortcutText(shortcut)} ${text}`
}

function configShortcut(api: TuiPluginApi, command: string): TipShortcut {
  return () =>
    api.tuiConfig.keybinds
      .get(command)
      .map((binding) => api.keys.formatSequence(Array.from(api.keymap.parseKeySequence(binding.key))))
      .filter(Boolean)
      .join(", ")
}

export function Tips(props: { api: TuiPluginApi; connected?: boolean }) {
  const theme = useTheme().theme
  const tipOffset = Math.random()
  const shortcuts: Shortcuts = {
    agentCycle: useCommandShortcut("agent.cycle"),
    childFirst: configShortcut(props.api, "session.child.first"),
    childNext: configShortcut(props.api, "session.child.next"),
    childPrevious: configShortcut(props.api, "session.child.previous"),
    commandList: useCommandShortcut("command.palette.show"),
    editorOpen: useCommandShortcut("prompt.editor"),
    helpShow: useCommandShortcut("help.show"),
    inputClear: useCommandShortcut("prompt.clear"),
    inputNewline: useCommandShortcut("input.newline"),
    inputPaste: useCommandShortcut("prompt.paste"),
    inputUndo: useCommandShortcut("input.undo"),
    leader: configShortcut(props.api, "leader"),
    messagesCopy: configShortcut(props.api, "messages.copy"),
    messagesFirst: configShortcut(props.api, "session.first"),
    messagesLast: configShortcut(props.api, "session.last"),
    messagesPageDown: configShortcut(props.api, "session.page.down"),
    messagesPageUp: configShortcut(props.api, "session.page.up"),
    messagesToggleConceal: configShortcut(props.api, "session.toggle.conceal"),
    modelCycleRecent: useCommandShortcut("model.cycle_recent"),
    modelList: useCommandShortcut("model.list"),
    sessionExport: configShortcut(props.api, "session.export"),
    sessionInterrupt: configShortcut(props.api, "session.interrupt"),
    sessionList: useCommandShortcut("session.list"),
    sessionNew: useCommandShortcut("session.new"),
    sessionParent: configShortcut(props.api, "session.parent"),
    sessionPinToggle: configShortcut(props.api, "session.pin.toggle"),
    sessionQuickSwitch1: useCommandShortcut("session.quick_switch.1"),
    sessionQuickSwitch9: useCommandShortcut("session.quick_switch.9"),
    sessionSidebarToggle: configShortcut(props.api, "session.sidebar.toggle"),
    sessionTimeline: configShortcut(props.api, "session.timeline"),
    statusView: useCommandShortcut("opencode.status"),
    terminalSuspend: useCommandShortcut("terminal.suspend"),
    themeList: useCommandShortcut("theme.switch"),
  }
  const tip = createMemo(() => {
    if (props.connected === false) return NO_MODELS_TIP
    const tips = [...TIPS, process.platform !== "win32" ? TERMINAL_SUSPEND_TIP : INPUT_UNDO_TIP].flatMap((item) => {
      const value = typeof item === "string" ? item : item(shortcuts)
      return value ? [value] : []
    })
    return tips[Math.floor(tipOffset * tips.length)] ?? NO_MODELS_TIP
  }, NO_MODELS_TIP)
  // Solid can expose a memo's initial value while a pure computation is pending.
  const parts = createMemo(() => {
    const value = tip()
    if (typeof value === "string") return parse(value)
    return NO_MODELS_PARTS
  }, NO_MODELS_PARTS)

  return (
    <box flexDirection="row" maxWidth="100%">
      <text flexShrink={0} style={{ fg: theme.warning }}>
        • 提示{" "}
      </text>
      <text flexShrink={1} wrapMode="word">
        <For each={parts()}>
          {(part) => <span style={{ fg: part.highlight ? theme.text : theme.textMuted }}>{part.text}</span>}
        </For>
      </text>
    </box>
  )
}

const TIPS: Tip[] = [
  "输入 {highlight}@{/highlight} 加文件名，可以模糊搜索并附加文件",
  "消息以 {highlight}!{/highlight} 开头可以直接运行 shell 命令，例如 {highlight}!ls -la{/highlight}",
  (shortcuts) => press(shortcuts.agentCycle(), "在 Build 和 Plan 智能体之间切换"),
  "使用 {highlight}/undo{/highlight} 撤销上一条消息和文件改动",
  "使用 {highlight}/redo{/highlight} 恢复刚撤销的消息和文件改动",
  "运行 {highlight}/share{/highlight} 创建当前对话的公开分享链接",
  "把图片或 PDF 拖进终端，可以作为上下文附件",
  (shortcuts) => press(shortcuts.inputPaste(), "把剪贴板里的图片粘贴到输入框"),
  (shortcuts) => `使用 ${commandText("/editor", shortcuts.editorOpen())} 在外部编辑器里编写长消息`,
  "运行 {highlight}/init{/highlight} 根据当前代码库自动生成项目规则",
  (shortcuts) => `使用 ${commandText("/models", shortcuts.modelList())} 查看并切换可用 AI 模型`,
  (shortcuts) => `使用 ${commandText("/themes", shortcuts.themeList())} 在 ${themeCount} 个内置主题之间切换`,
  (shortcuts) => `使用 ${commandText("/new", shortcuts.sessionNew())} 开始一个全新的会话`,
  (shortcuts) => `使用 ${commandText("/sessions", shortcuts.sessionList())} 查看、置顶或继续历史会话`,
  (shortcuts) => press(shortcuts.sessionPinToggle(), "在会话列表中置顶会话"),
  (shortcuts) =>
    shortcuts.sessionQuickSwitch1() && shortcuts.sessionQuickSwitch9()
      ? `置顶会话会分配快捷槽位；使用 ${shortcutText(shortcuts.sessionQuickSwitch1())} 到 ${shortcutText(shortcuts.sessionQuickSwitch9())} 快速切换`
      : undefined,
  "运行 {highlight}/compact{/highlight} 在上下文接近上限时压缩长会话",
  (shortcuts) => `使用 ${commandText("/export", shortcuts.sessionExport())} 将对话保存为 Markdown`,
  (shortcuts) => press(shortcuts.messagesCopy(), "复制助手上一条回复到剪贴板"),
  (shortcuts) => press(shortcuts.commandList(), "查看所有可用操作和命令"),
  "运行 {highlight}/connect{/highlight} 为 75+ 个支持的 LLM 服务商添加 API Key",
  (shortcuts) => `Leader 键是 ${shortcutText(shortcuts.leader())}；可以和其他按键组合触发快捷操作`,
  (shortcuts) => press(shortcuts.modelCycleRecent(), "在最近使用过的模型之间快速切换"),
  (shortcuts) => press(shortcuts.sessionSidebarToggle(), "在会话中显示或隐藏侧边栏"),
  (shortcuts) =>
    shortcuts.messagesPageUp() && shortcuts.messagesPageDown()
      ? `使用 ${shortcutText(shortcuts.messagesPageUp())}/${shortcutText(shortcuts.messagesPageDown())} 浏览对话历史`
      : undefined,
  (shortcuts) => press(shortcuts.messagesFirst(), "跳到对话开头"),
  (shortcuts) => press(shortcuts.messagesLast(), "跳到最新消息"),
  (shortcuts) => press(shortcuts.inputNewline(), "在输入框里换行"),
  (shortcuts) => press(shortcuts.inputClear(), "清空正在输入的内容"),
  (shortcuts) => press(shortcuts.sessionInterrupt(), "中断 AI 当前回复"),
  "切换到 {highlight}Plan{/highlight} 智能体，可以先拿建议而不直接改文件",
  "在提示词里使用 {highlight}@agent-name{/highlight} 调用专门的子智能体",
  (shortcuts) => {
    const items = [
      shortcuts.sessionParent(),
      shortcuts.childFirst(),
      shortcuts.childPrevious(),
      shortcuts.childNext(),
    ].filter(Boolean)
    if (!items.length) return undefined
    return `使用 ${items.map(shortcutText).join(" / ")} 在父会话和子会话之间切换`
  },
  "创建 {highlight}zxcode.json{/highlight} 管理服务端设置，创建 {highlight}tui.json{/highlight} 管理 TUI 设置",
  "把 TUI 全局设置放到 {highlight}~/.config/zxcode/tui.json{/highlight}",
  "在配置里添加 {highlight}$schema{/highlight}，编辑器就能自动补全",
  "在配置里设置 {highlight}model{/highlight}，可以指定默认模型",
  "在 {highlight}tui.json{/highlight} 的 {highlight}keybinds{/highlight} 里覆盖快捷键",
  "把任意快捷键设置成 {highlight}none{/highlight} 可以完全禁用它",
  "在配置的 {highlight}mcp{/highlight} 区域配置本地或远程 MCP 服务",
  "把 {highlight}.md{/highlight} 文件放进 {highlight}.zxcode/commands/{/highlight} 可以定义可复用的自定义提示词",
  "在自定义命令里使用 {highlight}$ARGUMENTS{/highlight}、{highlight}$1{/highlight}、{highlight}$2{/highlight} 接收动态输入",
  "在命令里使用反引号可以注入 shell 输出，例如 {highlight}`git status`{/highlight}",
  "把 {highlight}.md{/highlight} 文件放进 {highlight}.zxcode/agents/{/highlight} 可以定义专门的 AI 角色",
  "为每个智能体单独配置 {highlight}edit{/highlight}、{highlight}bash{/highlight}、{highlight}webfetch{/highlight} 工具权限",
  '使用类似 {highlight}"git *": "allow"{/highlight} 的规则精细控制 bash 权限',
  '设置 {highlight}"rm -rf *": "deny"{/highlight} 可以阻止危险删除命令',
  '设置 {highlight}"git push": "ask"{/highlight} 可以在推送前要求确认',
  '设置 {highlight}"formatter": true{/highlight} 可以启用 prettier、gofmt、ruff 等内置格式化器',
  '设置 {highlight}"formatter": false{/highlight} 可以关闭其他配置层启用的格式化器',
  "可以按文件扩展名定义自定义格式化命令",
  '设置 {highlight}"lsp": true{/highlight} 可以启用内置 LSP 做代码分析',
  "把 {highlight}.ts{/highlight} 文件放进 {highlight}.zxcode/tools/{/highlight} 可以定义新的 LLM 工具",
  "工具定义可以调用 Python、Go 等语言编写的脚本",
  "把 {highlight}.ts{/highlight} 文件放进 {highlight}.zxcode/plugins/{/highlight} 可以定义事件钩子",
  "使用插件可以在会话完成时发送系统通知",
  "创建插件可以阻止 ZXCode 读取敏感文件",
  "使用 {highlight}zxcode run{/highlight} 可以进行非交互式脚本调用",
  "使用 {highlight}zxcode --continue{/highlight} 可以继续上一次会话",
  "使用 {highlight}zxcode run -f file.ts{/highlight} 可以通过 CLI 附加文件",
  "使用 {highlight}--format json{/highlight} 可以在脚本中获得机器可读输出",
  "运行 {highlight}zxcode serve{/highlight} 可以启动无界面的 API 服务",
  "使用 {highlight}zxcode run --attach{/highlight} 可以连接到正在运行的服务",
  "运行 {highlight}zxcode upgrade{/highlight} 可以更新到最新版本",
  "运行 {highlight}zxcode auth list{/highlight} 可以查看已配置的服务商",
  "运行 {highlight}zxcode agent create{/highlight} 可以引导创建智能体",
  "在 GitHub Issue 或 PR 里使用 {highlight}/zxcode{/highlight} 可以触发 AI 操作",
  "运行 {highlight}zxcode github install{/highlight} 可以配置 GitHub 工作流",
  "在 Issue 里评论 {highlight}/zxcode fix this{/highlight} 可以自动创建修复 PR",
  "在 PR 代码行评论 {highlight}/oc{/highlight} 可以发起定点代码审查",
  '使用 {highlight}"theme": "system"{/highlight} 可以跟随终端配色',
  "把 JSON 主题文件放进 {highlight}.zxcode/themes/{/highlight} 目录即可使用自定义主题",
  "主题同时支持深色和浅色两种变体",
  "自定义主题 JSON 支持 0-255 的 xterm 数字色值",
  "使用 {highlight}{env:VAR_NAME}{/highlight} 可以在配置中引用环境变量",
  "使用 {highlight}{file:path}{/highlight} 可以在配置中引用文件内容",
  "使用 {highlight}instructions{/highlight} 可以加载额外规则文件",
  "把智能体 {highlight}temperature{/highlight} 设为 0.0 更稳定，设为 1.0 更发散",
  "配置 {highlight}steps{/highlight} 可以限制智能体每次请求的迭代步数",
  '设置 {highlight}"tools": {"bash": false}{/highlight} 可以禁用指定工具',
  '设置 {highlight}"mcp_*": false{/highlight} 可以禁用某个 MCP 服务下的所有工具',
  "可以按智能体覆盖全局工具设置",
  '设置 {highlight}"share": "auto"{/highlight} 可以自动分享所有会话',
  '设置 {highlight}"share": "disabled"{/highlight} 可以禁止会话分享',
  "运行 {highlight}/unshare{/highlight} 可以取消当前会话的公开分享",
  "{highlight}doom_loop{/highlight} 权限用于防止工具调用无限循环",
  "{highlight}external_directory{/highlight} 权限用于保护项目外部文件",
  "运行 {highlight}zxcode debug config{/highlight} 可以排查配置问题",
  "使用 {highlight}--print-logs{/highlight} 可以在 stderr 中查看详细日志",
  (shortcuts) => `使用 ${commandText("/timeline", shortcuts.sessionTimeline())} 跳到指定消息`,
  (shortcuts) => press(shortcuts.messagesToggleConceal(), "折叠或展开消息中的代码块"),
  (shortcuts) => `使用 ${commandText("/status", shortcuts.statusView())} 查看系统状态信息`,
  "在 {highlight}tui.json{/highlight} 里启用 {highlight}scroll_acceleration{/highlight} 可以获得更顺滑的滚动",
  (shortcuts) =>
    shortcuts.commandList()
      ? `通过命令面板切换聊天中的用户名显示（${shortcutText(shortcuts.commandList())}）`
      : "通过命令面板切换聊天中的用户名显示",
  "运行 {highlight}docker run -it --rm ghcr.io/1017293270/zhixiangcode{/highlight} 可以用容器启动",
  "使用 {highlight}/connect{/highlight} 连接经过整理和测试的模型服务",
  "把项目的 {highlight}AGENTS.md{/highlight} 提交到 Git，方便团队共享规则",
  "使用 {highlight}/review{/highlight} 审查未提交改动、分支或 PR",
  (shortcuts) => `使用 ${commandText("/help", shortcuts.helpShow())} 打开帮助面板`,
  "使用 {highlight}/rename{/highlight} 可以重命名当前会话",
]

const INPUT_UNDO_TIP: Tip = (shortcuts) => press(shortcuts.inputUndo(), "撤销输入框里的改动")
const TERMINAL_SUSPEND_TIP: Tip = (shortcuts) =>
  press(shortcuts.terminalSuspend(), "挂起终端并回到 shell")
