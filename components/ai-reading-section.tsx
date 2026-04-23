import { Sparkles, Send, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const messages = [
  {
    role: "user",
    text: "请问我今年的事业运如何？是否适合跳槽？",
  },
  {
    role: "ai",
    text: "依您丙火日元命盘，甲辰流年木火相生，正印贴身主文书贵人。上半年辰月伤官见官，不宜主动求变；下半年申酉月庚金透出，财星得力，属跳槽吉期。建议：九月后寻求东南方向之新机遇。",
  },
  {
    role: "user",
    text: "那正缘桃花何时到？",
  },
]

const suggestions = [
  "我的命格属于什么格局？",
  "今年有没有正桃花？",
  "哪个方位对我最有利？",
  "什么行业最适合我？",
  "大运什么时候转折？",
]

export function AIReadingSection() {
  return (
    <section id="ai-reading" className="relative border-t border-border/60">
      <div className="mx-auto grid w-full max-w-7xl gap-14 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.1fr_1fr]">
        <div className="relative order-2 lg:order-1">
          <div
            aria-hidden
            className="absolute -inset-4 rounded-lg bg-gradient-to-br from-accent/15 via-transparent to-primary/10 blur-2xl"
          />
          <div className="relative overflow-hidden rounded-md border border-border bg-card shadow-[0_30px_60px_-30px_rgba(20,25,45,0.35)]">
            <div className="flex items-center justify-between border-b border-border bg-secondary/60 px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-serif text-primary-foreground">
                  玄
                </div>
                <div>
                  <p className="font-serif text-sm text-foreground">玄机 · AI 命理师</p>
                  <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-chart-4" />
                    在线 · 已解读您的命盘
                  </p>
                </div>
              </div>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="max-h-[420px] space-y-4 overflow-y-auto p-5">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-3 font-serif text-sm leading-relaxed ${
                      m.role === "user"
                        ? "rounded-tr-sm bg-primary text-primary-foreground"
                        : "rounded-tl-sm border border-accent/30 bg-accent/5 text-foreground"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-lg rounded-tl-sm border border-accent/30 bg-accent/5 px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:300ms]" />
                </div>
              </div>
            </div>

            <div className="border-t border-border p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                {suggestions.slice(0, 3).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="rounded-full border border-border bg-background px-3 py-1 font-serif text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
                <input
                  type="text"
                  placeholder="向玄机发问你的命运..."
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  aria-label="发送"
                  className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-primary-foreground"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 flex flex-col justify-center lg:order-2">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">AI Oracle</p>
          <h2 className="mt-3 text-balance font-serif text-4xl font-semibold leading-tight text-foreground md:text-5xl">
            与 AI 命理师，<br />
            <span className="text-accent">促膝长谈</span>
          </h2>
          <p className="mt-5 max-w-xl font-serif text-muted-foreground md:text-lg">
            不再是千篇一律的运势文案。玄机 AI 读懂您完整的命盘结构，
            以古文辞藻与现代语境兼具的方式，回答您关于事业、姻缘、健康、
            财富、学业的任何具体问题。
          </p>

          <div className="mt-7 grid gap-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">常见问询</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-border bg-card px-3 py-1.5 font-serif text-xs text-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <Button
            size="lg"
            className="mt-8 w-fit bg-primary font-serif tracking-wider text-primary-foreground hover:bg-primary/90"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            开始你的命理对话
          </Button>
        </div>
      </div>
    </section>
  )
}
