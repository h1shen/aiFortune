"use client"

// 人生走势 K 线图 — ink-style candlestick chart using dayun as periods,
// with a smoothed trend line. Data source: chart.lifeCurve (populated by backend).

import { useEffect, useState } from "react"
import type { Chart } from "@/lib/types"

interface LifeCandle {
  ganzhi: string
  startYear: number
  endYear: number
  startAge: number
  tenGod: string
  state: "past" | "current" | "future"
  open: number
  close: number
  high: number
  low: number
  up: boolean
  score: number
  drivers: string[]
}

export function LifeKLine({ chart }: { chart: Chart }) {
  const series = (chart as any).lifeCurve as LifeCandle[] | undefined
  const [hover, setHover] = useState<number | null>(null)
  const [narrow, setNarrow] = useState(false)
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const narrowMQ = window.matchMedia("(max-width: 768px)")
    const compactMQ = window.matchMedia("(max-width: 1024px)")
    const syncNarrow = () => setNarrow(narrowMQ.matches)
    const syncCompact = () => setCompact(compactMQ.matches)
    syncNarrow()
    syncCompact()
    narrowMQ.addEventListener("change", syncNarrow)
    compactMQ.addEventListener("change", syncCompact)
    return () => {
      narrowMQ.removeEventListener("change", syncNarrow)
      compactMQ.removeEventListener("change", syncCompact)
    }
  }, [])

  if (!series || series.length === 0) return null

  // plot area
  const W = 1344
  const H = compact ? 240 : 320
  const padL = 48
  const padR = 48
  const padT = 28
  const padB = 48
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const n = series.length
  const step = plotW / n
  const yMin = 0
  const yMax = 100
  const y = (v: number) => padT + plotH * (1 - (v - yMin) / (yMax - yMin))
  const xCenter = (i: number) => padL + step * (i + 0.5)
  const candleW = Math.min(36, step * 0.5)

  // MA trend line points (centered close)
  const trendPath = series
    .map((s, i) => {
      const prev = series[i - 1]?.close ?? s.open
      const next = series[i + 1]?.close ?? s.close
      const smoothed = (prev + s.close + next) / 3
      return `${i === 0 ? "M" : "L"} ${xCenter(i).toFixed(1)} ${y(smoothed).toFixed(1)}`
    })
    .join(" ")

  // ref levels
  const levels = [
    { v: 80, label: "鼎盛", color: "oklch(0.22 0.015 50 / 0.2)" },
    { v: 50, label: "平线", color: "oklch(0.22 0.015 50 / 0.3)" },
    { v: 20, label: "低谷", color: "oklch(0.22 0.015 50 / 0.2)" },
  ]

  const curIdx = series.findIndex((s) => s.state === "current")

  // 墨色/朱砂配色 — 阳(up)=朱砂描边空心, 阴(down)=墨色实心 (符合中式传统 & 直觉)
  const RED = "var(--destructive)" // 朱砂
  const INK = "oklch(0.24 0.02 260)" // 深墨青
  const GREY = "oklch(0.65 0.01 70)" // 过去

  return (
    <div className="w-full">
      <div
        style={{
          position: "relative",
          border: "1px solid oklch(0.88 0.015 75 / 0.7)",
          borderRadius: 6,
          background: "var(--card)",
          padding: "28px 28px 22px",
          boxShadow: "0 30px 60px -30px rgba(20,25,45,0.25)",
          overflow: "hidden",
        }}
      >
        {/* 右上角装饰：小印章 */}
        <div
          style={{
            position: "absolute",
            top: 22,
            right: 28,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            className="font-serif"
            style={{
              width: 40,
              height: 40,
              display: "grid",
              placeItems: "center",
              border: "2px solid var(--destructive)",
              color: "var(--destructive)",
              background: "oklch(0.975 0.008 85)",
              fontSize: 14,
              fontWeight: 700,
              transform: "rotate(-6deg)",
              borderRadius: 2,
            }}
          >
            运
          </div>
        </div>

        {/* 标题 */}
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.3em",
              color: "var(--accent)",
              textTransform: "uppercase",
            }}
          >
            Life · K 线
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 14,
              marginTop: 6,
              flexWrap: "wrap",
            }}
          >
            <h3 className="font-serif" style={{ fontSize: 26, fontWeight: 600, margin: 0 }}>
              人生走势
            </h3>
            <span
              className="font-serif"
              style={{ fontSize: 13, color: "var(--muted-foreground)" }}
            >
              以大运为周期 · 蜡烛 = 开合起落 · 影线 = 流年极值 · 墨线 = 运势均值
            </span>
          </div>
        </div>

        {/* 图例 */}
        <div
          style={{
            display: "flex",
            gap: 18,
            fontSize: 11,
            color: "var(--muted-foreground)",
            marginBottom: 4,
            flexWrap: "wrap",
          }}
        >
          <LegendSwatch type="up" color={RED} label="阳线 · 运势上行（收 ≥ 开）" />
          <LegendSwatch type="down" color={INK} label="阴线 · 运势下行（收 < 开）" />
          <LegendSwatch type="line" color="var(--accent)" label="运势均线（三段平滑）" />
          <LegendSwatch type="dot" color="var(--destructive)" label="当前大运" />
        </div>

        {/* 主图 */}
        <div style={{ overflowX: narrow ? "auto" : "visible" }}>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            height={H}
            style={{ display: "block", marginTop: 10, minWidth: narrow ? 720 : undefined }}
          >
            <defs>
              <linearGradient id="klineFade" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.52 0.17 28 / 0.05)" />
                <stop offset="100%" stopColor="oklch(0.24 0.02 260 / 0.02)" />
              </linearGradient>
              <filter id="inkBlur">
                <feGaussianBlur stdDeviation="0.4" />
              </filter>
            </defs>

            {/* background zones */}
            <rect
              x={padL}
              y={padT}
              width={plotW}
              height={plotH * 0.3}
              fill="oklch(0.52 0.17 28 / 0.04)"
            />
            <rect
              x={padL}
              y={padT + plotH * 0.7}
              width={plotW}
              height={plotH * 0.3}
              fill="oklch(0.24 0.02 260 / 0.04)"
            />

            {/* 参考横线 */}
            {levels.map((l) => (
              <g key={l.v}>
                <line
                  x1={padL}
                  x2={W - padR}
                  y1={y(l.v)}
                  y2={y(l.v)}
                  stroke={l.color}
                  strokeWidth={1}
                  strokeDasharray="2 6"
                />
                <text
                  x={padL - 8}
                  y={y(l.v) + 4}
                  fontSize="10"
                  textAnchor="end"
                  fill="oklch(0.48 0.02 60 / 0.7)"
                  className="font-serif"
                >
                  {l.label}
                </text>
              </g>
            ))}

            {/* 当前大运高亮柱 */}
            {curIdx >= 0 && (
              <rect
                x={padL + curIdx * step}
                y={padT}
                width={step}
                height={plotH}
                fill="oklch(0.52 0.17 28 / 0.06)"
              />
            )}

            {/* 候选 hover 高亮 */}
            {hover != null && (
              <rect
                x={padL + hover * step}
                y={padT}
                width={step}
                height={plotH}
                fill="oklch(0.24 0.02 260 / 0.05)"
              />
            )}

            {/* 均线 */}
            <path
              d={trendPath}
              fill="none"
              stroke="oklch(0.72 0.12 75)"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#inkBlur)"
              opacity="0.85"
            />

            {/* 蜡烛 */}
            {series.map((s, i) => {
              const cx = xCenter(i)
              const yH = y(s.high)
              const yL = y(s.low)
              const yO = y(s.open)
              const yC = y(s.close)
              const past = s.state === "past"
              const current = s.state === "current"
              // 颜色：过去灰色；当前朱砂加粗；未来按阴阳
              let strokeC = s.up ? RED : INK
              let fillC = s.up ? "oklch(0.975 0.008 85)" : INK
              if (past) {
                strokeC = GREY
                fillC = s.up ? "oklch(0.975 0.008 85)" : GREY
              }
              const topB = Math.min(yO, yC)
              const hB = Math.max(2, Math.abs(yO - yC))
              return (
                <g
                  key={i}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: "pointer" }}
                >
                  {/* 影线 */}
                  <line
                    x1={cx}
                    x2={cx}
                    y1={yH}
                    y2={yL}
                    stroke={strokeC}
                    strokeWidth={current ? 2 : 1.2}
                  />
                  {/* 实体 */}
                  <rect
                    x={cx - candleW / 2}
                    y={topB}
                    width={candleW}
                    height={hB}
                    fill={fillC}
                    stroke={strokeC}
                    strokeWidth={current ? 2.2 : 1.2}
                  />
                  {/* 当前运环 */}
                  {current && (
                    <circle
                      cx={cx}
                      cy={y((s.open + s.close) / 2)}
                      r={candleW * 0.9}
                      fill="none"
                      stroke="var(--destructive)"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      opacity="0.7"
                    />
                  )}
                  {/* 顶部年份 */}
                  <text
                    x={cx}
                    y={padT - 10}
                    fontSize="9.5"
                    textAnchor="middle"
                    fill={past ? "oklch(0.48 0.02 60 / 0.6)" : "var(--muted-foreground)"}
                    className="font-mono"
                  >
                    {s.startYear}
                  </text>
                  {/* 底部干支 + 十神 */}
                  <text
                    x={cx}
                    y={H - padB + 22}
                    fontSize={current ? 19 : 16}
                    textAnchor="middle"
                    className="font-serif"
                    fontWeight={current ? 700 : 500}
                    fill={past ? "oklch(0.48 0.02 60 / 0.85)" : "var(--foreground)"}
                  >
                    {s.ganzhi}
                  </text>
                  <text
                    x={cx}
                    y={H - padB + 38}
                    fontSize="10"
                    textAnchor="middle"
                    className="font-serif"
                    fill={current ? "var(--destructive)" : "var(--muted-foreground)"}
                  >
                    {s.tenGod} · {s.startAge}岁
                  </text>
                </g>
              )
            })}

            {/* 当前大运垂直虚线 */}
            {curIdx >= 0 && (
              <line
                x1={xCenter(curIdx)}
                x2={xCenter(curIdx)}
                y1={padT}
                y2={H - padB}
                stroke="var(--destructive)"
                strokeWidth={1}
                strokeDasharray="2 4"
                opacity="0.5"
              />
            )}
          </svg>
        </div>

        {/* 详情浮窗 */}
        {hover != null && !narrow && <HoverDetail s={series[hover]} />}

        {/* 脚注统计 */}
        <div
          className="grid grid-cols-2 md:grid-cols-5"
          style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: "1px dashed oklch(0.88 0.015 75)",
            gap: 16,
          }}
        >
          {[
            { l: "峰顶运", v: topAt(series, "high"), desc: "高 " + topValue(series, "high") },
            {
              l: "谷底运",
              v: topAt(series, "low", true),
              desc: "低 " + topValue(series, "low", true),
            },
            { l: "最强上行", v: maxGain(series).ganzhi, desc: `+${maxGain(series).g}` },
            { l: "最大回撤", v: maxDrop(series).ganzhi, desc: `${maxDrop(series).g}` },
            {
              l: "当前",
              v: series[curIdx]?.ganzhi || "—",
              desc: `${series[curIdx]?.tenGod ?? ""} · ${series[curIdx]?.close ?? ""}`,
            },
          ].map((x, i) => (
            <div key={i}>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--muted-foreground)",
                }}
              >
                {x.l}
              </div>
              <div
                className="font-serif"
                style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}
              >
                {x.v}
              </div>
              <div
                className="font-mono"
                style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 2 }}
              >
                {x.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function LegendSwatch({
  type,
  color,
  label,
}: {
  type: "up" | "down" | "line" | "dot"
  color: string
  label: string
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {type === "up" && (
        <svg width="12" height="14">
          <rect
            x="3"
            y="2"
            width="6"
            height="10"
            fill="oklch(0.975 0.008 85)"
            stroke={color}
            strokeWidth="1.2"
          />
          <line x1="6" x2="6" y1="0" y2="14" stroke={color} strokeWidth="1" />
        </svg>
      )}
      {type === "down" && (
        <svg width="12" height="14">
          <rect x="3" y="2" width="6" height="10" fill={color} />
          <line x1="6" x2="6" y1="0" y2="14" stroke={color} strokeWidth="1" />
        </svg>
      )}
      {type === "line" && (
        <svg width="20" height="10">
          <path d="M0 7 Q 5 2 10 5 T 20 4" fill="none" stroke={color} strokeWidth="1.5" />
        </svg>
      )}
      {type === "dot" && (
        <svg width="14" height="14">
          <circle
            cx="7"
            cy="7"
            r="4.5"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
        </svg>
      )}
      <span>{label}</span>
    </div>
  )
}

function HoverDetail({ s }: { s: LifeCandle }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 22,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 22,
        alignItems: "center",
        padding: "8px 16px",
        background: "oklch(0.22 0.015 50)",
        color: "oklch(0.975 0.008 85)",
        borderRadius: 4,
        fontSize: 11,
        boxShadow: "0 10px 30px oklch(0.22 0.015 50 / 0.3)",
        pointerEvents: "none",
        zIndex: 5,
      }}
    >
      <span className="font-serif" style={{ fontSize: 16, fontWeight: 700 }}>
        {s.ganzhi}
      </span>
      <span className="font-mono">
        {s.startYear}–{s.endYear} · {s.startAge}岁起
      </span>
      <span>
        开 <b className="font-mono">{s.open}</b>
      </span>
      <span>
        收{" "}
        <b
          className="font-mono"
          style={{ color: s.up ? "oklch(0.75 0.15 30)" : "oklch(0.85 0.02 80)" }}
        >
          {s.close}
        </b>
      </span>
      <span>
        高 <b className="font-mono">{s.high}</b>
      </span>
      <span>
        低 <b className="font-mono">{s.low}</b>
      </span>
      <span style={{ color: "var(--accent)" }}>{s.tenGod}</span>
    </div>
  )
}

// helpers
function topAt(
  series: LifeCandle[],
  key: "high" | "low" | "open" | "close",
  inverse?: boolean,
): string {
  let best = series[0]
  let bv = series[0][key]
  for (const s of series) {
    if (inverse ? s[key] < bv : s[key] > bv) {
      bv = s[key]
      best = s
    }
  }
  return best.ganzhi
}

function topValue(
  series: LifeCandle[],
  key: "high" | "low" | "open" | "close",
  inverse?: boolean,
): number {
  let bv = series[0][key]
  for (const s of series) {
    if (inverse ? s[key] < bv : s[key] > bv) bv = s[key]
  }
  return bv
}

function maxGain(series: LifeCandle[]): { g: number; ganzhi: string } {
  let best = { g: 0, ganzhi: "—" }
  for (const s of series) {
    const g = s.close - s.open
    if (g > best.g) best = { g, ganzhi: s.ganzhi }
  }
  return best
}

function maxDrop(series: LifeCandle[]): { g: number; ganzhi: string } {
  let best = { g: 0, ganzhi: "—" }
  for (const s of series) {
    const g = s.close - s.open
    if (g < best.g) best = { g, ganzhi: s.ganzhi }
  }
  return best
}
