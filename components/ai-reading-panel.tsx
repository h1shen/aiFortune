"use client"

import { useEffect, useRef, useState } from "react"
import { Send, Loader2 } from "lucide-react"
import { streamChat } from "@/lib/api"
import type { ChatMessage } from "@/lib/types"

const SUGGESTIONS = [
  "我的命格属于什么格局？",
  "今年有没有正桃花？",
  "哪个方位对我最有利？",
  "什么行业最适合我？",
  "大运什么时候转折？",
]

type ChatTurn = ChatMessage & { streaming?: boolean }

/** 来意预测卡：进入 /result 自动触发一次 laiyi 流式输出 */
export function LaiyiCard({ chartId }: { chartId: string }) {
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

  return (
    <div className="relative overflow-hidden rounded-md border border-accent/40 bg-card p-6 shadow-[0_30px_60px_-30px_rgba(20,25,45,0.35)] md:p-8">
      <div aria-hidden className="pointer-events-none absolute -inset-4 rounded-lg bg-gradient-to-br from-accent/15 via-transparent to-primary/10 blur-2xl -z-10" />
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-accent">Laiyi · 来意预测</p>
          <h3 className="mt-1 font-serif text-xl font-semibold text-foreground">玄机猜你正在想什么</h3>
        </div>
        {busy && <Loader2 className="h-4 w-4 animate-spin text-accent" />}
      </div>
      <div className="min-h-[120px] whitespace-pre-wrap font-serif text-sm leading-relaxed text-foreground/90">
        {laiyi || (busy ? "玄机正在推算您此刻的心事..." : "（暂无）")}
        {busy && laiyi && <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-accent align-middle" />}
      </div>
    </div>
  )
}

/** 自由问答 chat 面板 */
export function QaChat({ chartId }: { chartId: string }) {
  const [chat, setChat] = useState<ChatTurn[]>([])
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const scrollerRef = useRef<HTMLDivElement>(null)

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
          next[assistantIdx] = { ...next[assistantIdx], content: next[assistantIdx].content + `\n[错误: ${err}]`, streaming: false }
          return next
        })
        setBusy(false)
      },
    )
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card shadow-[0_30px_60px_-30px_rgba(20,25,45,0.35)]">
      <div className="flex items-center justify-between border-b border-border bg-secondary/60 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-serif text-primary-foreground">玄</div>
          <div>
            <p className="font-serif text-sm text-foreground">玄机 · AI 命理师</p>
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-chart-4" />
              在线 · 已加载您的命盘
            </p>
          </div>
        </div>
      </div>

      <div ref={scrollerRef} className="max-h-[420px] min-h-[200px] space-y-4 overflow-y-auto p-5">
        {chat.length === 0 && (
          <div className="text-center font-serif text-sm text-muted-foreground">
            可以直接问玄机您关心的事情 —— 比如事业、感情、健康、选择。
          </div>
        )}
        {chat.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-lg px-4 py-3 font-serif text-sm leading-relaxed whitespace-pre-wrap ${
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
          onSubmit={(e) => { e.preventDefault(); sendMessage(input) }}
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
