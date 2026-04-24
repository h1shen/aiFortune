"use client"

import { useEffect, useRef, useState } from "react"

const STEPS = [
  { k: "paper", label: "铺纸", sub: "Unfurling the scroll" },
  { k: "ink", label: "润墨", sub: "Grinding the ink" },
  { k: "bazi", label: "推八字", sub: "Casting the pillars" },
  { k: "dayun", label: "排大运", sub: "Aligning the fortune arc" },
  { k: "qian", label: "成签", sub: "Sealing the verses" },
] as const

const STEP_DURATIONS = [400, 420, 460, 440, 380]

export function ResultLoadingOverlay({
  chartReady,
  onDone,
}: {
  chartReady: boolean
  onDone: () => void
}) {
  const [stepIdx, setStepIdx] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [finishedAnim, setFinishedAnim] = useState(false)

  // Latest onDone via ref — avoids retriggering the fade-out effect when the
  // parent re-renders (e.g. reading-SSE chunks) and passes a new callback.
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  // One-shot fade gate. Using a ref (not `leaving` state) in the deps avoids a
  // self-induced cleanup: if `leaving` were in the deps, setting it inside the
  // effect would retrigger cleanup and cancel the pending onDone timeout.
  const fadeStartedRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    let acc = 0
    const timers = STEPS.map((_, i) => {
      acc += STEP_DURATIONS[i]
      return window.setTimeout(() => {
        if (cancelled) return
        if (i < STEPS.length - 1) setStepIdx(i + 1)
        else setFinishedAnim(true)
      }, acc)
    })
    return () => {
      cancelled = true
      timers.forEach((id) => window.clearTimeout(id))
    }
  }, [])

  useEffect(() => {
    if (!finishedAnim || !chartReady) return
    if (fadeStartedRef.current) return
    fadeStartedRef.current = true
    setLeaving(true)
    const t = window.setTimeout(() => onDoneRef.current(), 650)
    return () => window.clearTimeout(t)
  }, [finishedAnim, chartReady])

  const progress = ((stepIdx + 1) / STEPS.length) * 100

  return (
    <div
      aria-live="polite"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background:
          "radial-gradient(ellipse at 50% 40%, oklch(0.97 0.015 82), oklch(0.93 0.025 78) 70%, oklch(0.88 0.03 75) 100%)",
        display: "grid",
        placeItems: "center",
        opacity: leaving ? 0 : 1,
        transform: leaving ? "scale(1.04)" : "scale(1)",
        filter: leaving ? "blur(8px)" : "blur(0)",
        transition:
          "opacity .55s ease, transform .55s ease, filter .55s ease",
        pointerEvents: leaving ? "none" : "auto",
        fontFamily: "var(--font-serif)",
        color: "var(--foreground)",
      }}
    >
      <InkDrops />

      <div
        style={{
          position: "relative",
          width: 520,
          maxWidth: "calc(100% - 48px)",
          textAlign: "center",
        }}
      >
        <div style={{ position: "relative", width: 130, height: 130, margin: "0 auto 26px" }}>
          <svg viewBox="0 0 130 130" style={{ position: "absolute", inset: 0 }}>
            <g style={{ transformOrigin: "65px 65px", animation: "resultSpinSlow 8s linear infinite" }}>
              <circle
                cx="65"
                cy="65"
                r="60"
                fill="none"
                stroke="oklch(0.52 0.17 28 / 0.5)"
                strokeWidth="1"
                strokeDasharray="3 5"
              />
              <circle
                cx="65"
                cy="65"
                r="55"
                fill="none"
                stroke="oklch(0.52 0.17 28 / 0.25)"
                strokeWidth="0.8"
              />
            </g>
            <g style={{ transformOrigin: "65px 65px", animation: "resultSpinSlowRev 6s linear infinite" }}>
              <circle
                cx="65"
                cy="65"
                r="46"
                fill="oklch(0.52 0.17 28 / 0.08)"
                stroke="oklch(0.52 0.17 28 / 0.6)"
                strokeWidth="1.5"
              />
              {Array.from({ length: 8 }).map((_, i) => {
                const a = (i / 8) * Math.PI * 2
                const x1 = 65 + Math.cos(a) * 38
                const y1 = 65 + Math.sin(a) * 38
                const x2 = 65 + Math.cos(a) * 46
                const y2 = 65 + Math.sin(a) * 46
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="oklch(0.52 0.17 28 / 0.7)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                )
              })}
            </g>
            <text
              x="65"
              y="75"
              textAnchor="middle"
              fontSize="30"
              fontWeight="700"
              fill="var(--destructive)"
              fontFamily="var(--font-serif)"
              style={{ animation: "resultSeal 2.2s ease-in-out infinite" }}
            >
              命
            </text>
          </svg>
        </div>

        <div
          style={{
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: "0.35em",
            marginLeft: "0.35em",
            marginBottom: 6,
          }}
        >
          起 卦 中
        </div>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.45em",
            color: "var(--muted-foreground)",
            textTransform: "uppercase",
            marginBottom: 28,
          }}
        >
          Casting Your Fortune
        </div>

        <div
          style={{
            position: "relative",
            height: 2,
            background: "oklch(0.88 0.015 75 / 0.6)",
            borderRadius: 2,
            overflow: "hidden",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "0 auto 0 0",
              width: `${progress}%`,
              background: "linear-gradient(90deg, var(--destructive), oklch(0.72 0.12 75))",
              transition: "width .45s cubic-bezier(.4,.1,.3,1)",
            }}
          />
        </div>

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 8,
          }}
        >
          {STEPS.map((s, i) => {
            const done = i < stepIdx
            const active = i === stepIdx
            return (
              <li
                key={s.k}
                style={{
                  textAlign: "center",
                  opacity: done ? 0.55 : active ? 1 : 0.35,
                  transition: "opacity .35s",
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    margin: "0 auto 8px",
                    background: active
                      ? "var(--destructive)"
                      : done
                        ? "oklch(0.72 0.12 75)"
                        : "oklch(0.88 0.015 75)",
                    boxShadow: active ? "0 0 0 5px oklch(0.52 0.17 28 / 0.15)" : "none",
                    animation: active ? "resultPulseDot 1s ease-in-out infinite" : "none",
                    transition: "background .3s, box-shadow .3s",
                  }}
                />
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: active ? 600 : 500,
                    color: active ? "var(--foreground)" : "oklch(0.45 0.02 60)",
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    letterSpacing: "0.15em",
                    color: "var(--muted-foreground)",
                    textTransform: "uppercase",
                    marginTop: 3,
                  }}
                >
                  {s.sub}
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 48,
          fontSize: 10,
          letterSpacing: "0.3em",
          color: "oklch(0.55 0.02 60 / 0.7)",
        }}
      >
        知 命 · KEYMIND
      </div>
      <div
        style={{
          position: "absolute",
          top: 40,
          right: 48,
          fontSize: 10,
          letterSpacing: "0.3em",
          color: "oklch(0.55 0.02 60 / 0.7)",
        }}
      >
        天  干  地  支
      </div>

      <style>{`
        @keyframes resultSpinSlow    { to { transform: rotate(360deg); } }
        @keyframes resultSpinSlowRev { to { transform: rotate(-360deg); } }
        @keyframes resultSeal {
          0%,100% { opacity: .85; transform: translateY(0) scale(1); }
          50%     { opacity: 1;   transform: translateY(-1px) scale(1.04); }
        }
        @keyframes resultPulseDot {
          0%,100% { transform: scale(1);   box-shadow: 0 0 0 5px oklch(0.52 0.17 28 / 0.15); }
          50%     { transform: scale(1.3); box-shadow: 0 0 0 9px oklch(0.52 0.17 28 / 0.05); }
        }
        @keyframes resultInkSpread {
          0%   { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.2); opacity: 1;   }
        }
      `}</style>
    </div>
  )
}

function InkDrops() {
  const drops = [
    { top: "12%", left: "18%", size: 180, delay: "0s", color: "oklch(0.24 0.02 260 / 0.08)" },
    { top: "62%", left: "78%", size: 240, delay: "1.2s", color: "oklch(0.52 0.17 28 / 0.08)" },
    { top: "78%", left: "22%", size: 200, delay: "0.6s", color: "oklch(0.72 0.12 75 / 0.1)" },
  ]
  return (
    <>
      {drops.map((d, i) => (
        <div
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            top: d.top,
            left: d.left,
            width: d.size,
            height: d.size,
            borderRadius: "50%",
            background: d.color,
            filter: "blur(40px)",
            animation: `resultInkSpread 4s ease-in-out ${d.delay} infinite alternate`,
          }}
        />
      ))}
    </>
  )
}
