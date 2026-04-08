import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Flame,
  Clock,
  Target,
  BookOpen,
  Bot,
  CalendarClock,
  GraduationCap,
  Heart,
  Code,
  LoaderCircle,
  Save,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useSupabase } from '@/hooks'
import { createUserLog, getUserSettings, listUserLogs, saveUserSettings, DEFAULT_USER_SETTINGS } from '@/services'
import { Category, type AIPersonality } from '@/types'

const AI_PERSONALITIES: Record<AIPersonality, { label: string; icon: React.ElementType; desc: string }> = {
  strict: { label: '严厉导师', icon: GraduationCap, desc: '直接指出问题，不废话，追求极致代码质量' },
  encouraging: { label: '鼓励夸夸', icon: Heart, desc: '每次都先肯定你的努力，再温柔给出建议' },
  minimal: { label: '极简代码', icon: Code, desc: '只给代码，最少解释，适合有经验的开发者' },
}

const CATEGORY_OPTIONS: Array<{ value: Category; label: string }> = [
  { value: Category.ALGO, label: '算法' },
  { value: Category.EN, label: '英语' },
  { value: Category.JP, label: '日语' },
]

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
}

function getTodayDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = `${now.getMonth() + 1}`.padStart(2, '0')
  const day = `${now.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function Profile() {
  const { client, userId, isSupabaseConfigured } = useSupabase()
  const [dailyAlgo, setDailyAlgo] = useState(`${DEFAULT_USER_SETTINGS.dailyAlgo}`)
  const [dailyWords, setDailyWords] = useState(`${DEFAULT_USER_SETTINGS.dailyWords}`)
  const [weekendRest, setWeekendRest] = useState(DEFAULT_USER_SETTINGS.weekendRest)
  const [aiPersonality, setAiPersonality] = useState<AIPersonality>(DEFAULT_USER_SETTINGS.aiPersonality)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [recordSaving, setRecordSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [settingsNotice, setSettingsNotice] = useState('')
  const [recordNotice, setRecordNotice] = useState('')
  const [recordDate, setRecordDate] = useState(getTodayDate())
  const [recordCategory, setRecordCategory] = useState<Category>(Category.ALGO)
  const [recordDuration, setRecordDuration] = useState('45')
  const [recordNote, setRecordNote] = useState('')
  const [recentLogs, setRecentLogs] = useState<Array<{
    id: string
    recordDate: string
    category: Category
    durationMinutes: number
    note: string
  }>>([])

  useEffect(() => {
    let cancelled = false

    const loadProfile = async () => {
      setIsLoading(true)
      const [settings, logs] = await Promise.all([
        getUserSettings(client, userId),
        listUserLogs(client, userId, { limit: 5 }),
      ])

      if (cancelled) {
        return
      }

      setDailyAlgo(`${settings.dailyAlgo}`)
      setDailyWords(`${settings.dailyWords}`)
      setWeekendRest(settings.weekendRest)
      setAiPersonality(settings.aiPersonality)
      setRecentLogs(logs)
      setIsLoading(false)
    }

    void loadProfile()

    return () => {
      cancelled = true
    }
  }, [client, userId])

  const statusText = useMemo(() => {
    if (!isSupabaseConfigured) {
      return '当前运行在本地数据模式；配置 Clerk 与 Supabase 后会自动切换到账号同步。'
    }

    if (userId) {
      return '当前配置会同步到你的登录账号，并驱动 Dashboard 与 Copilot 共享同一份数据。'
    }

    return '当前未登录，设置与打卡会先保存在本地浏览器中。'
  }, [isSupabaseConfigured, userId])

  const recentLogBars = useMemo(() => {
    const values = recentLogs
      .slice(0, 7)
      .reverse()
      .map((log) => Math.max(12, Math.min(100, Math.round((log.durationMinutes / 180) * 100))))

    return Array.from({ length: 7 }, (_, index) => values[index] ?? 12)
  }, [recentLogs])

  const totalHours = useMemo(() => {
    const totalMinutes = recentLogs.reduce((sum, log) => sum + log.durationMinutes, 0)
    return Math.round((totalMinutes / 60) * 10) / 10
  }, [recentLogs])

  const handleSaveSettings = async () => {
    const nextDailyAlgo = Number(dailyAlgo)
    const nextDailyWords = Number(dailyWords)

    if (!Number.isFinite(nextDailyAlgo) || nextDailyAlgo < 1) {
      setSettingsNotice('每日算法目标至少需要 1。')
      return
    }

    if (!Number.isFinite(nextDailyWords) || nextDailyWords < 1) {
      setSettingsNotice('每日单词目标至少需要 1。')
      return
    }

    setSettingsSaving(true)
    const savedSettings = await saveUserSettings(client, userId, {
      dailyAlgo: nextDailyAlgo,
      dailyWords: nextDailyWords,
      weekendRest,
      aiPersonality,
    })

    setDailyAlgo(`${savedSettings.dailyAlgo}`)
    setDailyWords(`${savedSettings.dailyWords}`)
    setWeekendRest(savedSettings.weekendRest)
    setAiPersonality(savedSettings.aiPersonality)
    setSettingsNotice('设置已保存，Dashboard 与 Copilot 会使用这份最新配置。')
    setSettingsSaving(false)
  }

  const handleCreateLog = async () => {
    const nextDuration = Number(recordDuration)

    if (!recordDate) {
      setRecordNotice('请选择记录日期。')
      return
    }

    if (!Number.isFinite(nextDuration) || nextDuration <= 0) {
      setRecordNotice('专注分钟数需要大于 0。')
      return
    }

    setRecordSaving(true)
    const savedLog = await createUserLog(client, userId, {
      recordDate,
      category: recordCategory,
      durationMinutes: nextDuration,
      note: recordNote,
    })

    setRecentLogs((currentLogs) => [savedLog, ...currentLogs].slice(0, 5))
    setRecordNote('')
    setRecordDuration('45')
    setRecordNotice('今日记录已写入，Dashboard 刷新后会展示新的统计。')
    setRecordSaving(false)
  }

  return (
    <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="rounded-2xl border border-white/10 dark:border-white/[0.06] bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl overflow-hidden"
      >
        <Tabs defaultValue="overview">
          <div className="border-b border-white/10 dark:border-white/[0.06] px-6 pt-6">
            <TabsList variant="line">
              <TabsTrigger value="overview">极客档案</TabsTrigger>
              <TabsTrigger value="goals">目标配置</TabsTrigger>
              <TabsTrigger value="ai">AI Copilot</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="p-6">
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/8 px-4 py-3 text-sm text-muted-foreground mb-6">
              {statusText}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8">
              <Avatar size="lg" className="size-20">
                <AvatarFallback className="text-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white font-bold">
                  G
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Geek Traveler</h2>
                <p className="text-sm text-muted-foreground mt-1">Keep coding, keep evolving.</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="gap-1">
                    <Flame className="size-3" />
                    {userId ? '账号同步中' : '本地模式'}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <BookOpen className="size-3" />
                    {aiPersonality === 'strict' ? '严厉导师' : aiPersonality === 'minimal' ? '极简代码' : '鼓励夸夸'}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator className="mb-6" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div
                whileHover={{ y: -2 }}
                className="rounded-xl border border-white/10 dark:border-white/[0.06] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-sm p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Flame className="size-5 text-orange-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">连续打卡</span>
                </div>
                <div className="text-3xl font-bold text-foreground">
                  {recentLogs.length} <span className="text-base font-normal text-muted-foreground">Entries</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  最近一条记录: {recentLogs[0]?.recordDate ?? '还没有记录'}
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                className="rounded-xl border border-white/10 dark:border-white/[0.06] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-sm p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Clock className="size-5 text-blue-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">本月专注</span>
                </div>
                <div className="text-3xl font-bold text-foreground">
                  {totalHours} <span className="text-base font-normal text-muted-foreground">Hours</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">来自最近的真实打卡记录</div>
              </motion.div>
            </div>

            <div className="mt-6 rounded-xl border border-white/10 dark:border-white/[0.06] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-sm p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">最近打卡热力</h3>
              <div className="flex items-end gap-1.5 h-16">
                {['-6', '-5', '-4', '-3', '-2', '-1', '今天'].map((day, index) => {
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-sm bg-gradient-to-t from-violet-500 to-fuchsia-500 transition-all"
                        style={{ height: `${recentLogBars[index]}%` }}
                      />
                      <span className="text-[10px] text-muted-foreground">{day}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">每日目标</h3>
                <p className="text-sm text-muted-foreground">
                  设定你每天的学习量，保持节奏感。当前页面会优先读取真实用户配置。
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/10 dark:border-white/[0.06] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-sm p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Target className="size-4 text-violet-500" />
                    <Label>每日算法题数</Label>
                  </div>
                  <Input
                    type="number"
                    value={dailyAlgo}
                    onChange={(e) => setDailyAlgo(e.target.value)}
                    min={1}
                    max={50}
                    disabled={isLoading || settingsSaving}
                  />
                  <p className="text-xs text-muted-foreground">保存后会作为算法学习建议与 Copilot 上下文。</p>
                </div>

                <div className="rounded-xl border border-white/10 dark:border-white/[0.06] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-sm p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="size-4 text-green-500" />
                    <Label>每日单词数</Label>
                  </div>
                  <Input
                    type="number"
                    value={dailyWords}
                    onChange={(e) => setDailyWords(e.target.value)}
                    min={10}
                    max={500}
                    disabled={isLoading || settingsSaving}
                  />
                  <p className="text-xs text-muted-foreground">保存后会同步到真实用户配置。</p>
                </div>
              </div>

              <Separator />

              <div className="rounded-xl border border-white/10 dark:border-white/[0.06] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-sm p-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🏖️</span>
                      <Label>周末休息模式</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">开启后，周六周日将不计入连续打卡，目标也会暂停。</p>
                  </div>
                  <Switch
                    checked={weekendRest}
                    onCheckedChange={setWeekendRest}
                    disabled={isLoading || settingsSaving}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-white/10 dark:border-white/[0.06] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-sm p-5 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">今日记录</h4>
                  <p className="text-xs text-muted-foreground">补一条最小学习记录，Dashboard 会立刻开始生成真实统计。</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>日期</Label>
                    <Input
                      type="date"
                      value={recordDate}
                      onChange={(e) => setRecordDate(e.target.value)}
                      disabled={recordSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>分类</Label>
                    <select
                      value={recordCategory}
                      onChange={(e) => setRecordCategory(e.target.value as Category)}
                      disabled={recordSaving}
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                    >
                      {CATEGORY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="bg-background text-foreground">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>专注分钟</Label>
                    <Input
                      type="number"
                      value={recordDuration}
                      onChange={(e) => setRecordDuration(e.target.value)}
                      min={5}
                      max={600}
                      disabled={recordSaving}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>备注</Label>
                  <Textarea
                    value={recordNote}
                    onChange={(e) => setRecordNote(e.target.value)}
                    placeholder="例如：刷了 2 道双指针题，复习了 30 个核心单词。"
                    disabled={recordSaving}
                  />
                </div>

                {recordNotice ? <p className="text-xs text-muted-foreground">{recordNotice}</p> : null}

                <div className="flex justify-end">
                  <Button
                    onClick={handleCreateLog}
                    disabled={recordSaving}
                    className="gap-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    {recordSaving ? <LoaderCircle className="size-4 animate-spin" /> : <CalendarClock className="size-4" />}
                    写入记录
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 dark:border-white/[0.06] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-sm p-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-foreground">最近记录</h4>
                  <Badge variant="outline">{recentLogs.length} 条</Badge>
                </div>

                {recentLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">还没有任何打卡，先添加一条今日记录。</p>
                ) : (
                  <div className="space-y-2">
                    {recentLogs.map((log) => (
                      <div
                        key={log.id}
                        className="rounded-lg border border-white/10 dark:border-white/[0.06] px-3 py-3 flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="text-sm font-medium text-foreground">{CATEGORY_OPTIONS.find((option) => option.value === log.category)?.label}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {log.recordDate} · {log.durationMinutes} 分钟
                          </div>
                          {log.note ? <p className="text-xs text-muted-foreground mt-1">{log.note}</p> : null}
                        </div>
                        <Badge variant="secondary">{log.category}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {settingsNotice ? <p className="text-xs text-muted-foreground">{settingsNotice}</p> : null}

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveSettings}
                  disabled={isLoading || settingsSaving}
                  className="gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white border-0"
                >
                  {settingsSaving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
                  保存设置
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">AI Copilot 引擎</h3>
                <p className="text-sm text-muted-foreground">Copilot 会读取你的真实目标与打卡记录，生成更贴近当前状态的建议。</p>
              </div>

              <div className="rounded-xl border border-white/10 dark:border-white/[0.06] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-sm p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Bot className="size-4 text-violet-500" />
                  <Label>当前接入策略</Label>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  当前前端不再直接存储个人 API Key。Copilot 优先走受控服务端接口；如果接口尚未配置，则退回到带有学习上下文的本地建议模式。
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">AI 性格设定</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(Object.entries(AI_PERSONALITIES) as [AIPersonality, typeof AI_PERSONALITIES.strict][]).map(
                    ([key, { label, icon: Icon, desc }]) => (
                      <motion.button
                        key={key}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setAiPersonality(key)}
                        disabled={settingsSaving}
                        className={`rounded-xl border p-4 text-left transition-all ${
                          aiPersonality === key
                            ? 'border-violet-500/50 bg-violet-500/10 dark:bg-violet-500/5 ring-1 ring-violet-500/30'
                            : 'border-white/10 dark:border-white/[0.06] bg-white/30 dark:bg-zinc-800/30 hover:border-white/20 dark:hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={`size-4 ${aiPersonality === key ? 'text-violet-500' : 'text-muted-foreground'}`} />
                          <span className={`text-sm font-medium ${aiPersonality === key ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                      </motion.button>
                    )
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveSettings}
                  disabled={settingsSaving}
                  className="gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white border-0"
                >
                  {settingsSaving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
                  保存设置
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
