import { useState, useEffect } from 'react'
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
  GraduationCap,
  Heart,
  Code,
  Eye,
  EyeOff,
  Save,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

type AIPersonality = 'strict' | 'encouraging' | 'minimal'

const AI_PERSONALITIES: Record<AIPersonality, { label: string; icon: React.ElementType; desc: string }> = {
  strict: { label: '严厉导师', icon: GraduationCap, desc: '直接指出问题，不废话，追求极致代码质量' },
  encouraging: { label: '鼓励夸夸', icon: Heart, desc: '每次都先肯定你的努力，再温柔给出建议' },
  minimal: { label: '极简代码', icon: Code, desc: '只给代码，最少解释，适合有经验的开发者' },
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
}

export function Profile() {
  const [dailyAlgo, setDailyAlgo] = useState(() => localStorage.getItem('goal_daily_algo') || '3')
  const [dailyWords, setDailyWords] = useState(() => localStorage.getItem('goal_daily_words') || '50')
  const [weekendRest, setWeekendRest] = useState(() => localStorage.getItem('goal_weekend_rest') === 'true')
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('ai_api_key') || '')
  const [showApiKey, setShowApiKey] = useState(false)
  const [aiPersonality, setAiPersonality] = useState<AIPersonality>(() =>
    (localStorage.getItem('ai_personality') as AIPersonality) || 'encouraging'
  )
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    localStorage.setItem('goal_daily_algo', dailyAlgo)
    localStorage.setItem('goal_daily_words', dailyWords)
    localStorage.setItem('goal_weekend_rest', String(weekendRest))
    localStorage.setItem('ai_api_key', apiKey)
    localStorage.setItem('ai_personality', aiPersonality)
  }, [dailyAlgo, dailyWords, weekendRest, apiKey, aiPersonality])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
                    Lv.5 算法学徒
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <BookOpen className="size-3" />
                    Lv.3 词汇猎手
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
                <div className="text-3xl font-bold text-foreground">12 <span className="text-base font-normal text-muted-foreground">Days</span></div>
                <div className="text-xs text-muted-foreground mt-1">上次打卡: 今天</div>
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
                <div className="text-3xl font-bold text-foreground">45 <span className="text-base font-normal text-muted-foreground">Hours</span></div>
                <div className="text-xs text-muted-foreground mt-1">日均 1.5h · 超过 78% 的用户</div>
              </motion.div>
            </div>

            <div className="mt-6 rounded-xl border border-white/10 dark:border-white/[0.06] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-sm p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">本周学习热力</h3>
              <div className="flex items-end gap-1.5 h-16">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                  const heights = [60, 80, 45, 90, 70, 100, 75]
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-sm bg-gradient-to-t from-violet-500 to-fuchsia-500 transition-all"
                        style={{ height: `${heights[i]}%` }}
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
                <p className="text-sm text-muted-foreground">设定你每天的学习量，保持节奏感。</p>
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
                  />
                  <p className="text-xs text-muted-foreground">当前进度: 2/3 题</p>
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
                  />
                  <p className="text-xs text-muted-foreground">当前进度: 35/50 词</p>
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
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  className="gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white border-0"
                >
                  <Save className="size-4" />
                  {saved ? '已保存 ✓' : '保存设置'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">AI Copilot 引擎</h3>
                <p className="text-sm text-muted-foreground">配置你的 AI 助教，让它用你喜欢的方式帮助你学习。</p>
              </div>

              <div className="rounded-xl border border-white/10 dark:border-white/[0.06] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-sm p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Bot className="size-4 text-violet-500" />
                  <Label>API Key</Label>
                </div>
                <div className="relative">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showApiKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">密钥仅存储在本地浏览器中，不会上传到任何服务器。</p>
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
                  onClick={handleSave}
                  className="gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white border-0"
                >
                  <Save className="size-4" />
                  {saved ? '已保存 ✓' : '保存设置'}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
