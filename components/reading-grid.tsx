"use client"

import { useEffect, useState } from "react"
import { BookOpen, Loader2, RotateCw, Feather } from "lucide-react"
import { Button } from "@/components/ui/button"
import { streamChat } from "@/lib/api"
import type { Chart } from "@/lib/types"
import { READING_SECTIONS, parseReading, type ReadingSectionKey } from "@/lib/reading-parse"
import { FortuneChart } from "./fortune-chart"

// 每段的配色（基于 globals.css 的 token）
const TONE: Record<string, { border: string; badge: string; bar: string; text: string }> = {
  chart4: { border: "border-chart-4/30", badge: "bg-chart-4/15 text-chart-4 border-chart-4/30", bar: "bg-chart-4", text: "text-chart-4" },
  accent: { border: "border-accent/40", badge: "bg-accent/15 text-accent border-accent/40", bar: "bg-accent", text: "text-accent" },
  chart1: { border: "border-chart-1/30", badge: "bg-chart-1/15 text-chart-1 border-chart-1/30", bar: "bg-chart-1", text: "text-chart-1" },
  destructive: { border: "border-destructive/30", badge: "bg-destructive/10 text-destructive border-destructive/30", bar: "bg-destructive", text: "text-destructive" },
  chart3: { border: "border-chart-3/30", badge: "bg-chart-3/15 text-chart-3 border-chart-3/30", bar: "bg-chart-3", text: "text-chart-3" },
  highlight: { border: "border-accent/50", badge: "bg-gradient-to-r from-accent/25 to-primary/10 text-accent border-accent/40", bar: "bg-accent", text: "text-accent" },
}

// 加载状态轮换文案（"命理师执笔中" 感）
const STATUS_STAGES = [
  "玄机查阅古籍中...",
  "推演您的十神格局...",
  "权衡五行喜忌...",
  "梳理大运流年...",
  "润色命理建言...",
]
// 加载态旋转展示的天干地支
const GANZHI_WHEEL = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸", "子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

export function ReadingGrid({ chart }: { chart: Chart }) {
  const [reading, setReading] = useState("")
  const [busy, setBusy] = useState(false)
  const [started, setStarted] = useState(false)

  const handleReading = () => {
    if (busy) return
    setReading("")
    setStarted(true)
    setBusy(true)
    streamChat(
      { chartId: chart.chartId, mode: "reading" },
      (d) => setReading((s) => s + d),
      () => setBusy(false),
      (err) => { setReading((s) => s + `\n[错误: ${err}]`); setBusy(false) },
    )
  }

  const parsed = parseReading(reading)
  const anyContent = Object.values(parsed.sections).some((v) => v.length > 0)
  // "首字未到" 的空窗期：已请求但还没收到任何 emoji 段
  const preStreamWaiting = busy && !anyContent

  return (
    <section className="space-y-6">
      {/* 顶部：人生运势折线图，始终展示（数据来自命盘） */}
      <FortuneChart chart={chart} />

      <div className="rounded-md border border-border bg-card p-6 shadow-[0_20px_50px_-25px_rgba(20,25,45,0.25)] md:p-8">
        <header className="mb-6 flex flex-col gap-3 border-b border-border/60 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent">Reading</p>
            <h3 className="mt-2 font-serif text-2xl font-semibold text-foreground md:text-3xl">命盘整体解读</h3>
            <p className="mt-2 font-serif text-sm text-muted-foreground">
              性格 · 人生格局 · 大运 · 五行 · 关键节点 · 一句话总结
            </p>
          </div>
          <Button onClick={handleReading} disabled={busy} variant="outline" className="font-serif">
            {busy ? (
              <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" />玄机执笔中...</>
            ) : started ? (
              <><RotateCw className="mr-1.5 h-4 w-4" />重新解读</>
            ) : (
              <><BookOpen className="mr-1.5 h-4 w-4" />展开完整解读</>
            )}
          </Button>
        </header>

        {!started ? (
          <EmptyState />
        ) : (
          <>
            {preStreamWaiting && <WaitingBanner />}
            <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${preStreamWaiting ? "mt-4" : ""}`}>
              {READING_SECTIONS.slice(0, 5).map((sec) => {
                const content = parsed.sections[sec.key]
                const isCurrent = busy && parsed.current === sec.key
                const isPending = !content && !isCurrent
                const isFull = sec.key === "keydates"
                return (
                  <SectionCard
                    key={sec.key}
                    sec={sec}
                    content={content}
                    isCurrent={isCurrent}
                    isPending={isPending}
                    busy={busy}
                    fullWidth={isFull}
                  />
                )
              })}
              <SummaryCard
                content={parsed.sections.summary}
                isCurrent={busy && parsed.current === "summary"}
                isPending={!parsed.sections.summary && parsed.current !== "summary"}
                busy={busy}
              />
              {parsed.empty && reading && (
                <div className="md:col-span-2 whitespace-pre-wrap rounded-md border border-dashed border-border p-4 font-serif text-sm leading-relaxed text-foreground/90">
                  {reading}
                  {busy && <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-accent align-middle" />}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

/** 已请求但 LLM 还没回首字的空窗期 —— 用一个大 banner 展示"推算中" */
function WaitingBanner() {
  const [statusIdx, setStatusIdx] = useState(0)
  const [wheelIdx, setWheelIdx] = useState(0)
  useEffect(() => {
    const t1 = setInterval(() => setStatusIdx((i) => (i + 1) % STATUS_STAGES.length), 1500)
    const t2 = setInterval(() => setWheelIdx((i) => (i + 1) % GANZHI_WHEEL.length), 120)
    return () => { clearInterval(t1); clearInterval(t2) }
  }, [])
  return (
    <div className="relative overflow-hidden rounded-md border border-accent/40 bg-gradient-to-br from-accent/10 via-transparent to-primary/5 p-6 md:p-8">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-accent/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -left-20 -bottom-20 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative flex items-center gap-5">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-accent/40 bg-background/60 shadow-inner md:h-24 md:w-24">
          <span
            key={wheelIdx}
            className="font-serif text-3xl font-semibold text-accent md:text-4xl animate-in fade-in zoom-in duration-200"
          >
            {GANZHI_WHEEL[wheelIdx]}
          </span>
          {/* 外环旋转 */}
          <svg aria-hidden className="absolute inset-0 animate-spin" style={{ animationDuration: "8s" }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 6" className="text-accent/40" />
          </svg>
          <svg aria-hidden className="absolute inset-0 animate-spin" style={{ animationDuration: "4s", animationDirection: "reverse" }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1 10" className="text-primary/30" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 font-serif text-xs uppercase tracking-[0.25em] text-accent">
            <Feather className="h-3.5 w-3.5" />
            Crafting
          </div>
          <div className="mt-2 font-serif text-lg text-foreground md:text-xl">
            <span key={statusIdx} className="inline-block animate-in fade-in slide-in-from-bottom-1 duration-500">
              {STATUS_STAGES[statusIdx]}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse"
                style={{ animationDelay: `${i * 200}ms`, animationDuration: "1.2s" }}
              />
            ))}
            <span className="ml-2 font-serif text-xs text-muted-foreground">玄机正伏案执笔，片刻即成</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {READING_SECTIONS.slice(0, 5).map((sec) => {
        const tone = TONE[sec.tone]
        const isFull = sec.key === "keydates"
        return (
          <div
            key={sec.key}
            className={`rounded-md border border-dashed ${tone.border} bg-background/30 p-5 opacity-60 ${isFull ? "md:col-span-2" : ""}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{sec.emoji}</span>
              <span className={`font-serif text-sm font-medium ${tone.text}`}>{sec.title}</span>
            </div>
            <p className="mt-3 font-serif text-xs text-muted-foreground">（待展开解读）</p>
          </div>
        )
      })}
      <div className="md:col-span-2 rounded-md border border-dashed border-accent/40 bg-accent/5 p-5 opacity-70">
        <div className="flex items-center gap-2">
          <span className="text-xl">✨</span>
          <span className="font-serif text-sm font-medium text-accent">一句话总结</span>
        </div>
        <p className="mt-3 font-serif text-xs text-muted-foreground">
          点击右上角"展开完整解读"，玄机将逐段为您揭示命盘。
        </p>
      </div>
    </div>
  )
}

function SkeletonLines({ count = 3, tone }: { count?: number; tone: string }) {
  return (
    <div className="space-y-2.5 pt-1">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`h-2.5 rounded-full ${tone} animate-pulse`}
          style={{
            width: `${100 - i * 18}%`,
            animationDelay: `${i * 220}ms`,
            animationDuration: "1.4s",
          }}
        />
      ))}
    </div>
  )
}

function SectionCard({
  sec, content, isCurrent, isPending, busy, fullWidth,
}: {
  sec: (typeof READING_SECTIONS)[number]
  content: string
  isCurrent: boolean
  isPending: boolean
  busy: boolean
  fullWidth?: boolean
}) {
  const tone = TONE[sec.tone]
  const showSkeleton = busy && isPending
  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-md border bg-card transition-all ${tone.border} ${
        fullWidth ? "md:col-span-2" : ""
      } ${isPending && !busy ? "opacity-55" : ""} ${
        isCurrent ? "ring-2 ring-accent/40 shadow-[0_20px_40px_-20px_rgba(201,166,120,0.4)]" : ""
      }`}
    >
      <div className={`h-1 w-full ${tone.bar} ${showSkeleton ? "animate-pulse" : ""} ${isPending && !busy ? "opacity-40" : ""}`} />
      <div className="flex items-center justify-between px-5 pt-4">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">{sec.emoji}</span>
          <span className={`rounded-full border px-2.5 py-0.5 font-serif text-xs ${tone.badge}`}>
            {sec.title}
          </span>
        </div>
        {isCurrent && <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />}
      </div>
      <div className="flex-1 px-5 pb-5 pt-3">
        {content ? (
          <div className="whitespace-pre-wrap font-serif text-sm leading-[1.75] text-foreground/90">
            {content}
            {isCurrent && (
              <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-accent align-middle" />
            )}
          </div>
        ) : showSkeleton ? (
          <SkeletonLines tone={`${tone.bar}/20`} count={fullWidth ? 4 : 3} />
        ) : (
          <p className="font-serif text-xs text-muted-foreground">
            {isCurrent ? "玄机正在落笔..." : "（待解读）"}
          </p>
        )}
      </div>
    </article>
  )
}

function SummaryCard({
  content, isCurrent, isPending, busy,
}: { content: string; isCurrent: boolean; isPending: boolean; busy: boolean }) {
  const tone = TONE.highlight
  const showSkeleton = busy && isPending
  return (
    <article
      className={`md:col-span-2 relative overflow-hidden rounded-md border-2 ${tone.border} bg-gradient-to-br from-accent/10 via-transparent to-primary/5 p-6 md:p-7 ${
        isPending && !busy ? "opacity-55" : ""
      } ${isCurrent ? "ring-2 ring-accent/40 shadow-[0_25px_50px_-20px_rgba(201,166,120,0.45)]" : ""}`}
    >
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
      <div className="flex items-center gap-2">
        <span className="text-2xl">✨</span>
        <span className={`rounded-full border px-3 py-0.5 font-serif text-xs uppercase tracking-wider ${tone.badge}`}>
          一句话总结
        </span>
        {isCurrent && <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-accent" />}
      </div>
      <div className="mt-4">
        {content ? (
          <p className="font-serif text-base leading-[1.85] text-foreground md:text-lg">
            {content}
            {isCurrent && (
              <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-accent align-middle" />
            )}
          </p>
        ) : showSkeleton ? (
          <SkeletonLines tone="bg-accent/25" count={2} />
        ) : (
          <p className="font-serif text-sm text-muted-foreground">
            {isCurrent ? "正在落笔..." : "（玄机即将写下总结）"}
          </p>
        )}
      </div>
    </article>
  )
}
