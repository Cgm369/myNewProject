import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ActivityCalendar } from 'react-activity-calendar'
import { Code, BookOpen, Clock, LoaderCircle, Sparkles } from 'lucide-react'
import { preloadTextHeight } from '@/lib/text-measure'
import { useSupabase } from '@/hooks'
import { getDashboardSummary } from '@/services'
import type { DashboardMetric, DashboardSummary } from '@/types'

const WELCOME_TEXT = 'Hello, Geek. Today is'
const EMPTY_SUMMARY: DashboardSummary = {
  focusTrend: [
    { day: 'Mon', hours: 0 },
    { day: 'Tue', hours: 0 },
    { day: 'Wed', hours: 0 },
    { day: 'Thu', hours: 0 },
    { day: 'Fri', hours: 0 },
    { day: 'Sat', hours: 0 },
    { day: 'Sun', hours: 0 },
  ],
  contribution: [],
  metrics: [
    { key: 'algo', title: '算法打卡', value: 0, change: '本周 0 次', color: '#a855f7' },
    { key: 'language', title: '语言打卡', value: 0, change: '本周 0 次', color: '#22c55e' },
    { key: 'focus', title: '专注总计', value: '0h', change: '本周暂无新增', color: '#f59e0b' },
  ],
  description: '还没有学习记录，先去 Profile 中补一条今日打卡。',
  streak: 0,
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 12,
    },
  },
}

interface BentoCardProps {
  children: React.ReactNode
  className?: string
}

function BentoCard({ children, className }: BentoCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`relative group rounded-2xl border border-white/10 dark:border-white/[0.06] bg-white/30 dark:bg-zinc-900/30 backdrop-blur-md overflow-hidden ${className || ''}`}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div
          className="absolute inset-0 opacity-50"
          style={{
            boxShadow: 'inset 0 0 30px rgba(168, 85, 247, 0.1), 0 0 40px rgba(168, 85, 247, 0.05)',
          }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

function TypewriterWelcome({ streak }: { streak: number }) {
  const [displayText, setDisplayText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const fullText = `${WELCOME_TEXT} ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}. ${streak > 0 ? `Current streak: ${streak} day${streak > 1 ? 's' : ''}.` : 'Ready to evolve?'}`.trim()

  useEffect(() => {
    let index = 0
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayText(fullText.slice(0, index))
        index++
      } else {
        clearInterval(timer)
      }
    }, 40)
    return () => clearInterval(timer)
  }, [fullText])

  useEffect(() => {
    const cursorTimer = setInterval(() => setShowCursor((v) => !v), 530)
    return () => clearInterval(cursorTimer)
  }, [])

  return (
    <div className="flex items-center gap-3">
      <div className="p-3 rounded-xl bg-primary/10">
        <Sparkles className="w-6 h-6 text-primary" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">AI Copilot</p>
        <h2 className="text-xl md:text-2xl font-semibold text-foreground">
          {displayText}
          <span
            className={`inline-block w-[2px] h-5 ml-0.5 bg-primary align-middle ${showCursor ? 'opacity-100' : 'opacity-0'}`}
          />
        </h2>
      </div>
    </div>
  )
}

function FocusChart({ data, description }: { data: DashboardSummary['focusTrend']; description: string }) {
  const descriptionRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (descriptionRef.current) {
      const containerWidth = descriptionRef.current.offsetWidth
      const height = preloadTextHeight(description, containerWidth, 14, 1.6)
      descriptionRef.current.style.height = `${height}px`
    }
  }, [description])

  const axisTick = (props: Record<string, unknown>) => {
    const { x = 0, y = 0, payload } = props as { x?: number; y?: number; payload?: { value: string } }
    return (
      <text
        x={x}
        y={y + 12}
        textAnchor="middle"
        className="fill-muted-foreground text-[11px]"
      >
        {payload?.value}
      </text>
    )
  }

  const yAxisTick = (props: Record<string, unknown>) => {
    const { x = 0, y = 0, payload } = props as { x?: number; y?: number; payload?: { value: number } }
    return (
      <text
        x={x}
        y={y + 4}
        textAnchor="end"
        className="fill-muted-foreground text-[11px]"
      >
        {payload?.value}h
      </text>
    )
  }

  return (
    <div className="p-6 w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">近7天专注时长</h3>
        <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
          本周
        </span>
      </div>
      <div className="w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border opacity-40"
            />
            <XAxis
              dataKey="day"
              tick={axisTick}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={yAxisTick}
              tickLine={false}
              axisLine={false}
              width={35}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'var(--foreground)',
              }}
              labelStyle={{ color: 'var(--foreground)' }}
              itemStyle={{ color: 'var(--foreground)' }}
              formatter={(value) => [`${value} 小时`, '专注时长']}
            />
            <Area
              type="monotone"
              dataKey="hours"
              stroke="#a855f7"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#focusGradient)"
              animationDuration={1800}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p
        ref={descriptionRef}
        className="text-xs text-muted-foreground mt-4 overflow-hidden"
      >
        {description}
      </p>
    </div>
  )
}

function ActivityContribution({ data }: { data: DashboardSummary['contribution'] }) {
  return (
    <div className="p-6 w-full">
      <h3 className="text-lg font-semibold text-foreground mb-4">年度贡献</h3>
      <div className="overflow-x-auto w-full">
        <ActivityCalendar
          data={data}
          theme={{
            dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
            light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
          }}
          colorScheme="dark"
          blockSize={10}
          blockMargin={2}
          fontSize={9}
          labels={{
            totalCount: '{{count}} 次',
          }}
        />
      </div>
      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          {['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'].map((color) => (
            <div key={color} className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  )
}

function StatCard({
  metric,
}: {
  metric: DashboardMetric
}) {
  const Icon = metric.key === 'algo' ? Code : metric.key === 'language' ? BookOpen : Clock

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className="relative group p-5 rounded-xl border border-white/10 dark:border-white/[0.06] bg-white/30 dark:bg-zinc-900/30 backdrop-blur-md overflow-hidden cursor-pointer"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 25px ${metric.color}15, 0 0 35px ${metric.color}10`,
        }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">{metric.title}</span>
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${metric.color}15` }}>
            <Icon className="w-4 h-4" style={{ color: metric.color }} />
          </div>
        </div>
        <div className="text-2xl font-bold text-foreground">{metric.value}</div>
        <div className="text-xs mt-1" style={{ color: metric.color }}>
          {metric.change}
        </div>
      </div>
    </motion.div>
  )
}

export function Dashboard() {
  const { client, userId } = useSupabase()
  const [summary, setSummary] = useState<DashboardSummary>(EMPTY_SUMMARY)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const loadDashboard = async () => {
      setIsLoading(true)
      const nextSummary = await getDashboardSummary(client, userId)

      if (cancelled) {
        return
      }

      setSummary(nextSummary)
      setIsLoading(false)
    }

    void loadDashboard()

    return () => {
      cancelled = true
    }
  }, [client, userId])

  return (
    <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        className="relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <BentoCard className="col-span-full mb-4 p-6">
          <TypewriterWelcome streak={summary.streak} />
        </BentoCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <BentoCard className="lg:col-span-2">
            <FocusChart data={summary.focusTrend} description={summary.description} />
          </BentoCard>

          <BentoCard className="lg:col-span-1">
            <ActivityContribution data={summary.contribution} />
          </BentoCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {summary.metrics.map((metric) => (
            <StatCard key={metric.key} metric={metric} />
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-6">
            <LoaderCircle className="size-4 animate-spin" />
            正在加载真实统计数据…
          </div>
        ) : null}
      </motion.div>
    </div>
  )
}
