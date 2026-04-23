const elements = [
  {
    cn: "金",
    py: "Metal",
    color: "oklch(0.78 0.13 75)",
    text: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/50",
    desc: "主义 · 肃杀 · 收敛",
    percent: 22,
  },
  {
    cn: "木",
    py: "Wood",
    color: "oklch(0.6 0.11 140)",
    text: "text-chart-4",
    bg: "bg-chart-4/10",
    border: "border-chart-4/50",
    desc: "主仁 · 生发 · 条达",
    percent: 18,
  },
  {
    cn: "水",
    py: "Water",
    color: "oklch(0.4 0.05 260)",
    text: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/40",
    desc: "主智 · 润下 · 灵动",
    percent: 12,
  },
  {
    cn: "火",
    py: "Fire",
    color: "oklch(0.55 0.18 28)",
    text: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/50",
    desc: "主礼 · 炎上 · 明理",
    percent: 32,
  },
  {
    cn: "土",
    py: "Earth",
    color: "oklch(0.65 0.09 60)",
    text: "text-chart-5",
    bg: "bg-chart-5/10",
    border: "border-chart-5/50",
    desc: "主信 · 稼穑 · 承载",
    percent: 16,
  },
]

export function FiveElementsSection() {
  return (
    <section id="fortune" className="relative border-t border-border/60 bg-secondary/40">
      <div className="mx-auto grid w-full max-w-7xl gap-14 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Wu Xing</p>
          <h2 className="mt-3 text-balance font-serif text-4xl font-semibold leading-tight text-foreground md:text-5xl">
            五行相生，<br />
            <span className="text-accent">万物有序</span>
          </h2>
          <p className="mt-5 max-w-xl font-serif text-muted-foreground md:text-lg">
            金生水、水生木、木生火、火生土、土生金——循环往复，生生不息。
            AI 根据您八字中五行的旺衰分布，推算命局中的"用神"与"忌神"，
            指导您选择有利的方位、颜色、行业乃至贵人。
          </p>

          <div className="mt-8 space-y-4">
            {elements.map((el) => (
              <div key={el.cn} className="space-y-1.5">
                <div className="flex items-baseline justify-between font-serif">
                  <span className="text-sm text-foreground">
                    <span className={`mr-2 text-base ${el.text}`}>{el.cn}</span>
                    <span className="text-xs text-muted-foreground">{el.desc}</span>
                  </span>
                  <span className={`text-sm tabular-nums ${el.text}`}>{el.percent}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/60">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${el.percent}%`, backgroundColor: el.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div
            aria-hidden
            className="absolute inset-0 rounded-full bg-gradient-to-br from-accent/10 via-transparent to-destructive/10 blur-3xl"
          />
          <div className="relative aspect-square w-full max-w-lg">
            <div className="absolute inset-0 rounded-full border border-border/60" />
            <div className="absolute inset-6 rounded-full border border-dashed border-accent/30" />
            <div className="absolute inset-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-accent bg-background text-center">
              <div>
                <p className="font-serif text-3xl font-semibold text-accent">玄</p>
                <p className="text-[10px] tracking-[0.2em] text-muted-foreground">XUAN JI</p>
              </div>
            </div>

            {elements.map((el, i) => {
              const angle = (i / elements.length) * Math.PI * 2 - Math.PI / 2
              const r = 42
              const x = 50 + Math.cos(angle) * r
              const y = 50 + Math.sin(angle) * r
              return (
                <div
                  key={el.cn}
                  className={`absolute flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 ${el.border} ${el.bg} shadow-sm backdrop-blur-sm md:h-24 md:w-24`}
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <div className="text-center">
                    <p className={`font-serif text-2xl font-semibold md:text-3xl ${el.text}`}>{el.cn}</p>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{el.py}</p>
                  </div>
                </div>
              )
            })}

            <svg
              aria-hidden
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              fill="none"
            >
              {elements.map((_, i) => {
                const next = (i + 2) % elements.length
                const a1 = (i / elements.length) * Math.PI * 2 - Math.PI / 2
                const a2 = (next / elements.length) * Math.PI * 2 - Math.PI / 2
                const r = 42
                const x1 = 50 + Math.cos(a1) * r
                const y1 = 50 + Math.sin(a1) * r
                const x2 = 50 + Math.cos(a2) * r
                const y2 = 50 + Math.sin(a2) * r
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="oklch(0.52 0.17 28 / 0.15)"
                    strokeWidth="0.3"
                    strokeDasharray="1 1"
                  />
                )
              })}
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
