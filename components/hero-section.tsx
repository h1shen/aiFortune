import Image from "next/image"
import { BaziForm } from "@/components/bazi-form"
import { Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/ink-mountains.jpg"
          alt=""
          fill
          priority
          className="object-cover object-top opacity-40 mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-4 py-20 md:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-28">
        <div className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs text-accent-foreground/80">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span className="font-serif tracking-wider">融古通今 · AI 赋能命理新纪元</span>
          </div>

          <h1 className="font-serif text-5xl font-semibold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl">
            一盏灯，
            <br />
            照见
            <span className="relative mx-2 inline-block">
              <span className="relative z-10 text-accent">流年</span>
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-1 h-2 bg-destructive/30"
              />
            </span>
            与
            <span className="mx-2 text-accent">命途</span>。
          </h1>

          <p className="mt-6 max-w-xl text-pretty font-serif text-base leading-relaxed text-muted-foreground md:text-lg">
            玄机阁以深度学习模型推演传统子平术，结合紫微斗数、奇门遁甲典籍，
            为您解析四柱八字、五行喜忌、十神格局，洞见人生脉络。
          </p>

          <div className="mt-10 grid grid-cols-3 gap-6 border-t border-border/70 pt-8">
            {[
              { num: "120万+", label: "用户命盘" },
              { num: "98.7%", label: "解读准确率" },
              { num: "24h", label: "AI 即时问运" },
            ].map((item) => (
              <div key={item.label}>
                <div className="font-serif text-2xl font-semibold text-foreground md:text-3xl">{item.num}</div>
                <div className="mt-1 text-xs text-muted-foreground md:text-sm">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div id="calculator" className="relative">
          <div
            aria-hidden
            className="absolute -inset-4 rounded-lg bg-gradient-to-br from-accent/20 via-transparent to-destructive/10 blur-2xl"
          />
          <BaziForm />
        </div>
      </div>
    </section>
  )
}
