import Image from "next/image"
import { Quote } from "lucide-react"

const testimonials = [
  {
    name: "林女士",
    role: "品牌创始人 · 上海",
    avatar: "/avatar-1.jpg",
    quote:
      "AI 准确说中了我今年会迎来事业转折点，甚至指出了合作贵人的方位。细节到连我童年时一段经历都推测出来了，惊到我了。",
    rating: 5,
  },
  {
    name: "陈先生",
    role: "投资顾问 · 深圳",
    avatar: "/avatar-2.jpg",
    quote:
      "用过不少排盘软件，玄机阁的解读最不机械。既有古籍依据，又能结合现代语境给出建议，格局十神分析非常清晰。",
    rating: 5,
  },
  {
    name: "Sophie",
    role: "设计师 · 杭州",
    avatar: "/avatar-3.jpg",
    quote:
      "我喜欢它的隐私保护，也喜欢它对感情运的细腻解读。它让我明白为什么我总在重复同样的情感模式。",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="relative border-t border-border/60">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="mb-14 flex flex-col items-center text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Voices</p>
          <h2 className="mt-3 max-w-3xl text-balance font-serif text-4xl font-semibold leading-tight text-foreground md:text-5xl">
            百万人在<span className="text-accent">此寻见答案</span>
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="relative flex flex-col rounded-md border border-border bg-card p-7"
            >
              <Quote
                aria-hidden
                className="absolute right-6 top-6 h-7 w-7 text-accent/30"
                strokeWidth={1.5}
              />
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i} className="text-accent">
                    ★
                  </span>
                ))}
              </div>
              <blockquote className="flex-1 font-serif text-sm leading-relaxed text-foreground/90">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border/60 pt-5">
                <Image
                  src={t.avatar || "/placeholder.svg"}
                  alt={t.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-serif text-sm text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
