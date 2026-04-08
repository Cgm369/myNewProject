import type { SupabaseClient } from '@supabase/supabase-js'
import { getDashboardSummary } from '@/services/dashboard'
import { listUserLogs } from '@/services/logs'
import { getUserSettings } from '@/services/profile'
import { readLocalChatHistory, resolveUserScope, writeLocalChatHistory } from '@/services/storage'
import type { AiChatHistory, CopilotMessage } from '@/types'

const GREETING_MESSAGE =
  '你好！我是 GeekLearn AI 助教 🤖\n\n我可以帮你解答算法问题、制定学习计划、分析你的学习数据。有什么想问的？'

const copilotApiUrl = import.meta.env.VITE_COPILOT_API_URL

type ChatHistoryRow = {
  id: string
  user_id: string
  user_prompt: string
  ai_response: string
  created_at: string | null
}

function toConversation(history: AiChatHistory[]) {
  const messages: CopilotMessage[] = [{ role: 'ai', content: GREETING_MESSAGE }]

  for (const item of history) {
    messages.push({ role: 'user', content: item.userPrompt })
    messages.push({ role: 'ai', content: item.aiResponse })
  }

  return messages
}

function createHistoryRecord(userId: string, prompt: string, response: string): AiChatHistory {
  return {
    id: crypto.randomUUID(),
    userId,
    userPrompt: prompt,
    aiResponse: response,
    createdAt: new Date().toISOString(),
  }
}

function mapHistoryRow(row: ChatHistoryRow): AiChatHistory {
  return {
    id: row.id,
    userId: row.user_id,
    userPrompt: row.user_prompt,
    aiResponse: row.ai_response,
    createdAt: row.created_at ?? new Date().toISOString(),
  }
}

function trimHistory(history: AiChatHistory[]) {
  return [...history]
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
    .slice(-8)
}

function buildFallbackResponse(
  prompt: string,
  context: {
    streak: number
    metricsSummary: string
    settingsSummary: string
    recentLogsSummary: string
  }
) {
  const normalizedPrompt = prompt.toLowerCase()

  if (normalizedPrompt.includes('计划') || normalizedPrompt.includes('安排')) {
    return `我已经结合你的当前状态做了一个简版建议：\n\n${context.settingsSummary}\n${context.metricsSummary}\n\n建议你今天先完成一条算法打卡，再补一段语言学习，把连续性拉起来。`
  }

  if (normalizedPrompt.includes('总结') || normalizedPrompt.includes('复盘') || normalizedPrompt.includes('数据')) {
    return `这是你的最近学习摘要：\n\n${context.metricsSummary}\n${context.recentLogsSummary}\n\n如果你愿意，我还可以继续帮你拆成“今天做什么”和“本周补什么”。`
  }

  if (normalizedPrompt.includes('算法') || normalizedPrompt.includes('代码')) {
    return `先给你一个更适合当前节奏的建议：\n\n保持每天至少一次算法打卡，优先选择 30-60 分钟能完成的小题，做完后立刻写一句复盘。\n\n${context.metricsSummary}`
  }

  return `我已经读到你当前的学习状态：\n\n${context.settingsSummary}\n${context.metricsSummary}\n${context.recentLogsSummary}\n\n你可以继续问我“帮我安排今天的学习计划”或“总结一下我最近的状态”。`
}

async function requestRemoteReply(payload: {
  prompt: string
  settingsSummary: string
  metricsSummary: string
  recentLogsSummary: string
}) {
  if (!copilotApiUrl) {
    return null
  }

  try {
    const response = await fetch(copilotApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as { reply?: string }
    return data.reply?.trim() ? data.reply : null
  } catch {
    return null
  }
}

export async function loadCopilotMessages(client: SupabaseClient | null, userId?: string | null) {
  const scope = resolveUserScope(userId)
  const localHistory = trimHistory(readLocalChatHistory(scope))

  if (!client || !userId) {
    return toConversation(localHistory)
  }

  try {
    const { data, error } = await client
      .from('ai_chat_histories')
      .select('id, user_id, user_prompt, ai_response, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(8)
      .returns<ChatHistoryRow[]>()

    if (error) {
      throw error
    }

    const history = trimHistory((data ?? []).map(mapHistoryRow))
    writeLocalChatHistory(scope, history)
    return toConversation(history)
  } catch {
    return toConversation(localHistory)
  }
}

export async function saveCopilotExchange(
  client: SupabaseClient | null,
  userId: string | null | undefined,
  prompt: string,
  response: string
) {
  const scope = resolveUserScope(userId)
  const localHistory = trimHistory([
    ...readLocalChatHistory(scope),
    createHistoryRecord(scope, prompt, response),
  ])

  writeLocalChatHistory(scope, localHistory)

  if (!client || !userId) {
    return localHistory
  }

  try {
    await client.from('ai_chat_histories').insert({
      user_id: userId,
      user_prompt: prompt,
      ai_response: response,
    })
    return localHistory
  } catch {
    return localHistory
  }
}

export async function generateCopilotReply(
  client: SupabaseClient | null,
  userId: string | null | undefined,
  prompt: string
) {
  const [settings, summary, logs] = await Promise.all([
    getUserSettings(client, userId),
    getDashboardSummary(client, userId),
    listUserLogs(client, userId, { limit: 3 }),
  ])

  const settingsSummary = `你的每日目标是算法 ${settings.dailyAlgo} 题、单词 ${settings.dailyWords} 个，AI 风格偏好是「${settings.aiPersonality}」。`
  const metricsSummary = `当前累计算法打卡 ${summary.metrics[0]?.value ?? 0} 次，语言打卡 ${summary.metrics[1]?.value ?? 0} 次，连续打卡 ${summary.streak} 天。`
  const recentLogsSummary =
    logs.length > 0
      ? `最近记录：${logs
          .map((log) => `${log.recordDate} ${log.category} ${log.durationMinutes} 分钟`)
          .join('；')}`
      : '最近还没有新的学习记录。'

  const remoteReply = await requestRemoteReply({
    prompt,
    settingsSummary,
    metricsSummary,
    recentLogsSummary,
  })

  return (
    remoteReply ??
    buildFallbackResponse(prompt, {
      streak: summary.streak,
      settingsSummary,
      metricsSummary,
      recentLogsSummary,
    })
  )
}
