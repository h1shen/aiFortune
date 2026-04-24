"use client"

import { useEffect, useRef, useState } from "react"
import { RotateCw, Loader2 } from "lucide-react"
import { streamChat } from "@/lib/api"
import { READING_SECTIONS, parseReading, type ReadingSectionKey } from "@/lib/reading-parse"

/**
 * 六段索引元数据：中文数字 / 新标题 / 英文副标 / 小提示。
 * 顺序严格对齐 READING_SECTIONS：personality → framework → dayun → elements → keydates → summary
 */
const SECTION_META: Record<
  ReadingSectionKey,
  { num: string; title: string; sub: string; hint: string }
> = {
  personality: { num: "一", title: "论性格", sub: "Personality", hint: "性格底色" },
  framework: { num: "二", title: "论格局", sub: "Structure", hint: "人生格局" },
  dayun: { num: "三", title: "论大运", sub: "Destiny Arc", hint: "大运轨迹" },
  elements: { num: "四", title: "论五行", sub: "Five Phases", hint: "五行建议" },
  keydates: { num: "五", title: "论节点", sub: "Key Years", hint: "关键节点" },
  summary: { num: "六", title: "一句之言", sub: "In a Word", hint: "玄机之签" },
}

type ExtrasState = Partial<Record<ReadingSectionKey, string>>
type RedoingState = Partial<Record<ReadingSectionKey, boolean>>

export function ReadingSix({
  chartId,
  readingText,
  busy,
}: {
  chartId: string
  readingText: string
  busy: boolean
}) {
  const parsed = parseReading(readingText)
  const [active, setActive] = useState<ReadingSectionKey>("personality")
  const [extras, setExtras] = useState<ExtrasState>({})
  const [redoing, setRedoing] = useState<RedoingState>({})
  const refs = useRef<Partial<Record<ReadingSectionKey, HTMLElement | null>>>({})
  const abortRefs = useRef<Partial<Record<ReadingSectionKey, AbortController>>>({})

  // 滚动锚点 observer
  useEffect(() => {
    const els = READING_SECTIONS
      .map((s) => refs.current[s.key])
      .filter((el): el is HTMLElement => !!el)
    if (els.length === 0) return
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const first = visible[0]
        if (first) {
          const key = first.target.getAttribute("data-key") as ReadingSectionKey | null
          if (key) setActive(key)
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  // 卸载时取消所有 reading_section 请求
  useEffect(() => {
    return () => {
      Object.values(abortRefs.current).forEach((c) => c?.abort())
    }
  }, [])

  const jump = (key: ReadingSectionKey) => {
    const el = refs.current[key]
    if (el) el.scrollIntoView({ block: "start", behavior: "smooth" })
  }

  const reAnalyze = (key: ReadingSectionKey) => {
    if (redoing[key]) return
    // 中止已有请求
    abortRefs.current[key]?.abort()
    setExtras((x) => ({ ...x, [key]: "" }))
    setRedoing((r) => ({ ...r, [key]: true }))
    const ctl = streamChat(
      { chartId, mode: "reading_section", section: key },
      (d) =>
        setExtras((x) => ({
          ...x,
          [key]: (x[key] ?? "") + d,
        })),
      () => setRedoing((r) => ({ ...r, [key]: false })),
      (err) => {
        setExtras((x) => ({
          ...x,
          [key]: (x[key] ?? "") + `\n[错误: ${err}]`,
        }))
        setRedoing((r) => ({ ...r, [key]: false }))
      },
    )
    abortRefs.current[key] = ctl
  }

  const isEmpty = !readingText

  return (
    <section>
      <header className="mb-6 border-b border-border/60 pb-5">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Reading</p>
        <h3 className="mt-2 font-serif text-2xl font-semibold text-foreground md:text-3xl">
          命盘整体解读
        </h3>
        <p className="mt-2 font-serif text-sm text-muted-foreground">
          性格 · 人生格局 · 大运 · 五行 · 关键节点 · 一句话总结
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[200px_1fr] lg:gap-10">
        {/* 侧边锚点导航（小屏转顶部横向 pill bar） */}
        <nav className="lg:sticky lg:top-6 lg:self-start lg:pt-1">
          <div className="mb-3 font-serif text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Index · 六段索引
          </div>

          {/* 小屏：横向 pill bar */}
          <ul className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {READING_SECTIONS.map((s) => {
              const meta = SECTION_META[s.key]
              const isActive = active === s.key
              return (
                <li key={s.key} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => jump(s.key)}
                    className={`font-serif flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs transition-colors ${
                      isActive
                        ? "border-accent bg-accent/10 text-foreground"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className={isActive ? "text-accent" : "text-muted-foreground"}>
                      {meta.num}
                    </span>
                    <span>{meta.title}</span>
                  </button>
                </li>
              )
            })}
          </ul>

          {/* 大屏：纵向锚点 */}
          <ul className="hidden flex-col gap-0.5 lg:flex">
            {READING_SECTIONS.map((s) => {
              const meta = SECTION_META[s.key]
              const isActive = active === s.key
              return (
                <li key={s.key}>
                  <button
                    type="button"
                    onClick={() => jump(s.key)}
                    className={`font-serif flex w-full items-baseline gap-2.5 px-3 py-2 text-left transition-all ${
                      isActive ? "bg-accent/10" : "bg-transparent"
                    }`}
                    style={{
                      borderLeft: `2px solid ${
                        isActive ? "var(--destructive)" : "oklch(0.88 0.015 75 / 0.5)"
                      }`,
                    }}
                  >
                    <span
                      className={`w-4 text-[13px] ${
                        isActive ? "text-accent" : "text-muted-foreground"
                      }`}
                    >
                      {meta.num}
                    </span>
                    <span className="flex-1">
                      <div
                        className={`text-sm leading-tight ${
                          isActive ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
                        }`}
                      >
                        {meta.title}
                      </div>
                      <div className="mt-1 text-[10px] tracking-[0.12em] text-muted-foreground">
                        {meta.sub}
                      </div>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="mt-5 hidden rounded-sm bg-primary p-3 text-[11px] leading-[1.7] text-primary-foreground lg:block">
            <div className="font-serif mb-1 text-[10px] uppercase tracking-[0.2em] text-accent">
              Tips
            </div>
            <span className="font-serif">
              每段尾按「再抽一签」
              <br />
              玄机会换一角度再落笔。
            </span>
          </div>
        </nav>

        {/* 六段正文 */}
        <div className="flex flex-col gap-7">
          {READING_SECTIONS.map((s) => {
            const meta = SECTION_META[s.key]
            const isSummary = s.key === "summary"
            const content = parsed.sections[s.key]
            const streamingThisOne = busy && parsed.current === s.key
            const isPendingPlaceholder = !content && !streamingThisOne
            const extra = extras[s.key]
            const isRedoing = !!redoing[s.key]

            return (
              <article
                key={s.key}
                data-key={s.key}
                ref={(el) => {
                  refs.current[s.key] = el
                }}
                className="relative overflow-hidden rounded-md p-6 md:p-7"
                style={{
                  scrollMarginTop: 24,
                  border: `1px solid ${
                    isSummary ? "oklch(0.72 0.12 75 / 0.45)" : "oklch(0.88 0.015 75 / 0.7)"
                  }`,
                  background: isSummary
                    ? "linear-gradient(135deg, oklch(0.72 0.12 75 / 0.08), transparent 60%, oklch(0.24 0.02 260 / 0.05))"
                    : "var(--card)",
                }}
              >
                {/* 段号印章 + 标题 + 再抽一签 */}
                <div className="mb-4 flex items-baseline gap-3.5">
                  <span
                    className="font-serif inline-grid place-items-center"
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 2,
                      border: "1.5px solid var(--destructive)",
                      color: "var(--destructive)",
                      background: "oklch(0.975 0.008 85)",
                      fontSize: 16,
                      fontWeight: 700,
                    }}
                  >
                    {meta.num}
                  </span>
                  <div>
                    <div className="font-serif text-xl font-semibold leading-none">
                      {meta.title}
                    </div>
                    <div className="mt-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {meta.sub} · {meta.hint}
                    </div>
                  </div>
                  <div className="flex-1" />
                  {streamingThisOne && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
                  )}
                  {!isSummary && !isEmpty && (
                    <button
                      type="button"
                      onClick={() => reAnalyze(s.key)}
                      disabled={isRedoing}
                      className="font-serif inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3.5 py-1.5 text-xs text-foreground transition-colors hover:bg-accent/20 disabled:cursor-wait disabled:opacity-70"
                    >
                      {isRedoing ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          起卦中…
                        </>
                      ) : (
                        <>
                          <RotateCw className="h-3 w-3" />
                          再抽一签
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* 正文 */}
                <pre
                  className="font-serif m-0 whitespace-pre-wrap"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: isSummary ? 20 : 15,
                    lineHeight: 2.1,
                    color: "oklch(0.22 0.015 50 / 0.92)",
                    fontWeight: isSummary ? 500 : 400,
                    paddingLeft: 10,
                    borderLeft: `2px solid ${
                      isSummary ? "oklch(0.72 0.12 75 / 0.5)" : "oklch(0.88 0.015 75)"
                    }`,
                    opacity: isPendingPlaceholder ? 0.55 : 1,
                  }}
                >
                  {content ? (
                    <>
                      {content}
                      {streamingThisOne && (
                        <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-accent align-middle" />
                      )}
                    </>
                  ) : isEmpty && busy ? (
                    "玄机执笔中..."
                  ) : isEmpty ? (
                    "玄机尚未起卦"
                  ) : streamingThisOne ? (
                    <span>
                      玄机正在落笔...
                      <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-accent align-middle" />
                    </span>
                  ) : (
                    "（待解读）"
                  )}
                </pre>

                {/* 再抽一签 · 另角度 */}
                {extra !== undefined && (
                  <div
                    className="mt-5 border-t border-dashed pt-4 animate-in fade-in slide-in-from-bottom-1 duration-500"
                    style={{
                      borderTopColor: "oklch(0.88 0.015 75)",
                    }}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{
                          background: "var(--destructive)",
                          boxShadow: "0 0 0 3px oklch(0.52 0.17 28 / 0.2)",
                        }}
                      />
                      <span
                        className="font-serif text-[10px] uppercase"
                        style={{
                          letterSpacing: "0.2em",
                          color: "var(--destructive)",
                        }}
                      >
                        玄机再签
                      </span>
                      <span className="font-serif text-[11px] text-muted-foreground">
                        · 另角度 ·
                      </span>
                    </div>
                    <pre
                      className="font-serif m-0 whitespace-pre-wrap"
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: 14,
                        lineHeight: 2,
                        color: "oklch(0.22 0.015 50 / 0.85)",
                        paddingLeft: 10,
                        borderLeft: "2px dashed oklch(0.52 0.17 28 / 0.4)",
                      }}
                    >
                      {extra || (isRedoing ? "…" : "")}
                      {isRedoing && (
                        <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-destructive align-middle" />
                      )}
                    </pre>
                  </div>
                )}
              </article>
            )
          })}

          {/* 解析失败兜底：LLM 返回不含 emoji 时显示原文 */}
          {parsed.empty && readingText && (
            <div className="whitespace-pre-wrap rounded-md border border-dashed border-border p-4 font-serif text-sm leading-relaxed text-foreground/90">
              {readingText}
              {busy && (
                <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-accent align-middle" />
              )}
            </div>
          )}
        </div>
      </div>

    </section>
  )
}
