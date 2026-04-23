"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, MapPin, Sparkles } from "lucide-react"

const timeOptions = [
  { value: "子", label: "子时 · 23:00 – 01:00" },
  { value: "丑", label: "丑时 · 01:00 – 03:00" },
  { value: "寅", label: "寅时 · 03:00 – 05:00" },
  { value: "卯", label: "卯时 · 05:00 – 07:00" },
  { value: "辰", label: "辰时 · 07:00 – 09:00" },
  { value: "巳", label: "巳时 · 09:00 – 11:00" },
  { value: "午", label: "午时 · 11:00 – 13:00" },
  { value: "未", label: "未时 · 13:00 – 15:00" },
  { value: "申", label: "申时 · 15:00 – 17:00" },
  { value: "酉", label: "酉时 · 17:00 – 19:00" },
  { value: "戌", label: "戌时 · 19:00 – 21:00" },
  { value: "亥", label: "亥时 · 21:00 – 23:00" },
]

export function BaziForm() {
  const [calendarType, setCalendarType] = useState<"solar" | "lunar">("solar")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("[v0] Bazi form submitted")
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="paper-texture relative rounded-md border border-border bg-card/95 p-6 shadow-[0_30px_60px_-30px_rgba(20,25,45,0.35)] backdrop-blur-sm md:p-8"
    >
      <div
        aria-hidden
        className="absolute -left-px -top-px h-8 w-8 border-l-2 border-t-2 border-accent"
      />
      <div
        aria-hidden
        className="absolute -right-px -top-px h-8 w-8 border-r-2 border-t-2 border-accent"
      />
      <div
        aria-hidden
        className="absolute -bottom-px -left-px h-8 w-8 border-b-2 border-l-2 border-accent"
      />
      <div
        aria-hidden
        className="absolute -bottom-px -right-px h-8 w-8 border-b-2 border-r-2 border-accent"
      />

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
          <Label htmlFor="name" className="font-serif text-sm text-foreground">
            姓名
          </Label>
          <Input
            id="name"
            placeholder="请输入您的姓名"
            className="h-11 border-border bg-background/50 font-serif"
          />
        </div>

        <div className="space-y-2">
          <Label className="font-serif text-sm text-foreground">性别</Label>
          <RadioGroup defaultValue="male" className="grid grid-cols-2 gap-3">
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
          <Label htmlFor="birthdate" className="font-serif text-sm text-foreground">
            出生日期
          </Label>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="birthdate"
              type="date"
              className="h-11 border-border bg-background/50 pl-10 font-serif"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthtime" className="font-serif text-sm text-foreground">
            出生时辰
          </Label>
          <Select>
            <SelectTrigger id="birthtime" className="h-11 border-border bg-background/50 font-serif">
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
          <Label htmlFor="location" className="font-serif text-sm text-foreground">
            出生地（用于真太阳时校准）
          </Label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="location"
              placeholder="如：浙江省杭州市"
              className="h-11 border-border bg-background/50 pl-10 font-serif"
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="mt-7 h-12 w-full bg-primary font-serif text-base tracking-widest text-primary-foreground hover:bg-primary/90"
      >
        <Sparkles className="mr-2 h-4 w-4" />
        开 启 命 盘
      </Button>

      <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
        信息仅用于排盘，全程加密 · 不会存储或外泄
      </p>
    </form>
  )
}
