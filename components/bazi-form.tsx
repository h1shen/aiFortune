"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Loader2, MapPin, Sparkles } from "lucide-react"
import { calculateBazi } from "@/lib/api"
import type { CalendarType, Gender } from "@/lib/types"

// 时辰 → 小时（取每个 2 小时段的中位数，子时用 00:00）
const timeOptions: { value: string; label: string; hour: number }[] = [
  { value: "子", label: "子时 · 23:00 – 01:00", hour: 0 },
  { value: "丑", label: "丑时 · 01:00 – 03:00", hour: 2 },
  { value: "寅", label: "寅时 · 03:00 – 05:00", hour: 4 },
  { value: "卯", label: "卯时 · 05:00 – 07:00", hour: 6 },
  { value: "辰", label: "辰时 · 07:00 – 09:00", hour: 8 },
  { value: "巳", label: "巳时 · 09:00 – 11:00", hour: 10 },
  { value: "午", label: "午时 · 11:00 – 13:00", hour: 12 },
  { value: "未", label: "未时 · 13:00 – 15:00", hour: 14 },
  { value: "申", label: "申时 · 15:00 – 17:00", hour: 16 },
  { value: "酉", label: "酉时 · 17:00 – 19:00", hour: 18 },
  { value: "戌", label: "戌时 · 19:00 – 21:00", hour: 20 },
  { value: "亥", label: "亥时 · 21:00 – 23:00", hour: 22 },
]

export function BaziForm() {
  const router = useRouter()
  const [calendarType, setCalendarType] = useState<CalendarType>("solar")
  const [gender, setGender] = useState<Gender>("male")
  const [name, setName] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [birthTime, setBirthTime] = useState("")
  const [location, setLocation] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) { setError("请输入姓名"); return }
    if (!birthDate) { setError("请选择出生日期"); return }
    const timeOpt = timeOptions.find((t) => t.value === birthTime)
    if (!timeOpt) { setError("请选择出生时辰"); return }

    // 尽量把用户输入解析成 省/市
    const loc = location.trim()
    let province = "", city = ""
    const match = loc.match(/^(.+?省|.+?市|.+?区)?(.+)$/)
    if (match) {
      province = (match[1] || "").replace(/省|市|区$/, "")
      city = (match[2] || "").replace(/省|市|区$/, "")
    } else {
      city = loc
    }

    setSubmitting(true)
    try {
      const chart = await calculateBazi({
        name: name.trim(),
        gender,
        calendarType,
        birthDate,
        birthHour: timeOpt.hour,
        birthMinute: 0,
        isLeapMonth: false,
        location: { province, city },
      })
      router.push(`/result?chartId=${chart.chartId}`)
    } catch (err: any) {
      setError(err?.message || "排盘失败，请稍后再试")
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="paper-texture relative rounded-md border border-border bg-card/95 p-6 shadow-[0_30px_60px_-30px_rgba(20,25,45,0.35)] backdrop-blur-sm md:p-8"
    >
      <div aria-hidden className="pointer-events-none absolute -left-px -top-px h-8 w-8 border-l-2 border-t-2 border-accent" />
      <div aria-hidden className="pointer-events-none absolute -right-px -top-px h-8 w-8 border-r-2 border-t-2 border-accent" />
      <div aria-hidden className="pointer-events-none absolute -bottom-px -left-px h-8 w-8 border-b-2 border-l-2 border-accent" />
      <div aria-hidden className="pointer-events-none absolute -bottom-px -right-px h-8 w-8 border-b-2 border-r-2 border-accent" />

      <div className="mb-1 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-foreground">排盘起运</h2>
          <p className="mt-1 text-xs text-muted-foreground">请如实填写，以确保命盘精准</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/50 font-serif text-lg text-accent">
          命
        </div>
      </div>

      <div className="my-5 ink-divider h-px w-full" />

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="font-serif text-sm text-foreground">姓名</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="请输入您的姓名"
            className="h-11 border-border bg-background/50 font-serif"
          />
        </div>

        <div className="space-y-2">
          <Label className="font-serif text-sm text-foreground">性别</Label>
          <RadioGroup value={gender} onValueChange={(v) => setGender(v as Gender)} className="grid grid-cols-2 gap-3">
            <Label
              htmlFor="male"
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-background/50 font-serif text-sm transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent/10 has-[:checked]:text-foreground"
            >
              <RadioGroupItem id="male" value="male" className="sr-only" />
              <span className="text-accent">乾</span> 男
            </Label>
            <Label
              htmlFor="female"
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-background/50 font-serif text-sm transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent/10 has-[:checked]:text-foreground"
            >
              <RadioGroupItem id="female" value="female" className="sr-only" />
              <span className="text-destructive">坤</span> 女
            </Label>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label className="font-serif text-sm text-foreground">历法</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setCalendarType("solar")}
              className={`h-11 rounded-md border font-serif text-sm transition-colors ${
                calendarType === "solar"
                  ? "border-accent bg-accent/10 text-foreground"
                  : "border-border bg-background/50 text-muted-foreground"
              }`}
            >
              阳历（公历）
            </button>
            <button
              type="button"
              onClick={() => setCalendarType("lunar")}
              className={`h-11 rounded-md border font-serif text-sm transition-colors ${
                calendarType === "lunar"
                  ? "border-accent bg-accent/10 text-foreground"
                  : "border-border bg-background/50 text-muted-foreground"
              }`}
            >
              阴历（农历）
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthdate" className="font-serif text-sm text-foreground">出生日期</Label>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="birthdate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="h-11 border-border bg-background/50 pl-10 font-serif"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthtime" className="font-serif text-sm text-foreground">出生时辰</Label>
          <Select value={birthTime} onValueChange={setBirthTime}>
            <SelectTrigger id="birthtime" className="h-11 w-full border-border bg-background/50 font-serif">
              <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="请选择出生时辰" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((t) => (
                <SelectItem key={t.value} value={t.value} className="font-serif">
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="font-serif text-sm text-foreground">出生地（用于真太阳时校准）</Label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="如：浙江省杭州市"
              className="h-11 border-border bg-background/50 pl-10 font-serif"
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 font-serif text-xs text-destructive">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={submitting}
        className="mt-7 h-12 w-full bg-primary font-serif text-base tracking-widest text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 排盘中...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            开 启 命 盘
          </>
        )}
      </Button>

      <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
        信息仅用于排盘，全程加密 · 不会存储或外泄
      </p>
    </form>
  )
}
