"use client"

// 一生运势走向 · LIFE JOURNEY · 人生十运
// 每十年一段 · 路高则顺、路低则难 · 红圈为当下

import { useEffect, useState } from "react"
import type { Chart, LifeCandle } from "@/lib/types"

const TEN_GOD_PLAIN: Record<string, string> = {
  正财: "稳定的收入与回报",
  偏财: "意外之财与机遇",
  正官: "名声与责任加身",
  七杀: "压力大，磨练心志",
  正印: "贵人庇佑，学业有成",
  偏印: "得长辈照拂，思虑较多",
  比肩: "朋友多，但易分财",
  劫财: "防被人借财、合伙",
  食神: "享受生活，子女缘厚",
  伤官: "才华外显，口舌是非",
}

type Tier = "up" | "mid" | "down"
interface Segment extends LifeCandle {
  tier: Tier
  tierLabel: string
  tierDesc: string
  tenGodPlain: string
}

const UP = "oklch(0.5 0.16 145)" // 深绿
const MID = "oklch(0.6 0.05 75)" // 米
const DOWN = "var(--destructive)" // 朱砂

function tierOf(score: number): { tier: Tier; tierLabel: string; tierDesc: string } {
  if (score >= 62) return { tier: "up", tierLabel: "顺境", tierDesc: "事顺人和" }
  if (score >= 38) return { tier: "mid", tierLabel: "平稳", tierDesc: "不疾不徐" }
  return { tier: "down", tierLabel: "逆境", tierDesc: "宜守不宜攻" }
}

function tierColor(t: Tier) {
  return t === "up" ? UP : t === "down" ? DOWN : MID
}

export function LifeKLine({ chart }: { chart: Chart }) {
  const raw = (chart.lifeCurve || []) as LifeCandle[]
  const series: Segment[] = raw.map((s) => {
    const t = tierOf(s.score)
    return { ...s, ...t, tenGodPlain: TEN_GOD_PLAIN[s.tenGod] ?? "" }
  })
  const [hover, setHover] = useState<number | null>(null)
  const [narrow, setNarrow] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const mq = window.matchMedia("(max-width: 1024px)")
    const sync = () => setNarrow(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  if (series.length === 0) return null

  // 布局：viewBox 与设计稿一致（1344 × 340），下方留 120 给三行文字
  const W = 1344
  const H = 340
  const padL = 56,
    padR = 56,
    padT = 40,
    padB = 120
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const n = series.length
  const step = plotW / n
  const yMin = 0,
    yMax = 100
  const y = (v: number) => padT + plotH * (1 - (v - yMin) / (yMax - yMin))
  const xCenter = (i: number) => padL + step * (i + 0.5)

  // 定位当前段：优先 state=current，其次按 currentYear 落段，再其次按 currentDayun.ganzhi 匹配
  let curIdx = series.findIndex((s) => s.state === "current")
  if (curIdx < 0 && chart.currentYear) {
    curIdx = series.findIndex(
      (s) =>
        s.startYear != null &&
        s.endYear != null &&
        chart.currentYear >= s.startYear &&
        chart.currentYear <= s.endYear,
    )
  }
  if (curIdx < 0 && chart.currentDayun) {
    curIdx = series.findIndex((s) => s.ganzhi === chart.currentDayun!.ganzhi)
  }

  // 当 curIdx 仍 < 0：判断是未起运还是已过大运，供文案/图例使用
  const firstStart = series[0]?.startYear ?? null
  const lastEnd = series[series.length - 1]?.endYear ?? null
  const preRun =
    curIdx < 0 && firstStart != null && chart.currentYear && chart.currentYear < firstStart
  const postRun =
    curIdx < 0 && lastEnd != null && chart.currentYear && chart.currentYear > lastEnd
  const curStatusLabel = preRun ? "尚未起运" : postRun ? "已过大运" : "—"
  const curStatusTip = preRun
    ? `${firstStart} 年起第一步大运`
    : postRun
      ? "颐养天年 · 静守福泽"
      : ""

  const pts: [number, number][] = series.map((s, i) => [xCenter(i), y(s.score)])
  const smoothPath = buildSmoothPath(pts)
  const areaPath =
    smoothPath +
    ` L ${pts[pts.length - 1][0]} ${y(yMin)} L ${pts[0][0]} ${y(yMin)} Z`

  const cur = curIdx >= 0 ? series[curIdx] : null
  const focus = hover != null ? series[hover] : cur
  const isCurrentFocus = hover == null || hover === curIdx

  const peak = topAt(series, "score")
  const trough = topAt(series, "score", true)

  return (
    <div
      style={{
        position: "relative",
        border: "1px solid oklch(0.88 0.015 75 / 0.7)",
        borderRadius: 6,
        background: "var(--card)",
        padding: "32px 32px 26px",
        boxShadow: "0 30px 60px -30px rgba(20,25,45,0.25)",
        overflow: "hidden",
      }}
    >
      {/* 标题区 */}
      <div style={{ marginBottom: 10 }}>
        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.3em",
            color: "var(--accent)",
            textTransform: "uppercase",
          }}
        >
          Life Journey · 人生十运
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 16,
            marginTop: 8,
            flexWrap: "wrap",
          }}
        >
          <h3 className="font-serif" style={{ fontSize: 30, fontWeight: 600, margin: 0 }}>
            一生运势走向
          </h3>
          <span
            className="font-serif"
            style={{ fontSize: 16, color: "var(--muted-foreground)" }}
          >
            每十年一段 · 路高则顺、路低则难 · 红圈为当下
          </span>
        </div>
      </div>

      {/* 图例 */}
      <div
        style={{
          display: "flex",
          gap: 24,
          fontSize: 14,
          marginTop: 14,
          marginBottom: 8,
          color: "var(--foreground)",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <LegendBlock color={UP} dot label="顺境" sub="事顺人和" />
        <LegendBlock color={MID} dot label="平稳" sub="不疾不徐" />
        <LegendBlock color={DOWN} dot label="逆境" sub="宜守不宜攻" />
        <div style={{ flex: 1 }} />
        <LegendBlock
          ring
          color={DOWN}
          label="你在这里"
          sub={cur?.ganzhi ?? curStatusLabel}
        />
      </div>

      {/* 主图 */}
      <div style={{ overflowX: narrow ? "auto" : "visible" }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height={H}
          style={{
            display: "block",
            marginTop: 6,
            overflow: "visible",
            minWidth: narrow ? 900 : undefined,
            height: H,
          }}
        >
          <defs>
            <linearGradient id="lifeFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.72 0.12 75 / 0.28)" />
              <stop offset="100%" stopColor="oklch(0.72 0.12 75 / 0.02)" />
            </linearGradient>
          </defs>

          {/* 顺/平/逆 横向彩色区带 */}
          <rect
            x={padL}
            y={y(yMax)}
            width={plotW}
            height={y(62) - y(yMax)}
            fill="oklch(0.55 0.12 140 / 0.14)"
          />
          <rect
            x={padL}
            y={y(62)}
            width={plotW}
            height={y(38) - y(62)}
            fill="oklch(0.88 0.02 80 / 0.35)"
          />
          <rect
            x={padL}
            y={y(38)}
            width={plotW}
            height={y(yMin) - y(38)}
            fill="oklch(0.52 0.17 28 / 0.12)"
          />

          {/* 区带分隔线 */}
          <line
            x1={padL}
            x2={W - padR}
            y1={y(62)}
            y2={y(62)}
            stroke="oklch(0.55 0.12 140 / 0.5)"
            strokeWidth={1.2}
          />
          <line
            x1={padL}
            x2={W - padR}
            y1={y(38)}
            y2={y(38)}
            stroke="oklch(0.52 0.17 28 / 0.5)"
            strokeWidth={1.2}
          />

          {/* 右侧分区标签 */}
          <g>
            <text
              x={W - padR + 12}
              y={y((100 + 62) / 2) + 5}
              fontSize="16"
              textAnchor="start"
              fill="oklch(0.45 0.14 140)"
              className="font-serif"
              fontWeight={700}
            >
              顺境
            </text>
            <text
              x={W - padR + 12}
              y={y(50) + 5}
              fontSize="14"
              textAnchor="start"
              fill="oklch(0.45 0.02 60)"
              className="font-serif"
              fontWeight={600}
            >
              平稳
            </text>
            <text
              x={W - padR + 12}
              y={y((38 + 0) / 2) + 5}
              fontSize="16"
              textAnchor="start"
              fill="var(--destructive)"
              className="font-serif"
              fontWeight={700}
            >
              逆境
            </text>
          </g>

          {/* 当前段高亮柱 */}
          {curIdx >= 0 && (
            <rect
              x={padL + curIdx * step}
              y={padT}
              width={step}
              height={plotH}
              fill="oklch(0.52 0.17 28 / 0.07)"
              rx="4"
            />
          )}

          {/* hover 段高亮 */}
          {hover != null && hover !== curIdx && (
            <rect
              x={padL + hover * step}
              y={padT}
              width={step}
              height={plotH}
              fill="oklch(0.24 0.02 260 / 0.05)"
              rx="4"
            />
          )}

          {/* 面积 + 主线 */}
          <path d={areaPath} fill="url(#lifeFill)" />
          <path
            d={smoothPath}
            fill="none"
            stroke="oklch(0.28 0.03 260)"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 节点 + 下方信息 */}
          {series.map((s, i) => {
            const cx = xCenter(i)
            const cy = y(s.score)
            const past = s.state === "past"
            const current = s.state === "current"
            const col = tierColor(s.tier)
            const r = current ? 14 : 10
            const startAge = s.startAge ?? 0
            const startYear = s.startYear ?? ""
            const endYear = s.endYear ?? ""

            return (
              <g
                key={i}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer" }}
              >
                {/* 当前光晕（脉冲虚线环） */}
                {current && (
                  <>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r + 12}
                      fill="none"
                      stroke="var(--destructive)"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      opacity={0.55}
                    >
                      <animate
                        attributeName="r"
                        values={`${r + 10};${r + 16};${r + 10}`}
                        dur="2.4s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.55;0.2;0.55"
                        dur="2.4s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r + 5}
                      fill="var(--destructive)"
                      opacity={0.15}
                    />
                  </>
                )}

                {/* 主圆 */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={past ? "var(--card)" : col}
                  stroke={past ? "oklch(0.7 0.01 70)" : current ? "var(--destructive)" : col}
                  strokeWidth={current ? 3 : 2}
                  opacity={past ? 0.85 : 1}
                />
                {!past && (
                  <circle cx={cx} cy={cy} r={current ? 5 : 3.5} fill="var(--card)" />
                )}

                {/* 节点下方：年龄（大） / 年份（mono） / 干支 · 十神 */}
                <text
                  x={cx}
                  y={H - padB + 34}
                  fontSize={current ? 26 : 22}
                  textAnchor="middle"
                  className="font-serif"
                  fontWeight={current ? 700 : 600}
                  fill={past ? "oklch(0.5 0.02 60)" : "var(--foreground)"}
                >
                  {startAge}–{startAge + 9}岁
                </text>
                <text
                  x={cx}
                  y={H - padB + 54}
                  fontSize="13"
                  textAnchor="middle"
                  className="font-mono"
                  fill="var(--muted-foreground)"
                >
                  {startYear}–{endYear}
                </text>
                <text
                  x={cx}
                  y={H - padB + 76}
                  fontSize={current ? 18 : 16}
                  textAnchor="middle"
                  className="font-serif"
                  fontWeight={current ? 700 : 500}
                  fill={current ? "var(--destructive)" : "var(--foreground)"}
                >
                  {s.ganzhi} · {s.tenGod}
                </text>

                {/* 透明点击区 */}
                <rect
                  x={padL + i * step}
                  y={padT}
                  width={step}
                  height={plotH + 90}
                  fill="transparent"
                />
              </g>
            )
          })}

          {/* 节点到下方文字的虚线 */}
          {series.map((s, i) => (
            <line
              key={`gx-${i}`}
              x1={xCenter(i)}
              x2={xCenter(i)}
              y1={y(s.score) + (s.state === "current" ? 26 : 12)}
              y2={H - padB + 12}
              stroke="oklch(0.6 0.02 70 / 0.25)"
              strokeWidth={1}
              strokeDasharray="2 4"
            />
          ))}
        </svg>
      </div>

      {/* 当前段 / hover 详情面板 */}
      {focus && <DetailPanel s={focus} isCurrent={isCurrentFocus} />}

      {/* 底部三栏关键提示 */}
      <div
        style={{
          marginTop: 18,
          paddingTop: 18,
          borderTop: "1px dashed oklch(0.88 0.015 75)",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 18,
        }}
      >
        <Highlight
          label="一生最旺"
          ganzhi={peak.ganzhi}
          age={`${peak.startAge ?? 0}–${(peak.startAge ?? 0) + 9}岁`}
          tip="黄金十年 · 全力以赴"
          color={UP}
        />
        <Highlight
          label="当前所在"
          ganzhi={cur?.ganzhi || curStatusLabel}
          age={cur ? `${cur.startAge ?? 0}–${(cur.startAge ?? 0) + 9}岁` : ""}
          tip={
            cur
              ? `${cur.tierLabel} · ${cur.tenGodPlain || cur.tierDesc}`
              : curStatusTip
          }
          color={DOWN}
          current
        />
        <Highlight
          label="需要留意"
          ganzhi={trough.ganzhi}
          age={`${trough.startAge ?? 0}–${(trough.startAge ?? 0) + 9}岁`}
          tip="低谷十年 · 稳字当头"
          color={DOWN}
        />
      </div>
    </div>
  )
}

// ============ 子组件 ============

function LegendBlock({
  color,
  label,
  sub,
  dot,
  ring,
}: {
  color: string
  label: string
  sub?: string
  dot?: boolean
  ring?: boolean
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {dot && (
        <span
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: color,
            display: "inline-block",
            boxShadow: `0 0 0 3px ${color}22`,
          }}
        />
      )}
      {ring && (
        <svg width="22" height="22">
          <circle cx="11" cy="11" r="6" fill={color} />
          <circle
            cx="11"
            cy="11"
            r="9"
            fill="none"
            stroke={color}
            strokeWidth="1.2"
            strokeDasharray="2 2"
          />
        </svg>
      )}
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
        <span className="font-serif" style={{ fontSize: 15, fontWeight: 600 }}>
          {label}
        </span>
        {sub && (
          <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{sub}</span>
        )}
      </div>
    </div>
  )
}

function DetailPanel({ s, isCurrent }: { s: Segment; isCurrent: boolean }) {
  const col =
    s.tier === "up"
      ? "oklch(0.55 0.12 140)"
      : s.tier === "down"
        ? "var(--destructive)"
        : "oklch(0.55 0.04 75)"
  const startAge = s.startAge ?? 0
  return (
    <div
      style={{
        marginTop: 14,
        padding: "16px 20px",
        background: "oklch(0.97 0.012 82)",
        borderLeft: `4px solid ${col}`,
        borderRadius: 4,
        display: "flex",
        alignItems: "center",
        gap: 22,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", minWidth: 110 }}>
        <span
          style={{
            fontSize: 12,
            letterSpacing: "0.2em",
            color: "var(--muted-foreground)",
            textTransform: "uppercase",
          }}
        >
          {isCurrent ? "当前大运" : "此段大运"}
        </span>
        <span
          className="font-serif"
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "var(--foreground)",
            marginTop: 2,
          }}
        >
          {s.ganzhi}
        </span>
      </div>
      <div style={{ width: 1, height: 42, background: "oklch(0.88 0.015 75)" }} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>年龄 · 年份</span>
        <span
          className="font-serif"
          style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}
        >
          {startAge}–{startAge + 9}岁 · {s.startYear ?? ""}–{s.endYear ?? ""}
        </span>
      </div>
      <div style={{ width: 1, height: 42, background: "oklch(0.88 0.015 75)" }} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>运势</span>
        <span
          className="font-serif"
          style={{ fontSize: 18, fontWeight: 700, color: col, marginTop: 2 }}
        >
          {s.tierLabel} · {s.tierDesc}
        </span>
      </div>
      <div style={{ width: 1, height: 42, background: "oklch(0.88 0.015 75)" }} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 240,
        }}
      >
        <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
          此段主题 · {s.tenGod}
        </span>
        <span
          className="font-serif"
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: "var(--foreground)",
            marginTop: 2,
            lineHeight: 1.5,
          }}
        >
          {s.tenGodPlain || s.tierDesc}
        </span>
      </div>
    </div>
  )
}

function Highlight({
  label,
  ganzhi,
  age,
  tip,
  color,
  current,
}: {
  label: string
  ganzhi: string
  age: string
  tip: string
  color: string
  current?: boolean
}) {
  return (
    <div
      style={{
        padding: "14px 16px",
        background: current ? "oklch(0.52 0.17 28 / 0.06)" : "oklch(0.97 0.012 82 / 0.7)",
        border: current ? `1.5px solid ${color}55` : "1px solid oklch(0.88 0.015 75)",
        borderRadius: 6,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: color,
            display: "inline-block",
          }}
        />
        <span
          style={{
            fontSize: 13,
            letterSpacing: "0.15em",
            color: "var(--muted-foreground)",
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 8 }}>
        <span className="font-serif" style={{ fontSize: 22, fontWeight: 700 }}>
          {ganzhi}
        </span>
        <span
          className="font-mono"
          style={{ fontSize: 13, color: "var(--muted-foreground)" }}
        >
          {age}
        </span>
      </div>
      <div
        className="font-serif"
        style={{
          fontSize: 14,
          color: "var(--foreground)",
          marginTop: 4,
          lineHeight: 1.5,
        }}
      >
        {tip}
      </div>
    </div>
  )
}

// ============ helpers ============

function buildSmoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return ""
  let d = `M ${pts[0][0]} ${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || pts[i + 1]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0]} ${p2[1]}`
  }
  return d
}

function topAt(series: Segment[], key: "score", inverse?: boolean): Segment {
  let best = series[0]
  for (const s of series) {
    if (inverse ? s[key] < best[key] : s[key] > best[key]) best = s
  }
  return best
}
