"use client"

import type { Chart } from "@/lib/types"

const ELEMENT_COLOR: Record<string, string> = {
  金: "text-accent",
  木: "text-chart-4",
  水: "text-chart-1",
  火: "text-destructive",
  土: "text-chart-3",
}

const ELEMENT_BAR: Record<string, string> = {
  金: "bg-accent",
  木: "bg-chart-4",
  水: "bg-chart-1",
  火: "bg-destructive",
  土: "bg-chart-3",
}

export function PillarsCard({ chart }: { chart: Chart }) {
  const order: ("year" | "month" | "day" | "hour")[] = ["year", "month", "day", "hour"]
  const labels: Record<string, { zh: string; sub: string }> = {
    year: { zh: "年柱", sub: "祖业·童年" },
    month: { zh: "月柱", sub: "父母·青年" },
    day: { zh: "日柱", sub: "命主·夫妻" },
    hour: { zh: "时柱", sub: "子女·晚年" },
  }

  return (
    <div className="paper-texture relative overflow-hidden rounded-md border border-border bg-card p-6 shadow-[0_20px_50px_-25px_rgba(20,25,45,0.25)] md:p-8">
      <div className="mb-6 flex items-end justify-between border-b border-border/60 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Four Pillars</p>
          <h3 className="mt-1 font-serif text-2xl font-semibold text-foreground">四柱命盘</h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">
            公元 {chart.solarDate} · 真太阳时 {chart.trueSolarTime}
          </p>
          <p className="mt-1 font-serif text-sm text-accent">
            {chart.dayMaster.stem}{chart.dayMaster.element}日元 · {chart.wangshuai.level}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {order.map((k) => {
          const p = chart.pillars[k]
          const isMaster = k === "day"
          const colorStem = ELEMENT_COLOR[p.element] || "text-foreground"
          return (
            <div
              key={k}
              className={`relative rounded-sm border p-3 text-center transition-colors md:p-4 ${
                isMaster ? "border-accent bg-accent/10" : "border-border bg-background/50"
              }`}
            >
              {isMaster && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                  日元
                </span>
              )}
              <p className="text-[11px] text-muted-foreground">{labels[k].zh}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground/80">{labels[k].sub}</p>

              <div className="my-3 flex flex-col items-center">
                <span className={`font-serif text-3xl font-semibold md:text-4xl ${colorStem}`}>{p.stem}</span>
                <span className="mt-1 font-serif text-3xl font-semibold text-foreground md:text-4xl">{p.branch}</span>
              </div>

              <div className="space-y-1 border-t border-border/60 pt-2">
                <p className="text-[10px] text-muted-foreground">十神</p>
                <p className="font-serif text-xs text-foreground">{p.tenGod}</p>
                <p className="text-[10px] text-muted-foreground">藏干</p>
                <p className="font-serif text-[11px] text-foreground/80">{p.hiddenStems.join(" · ")}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border/60 pt-5 md:grid-cols-4">
        <Stat label="八字格局" value={chart.geju} />
        <Stat label="用神" value={chart.yongshen.join(" · ")} />
        <Stat label="忌神" value={chart.jishen.join(" · ")} />
        <Stat
          label="当前大运"
          value={
            chart.currentDayun
              ? `${chart.currentDayun.ganzhi} · ${chart.currentDayun.startYear}`
              : "未入大运"
          }
        />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-serif text-sm text-foreground">{value}</p>
    </div>
  )
}

export function FiveElementsCard({ chart }: { chart: Chart }) {
  const elements: ("金" | "木" | "水" | "火" | "土")[] = ["金", "木", "水", "火", "土"]
  const max = Math.max(...elements.map((e) => chart.fiveElements[e]))
  return (
    <div className="rounded-md border border-border bg-card p-6 shadow-[0_20px_50px_-25px_rgba(20,25,45,0.25)] md:p-8">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Five Elements</p>
          <h3 className="mt-1 font-serif text-2xl font-semibold text-foreground">五行分布</h3>
        </div>
        <p className="font-serif text-sm text-muted-foreground">
          旺衰：<span className="text-foreground">{chart.wangshuai.level}</span>
        </p>
      </div>
      <div className="space-y-4">
        {elements.map((e) => {
          const pct = chart.fiveElements[e]
          const barW = max > 0 ? (pct / Math.max(max, 1)) * 100 : 0
          const isMax = pct === max
          return (
            <div key={e} className="flex items-center gap-4">
              <span className={`w-6 font-serif text-lg ${ELEMENT_COLOR[e]}`}>{e}</span>
              <div className="flex-1 h-2.5 rounded-full bg-secondary/50 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${ELEMENT_BAR[e]} ${isMax ? "" : "opacity-70"}`}
                  style={{ width: `${barW}%` }}
                />
              </div>
              <span className="w-14 text-right font-serif text-sm text-foreground">{pct}%</span>
            </div>
          )
        })}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 text-xs text-muted-foreground md:grid-cols-4">
        <span>用神 · <span className="text-foreground">{chart.yongshen.join("、")}</span></span>
        <span>忌神 · <span className="text-destructive">{chart.jishen.join("、")}</span></span>
        <span>日主 · <span className="text-foreground">{chart.dayMaster.stem}（{chart.dayMaster.element}）</span></span>
        <span>流年 · <span className="text-foreground">{chart.currentLiunian}</span></span>
      </div>
    </div>
  )
}

