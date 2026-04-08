export const Category = {
  ALGO: 'ALGO',
  EN: 'EN',
  JP: 'JP',
} as const

export type Category = (typeof Category)[keyof typeof Category]
export type AIPersonality = 'strict' | 'encouraging' | 'minimal'
export type CopilotMessageRole = 'user' | 'ai'

export interface UserLog {
  id: string
  userId: string
  recordDate: string
  category: Category
  durationMinutes: number
  note: string
  createdAt: string
}

export interface StudyNote {
  id: string
  logId: string
  markdownContent: string
  tags: string[]
  updatedAt: string
}

export interface AiChatHistory {
  id: string
  userId: string
  userPrompt: string
  aiResponse: string
  createdAt: string
}

export interface CopilotMessage {
  role: CopilotMessageRole
  content: string
}

export interface UserSettings {
  dailyAlgo: number
  dailyWords: number
  weekendRest: boolean
  aiPersonality: AIPersonality
}

export interface UserSettingsRecord extends UserSettings {
  userId: string
  updatedAt: string
}

export interface CreateUserLogInput {
  recordDate: string
  category: Category
  durationMinutes: number
  note: string
}

export interface FocusTrendPoint {
  day: string
  hours: number
}

export interface ContributionPoint {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

export interface DashboardMetric {
  key: 'algo' | 'language' | 'focus'
  title: string
  value: string | number
  change: string
  color: string
}

export interface DashboardSummary {
  focusTrend: FocusTrendPoint[]
  contribution: ContributionPoint[]
  metrics: DashboardMetric[]
  description: string
  streak: number
}
