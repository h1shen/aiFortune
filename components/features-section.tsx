import { BaziChartPreview } from "@/components/bazi-chart-preview"
import { Brain, ScrollText, Sparkles, Compass, TrendingUp, ShieldCheck } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "深度学习命理大模型",
    desc: "基于三十万部古籍与百万真实命盘训练，参悟《渊海子平》《滴天髓》《穷通宝鉴》。",
  },
  {
    icon: Compass,
    title: "真太阳时校准",
    desc: "按出生地经纬度自动换算真太阳时，避免时辰误差导致盘局偏差。",
  },
  {
    icon: ScrollText,
    title: "十神格局判定",
    desc: "AI 自动辨识正偏印绶、食伤财官杀，精准剖析命局喜忌与五行旺衰。",
  },
  {
    icon: TrendingUp,
    title: "流年大运推演",
    desc: "十年大运、流年吉凶、月令节气一一呈现，预见人生关键节点。",
  },
  {
    icon: Sparkles,
    title: "事业姻缘财富",
    desc: "多维度解读事业发展、婚恋桃花、财运起伏、健康隐忧与贵人方位。",
  },
  {
    icon: ShieldCheck,
    title: "端到端加密隐私",
    desc: "所有出生信息经端到端加密处理，绝不共享、不售卖、不用于任何训练。",
  },
]

export function FeaturesSection() {
  return (
    <section id="knowledge" className="relative border-t border-border/60">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="mb-16">
          <BaziChartPreview />
        </div>

        <div className="mb-14 flex flex-col items-center text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Why Keymind</p>
          <h2 className="mt-3 max-w-3xl text-balance font-serif text-4xl font-semibold leading-tight text-foreground md:text-5xl">
            六维解析，<span className="text-accent">洞见</span>命盘全貌
          </h2>
          <p className="mt-5 max-w-2xl text-pretty font-serif text-muted-foreground md:text-lg">
            以科学的工程方法诠释古老的命理哲学，
            让每一次测算都经得起推敲。
          </p>
        </div>

        <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="group relative flex flex-col gap-4 bg-card p-8 transition-colors hover:bg-secondary/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-accent/40 bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground">{f.title}</h3>
                <p className="font-serif text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                <span
                  aria-hidden
                  className="absolute bottom-0 left-0 h-0.5 w-0 bg-accent transition-all duration-500 group-hover:w-full"
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
