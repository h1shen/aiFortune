"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

const navItems = [
  { label: "命盘测算", href: "#calculator" },
  { label: "命理百科", href: "#knowledge" },
  { label: "AI 问运", href: "#ai-reading" },
  { label: "流年运势", href: "#fortune" },
  { label: "关于玄机", href: "#about" },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary font-serif text-lg font-semibold text-primary-foreground"
            aria-hidden
          >
            玄
          </span>
          <div className="flex flex-col leading-none">
            <span className="font-serif text-lg font-semibold tracking-wider text-foreground">玄机阁</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">XuanJi · AI Bazi</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-serif text-sm text-foreground/80 transition-colors hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="ghost" className="font-serif text-foreground/80 hover:text-accent">
            登录
          </Button>
          <Button className="bg-primary font-serif text-primary-foreground hover:bg-primary/90">
            立即测算
          </Button>
        </div>

        <button
          type="button"
          aria-label={open ? "关闭菜单" : "打开菜单"}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-border text-foreground lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background lg:hidden">
          <nav className="mx-auto flex w-full max-w-7xl flex-col px-4 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-border/50 py-3 font-serif text-sm text-foreground/80"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 flex gap-3">
              <Button variant="outline" className="flex-1 font-serif bg-transparent">
                登录
              </Button>
              <Button className="flex-1 bg-primary font-serif text-primary-foreground">立即测算</Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
