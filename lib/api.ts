import type { CalculateRequest, Chart, ChatRequest } from "./types"

// 所有请求走同源 /api/*：
//   - 本地开发 via Next.js rewrites → http://127.0.0.1:8000（uvicorn）
//   - Vercel 生产 → /api/index (Python serverless function)
const API = "/api"

const STORE_KEY = (id: string) => `keymind-chart-${id}`
const LATEST_KEY = "keymind-chart-latest"

/** 排盘：调后端算法，把结果写入 localStorage 以便后续 chat 无状态读取 */
export async function calculateBazi(input: CalculateRequest): Promise<Chart> {
  const res = await fetch(`${API}/bazi/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(`排盘失败 (${res.status}): ${msg}`)
  }
  const chart: Chart = await res.json()
  try {
    localStorage.setItem(STORE_KEY(chart.chartId), JSON.stringify(chart))
    localStorage.setItem(LATEST_KEY, chart.chartId)
  } catch {
    /* 隐私模式 / 容量爆满 → 忽略，功能降级（chat 会报 chart 缺失） */
  }
  return chart
}

/** 从 localStorage 读命盘；无后端存储 */
export function loadChartFromStorage(chartId: string): Chart | null {
  try {
    const raw = localStorage.getItem(STORE_KEY(chartId))
    if (!raw) return null
    return JSON.parse(raw) as Chart
  } catch {
    return null
  }
}

export function loadLatestChartId(): string | null {
  try {
    return localStorage.getItem(LATEST_KEY)
  } catch {
    return null
  }
}

/**
 * 连接 /api/chat/stream 的 SSE，逐 token 回调 onDelta。
 * 返回一个 AbortController，调用方可以取消。
 */
export function streamChat(
  req: ChatRequest,
  onDelta: (delta: string) => void,
  onDone?: (fullText: string) => void,
  onError?: (err: string) => void,
): AbortController {
  const ctl = new AbortController()
  let full = ""
  ;(async () => {
    try {
      const res = await fetch(`${API}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
        signal: ctl.signal,
      })
      if (!res.ok || !res.body) {
        const txt = await res.text().catch(() => "")
        onError?.(`chat 请求失败 ${res.status}: ${txt}`)
        return
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder("utf-8")
      let buffer = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split(/\n\n/)
        buffer = events.pop() || ""
        for (const ev of events) {
          for (const line of ev.split(/\n/)) {
            if (!line.startsWith("data: ")) continue
            const payload = line.slice(6).trim()
            if (payload === "[DONE]") continue
            try {
              const obj = JSON.parse(payload)
              if (obj.delta) {
                full += obj.delta
                onDelta(obj.delta)
              } else if (obj.error) {
                onError?.(obj.error)
              }
            } catch {
              /* malformed */
            }
          }
        }
      }
      onDone?.(full)
    } catch (e: any) {
      if (e?.name === "AbortError") return
      onError?.(String(e?.message || e))
    }
  })()
  return ctl
}
