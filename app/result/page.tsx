"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { loadChartFromStorage, loadLatestChartId, streamChat } from "@/lib/api"
import type { Chart } from "@/lib/types"
import { SiteFooter } from "@/components/site-footer"
import { PillarsCard, FiveElementsCard } from "@/components/chart-display"
import { LaiyiCard } from "@/components/ai-reading-panel"
import { QaSheet } from "@/components/qa-sheet"
import { ReadingSummaryCard } from "@/components/reading-summary-card"
import { ReadingSix } from "@/components/reading-six"
import { LifeKLine } from "@/components/life-kline"

function ResultInner() {
  const router = useRouter()
  const params = useSearchParams()
  const chartId = params.get("chartId") || ""
  const [chart, setChart] = useState<Chart | null>(null)
  const [error, setError] = useState<string | null>(null)

  // reading SSE state — lifted so summary card & six-section share text
  const [readingText, setReadingText] = useState("")
  const [readingBusy, setReadingBusy] = useState(false)

  // QA sheet open state (driven by LaiyiCard's「追问玄机」button)
  const [sheetOpen, setSheetOpen] = useState(false)

  // 从 localStorage 读命盘（无后端持久化）
  useEffect(() => {
    if (!chartId) {
      // 没带 chartId：有最近一次就跳过去，否则回首页
      const latest = loadLatestChartId()
      if (latest) router.replace(`/result?chartId=${latest}`)
      else setError("缺少 chartId 参数；请从首页开始排盘")
      return
    }
    const c = loadChartFromStorage(chartId)
    if (!c) {
      setError("本地未找到该命盘（换浏览器 / 清过缓存 / chartId 错误），请从首页重新排盘")
      return
    }
    setChart(c)
  }, [chartId, router])

  // 拿到 chart 后自动拉 reading
  useEffect(() => {
    if (!chart?.chartId) return
    setReadingText("")
    setReadingBusy(true)
    const ctl = streamChat(
      { chart, mode: "reading" },
      (d) => setReadingText((s) => s + d),
      () => setReadingBusy(false),
      (err) => {
        setReadingText((s) => s + `\n[错误: ${err}]`)
        setReadingBusy(false)
      },
    )
    return () => ctl.abort()
  }, [chart])

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="font-serif text-lg text-destructive">{error}</p>
        <Link href="/" className="mt-6 inline-block font-serif text-sm text-accent underline">
          返回首页重新排盘
        </Link>
      </div>
    )
  }

  if (!chart) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center px-4">
        <div className="flex items-center gap-3 font-serif text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> 正在读取您的命盘...
        </div>
      </div>
    )
  }

  const pillarsStr = [
    chart.pillars.year.ganzhi,
    chart.pillars.month.ganzhi,
    chart.pillars.day.ganzhi,
    chart.pillars.hour.ganzhi,
  ].join("　") // 全角空格
  const hourStr = chart.inputHour.toString().padStart(2, "0")
  const zaoStr = chart.gender === "male" ? "乾造" : "坤造"
  const genderCn = chart.gender === "male" ? "男" : "女"
  const dayMasterLabel = `${chart.dayMaster.stem}${chart.dayMaster.element}`

  return (
    <main className="mx-auto w-full max-w-[1440px]">
      {/* =========================================================
          1. HERO · 水墨山水 full-bleed
         ========================================================= */}
      <section
        className="relative overflow-hidden"
        style={{
          minHeight: 560,
          paddingBottom: 60,
          backgroundImage:
            "linear-gradient(to bottom, oklch(0.975 0.008 85 / 0) 0%, oklch(0.975 0.008 85 / 0.35) 70%, oklch(0.975 0.008 85) 100%), url('/ink-mountains.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
        }}
      >
        {/* 左→透明 overlay 让左侧文字可读 */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, oklch(0.975 0.008 85 / 0.85) 0%, oklch(0.975 0.008 85 / 0.2) 45%, transparent 75%)",
          }}
        />

        {/* 极简顶栏 */}
        <div
          className="relative flex items-center gap-5 px-6 py-6 md:gap-20 md:px-12"
          style={{ zIndex: 2 }}
        >
          <span className="font-serif text-lg font-semibold">玄机阁</span>
          <span className="text-[10px] tracking-[0.25em] text-muted-foreground">
            KEYMIND
          </span>
          <div className="flex-1" />
          <Link
            href="/"
            className="font-serif inline-flex items-center rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-xs text-foreground backdrop-blur-sm transition-colors hover:border-accent/50"
          >
            ← 返回首页
          </Link>
        </div>

        {/* 命主卡 */}
        <div
          className="relative px-6 py-6 md:px-12 md:py-9"
          style={{ zIndex: 2, maxWidth: 680 }}
        >
          <div className="text-[11px] uppercase tracking-[0.35em] text-accent">
            命 主 · {dayMasterLabel} 日 元
          </div>
          <h1
            className="font-serif my-4 text-[40px] font-semibold leading-[1.08] md:my-5 lg:text-[56px]"
            style={{ textShadow: "0 2px 20px oklch(0.975 0.008 85 / 0.6)" }}
          >
            {chart.name || "—"}
          </h1>
          <div className="font-serif text-[20px] tracking-[0.1em] text-foreground md:text-[28px]">
            {pillarsStr}
          </div>
          <div
            className="font-serif mt-4 text-[13px] leading-[1.8]"
            style={{ color: "oklch(0.22 0.015 50 / 0.8)" }}
          >
            {zaoStr}（{genderCn}） · 公元 {chart.solarDate} {hourStr}:00
            <br />
            农历 {chart.lunarDate} · 真太阳时 {chart.trueSolarTime} · {chart.geju}
          </div>
        </div>
      </section>

      {/* =========================================================
          2. 人生走势 K 线
         ========================================================= */}
      <section
        className="px-6 pb-10 pt-14 md:px-12"
        style={{
          background:
            "linear-gradient(to bottom, var(--background), oklch(0.96 0.012 82) 40%, var(--background))",
        }}
      >
        <LifeKLine chart={chart} />
      </section>

      {/* =========================================================
          3. 两栏主体 · 四柱 / 五行 / 来意 / 玄机一签
         ========================================================= */}
      <section className="px-6 py-14 md:px-18 md:py-20 lg:px-18">
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1.4fr_1fr] lg:gap-8">
          <div className="flex flex-col gap-7">
            <PillarsCard chart={chart} />
            <FiveElementsCard chart={chart} />
          </div>
          <div className="flex flex-col gap-7">
            <LaiyiCard
              chart={chart}
              onOpenChat={() => setSheetOpen(true)}
            />
            <ReadingSummaryCard readingText={readingText} busy={readingBusy} />
          </div>
        </div>
      </section>

      {/* =========================================================
          4. 一命六签
         ========================================================= */}
      <section
        className="px-6 pb-32 pt-14 md:px-18"
        style={{
          background:
            "linear-gradient(to bottom, transparent, oklch(0.96 0.012 82) 10%, oklch(0.96 0.012 82) 90%, transparent)",
          borderTop: "1px solid oklch(0.88 0.015 75 / 0.5)",
        }}
      >
        <div className="mb-9">
          <div className="text-[11px] uppercase tracking-[0.3em] text-accent">
            Reading · 命盘整解
          </div>
          <h2 className="font-serif mt-2.5 text-4xl font-semibold">一命六签</h2>
          <div className="font-serif mt-1.5 text-[13px] text-muted-foreground">
            侧边点索 · 任意一段可「再抽一签」换角度再落笔
          </div>
        </div>
        <ReadingSix
          chart={chart}
          readingText={readingText}
          busy={readingBusy}
        />
      </section>

      <QaSheet
        chart={chart}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </main>
  )
}

export default function ResultPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense
        fallback={
          <div className="mx-auto max-w-xl px-4 py-20 text-center font-serif text-muted-foreground">
            加载中...
          </div>
        }
      >
        <ResultInner />
      </Suspense>
      <SiteFooter />
    </div>
  )
}
