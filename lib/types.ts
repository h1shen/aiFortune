export type Gender = "male" | "female"
export type CalendarType = "solar" | "lunar"
export type ChatMode = "reading" | "laiyi" | "qa"

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
  fortuneScore: number // -5 ~ +5
  fortuneLabel: string // 顺 / 平 / 阻
}

export interface LiunianScore {
  year: number
  ganzhi: string
  tenGod: string
  score: number // -8 ~ +8
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
  liunianScores: LiunianScore[]
  currentDayun: DaYun | null
  currentYear: number
  currentLiunian: string
}

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export interface ChatRequest {
  chartId: string
  mode: ChatMode
  messages?: ChatMessage[]
}
