"use client"

import { useState } from "react"

export function EasterEggVideo() {
  const [open, setOpen] = useState(false)
  const [playing, setPlaying] = useState(false)

  return (
    <section
      className="easter-egg-video-section"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
      }}
    >
      {/* 分隔装饰 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          color: "oklch(0.55 0.02 60 / 0.5)",
        }}
      >
        <div style={{ width: 80, height: 1, background: "currentColor" }} />
        <span
          className="font-serif"
          style={{ fontSize: 12, letterSpacing: "0.35em" }}
        >
          · 终 ·
        </span>
        <div style={{ width: 80, height: 1, background: "currentColor" }} />
      </div>

      {/* 触发按钮 */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="font-serif"
        style={{
          position: "relative",
          padding: "16px 36px",
          fontSize: 15,
          letterSpacing: "0.2em",
          cursor: "pointer",
          border: "1.5px solid oklch(0.72 0.12 75 / 0.55)",
          borderRadius: 999,
          background: open
            ? "oklch(0.72 0.12 75 / 0.18)"
            : "linear-gradient(135deg, oklch(0.975 0.008 85), oklch(0.96 0.012 82))",
          color: "var(--foreground)",
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          boxShadow: open
            ? "inset 0 1px 3px oklch(0.22 0.015 50 / 0.08)"
            : "0 10px 30px -15px oklch(0.22 0.015 50 / 0.3)",
          transition: "all .25s",
        }}
      >
        <span
          aria-hidden
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "var(--destructive)",
            boxShadow: "0 0 0 4px oklch(0.52 0.17 28 / 0.18)",
            animation: open ? "none" : "eggPulse 2.2s ease-in-out infinite",
          }}
        />
        一生的故事
      </button>

      {/* 提示文字 */}
      <div
        className="font-serif"
        style={{
          fontSize: 12,
          color: "var(--muted-foreground)",
          letterSpacing: "0.15em",
        }}
      >
        {open ? "如露亦如电" : "如露亦如电"}
      </div>

      {/* 展开的影片占位 */}
      {open && (
        <div
          style={{
            width: "100%",
            maxWidth: 960,
            marginTop: 8,
            animation: "eggReveal .55s cubic-bezier(.2,.7,.3,1) both",
          }}
        >
          <div
            role={playing ? undefined : "button"}
            tabIndex={playing ? undefined : 0}
            onClick={playing ? undefined : () => setPlaying(true)}
            onKeyDown={
              playing
                ? undefined
                : (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setPlaying(true)
                    }
                  }
            }
            style={{
              position: "relative",
              aspectRatio: "16 / 9",
              borderRadius: 8,
              overflow: "hidden",
              border: "1px solid oklch(0.72 0.12 75 / 0.35)",
              boxShadow: "0 40px 80px -30px oklch(0.22 0.015 50 / 0.55)",
              background:
                "radial-gradient(circle at 30% 30%, oklch(0.32 0.04 50 / 0.6), transparent 55%), radial-gradient(circle at 75% 70%, oklch(0.52 0.17 28 / 0.4), transparent 55%), linear-gradient(135deg, oklch(0.22 0.015 50), oklch(0.18 0.02 260))",
              display: "grid",
              placeItems: "center",
              cursor: playing ? "default" : "pointer",
            }}
          >
            {/* 纸纹 / 扫描线 */}
            {!playing && (
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent 0 2px, oklch(0.95 0.012 82 / 0.03) 2px 3px), repeating-linear-gradient(90deg, transparent 0 2px, oklch(0.95 0.012 82 / 0.025) 2px 3px)",
                }}
              />
            )}

            {playing ? (
              <video
                src="/videos/mingzhiying.mp4"
                poster="/videos/mingzhiying-poster.jpg"
                controls
                autoPlay
                playsInline
                preload="auto"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  background: "black",
                }}
              />
            ) : (
              /* 中央占位 */
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 20,
                  color: "oklch(0.96 0.012 82)",
                }}
              >
                <div
                  className="egg-play-circle"
                  style={{
                    width: 86,
                    height: 86,
                    borderRadius: "50%",
                    border: "2px solid oklch(0.72 0.12 75 / 0.8)",
                    display: "grid",
                    placeItems: "center",
                    background: "oklch(0.22 0.015 50 / 0.5)",
                    backdropFilter: "blur(4px)",
                    WebkitBackdropFilter: "blur(4px)",
                    transition: "transform .2s ease, filter .2s ease",
                  }}
                >
                  <svg
                    width="28"
                    height="32"
                    viewBox="0 0 28 32"
                    aria-hidden
                  >
                    <polygon
                      points="4,2 26,16 4,30"
                      fill="oklch(0.72 0.12 75)"
                    />
                  </svg>
                </div>
                <div
                  className="font-serif"
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    letterSpacing: "0.25em",
                    textAlign: "center",
                  }}
                >
                  命之影 · 片长三分
                </div>
                <div
                  className="font-serif"
                  style={{
                    fontSize: 12,
                    letterSpacing: "0.3em",
                    color: "oklch(0.85 0.02 80 / 0.7)",
                    textTransform: "uppercase",
                  }}
                >
                  Video Placeholder · Coming Soon
                </div>
              </div>
            )}

            {/* 四角 L 形装饰 */}
            {(
              [
                { top: 12, left: 12 },
                { top: 12, right: 12 },
                { bottom: 12, left: 12 },
                { bottom: 12, right: 12 },
              ] as Array<{
                top?: number
                bottom?: number
                left?: number
                right?: number
              }>
            ).map((pos, i) => (
              <div
                key={i}
                aria-hidden
                style={{
                  position: "absolute",
                  width: 22,
                  height: 22,
                  borderColor: "oklch(0.72 0.12 75 / 0.8)",
                  borderStyle: "solid",
                  borderWidth: 0,
                  borderTopWidth: pos.top != null ? 1.5 : 0,
                  borderBottomWidth: pos.bottom != null ? 1.5 : 0,
                  borderLeftWidth: pos.left != null ? 1.5 : 0,
                  borderRightWidth: pos.right != null ? 1.5 : 0,
                  pointerEvents: "none",
                  zIndex: 2,
                  ...pos,
                }}
              />
            ))}
          </div>

          {/* 底部说明 + 署名 */}
          <div
            className="font-serif"
            style={{
              marginTop: 14,
              textAlign: "center",
              fontSize: 13,
              color: "var(--muted-foreground)",
              lineHeight: 1.8,
            }}
          >
            专属于你的故事
            <br />
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.2em",
                color: "oklch(0.55 0.02 60)",
              }}
            >
              ——知命 KeyMind 敬上
            </span>
          </div>
        </div>
      )}

      <style>{`
        .easter-egg-video-section {
          padding: 40px 20px 60px;
        }
        @media (min-width: 768px) {
          .easter-egg-video-section {
            padding: 40px 72px 90px;
          }
        }
        @keyframes eggPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 4px oklch(0.52 0.17 28 / 0.18); }
          50%      { transform: scale(1.15); box-shadow: 0 0 0 8px oklch(0.52 0.17 28 / 0.08); }
        }
        .easter-egg-video-section [role="button"]:hover .egg-play-circle {
          transform: scale(1.06);
          filter: brightness(1.1);
        }
        @keyframes eggReveal {
          0%   { opacity: 0; transform: translateY(-12px) scale(0.96); filter: blur(6px); }
          100% { opacity: 1; transform: translateY(0)     scale(1);    filter: blur(0); }
        }
      `}</style>
    </section>
  )
}
