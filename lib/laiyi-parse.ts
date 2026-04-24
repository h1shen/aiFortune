// 解析 laiyi 模式流式文本为 3 张结构化卡片。
//
// 后端 prompt 约定输出格式（见 server/app/llm/prompts.py）：
//
//   💭 你可能在想：<Q>｜原因：<R>
//   💭 你可能在想：<Q>｜原因：<R>
//   💭 你可能在想：<Q>｜原因：<R>
//   请直接告诉我你真正想问的是哪一个...
//
// 流式过程中文本可能不完整，解析需要容错：半成品卡片也返回。

export type LaiyiTopic = "事业" | "感情" | "选择" | "其他"

export interface LaiyiCard {
  topic: LaiyiTopic
  q: string
  reason: string
}

// 按"💭"切分文本（U+1F4AD）。第一段是 header 前的文本，丢弃。
const BULLET = "💭"
// "你可能在想：" 这样的前缀，兼容「你在想」「我猜你在想」等常见变体
const Q_PREFIX_REGEX = /^(?:我猜你在想|你可能在想|你在想|可能在想)\s*[:：]?\s*/
// "原因" 分隔 — 兼容中英文冒号
const REASON_SPLIT_REGEX = /原因\s*[:：]\s*/

// 话题关键词（顺序优先）
const TOPIC_PATTERNS: ReadonlyArray<{ topic: LaiyiTopic; regex: RegExp }> = [
  {
    topic: "感情",
    regex: /感情|爱情|婚姻|桃花|缘分|对象|伴侣|结婚|正缘|正桃花|恋爱/,
  },
  {
    topic: "事业",
    regex: /工作|职业|事业|赚钱|升职|换工作|公司|行业|offer/i,
  },
  {
    topic: "选择",
    regex: /选择|决定|机会|要不要|该不该|走|留|换|搬迁|南方|北方/,
  },
]

function inferTopic(q: string, reason: string): LaiyiTopic {
  const text = `${q} ${reason}`
  for (const { topic, regex } of TOPIC_PATTERNS) {
    if (regex.test(text)) return topic
  }
  return "其他"
}

function trimEdges(s: string): string {
  // 去掉首尾空白（包括全角空格）和 ｜ 分隔符
  return s.replace(/^[\s｜|]+/, "").replace(/[\s｜|]+$/, "")
}

export function parseLaiyi(raw: string): LaiyiCard[] {
  if (!raw || !raw.trim()) return []

  // 按 💭 切分
  const segments = raw.split(BULLET)
  // 第一段是 header 前文本，丢弃
  const body = segments.slice(1)
  if (body.length === 0) return []

  const cards: LaiyiCard[] = []

  for (const rawSeg of body) {
    // 单段可能形如 " 你可能在想：XXX｜原因：YYY\n请直接告诉..."，
    // 但既然所有 💭 都已切掉，后续自由文本（邀请语）会跟在最后一段尾部。
    // 我们只关心 q/reason 本体，容错地去掉明显的尾部邀请语——
    // 不过因为邀请语一般出现在最后一段外层（紧跟最后一个卡片），
    // 简化处理：只做前缀剥离 + 原因切分，不强行截断尾部。
    let seg = rawSeg.replace(/^\s+/, "")
    // 剥离 q 前缀
    seg = seg.replace(Q_PREFIX_REGEX, "")

    let q = ""
    let reason = ""
    const parts = seg.split(REASON_SPLIT_REGEX)
    if (parts.length >= 2) {
      q = trimEdges(parts[0])
      // 原因可能跨行；取 split 后的剩余内容，但若内嵌尾部邀请语则尝试在首个换行后截断
      const rest = parts.slice(1).join("原因：")
      reason = trimEdges(rest)
    } else {
      // 还没输出"原因："，q 半成品
      q = trimEdges(parts[0])
      reason = ""
    }

    // 尾部邀请语（最后一张卡的 reason 里可能拖着"请直接告诉我..."等）
    // 简单处理：如果 reason 里出现"请直接告诉我"/"请告诉我"/"你真正想问"等起始的行，裁掉
    if (reason) {
      const tailMatch = reason.match(
        /[\s\S]*?(?=\n\s*(?:请直接告诉我|请告诉我|你真正想问)|$)/,
      )
      if (tailMatch) reason = trimEdges(tailMatch[0])
    } else if (q) {
      // q 里可能也拖了尾部邀请语
      const tailMatch = q.match(
        /[\s\S]*?(?=\n\s*(?:请直接告诉我|请告诉我|你真正想问)|$)/,
      )
      if (tailMatch) q = trimEdges(tailMatch[0])
    }

    cards.push({ topic: inferTopic(q, reason), q, reason })
  }

  return cards
}

// --- 内联 self-test（仅开发期）-------------------------------------------
if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
  // 1) 完整三条
  const full = [
    "💭 你可能在想：今年能不能换工作？｜原因：大运正在转官杀",
    "💭 你可能在想：正缘什么时候来？｜原因：桃花入流年",
    "💭 你可能在想：要不要去南方发展？｜原因：地支冲动",
    "请直接告诉我你真正想问的是哪一个。",
  ].join("\n")
  const parsed = parseLaiyi(full)
  console.assert(parsed.length === 3, "laiyi parse: expected 3 cards", parsed)
  console.assert(parsed[0].topic === "事业", "laiyi parse: first card topic", parsed[0])
  console.assert(parsed[1].topic === "感情", "laiyi parse: second card topic", parsed[1])
  console.assert(parsed[2].topic === "选择", "laiyi parse: third card topic", parsed[2])

  // 2) 流式半成品：第三条 reason 未到
  const partial = [
    "💭 你可能在想：今年能不能换工作？｜原因：大运正在转官杀",
    "💭 你可能在想：正缘什么时候来？｜原因：桃花入流年",
    "💭 你可能在想：要不要去南方发展？",
  ].join("\n")
  const parsedPartial = parseLaiyi(partial)
  console.assert(
    parsedPartial.length === 3 && parsedPartial[2].reason === "",
    "laiyi parse: partial third card reason empty",
    parsedPartial,
  )

  // 3) 空输入
  console.assert(parseLaiyi("").length === 0, "laiyi parse: empty input")
}
