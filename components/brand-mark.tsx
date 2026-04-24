import { cn } from "@/lib/utils"

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <path d="M 72 23 A 34 34 0 1 0 75 76" strokeWidth="5" />
        <path d="M 75 76 A 34 34 0 0 0 80 68" strokeWidth="2.5" opacity="0.55" />
      </g>
      <circle cx="82" cy="30" r="4" className="fill-accent" />
    </svg>
  )
}
