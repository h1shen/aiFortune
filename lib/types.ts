export type Gender = "male" | "female"
export type CalendarType = "solar" | "lunar"
export type ChatMode = "reading" | "laiyi" | "qa" | "reading_section"
export type ReadingSectionKey =
  | "personality"
  | "framework"
  | "dayun"
  | "elements"
  | "keydates"
  | "summary"

export interface Location {
  province?: string
  city?: string
  longitude?: number
}

export interface CalculateRequest {
  name?: string
  gender: Gender
  calendarType: CalendarType
  birthDate: string // YYYY-MM-DD
  birthHour: number // 0-23
  birthMinute?: number
  isLeapMonth?: boolean
  location: Location
}

export interface Pillar {
  stem: string
  branch: string
  ganzhi: string
  tenGod: string
  hiddenStems: string[]
  element: string
  branchElement: string
}

export interface DayMaster {
  stem: string
  element: string
  yinyang: string
}

export interface WangShuai {
  level: string
  score: number
}

export interface DaYun {
  ganzhi: string
  startAge: number
  startYear: number
  endYear: number
  tenGod: string
}

export interface LifeCandle {
  ganzhi: string
  startYear: number | null
  endYear: number | null
  startAge: number | null
  tenGod: string
  state: "past" | "current" | "future"
  open: number
  close: number
  high: number
  low: number
  up: boolean
  score: number
  drivers: string[]
}

export interface Chart {
  chartId: string
  name: string
  gender: Gender
  inputDate: string
  inputHour: number
  calendarType: CalendarType
  solarDate: string
  lunarDate: string
  trueSolarTime: string
  locationLongitude: number | null
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar }
  dayMaster: DayMaster
  wangshuai: WangShuai
  geju: string
  yongshen: string[]
  jishen: string[]
  fiveElements: Record<"金" | "木" | "水" | "火" | "土", number>
  dayun: DaYun[]
  currentDayun: DaYun | null
  currentYear: number
  currentLiunian: string
  lifeCurve: LifeCandle[]
}

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export interface ChatRequest {
  chartId: string
  mode: ChatMode
  section?: ReadingSectionKey
  messages?: ChatMessage[]
}
