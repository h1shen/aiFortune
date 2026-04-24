import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight } from "lucide-react"

export function CtaSection() {
  return (
    <section className="relative overflow-hidden border-t border-border/60">
      <div className="absolute inset-0">
        <Image
          src="/bagua-ornament.jpg"
          alt=""
          fill
          className="object-cover opacity-20 mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background" />
      </div>

      <div className="relative mx-auto w-full max-w-4xl px-4 py-24 text-center md:px-8 md:py-32">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs text-accent-foreground/80">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <span className="font-serif tracking-wider">首次测算限时免费</span>
        </div>
        <h2 className="text-balance font-serif text-4xl font-semibold leading-tight text-foreground md:text-6xl">
          命由天定，<br />
          运由<span className="text-accent">己造</span>。
        </h2>
        <p className="mt-6 text-pretty font-serif text-lg text-muted-foreground">
          此刻，开启属于你的命盘，让 AI 为你点亮前路。
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            className="h-12 bg-primary px-8 font-serif tracking-wider text-primary-foreground hover:bg-primary/90"
          >
            立即免费测算
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 border-border bg-transparent px-8 font-serif tracking-wider text-foreground hover:bg-secondary"
          >
            查看付费深度解析
          </Button>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          已有 <span className="font-serif text-foreground">1,247,586</span> 人通过 Keymind 知命窥见命运
        </p>
      </div>
    </section>
  )
}
