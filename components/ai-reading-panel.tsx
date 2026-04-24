"use client"

import { useEffect, useRef, useState } from "react"
import { Send, Loader2 } from "lucide-react"
import { streamChat } from "@/lib/api"
import type { ChatMessage } from "@/lib/types"
import { parseLaiyi } from "@/lib/laiyi-parse"

const SUGGESTIONS = [
  "我的命格属于什么格局？",
  "今年有没有正桃花？",
  "哪个方位对我最有利？",
  "什么行业最适合我？",
  "大运什么时候转折？",
]

type ChatTurn = ChatMessage & { streaming?: boolean }

/** 来意预测卡：3 张子卡，边流式边解析；点击任一问题立即拉起 QA 抽屉并发送；底部按钮打开空白抽屉 */
export function LaiyiCard({
  chartId,
  onOpenChat,
}: {
  chartId: string
  onOpenChat: (question?: string) => void
}) {
  const [laiyi, setLaiyi] = useState("")
  const [busy, setBusy] = useState(true)

  useEffect(() => {
    if (!chartId) return
    setLaiyi("")
    setBusy(true)
    const ctl = streamChat(
      { chartId, mode: "laiyi" },
      (d) => setLaiyi((s) => s + d),
      () => setBusy(false),
      (err) => { setLaiyi((s) => s + `\n[错误: ${err}]`); setBusy(false) },
    )
    return () => ctl.abort()
  }, [chartId])

  const items = parseLaiyi(laiyi)
  // 补齐到 3 张骨架；已解析的填充
  const slots: Array<(typeof items)[number] | null> = [0, 1, 2].map((i) => items[i] ?? null)

  const hasAny = items.length > 0

  return (
    <div className="relative overflow-hidden rounded-md border border-accent/40 bg-card p-6 shadow-[0_30px_60px_-30px_rgba(20,25,45,0.35)] md:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-4 -z-10 rounded-lg bg-gradient-to-br from-accent/15 via-transparent to-primary/10 blur-2xl"
      />
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-accent">Laiyi · 来意预测</p>
          <h3 className="mt-1 font-serif text-xl font-semibold text-foreground">玄机猜你正在想什么</h3>
        </div>
        {busy && <Loader2 className="h-4 w-4 animate-spin text-accent" />}
      </div>

      <div className="flex flex-col gap-3">
        {!hasAny && busy && (
          <p className="font-serif text-sm text-muted-foreground">玄机正在推算您此刻的心事...</p>
        )}
        {slots.map((it, i) =>
          it ? (
            <button
              key={i}
              type="button"
              onClick={() => onOpenChat(it.q)}
              className="group w-full rounded-sm border border-accent/20 bg-[oklch(0.97_0.008_85/0.5)] px-3.5 py-3 text-left transition-colors hover:border-accent/60 hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              aria-label={`向玄机提问：${it.q}`}
            >
              <div className="text-[10px] tracking-[0.1em] text-accent">{it.topic}</div>
              <div className="mt-1 font-serif text-sm font-medium text-foreground">💭 {it.q}</div>
              <div className="mt-1.5 font-serif text-[11px] leading-[1.6] text-muted-foreground">
                原因：{it.reason}
              </div>
            </button>
          ) : (
            <div
              key={i}
              className="rounded-sm border border-dashed border-accent/20 bg-[oklch(0.97_0.008_85/0.3)] px-3.5 py-3 opacity-60"
            >
              <div className="h-2.5 w-16 rounded-sm bg-accent/20" />
              <div className="mt-2 h-3.5 w-4/5 rounded-sm bg-foreground/10" />
              <div className="mt-2 h-3 w-full rounded-sm bg-foreground/5" />
              <div className="mt-1.5 h-3 w-3/4 rounded-sm bg-foreground/5" />
            </div>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={() => onOpenChat()}
        className="mt-4 w-full rounded-full border border-transparent bg-primary px-4 py-2.5 font-serif text-sm text-primary-foreground transition-opacity hover:opacity-90"
      >
        追问玄机 →
      </button>
    </div>
  )
}

/** 自由问答 chat 面板；在 Sheet 内使用，占满容器高度，无外层边框。
 *  initial?: 父组件传来的"一点即问"初始提问；用 nonce 触发每一次点击都生效。 */
export function QaChat({
  chartId,
  initial,
}: {
  chartId: string
  initial?: { q: string; nonce: number }
}) {
  const [chat, setChat] = useState<ChatTurn[]>([])
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const busyRef = useRef(false)
  busyRef.current = busy

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" })
  }, [chat])

  const sendMessage = (text: string) => {
    const content = text.trim()
    if (!content || busy) return
    const history: ChatTurn[] = [...chat, { role: "user", content }]
    const assistantIdx = history.length
    const withStub: ChatTurn[] = [...history, { role: "assistant", content: "", streaming: true }]
    setChat(withStub)
    setInput("")
    setBusy(true)

    streamChat(
      { chartId, mode: "qa", messages: history.map(({ role, content }) => ({ role, content })) },
      (d) => setChat((prev) => {
        const next = [...prev]
        next[assistantIdx] = { ...next[assistantIdx], content: next[assistantIdx].content + d }
        return next
      }),
      () => {
        setChat((prev) => {
          const next = [...prev]
          next[assistantIdx] = { ...next[assistantIdx], streaming: false }
          return next
        })
        setBusy(false)
      },
      (err) => {
        setChat((prev) => {
          const next = [...prev]
          next[assistantIdx] = {
            ...next[assistantIdx],
            content: next[assistantIdx].content + `\n[错误: ${err}]`,
            streaming: false,
          }
          return next
        })
        setBusy(false)
      },
    )
  }

  // Latest sendMessage via ref so the auto-send effect only depends on nonce.
  const sendRef = useRef(sendMessage)
  sendRef.current = sendMessage

  // 一点即问：父组件 initial.nonce 一变就自动把问题送出去。
  const lastSentNonceRef = useRef<number | null>(null)
  useEffect(() => {
    if (!initial || !initial.q) return
    if (lastSentNonceRef.current === initial.nonce) return
    lastSentNonceRef.current = initial.nonce
    // 若正有请求进行中，先不打断——下次点击会再触发。
    if (busyRef.current) return
    sendRef.current(initial.q)
  }, [initial?.nonce, initial?.q, initial])

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollerRef} className="flex-1 space-y-4 overflow-y-auto p-5">
        {chat.length === 0 && (
          <div className="text-center font-serif text-sm text-muted-foreground">
            可以直接问玄机您关心的事情 —— 比如事业、感情、健康、选择。
          </div>
        )}
        {chat.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-4 py-3 font-serif text-sm leading-relaxed ${
                m.role === "user"
                  ? "rounded-tr-sm bg-primary text-primary-foreground"
                  : "rounded-tl-sm border border-accent/30 bg-accent/5 text-foreground"
              }`}
            >
              {m.content}
              {m.streaming && <span className="ml-1 inline-block h-3 w-1 animate-pulse bg-accent align-middle" />}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              disabled={busy}
              onClick={() => sendMessage(s)}
              className="rounded-full border border-border bg-background px-3 py-1 font-serif text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage(input)
          }}
          className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
            placeholder={busy ? "玄机正在书写..." : "向玄机发问你的命运..."}
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
          />
          <button
            type="submit"
            aria-label="发送"
            disabled={busy || !input.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-primary-foreground disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </button>
        </form>
      </div>
    </div>
  )
}
