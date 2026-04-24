// 解析"命盘整体解读" LLM 流式输出为 6 段结构化内容。
// Prompt 中约定每段以 emoji + **标题** 开头，因此用 emoji 作为唯一锚点。

export const READING_SECTIONS = [
  { emoji: "🌱", key: "personality", title: "性格底色", tone: "chart4" },
  { emoji: "🧭", key: "framework", title: "人生格局", tone: "accent" },
  { emoji: "🌊", key: "dayun", title: "大运轨迹", tone: "chart1" },
  { emoji: "🔥", key: "elements", title: "五行建议", tone: "destructive" },
  { emoji: "📅", key: "keydates", title: "近期关键节点", tone: "chart3" },
  { emoji: "✨", key: "summary", title: "一句话总结", tone: "highlight" },
] as const

export type ReadingSectionKey = typeof READING_SECTIONS[number]["key"]

const EMOJI_SET = READING_SECTIONS.map((s) => s.emoji)
const EMOJI_REGEX = new RegExp(`(${EMOJI_SET.join("|")})`, "g")
// 匹配段首：emoji + 可选 **标题** + 可选破折号/冒号
const HEADER_STRIP = new RegExp(
  `^(?:${EMOJI_SET.join("|")})\\s*(?:\\*{1,2}[^*]+\\*{1,2}\\s*)?(?:——|—|-|:|：)?\\s*`,
)

export interface ParsedReading {
  sections: Record<ReadingSectionKey, string>
  /** 正在流式输出的那段 key；若没有任何 emoji，返回 null */
  current: ReadingSectionKey | null
  /** 没解析到任何段时为 true（此时应当回退到 raw 显示） */
  empty: boolean
}

export function parseReading(text: string): ParsedReading {
  const sections = Object.fromEntries(
    READING_SECTIONS.map((s) => [s.key, ""]),
  ) as Record<ReadingSectionKey, string>

  const matches: { emoji: string; start: number }[] = []
  let m: RegExpExecArray | null
  EMOJI_REGEX.lastIndex = 0
  while ((m = EMOJI_REGEX.exec(text)) !== null) {
    matches.push({ emoji: m[1], start: m.index })
  }

  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i]
    const end = i + 1 < matches.length ? matches[i + 1].start : text.length
    const sec = READING_SECTIONS.find((s) => s.emoji === cur.emoji)
    if (!sec) continue
    const chunk = text.slice(cur.start, end).replace(HEADER_STRIP, "")
    sections[sec.key] = chunk.trim()
  }

  const last = matches[matches.length - 1]
  const current = last
    ? (READING_SECTIONS.find((s) => s.emoji === last.emoji)?.key ?? null)
    : null

  return { sections, current, empty: matches.length === 0 }
}
