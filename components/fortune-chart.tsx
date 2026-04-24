"use client"

import { useMemo } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { Chart } from "@/lib/types"

const ACCENT = "#c9a678"    // 金 · 烫金
const ACCENT_BRIGHT = "#e0bf87"
const RED = "#b84545"       // 火 · 朱砂
const RED_DEEP = "#8a2828"
const INK = "#2b2d38"
const MUTED = "#a0a3ad"

/** 把原始分数做视觉夸张（保留符号）：|s|^1.25 × 1.1 */
function dramatize(s: number): number {
  return Math.sign(s) * Math.pow(Math.abs(s), 1.25) * 1.1
}

export function FortuneChart({ chart }: { chart: Chart }) {
  const points = useMemo(() => {
    return (chart.liunianScores || []).map((p) => ({
      ...p,
      display: dramatize(p.score),
    }))
  }, [chart.liunianScores])

  if (!points.length) return null

  const currentYear = chart.currentYear
  const currentPoint = points.find((p) => p.year === currentYear) ?? null

  // 找到全生命最吉/最凶的年份做为剧情点
  const peak = points.reduce((a, b) => (b.score > a.score ? b : a), points[0])
  const trough = points.reduce((a, b) => (b.score < a.score ? b : a), points[0])

  // Y 域：基于数据，留 15% 空间给标签
  const allDisplay = points.map((p) => p.display)
  const yMax = Math.max(...allDisplay)
  const yMin = Math.min(...allDisplay)
  const yPad = Math.max(1.5, (yMax - yMin) * 0.15)
  const yDomain: [number, number] = [yMin - yPad, yMax + yPad]

  const xMin = points[0].year
  const xMax = points[points.length - 1].year
  // 每 10 年一条参考线 + 大运起运年也画一条
  const dayunBoundaries = chart.dayun.map((d) => d.startYear)

  return (
    <div className="rounded-md border border-border bg-card p-6 shadow-[0_20px_50px_-25px_rgba(20,25,45,0.25)] md:p-8">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Life Fortune</p>
          <h3 className="mt-1 font-serif text-xl font-semibold text-foreground md:text-2xl">
            人生运势折线
          </h3>
          <p className="mt-1 font-serif text-xs text-muted-foreground">
            {xMin} – {xMax} · 80 流年 · 基于大运 × 流年干支 × 冲合原局打分
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] font-serif">
          <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-accent">
            ▲ 巅峰 {peak.year} {peak.ganzhi}（{peak.score > 0 ? "+" : ""}{peak.score.toFixed(1)}）
          </span>
          <span className="rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-destructive">
            ▼ 低谷 {trough.year} {trough.ganzhi}（{trough.score.toFixed(1)}）
          </span>
          {currentPoint && (
            <span className="rounded-full border border-foreground/30 bg-foreground/5 px-3 py-1 text-foreground">
              ● 此刻 {currentPoint.year} {currentPoint.ganzhi}（{currentPoint.score > 0 ? "+" : ""}{currentPoint.score.toFixed(1)}）
            </span>
          )}
        </div>
      </div>

      <div className="h-[280px] w-full md:h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 24, right: 24, left: 0, bottom: 8 }}>
            <defs>
              <linearGradient id="posArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ACCENT_BRIGHT} stopOpacity={0.65} />
                <stop offset="60%" stopColor={ACCENT} stopOpacity={0.3} />
                <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="negArea" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor={RED_DEEP} stopOpacity={0.55} />
                <stop offset="60%" stopColor={RED} stopOpacity={0.25} />
                <stop offset="100%" stopColor={RED} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={ACCENT} />
                <stop offset="100%" stopColor={ACCENT_BRIGHT} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke={MUTED} strokeDasharray="3 3" opacity={0.18} vertical={false} />

            <XAxis
              dataKey="year"
              type="number"
              domain={[xMin, xMax]}
              ticks={dayunBoundaries}
              tickFormatter={(v) => String(v)}
              tick={{ fill: MUTED, fontSize: 10 }}
              stroke={MUTED}
              tickMargin={8}
            />
            <YAxis
              domain={yDomain}
              ticks={[-6, -3, 0, 3, 6]}
              tick={{ fill: MUTED, fontSize: 10 }}
              stroke={MUTED}
              width={28}
            />

            <ReferenceLine y={0} stroke={INK} strokeDasharray="4 4" opacity={0.35} />

            {/* 大运分界线 */}
            {dayunBoundaries.slice(1).map((y) => (
              <ReferenceLine
                key={y}
                x={y}
                stroke={MUTED}
                strokeDasharray="2 6"
                opacity={0.35}
              />
            ))}

            {/* 当前年 */}
            {currentPoint && (
              <ReferenceLine
                x={currentYear}
                stroke={ACCENT}
                strokeWidth={1.5}
                strokeDasharray="3 3"
                opacity={0.7}
                label={{ value: "此刻", position: "insideTopRight", fill: ACCENT, fontSize: 11, fontFamily: "Noto Serif SC, serif" }}
              />
            )}

            <Tooltip
              cursor={{ stroke: ACCENT, strokeDasharray: "3 3" }}
              contentStyle={{
                background: "rgba(255,250,240,0.97)",
                border: "1px solid rgba(201,166,120,0.5)",
                borderRadius: 6,
                fontFamily: "Noto Serif SC, serif",
                fontSize: 12,
                padding: "8px 12px",
              }}
              formatter={(_v, _n, item: any) => {
                const p = item.payload
                const s = p.score as number
                const tag = s > 1.5 ? "顺" : s < -1.5 ? "阻" : "平"
                return [`${p.ganzhi} · ${p.tenGod} · ${tag}（${s > 0 ? "+" : ""}${s.toFixed(1)}）`, `${p.year} 年`]
              }}
              labelFormatter={() => ""}
            />

            {/* 正向区域：display > 0（不进 Tooltip，避免重复行） */}
            <Area
              type="natural"
              dataKey={(p: any) => (p.display > 0 ? p.display : 0)}
              stroke="none"
              fill="url(#posArea)"
              tooltipType="none"
              isAnimationActive
              animationDuration={1200}
            />
            {/* 负向区域：display < 0（不进 Tooltip） */}
            <Area
              type="natural"
              dataKey={(p: any) => (p.display < 0 ? p.display : 0)}
              stroke="none"
              fill="url(#negArea)"
              tooltipType="none"
              isAnimationActive
              animationDuration={1200}
            />
            {/* 主折线 */}
            <Area
              type="natural"
              dataKey="display"
              stroke="url(#lineStroke)"
              strokeWidth={2.5}
              fill="transparent"
              dot={false}
              activeDot={{ r: 6, fill: ACCENT, stroke: "white", strokeWidth: 2 }}
              isAnimationActive
              animationDuration={1600}
            />

            {/* 巅峰 / 低谷 / 此刻 三个剧情锚点 */}
            <ReferenceDot x={peak.year} y={peak.display} r={6} fill={ACCENT} stroke="white" strokeWidth={2} isFront>
              <g></g>
            </ReferenceDot>
            <ReferenceDot x={trough.year} y={trough.display} r={6} fill={RED} stroke="white" strokeWidth={2} isFront>
              <g></g>
            </ReferenceDot>
            {currentPoint && (
              <ReferenceDot x={currentPoint.year} y={currentPoint.display} r={8} fill={ACCENT} stroke="white" strokeWidth={2.5} isFront />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 大运分段标签（显示在 x 轴下方，与分界线对齐） */}
      <div
        className="mt-2 grid gap-1"
        style={{ gridTemplateColumns: `repeat(${chart.dayun.length}, minmax(0,1fr))` }}
      >
        {chart.dayun.map((dy) => {
          const isCurrent = chart.currentDayun && dy.startYear === chart.currentDayun.startYear
          return (
            <div
              key={dy.startYear}
              className={`border-t pt-2 text-center font-serif text-[10px] ${
                isCurrent ? "border-accent text-accent" : "border-border/40 text-muted-foreground"
              }`}
            >
              <div className={`font-semibold ${isCurrent ? "text-accent" : "text-foreground"}`}>{dy.ganzhi}</div>
              <div className="mt-0.5">{dy.tenGod} · {dy.startAge}岁</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
