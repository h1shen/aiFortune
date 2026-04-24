import Link from "next/link"
import { BrandMark } from "@/components/brand-mark"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-sm border border-border/60 bg-card text-foreground"
            aria-hidden
          >
            <BrandMark className="h-6 w-6" />
          </span>
          <div className="flex flex-col leading-none">
            <span className="font-serif text-lg font-semibold tracking-wider text-foreground">Keymind 知命</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Keymind · AI Bazi</span>
          </div>
        </Link>
      </div>
    </header>
  )
}
