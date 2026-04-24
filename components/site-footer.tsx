import Link from "next/link"
import { BrandMark } from "@/components/brand-mark"

const columns = [
  {
    title: "命理服务",
    links: ["八字排盘", "紫微斗数", "奇门遁甲", "姓名解析", "择吉择日"],
  },
  {
    title: "学习资源",
    links: ["命理百科", "古籍原典", "案例研读", "术语辞典", "常见问题"],
  },
  {
    title: "关于我们",
    links: ["创立初心", "学术顾问", "隐私声明", "用户条款", "联系我们"],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-sm border border-border/60 bg-card text-foreground">
                <BrandMark className="h-7 w-7" />
              </span>
              <div className="flex flex-col leading-none">
                <span className="font-serif text-lg font-semibold tracking-wider text-foreground">Keymind 知命</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Keymind · AI Bazi
                </span>
              </div>
            </Link>
            <p className="mt-5 max-w-sm font-serif text-sm leading-relaxed text-muted-foreground">
              千年命理智慧，融合人工智能。愿每一个灵魂，都能在此寻见自己的天命与归途。
            </p>
            <p className="mt-4 font-serif text-xs text-muted-foreground">
              子曰：不知命，无以为君子也。
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-serif text-sm font-semibold text-foreground">{col.title}</h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <Link
                      href="#"
                      className="font-serif text-sm text-muted-foreground transition-colors hover:text-accent"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 md:flex-row md:items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Keymind 知命 Studio · 本站测算仅供参考，命运仍握于己手。
          </p>
          <div className="flex gap-5 text-xs text-muted-foreground">
            <Link href="#" className="hover:text-foreground">
              微博
            </Link>
            <Link href="#" className="hover:text-foreground">
              小红书
            </Link>
            <Link href="#" className="hover:text-foreground">
              微信公众号
            </Link>
            <Link href="#" className="hover:text-foreground">
              App Store
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
