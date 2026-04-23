const steps = [
  {
    num: "壹",
    title: "录入生辰",
    desc: "提供姓名、性别、精确出生日期与时辰，我们将为您校正真太阳时。",
  },
  {
    num: "贰",
    title: "AI 起盘",
    desc: "深度模型自动排布四柱干支，标注十神、藏干、纳音与神煞。",
  },
  {
    num: "叁",
    title: "格局辨识",
    desc: "判定身强身弱、用神忌神、命局格局，综合评定命盘吉凶层次。",
  },
  {
    num: "肆",
    title: "运程推演",
    desc: "十年大运、流年太岁、月令节气全面推演，预见关键转折节点。",
  },
  {
    num: "伍",
    title: "玄机问答",
    desc: "针对事业、感情、财富、健康等具体议题，与 AI 深度对话。",
  },
]

export function ProcessSection() {
  return (
    <section id="about" className="relative border-t border-border/60 bg-primary text-primary-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="mb-16 flex flex-col items-center text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">The Process</p>
          <h2 className="mt-3 max-w-3xl text-balance font-serif text-4xl font-semibold leading-tight md:text-5xl">
            五步开启<span className="text-accent"> 命盘之门</span>
          </h2>
          <p className="mt-5 max-w-2xl font-serif text-primary-foreground/70 md:text-lg">
            从录入八字到获取完整人生解读，仅需数分钟。
          </p>
        </div>

        <div className="grid gap-0 lg:grid-cols-5">
          {steps.map((s, i) => (
            <div
              key={s.num}
              className="relative border-accent/20 px-6 py-8 first:pl-0 last:pr-0 lg:border-l lg:first:border-l-0"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/60 font-serif text-xl text-accent">
                {s.num}
              </div>
              <h3 className="mt-5 font-serif text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 font-serif text-sm leading-relaxed text-primary-foreground/70">{s.desc}</p>

              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className="absolute right-0 top-[3.25rem] hidden h-px w-6 translate-x-1/2 bg-accent/40 lg:block"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
