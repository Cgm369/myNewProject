import type { SupabaseClient } from '@supabase/supabase-js'
import type { AIPersonality, UserSettings, UserSettingsRecord } from '@/types'
import { readLocalUserSettings, resolveUserScope, writeLocalUserSettings } from '@/services/storage'

type UserSettingsRow = {
  user_id: string
  daily_algo: number | null
  daily_words: number | null
  weekend_rest: boolean | null
  ai_personality: AIPersonality | null
  updated_at: string | null
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  dailyAlgo: 3,
  dailyWords: 50,
  weekendRest: false,
  aiPersonality: 'encouraging',
}

function normalizeSettings(
  userId: string,
  input?: Partial<UserSettings> & { updatedAt?: string | null }
): UserSettingsRecord {
  return {
    userId,
    dailyAlgo: input?.dailyAlgo ?? DEFAULT_USER_SETTINGS.dailyAlgo,
    dailyWords: input?.dailyWords ?? DEFAULT_USER_SETTINGS.dailyWords,
    weekendRest: input?.weekendRest ?? DEFAULT_USER_SETTINGS.weekendRest,
    aiPersonality: input?.aiPersonality ?? DEFAULT_USER_SETTINGS.aiPersonality,
    updatedAt: input?.updatedAt ?? new Date().toISOString(),
  }
}

function mapSettingsRow(row: UserSettingsRow): UserSettingsRecord {
  return normalizeSettings(row.user_id, {
    dailyAlgo: row.daily_algo ?? undefined,
    dailyWords: row.daily_words ?? undefined,
    weekendRest: row.weekend_rest ?? undefined,
    aiPersonality: row.ai_personality ?? undefined,
    updatedAt: row.updated_at,
  })
}

export async function getUserSettings(client: SupabaseClient | null, userId?: string | null) {
  const scope = resolveUserScope(userId)
  const localSettings = readLocalUserSettings(scope)
  const fallbackSettings = localSettings ?? normalizeSettings(scope)

  if (!client || !userId) {
    return fallbackSettings
  }

  try {
    const { data, error } = await client
      .from('user_settings')
      .select('user_id, daily_algo, daily_words, weekend_rest, ai_personality, updated_at')
      .eq('user_id', userId)
      .maybeSingle<UserSettingsRow>()

    if (error) {
      throw error
    }

    if (!data) {
      return fallbackSettings
    }

    const settings = mapSettingsRow(data)
    writeLocalUserSettings(scope, settings)
    return settings
  } catch {
    return fallbackSettings
  }
}

export async function saveUserSettings(
  client: SupabaseClient | null,
  userId: string | null | undefined,
  settings: UserSettings
) {
  const scope = resolveUserScope(userId)
  const localRecord = normalizeSettings(scope, settings)

  writeLocalUserSettings(scope, localRecord)

  if (!client || !userId) {
    return localRecord
  }

  try {
    const { data, error } = await client
      .from('user_settings')
      .upsert(
        {
          user_id: userId,
          daily_algo: settings.dailyAlgo,
          daily_words: settings.dailyWords,
          weekend_rest: settings.weekendRest,
          ai_personality: settings.aiPersonality,
          updated_at: localRecord.updatedAt,
        },
        { onConflict: 'user_id' }
      )
      .select('user_id, daily_algo, daily_words, weekend_rest, ai_personality, updated_at')
      .single<UserSettingsRow>()

    if (error) {
      throw error
    }

    const savedRecord = mapSettingsRow(data)
    writeLocalUserSettings(scope, savedRecord)
    return savedRecord
  } catch {
    return localRecord
  }
}
