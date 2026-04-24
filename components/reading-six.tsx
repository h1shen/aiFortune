"use client"

import { useEffect, useRef, useState } from "react"
import { streamChat } from "@/lib/api"
import { READING_SECTIONS, parseReading, type ReadingSectionKey } from "@/lib/reading-parse"
import type { Chart } from "@/lib/types"

/**
 * 六段索引元数据：中文数字 / 新标题 / 英文副标 / 小提示。
 * 顺序严格对齐 READING_SECTIONS：personality → framework → dayun → elements → keydates → summary
 */
const SECTION_META: Record<
  ReadingSectionKey,
  { num: string; title: string; sub: string; hint: string }
> = {
  personality: { num: "一", title: "论性格", sub: "Personality", hint: "火光内外之辨" },
  framework: { num: "二", title: "论格局", sub: "Structure", hint: "身弱正财，财为时引" },
  dayun: { num: "三", title: "论大运", sub: "Destiny Arc", hint: "辛巳被看见 · 壬午立骨" },
  elements: { num: "四", title: "论五行", sub: "Five Phases", hint: "近水以润燥" },
  keydates: { num: "五", title: "论节点", sub: "Key Years", hint: "2025 · 2027 · 2030 · 2033" },
  summary: { num: "六", title: "一句之言", sub: "In a Word", hint: "玄机之签，以诗作结" },
}

type BoolMap = Partial<Record<ReadingSectionKey, boolean>>
type ExtrasState = Partial<Record<ReadingSectionKey, string>>

export function ReadingSix({
  chart,
  readingText,
  busy,
}: {
  chart: Chart
  readingText: string
  busy: boolean
}) {
  const parsed = parseReading(readingText)

  const [unlocked, setUnlocked] = useState<BoolMap>({})
  const [drawing, setDrawing] = useState<ReadingSectionKey | null>(null)
  const [extras, setExtras] = useState<ExtrasState>({})
  const [redoing, setRedoing] = useState<BoolMap>({})

  const abortRefs = useRef<Partial<Record<ReadingSectionKey, AbortController>>>({})
  const drawTimers = useRef<number[]>([])

  // 卸载时取消所有 reading_section 请求 + 清理 drawing 定时器
  useEffect(() => {
    return () => {
      Object.values(abortRefs.current).forEach((c) => c?.abort())
      drawTimers.current.forEach((id) => window.clearTimeout(id))
    }
  }, [])

  const drawOne = (key: ReadingSectionKey) => {
    if (unlocked[key] || drawing) return
    setDrawing(key)
    const id = window.setTimeout(() => {
      setUnlocked((u) => ({ ...u, [key]: true }))
      setDrawing(null)
    }, 700)
    drawTimers.current.push(id)
  }

  const drawAll = () => {
    READING_SECTIONS.forEach((s, i) => {
      const id = window.setTimeout(() => {
        setUnlocked((u) => ({ ...u, [s.key]: true }))
      }, i * 220)
      drawTimers.current.push(id)
    })
  }

  const reAnalyze = (key: ReadingSectionKey) => {
    if (redoing[key]) return
    abortRefs.current[key]?.abort()
    setExtras((x) => ({ ...x, [key]: "" }))
    setRedoing((r) => ({ ...r, [key]: true }))
    const ctl = streamChat(
      { chart, mode: "reading_section", section: key },
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

  const unlockedCount = READING_SECTIONS.filter((s) => unlocked[s.key]).length
  const allUnlocked = unlockedCount === READING_SECTIONS.length

  return (
    <section>
      {/* 一键起全签：顶部小按钮，全部启后隐藏 */}
      {!allUnlocked && (
        <div className="mb-5 flex justify-end">
          <button
            type="button"
            onClick={drawAll}
            disabled={!!drawing}
            className="font-serif inline-flex items-center gap-1.5 rounded-full border border-accent/45 bg-accent/10 px-3.5 py-1.5 text-xs text-foreground transition-colors hover:bg-accent/20 disabled:cursor-wait disabled:opacity-70"
            style={{ letterSpacing: "0.08em" }}
          >
            ↯ 一键起全签
            <span className="text-[10px] text-muted-foreground">
              {unlockedCount}/{READING_SECTIONS.length}
            </span>
          </button>
        </div>
      )}

      {/* 六签网格 */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {READING_SECTIONS.map((s) => {
          const key = s.key
          const meta = SECTION_META[key]
          const isUnlocked = !!unlocked[key]
          const isDrawing = drawing === key
          const isSummary = key === "summary"
          const content = parsed.sections[key]
          const streamingThisOne = busy && parsed.current === key
          const extra = extras[key]
          const isRedoing = !!redoing[key]

          return (
            <article
              key={key}
              className="relative overflow-hidden"
              style={{
                minHeight: 360,
                borderRadius: 6,
                border: `1px solid ${
                  isSummary ? "oklch(0.72 0.12 75 / 0.45)" : "oklch(0.88 0.015 75 / 0.8)"
                }`,
                background: isSummary
                  ? "linear-gradient(135deg, oklch(0.72 0.12 75 / 0.08), transparent 60%, oklch(0.24 0.02 260 / 0.05))"
                  : "var(--card)",
                transition: "box-shadow .3s",
                boxShadow: isUnlocked
                  ? "0 20px 50px -25px rgba(20,25,45,0.25)"
                  : "0 10px 30px -20px rgba(20,25,45,0.15)",
              }}
            >
              {!isUnlocked ? (
                // ========= 密封态 · 签筒 =========
                <button
                  type="button"
                  onClick={() => drawOne(key)}
                  disabled={isDrawing}
                  className="paper-texture"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    background: `
                      radial-gradient(ellipse at 50% 0%, oklch(0.72 0.12 75 / 0.14), transparent 55%),
                      linear-gradient(180deg, oklch(0.97 0.015 82) 0%, oklch(0.94 0.02 78) 100%)`,
                    color: "var(--foreground)",
                    border: "none",
                    cursor: isDrawing ? "wait" : "pointer",
                    padding: 0,
                    fontFamily: "var(--font-serif)",
                    overflow: "hidden",
                  }}
                >
                  {/* 内描边 */}
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      inset: 10,
                      border: "1px dashed oklch(0.72 0.12 75 / 0.4)",
                      borderRadius: 4,
                      pointerEvents: "none",
                    }}
                  />
                  {/* 调杆 */}
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "50%",
                      width: 1.5,
                      height: 22,
                      background: "oklch(0.72 0.12 75 / 0.6)",
                      transform: "translateX(-50%)",
                    }}
                  />
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: 18,
                      left: "50%",
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: "var(--destructive)",
                      boxShadow:
                        "0 0 0 3px oklch(0.975 0.008 85), 0 2px 6px oklch(0.22 0.015 50 / 0.2)",
                      transform: "translateX(-50%)",
                    }}
                  />
                  {/* 竖写毛笔字 */}
                  <div
                    style={{
                      position: "absolute",
                      top: 58,
                      left: 0,
                      right: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        border: "1.5px solid var(--destructive)",
                        color: "var(--destructive)",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 20,
                        fontWeight: 700,
                        borderRadius: 2,
                        background: "oklch(0.975 0.008 85)",
                        transform: isDrawing ? "rotate(12deg) scale(1.08)" : "none",
                        transition: "transform .35s",
                        animation: isDrawing ? "drawShake .3s ease-in-out 2" : "none",
                      }}
                    >
                      {meta.num}
                    </div>
                    <div
                      style={{
                        writingMode: "vertical-rl",
                        fontSize: 26,
                        fontWeight: 600,
                        letterSpacing: "0.4em",
                        marginTop: 12,
                        color: "oklch(0.28 0.02 50)",
                      }}
                    >
                      {meta.title}
                    </div>
                  </div>
                  {/* 底部提示 */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 22,
                      left: 0,
                      right: 0,
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.3em",
                        color: "var(--accent)",
                        textTransform: "uppercase",
                        marginBottom: 10,
                        fontWeight: 600,
                      }}
                    >
                      {meta.sub}
                    </div>
                    <div
                      className="font-serif"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "7px 18px",
                        borderRadius: 999,
                        border: "1px solid oklch(0.72 0.12 75 / 0.55)",
                        background: "oklch(0.975 0.008 85)",
                        fontSize: 12.5,
                        color: "var(--foreground)",
                        boxShadow: "0 2px 8px oklch(0.22 0.015 50 / 0.06)",
                      }}
                    >
                      {isDrawing ? "起卦中…" : "☉ 点击启签"}
                    </div>
                  </div>
                </button>
              ) : (
                // ========= 已启 · 内容 =========
                <div
                  style={{
                    padding: "24px 24px 22px",
                    animation: "unfurl .5s ease both",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 12,
                      marginBottom: 12,
                    }}
                  >
                    <span
                      className="font-serif"
                      style={{
                        display: "inline-grid",
                        placeItems: "center",
                        width: 30,
                        height: 30,
                        borderRadius: 2,
                        border: "1.5px solid var(--destructive)",
                        color: "var(--destructive)",
                        background: "oklch(0.975 0.008 85)",
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {meta.num}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div
                        className="font-serif"
                        style={{ fontSize: 18, fontWeight: 600, lineHeight: 1 }}
                      >
                        {meta.title}
                      </div>
                      <div
                        style={{
                          fontSize: 9,
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          color: "var(--muted-foreground)",
                          marginTop: 5,
                        }}
                      >
                        {meta.sub} · {meta.hint}
                      </div>
                    </div>
                  </div>

                  <pre
                    className="font-serif"
                    style={{
                      whiteSpace: "pre-wrap",
                      fontFamily: "var(--font-serif)",
                      fontSize: isSummary ? 16 : 13.5,
                      lineHeight: 2,
                      color: "oklch(0.22 0.015 50 / 0.92)",
                      margin: 0,
                      fontWeight: isSummary ? 500 : 400,
                      paddingLeft: 10,
                      borderLeft: `2px solid ${
                        isSummary ? "oklch(0.72 0.12 75 / 0.5)" : "oklch(0.88 0.015 75)"
                      }`,
                      flex: 1,
                    }}
                  >
                    {content ? (
                      <>
                        {content}
                        {streamingThisOne && (
                          <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-accent align-middle" />
                        )}
                      </>
                    ) : busy ? (
                      <span style={{ opacity: 0.6 }}>
                        玄机执笔中…
                        <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-accent align-middle" />
                      </span>
                    ) : (
                      <span style={{ opacity: 0.55 }}>（待解读）</span>
                    )}
                  </pre>

                  {!isSummary && (
                    <div
                      style={{
                        marginTop: 14,
                        paddingTop: 12,
                        borderTop: "1px dashed oklch(0.88 0.015 75)",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => reAnalyze(key)}
                        disabled={isRedoing || !content}
                        style={{
                          cursor:
                            isRedoing || !content ? "not-allowed" : "pointer",
                          fontFamily: "var(--font-serif)",
                          fontSize: 12,
                          padding: "5px 12px",
                          borderRadius: 999,
                          border: "1px solid oklch(0.72 0.12 75 / 0.4)",
                          background: "oklch(0.72 0.12 75 / 0.08)",
                          color: "var(--foreground)",
                          opacity: isRedoing || !content ? 0.6 : 1,
                        }}
                      >
                        {isRedoing ? "起卦中…" : "↻ 再抽一签"}
                      </button>
                      {extra !== undefined && (
                        <pre
                          className="font-serif"
                          style={{
                            whiteSpace: "pre-wrap",
                            fontFamily: "var(--font-serif)",
                            fontSize: 12.5,
                            lineHeight: 1.9,
                            margin: "10px 0 0",
                            color: "oklch(0.22 0.015 50 / 0.85)",
                            paddingLeft: 10,
                            borderLeft: "2px solid oklch(0.52 0.17 28 / 0.4)",
                          }}
                        >
                          {extra || (isRedoing ? "…" : "")}
                          {isRedoing && (
                            <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-destructive align-middle" />
                          )}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}
            </article>
          )
        })}
      </div>

      {/* 解析失败兜底：LLM 返回不含 emoji 时显示原文 */}
      {parsed.empty && readingText && (
        <div className="mt-6 whitespace-pre-wrap rounded-md border border-dashed border-border p-4 font-serif text-sm leading-relaxed text-foreground/90">
          {readingText}
          {busy && (
            <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-accent align-middle" />
          )}
        </div>
      )}

      <style>{`
        @keyframes unfurl {
          0%   { opacity: 0; transform: scale(0.96); filter: blur(3px); }
          100% { opacity: 1; transform: scale(1);    filter: blur(0); }
        }
        @keyframes drawShake {
          0%, 100% { transform: translateY(0) rotate(12deg) scale(1.08); }
          50%      { transform: translateY(-4px) rotate(12deg) scale(1.08); }
        }
      `}</style>
    </section>
  )
}
