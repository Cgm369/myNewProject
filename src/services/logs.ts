import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreateUserLogInput, UserLog } from '@/types'
import { readLocalUserLogs, resolveUserScope, writeLocalUserLogs } from '@/services/storage'

type UserLogRow = {
  id: string
  user_id: string
  record_date: string
  category: UserLog['category']
  duration_minutes: number
  note: string | null
  created_at: string | null
}

function sortLogs(logs: UserLog[]) {
  return [...logs].sort((left, right) => {
    if (left.recordDate === right.recordDate) {
      return right.createdAt.localeCompare(left.createdAt)
    }

    return right.recordDate.localeCompare(left.recordDate)
  })
}

function mapUserLogRow(row: UserLogRow): UserLog {
  return {
    id: row.id,
    userId: row.user_id,
    recordDate: row.record_date,
    category: row.category,
    durationMinutes: row.duration_minutes,
    note: row.note ?? '',
    createdAt: row.created_at ?? new Date().toISOString(),
  }
}

function createLocalUserLogRecord(scope: string, input: CreateUserLogInput): UserLog {
  return {
    id: crypto.randomUUID(),
    userId: scope,
    recordDate: input.recordDate,
    category: input.category,
    durationMinutes: input.durationMinutes,
    note: input.note.trim(),
    createdAt: new Date().toISOString(),
  }
}

export async function listUserLogs(
  client: SupabaseClient | null,
  userId?: string | null,
  options?: { limit?: number }
) {
  const scope = resolveUserScope(userId)
  const localLogs = sortLogs(readLocalUserLogs(scope))
  const fallbackLogs = options?.limit ? localLogs.slice(0, options.limit) : localLogs

  if (!client || !userId) {
    return fallbackLogs
  }

  try {
    let query = client
      .from('user_logs')
      .select('id, user_id, record_date, category, duration_minutes, note, created_at')
      .eq('user_id', userId)
      .order('record_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query.returns<UserLogRow[]>()

    if (error) {
      throw error
    }

    const logs = sortLogs((data ?? []).map(mapUserLogRow))
    writeLocalUserLogs(scope, logs)
    return logs
  } catch {
    return fallbackLogs
  }
}

export async function createUserLog(
  client: SupabaseClient | null,
  userId: string | null | undefined,
  input: CreateUserLogInput
) {
  const scope = resolveUserScope(userId)
  const localLogs = readLocalUserLogs(scope)
  const localRecord = createLocalUserLogRecord(scope, input)

  if (!client || !userId) {
    writeLocalUserLogs(scope, sortLogs([localRecord, ...localLogs]))
    return localRecord
  }

  try {
    const { data, error } = await client
      .from('user_logs')
      .insert({
        user_id: userId,
        record_date: input.recordDate,
        category: input.category,
        duration_minutes: input.durationMinutes,
        note: input.note.trim(),
      })
      .select('id, user_id, record_date, category, duration_minutes, note, created_at')
      .single<UserLogRow>()

    if (error) {
      throw error
    }

    const savedRecord = mapUserLogRow(data)
    writeLocalUserLogs(scope, sortLogs([savedRecord, ...localLogs]))
    return savedRecord
  } catch {
    writeLocalUserLogs(scope, sortLogs([localRecord, ...localLogs]))
    return localRecord
  }
}
