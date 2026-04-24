"use client"

import { parseReading } from "@/lib/reading-parse"

/**
 * 玄机一签 · 独立展示 reading 的 summary 段。
 * 双描边（朱砂 + 烫金 via 2px accent），linear-gradient 背景；
 * 左上角胶囊 badge「玄机一签」，右上角模糊光晕。
 * busy 或 summary 为空时，渲染占位文案 / 闪烁光标。
 */
export function ReadingSummaryCard({
  readingText,
  busy,
}: {
  readingText: string
  busy: boolean
}) {
  const parsed = parseReading(readingText)
  const summary = parsed.sections.summary

  return (
    <div
      className="relative overflow-hidden rounded-md p-7 md:p-8"
      style={{
        border: "2px solid oklch(0.72 0.12 75 / 0.5)",
        background:
          "linear-gradient(135deg, oklch(0.72 0.12 75 / 0.10), transparent 60%, oklch(0.24 0.02 260 / 0.06))",
      }}
    >
      {/* 右上角模糊光晕 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/15 blur-3xl"
      />

      <div className="relative">
        {/* 左上角胶囊 badge */}
        <div className="flex items-center gap-2">
          <span
            className="font-serif"
            style={{
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              padding: "3px 10px",
              border: "1px solid oklch(0.72 0.12 75 / 0.4)",
              borderRadius: 999,
              color: "var(--accent)",
            }}
          >
            玄机一签
          </span>
        </div>

        <pre
          className="font-serif mt-5 mb-0 whitespace-pre-wrap"
          style={{
            fontSize: 20,
            lineHeight: 2,
            fontWeight: 500,
            fontFamily: "var(--font-serif)",
            color: "oklch(0.22 0.015 50 / 0.92)",
          }}
        >
          {summary || (busy ? "玄机正在落笔..." : "（暂无）")}
          {busy && summary && (
            <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-accent align-middle" />
          )}
        </pre>
      </div>
    </div>
  )
}
