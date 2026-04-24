"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { getChart, streamChat } from "@/lib/api"
import type { Chart } from "@/lib/types"
import { SiteFooter } from "@/components/site-footer"
import { PillarsCard, FiveElementsCard } from "@/components/chart-display"
import { LaiyiCard } from "@/components/ai-reading-panel"
import { QaSheet } from "@/components/qa-sheet"
import { ReadingSummaryCard } from "@/components/reading-summary-card"
import { ReadingSix } from "@/components/reading-six"
import { LifeKLine } from "@/components/life-kline"
import { EasterEggVideo } from "@/components/easter-egg-video"
import { ResultLoadingOverlay } from "@/components/result-loading-overlay"

function ResultInner() {
  const params = useSearchParams()
  const chartId = params.get("chartId") || ""
  const [chart, setChart] = useState<Chart | null>(null)
  const [error, setError] = useState<string | null>(null)

  // reading SSE state — lifted so summary card & six-section share text
  const [readingText, setReadingText] = useState("")
  const [readingBusy, setReadingBusy] = useState(false)

  // QA sheet open state + pending question for 一点即问
  const [sheetOpen, setSheetOpen] = useState(false)
  const [pendingQa, setPendingQa] = useState<{ q: string; nonce: number }>({ q: "", nonce: 0 })
  const openQa = useCallback((question?: string) => {
    setPendingQa((p) => ({ q: question || "", nonce: p.nonce + 1 }))
    setSheetOpen(true)
  }, [])

  // 起卦 loading overlay — 覆盖首屏直到 chart 拉到 + 动画走完
  const [overlayDone, setOverlayDone] = useState(false)
  const handleOverlayDone = useCallback(() => setOverlayDone(true), [])

  useEffect(() => {
    if (!chartId) { setError("缺少 chartId 参数"); return }
    let cancelled = false
    getChart(chartId)
      .then((c) => { if (!cancelled) setChart(c) })
      .catch((e) => { if (!cancelled) setError(e?.message || "命盘获取失败") })
    return () => { cancelled = true }
  }, [chartId])

  // kick off reading SSE as soon as we have a chart
  useEffect(() => {
    if (!chart?.chartId) return
    setReadingText("")
    setReadingBusy(true)
    const ctl = streamChat(
      { chartId: chart.chartId, mode: "reading" },
      (d) => setReadingText((s) => s + d),
      () => setReadingBusy(false),
      (err) => {
        setReadingText((s) => s + `\n[错误: ${err}]`)
        setReadingBusy(false)
      },
    )
    return () => ctl.abort()
  }, [chart?.chartId])

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

  if (!chart || !overlayDone) {
    return (
      <ResultLoadingOverlay
        chartReady={!!chart}
        onDone={handleOverlayDone}
      />
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
          className="relative flex items-center gap-4 px-6 py-6 md:px-12"
          style={{ zIndex: 2 }}
        >
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
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1.4fr_1fr] lg:gap-x-8 lg:gap-y-7 [&>*]:h-full">
          <PillarsCard chart={chart} />
          <LaiyiCard
            chartId={chart.chartId}
            onOpenChat={openQa}
          />
          <FiveElementsCard chart={chart} />
          <ReadingSummaryCard readingText={readingText} busy={readingBusy} />
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
          chartId={chart.chartId}
          readingText={readingText}
          busy={readingBusy}
        />
      </section>

      {/* =========================================================
          5. 彩蛋 · 隐藏影片
         ========================================================= */}
      <EasterEggVideo />

      <QaSheet
        chartId={chart.chartId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        initial={pendingQa}
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
