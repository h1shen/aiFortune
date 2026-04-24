"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { getChart } from "@/lib/api"
import type { Chart } from "@/lib/types"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PillarsCard, FiveElementsCard, DaYunTimeline } from "@/components/chart-display"
import { LaiyiCard, QaChat } from "@/components/ai-reading-panel"
import { ReadingGrid } from "@/components/reading-grid"

function ResultInner() {
  const params = useSearchParams()
  const chartId = params.get("chartId") || ""
  const [chart, setChart] = useState<Chart | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!chartId) { setError("缺少 chartId 参数"); return }
    let cancelled = false
    getChart(chartId)
      .then((c) => { if (!cancelled) setChart(c) })
      .catch((e) => { if (!cancelled) setError(e?.message || "命盘获取失败") })
    return () => { cancelled = true }
  }, [chartId])

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

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-serif text-sm text-muted-foreground transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" /> 返回首页
        </Link>
        <div className="text-right font-serif text-xs text-muted-foreground">
          Chart ID · <span className="text-foreground">{chart.chartId.slice(0, 8)}</span>
        </div>
      </div>

      {/* 命主简报 */}
      <section className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">KeyMind · 命主简报</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-foreground md:text-5xl">
          {chart.name ? <>{chart.name} · </> : null}
          <span className="text-accent">
            {chart.pillars.year.ganzhi} {chart.pillars.month.ganzhi} {chart.pillars.day.ganzhi} {chart.pillars.hour.ganzhi}
          </span>
        </h1>
        <p className="mt-3 font-serif text-sm text-muted-foreground md:text-base">
          {chart.gender === "male" ? "乾造（男）" : "坤造（女）"} · 公元 {chart.solarDate}{" "}
          {chart.inputHour.toString().padStart(2, "0")}:00 · 农历 {chart.lunarDate} · 真太阳时 {chart.trueSolarTime}
        </p>
      </section>

      {/* 四柱 + 来意预测 */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.25fr_1fr]">
        <div className="space-y-6">
          <PillarsCard chart={chart} />
          <FiveElementsCard chart={chart} />
          <DaYunTimeline chart={chart} />
        </div>
        <div className="space-y-6">
          <LaiyiCard chartId={chart.chartId} />
          <QaChat chartId={chart.chartId} />
        </div>
      </div>

      {/* 命盘整体解读 · 全宽 6 段结构化卡片 */}
      <section className="mt-10 md:mt-12">
        <ReadingGrid chartId={chart.chartId} />
      </section>
    </main>
  )
}

export default function ResultPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Suspense fallback={<div className="mx-auto max-w-xl px-4 py-20 text-center font-serif text-muted-foreground">加载中...</div>}>
        <ResultInner />
      </Suspense>
      <SiteFooter />
    </div>
  )
}
