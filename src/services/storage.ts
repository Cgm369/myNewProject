import type { AiChatHistory, UserLog, UserSettingsRecord } from '@/types'

const STORAGE_PREFIX = 'geeklearn'
const LOCAL_USER_SCOPE = 'local-user'

const settingsKey = (scope: string) => `${STORAGE_PREFIX}:settings:${scope}`
const logsKey = (scope: string) => `${STORAGE_PREFIX}:logs:${scope}`
const chatsKey = (scope: string) => `${STORAGE_PREFIX}:chats:${scope}`

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readStorageValue<T>(key: string, fallback: T) {
  if (!canUseStorage()) {
    return fallback
  }

  try {
    const rawValue = window.localStorage.getItem(key)
    return rawValue ? (JSON.parse(rawValue) as T) : fallback
  } catch {
    return fallback
  }
}

function writeStorageValue<T>(key: string, value: T) {
  if (!canUseStorage()) {
    return
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    return
  }
}

export function resolveUserScope(userId?: string | null) {
  return userId ?? LOCAL_USER_SCOPE
}

export function readLocalUserSettings(scope: string) {
  return readStorageValue<UserSettingsRecord | null>(settingsKey(scope), null)
}

export function writeLocalUserSettings(scope: string, settings: UserSettingsRecord) {
  writeStorageValue(settingsKey(scope), settings)
}

export function readLocalUserLogs(scope: string) {
  return readStorageValue<UserLog[]>(logsKey(scope), [])
}

export function writeLocalUserLogs(scope: string, logs: UserLog[]) {
  writeStorageValue(logsKey(scope), logs)
}

export function readLocalChatHistory(scope: string) {
  return readStorageValue<AiChatHistory[]>(chatsKey(scope), [])
}

export function writeLocalChatHistory(scope: string, history: AiChatHistory[]) {
  writeStorageValue(chatsKey(scope), history)
}
