export const Category = {
  ALGO: 'ALGO',
  EN: 'EN',
  JP: 'JP',
} as const

export type Category = (typeof Category)[keyof typeof Category]

export interface UserLog {
  id: string
  recordDate: Date
  category: Category
  durationMinutes: number
  createdAt: Date
}

export interface StudyNote {
  id: string
  logId: string
  markdownContent: string
  tags: string[]
  updatedAt: Date
}

export interface AiChatHistory {
  id: string
  logId: string
  userPrompt: string
  aiResponse: string
  createdAt: Date
}
