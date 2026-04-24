import type { CalculateRequest, Chart, ChatRequest } from "./types"

// 所有请求走 Next BFF /api/proxy/* ，后端真实地址由 BACKEND_URL 环境变量注入
const PROXY = "/api/proxy"

export async function calculateBazi(input: CalculateRequest): Promise<Chart> {
  const res = await fetch(`${PROXY}/bazi/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(`排盘失败 (${res.status}): ${msg}`)
  }
  return res.json()
}

export async function getChart(chartId: string): Promise<Chart> {
  const res = await fetch(`${PROXY}/bazi/chart/${chartId}`)
  if (!res.ok) throw new Error(`命盘获取失败 (${res.status})`)
  return res.json()
}

/**
 * 连接 /chat/stream 的 SSE，逐 token 回调 onDelta。
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
      const res = await fetch(`${PROXY}/chat/stream`, {
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
        // SSE 事件以两个换行结束
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
              // ignore malformed
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
