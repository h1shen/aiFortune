const pillars = [
  {
    label: "年柱",
    sub: "祖业·童年",
    heavenly: "庚",
    earthly: "午",
    tenGod: "正财",
    hiddenStems: ["丁", "己"],
    element: "金火",
    elementColor: "text-accent",
  },
  {
    label: "月柱",
    sub: "父母·青年",
    heavenly: "戊",
    earthly: "寅",
    tenGod: "偏印",
    hiddenStems: ["甲", "丙", "戊"],
    element: "土木",
    elementColor: "text-chart-4",
  },
  {
    label: "日柱",
    sub: "命主·夫妻",
    heavenly: "丙",
    earthly: "申",
    tenGod: "日元",
    hiddenStems: ["庚", "壬", "戊"],
    element: "火金",
    elementColor: "text-destructive",
    isMaster: true,
  },
  {
    label: "时柱",
    sub: "子女·晚年",
    heavenly: "甲",
    earthly: "午",
    tenGod: "偏印",
    hiddenStems: ["丁", "己"],
    element: "木火",
    elementColor: "text-chart-4",
  },
]

export function BaziChartPreview() {
  return (
    <div className="paper-texture relative overflow-hidden rounded-md border border-border bg-card p-6 shadow-[0_20px_50px_-25px_rgba(20,25,45,0.25)] md:p-8">
      <div className="mb-6 flex items-end justify-between border-b border-border/60 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Sample Reading</p>
          <h3 className="mt-1 font-serif text-2xl font-semibold text-foreground">四柱命盘 · 示例</h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">公元 1990.06.15 · 午时</p>
          <p className="mt-1 font-serif text-sm text-accent">丙火日元 · 身弱格</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {pillars.map((p) => (
          <div
            key={p.label}
            className={`relative rounded-sm border p-3 text-center transition-colors md:p-4 ${
              p.isMaster ? "border-accent bg-accent/10" : "border-border bg-background/50"
            }`}
          >
            {p.isMaster && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                日元
              </span>
            )}
            <p className="text-[11px] text-muted-foreground">{p.label}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground/80">{p.sub}</p>

            <div className="my-3 flex flex-col items-center">
              <span className={`font-serif text-3xl font-semibold md:text-4xl ${p.elementColor}`}>
                {p.heavenly}
              </span>
              <span className="mt-1 font-serif text-3xl font-semibold text-foreground md:text-4xl">{p.earthly}</span>
            </div>

            <div className="space-y-1 border-t border-border/60 pt-2">
              <p className="text-[10px] text-muted-foreground">十神</p>
              <p className="font-serif text-xs text-foreground">{p.tenGod}</p>
              <p className="text-[10px] text-muted-foreground">藏干</p>
              <p className="font-serif text-[11px] text-foreground/80">{p.hiddenStems.join(" · ")}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border/60 pt-5 md:grid-cols-4">
        {[
          { label: "五行格局", value: "木弱火旺" },
          { label: "用神", value: "壬水 · 庚金" },
          { label: "忌神", value: "丙火 · 甲木" },
          { label: "当前大运", value: "辛巳 · 2024" },
        ].map((stat) => (
          <div key={stat.label}>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{stat.label}</p>
            <p className="mt-1 font-serif text-sm text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
