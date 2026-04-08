import type { SupabaseClient } from '@supabase/supabase-js'
import { Category, type ContributionPoint, type DashboardMetric, type DashboardSummary, type UserLog } from '@/types'
import { listUserLogs } from '@/services/logs'

function getLocalDateKey(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getRangeStart(date: Date, days: number) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  result.setDate(result.getDate() - days)
  return result
}

function roundHours(minutes: number) {
  return Math.round((minutes / 60) * 10) / 10
}

function formatPercentChange(currentValue: number, previousValue: number) {
  if (currentValue === 0 && previousValue === 0) {
    return '本周暂无新增'
  }

  if (previousValue === 0) {
    return '本周刚开始积累'
  }

  const percentage = Math.round(((currentValue - previousValue) / previousValue) * 100)

  if (percentage === 0) {
    return '与上周持平'
  }

  return `${percentage > 0 ? '+' : ''}${percentage}% 较上周`
}

function buildFocusTrend(logs: UserLog[]) {
  const today = new Date()
  const groupedMinutes = new Map<string, number>()

  for (const log of logs) {
    groupedMinutes.set(
      log.recordDate,
      (groupedMinutes.get(log.recordDate) ?? 0) + log.durationMinutes
    )
  }

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - index))
    const key = getLocalDateKey(date)
    const minutes = groupedMinutes.get(key) ?? 0

    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      hours: roundHours(minutes),
    }
  })
}

function toContributionLevel(minutes: number): ContributionPoint['level'] {
  if (minutes <= 0) {
    return 0
  }

  if (minutes < 30) {
    return 1
  }

  if (minutes < 60) {
    return 2
  }

  if (minutes < 120) {
    return 3
  }

  return 4
}

function buildContribution(logs: UserLog[]) {
  const today = new Date()
  const groupedMinutes = new Map<string, number>()

  for (const log of logs) {
    groupedMinutes.set(
      log.recordDate,
      (groupedMinutes.get(log.recordDate) ?? 0) + log.durationMinutes
    )
  }

  return Array.from({ length: 366 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (365 - index))
    const key = getLocalDateKey(date)
    const minutes = groupedMinutes.get(key) ?? 0

    return {
      date: key,
      count: minutes,
      level: toContributionLevel(minutes),
    }
  })
}

function getCurrentStreak(logs: UserLog[]) {
  const uniqueDays = new Set(logs.map((log) => log.recordDate))
  let streak = 0
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)

  while (uniqueDays.has(getLocalDateKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

function buildMetrics(logs: UserLog[]) {
  const now = new Date()
  const weekStart = getRangeStart(now, 6)
  const previousWeekStart = getRangeStart(now, 13)
  const previousWeekEnd = getRangeStart(now, 7)

  let totalMinutes = 0
  let currentWeekMinutes = 0
  let previousWeekMinutes = 0
  let algoSessions = 0
  let languageSessions = 0
  let currentWeekAlgoSessions = 0
  let currentWeekLanguageSessions = 0

  for (const log of logs) {
    const recordTime = new Date(`${log.recordDate}T00:00:00`).getTime()
    totalMinutes += log.durationMinutes

    if (log.category === Category.ALGO) {
      algoSessions += 1
    } else {
      languageSessions += 1
    }

    if (recordTime >= weekStart.getTime()) {
      currentWeekMinutes += log.durationMinutes

      if (log.category === Category.ALGO) {
        currentWeekAlgoSessions += 1
      } else {
        currentWeekLanguageSessions += 1
      }
    }

    if (
      recordTime >= previousWeekStart.getTime() &&
      recordTime < previousWeekEnd.getTime()
    ) {
      previousWeekMinutes += log.durationMinutes
    }
  }

  const metrics: DashboardMetric[] = [
    {
      key: 'algo',
      title: '算法打卡',
      value: algoSessions,
      change: `本周 ${currentWeekAlgoSessions} 次`,
      color: '#a855f7',
    },
    {
      key: 'language',
      title: '语言打卡',
      value: languageSessions,
      change: `本周 ${currentWeekLanguageSessions} 次`,
      color: '#22c55e',
    },
    {
      key: 'focus',
      title: '专注总计',
      value: `${roundHours(totalMinutes)}h`,
      change: formatPercentChange(currentWeekMinutes, previousWeekMinutes),
      color: '#f59e0b',
    },
  ]

  return {
    metrics,
    totalMinutes,
    currentWeekMinutes,
    streak: getCurrentStreak(logs),
  }
}

function buildDescription(currentWeekMinutes: number, streak: number) {
  if (currentWeekMinutes === 0) {
    return '还没有学习记录，先补一条今天的打卡，仪表盘就会开始生成真实趋势。'
  }

  const hours = roundHours(currentWeekMinutes)

  if (streak > 1) {
    return `本周累计专注 ${hours} 小时，当前已连续打卡 ${streak} 天，继续保持这个节奏。`
  }

  return `本周累计专注 ${hours} 小时，已经开始形成稳定节奏，下一步可以继续补齐连续打卡。`
}

export async function getDashboardSummary(
  client: SupabaseClient | null,
  userId?: string | null
): Promise<DashboardSummary> {
  const logs = await listUserLogs(client, userId)
  const focusTrend = buildFocusTrend(logs)
  const contribution = buildContribution(logs)
  const { metrics, currentWeekMinutes, streak } = buildMetrics(logs)

  return {
    focusTrend,
    contribution,
    metrics,
    description: buildDescription(currentWeekMinutes, streak),
    streak,
  }
}
