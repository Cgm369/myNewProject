import { useEffect, useState, useRef } from 'react'
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
import { Code, BookOpen, Clock, Sparkles } from 'lucide-react'
import { preloadTextHeight } from '@/lib/text-measure'

const MOCK_FOCUS_DATA = [
  { day: 'Mon', hours: 3.5 },
  { day: 'Tue', hours: 4.2 },
  { day: 'Wed', hours: 2.8 },
  { day: 'Thu', hours: 5.1 },
  { day: 'Fri', hours: 3.9 },
  { day: 'Sat', hours: 6.0 },
  { day: 'Sun', hours: 4.5 },
]

const generateActivityData = () => {
  const data = []
  const today = new Date()
  for (let i = 365; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const count = Math.random() > 0.25 ? Math.floor(Math.random() * 5) : 0
    data.push({
      date: date.toISOString().split('T')[0],
      count,
      level: count === 0 ? 0 : count,
    })
  }
  return data
}

const STATS = [
  { title: '算法题数', value: 256, change: '+12', icon: Code, color: '#a855f7' },
  { title: '单词量', value: 1280, change: '+50', icon: BookOpen, color: '#22c55e' },
  { title: '专注总计', value: '128h', change: '+8h', icon: Clock, color: '#f59e0b' },
]

const WELCOME_TEXT = 'Hello, Geek. Today is'

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

function TypewriterWelcome() {
  const [displayText, setDisplayText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const fullText = `${WELCOME_TEXT} ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}. Ready to evolve?`

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
  }, [])

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

function FocusChart() {
  const descriptionRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (descriptionRef.current) {
      const containerWidth = descriptionRef.current.offsetWidth
      const text = '本周累计专注 29.8 小时，较上周增长 15%。保持良好的学习节奏！'
      const height = preloadTextHeight(text, containerWidth, 14, 1.6)
      descriptionRef.current.style.height = `${height}px`
    }
  }, [])

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
            data={MOCK_FOCUS_DATA}
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
        本周累计专注 29.8 小时，较上周增长 15%。保持良好的学习节奏！
      </p>
    </div>
  )
}

function ActivityContribution() {
  const data = generateActivityData()

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
  title,
  value,
  change,
  icon: Icon,
  color,
}: {
  title: string
  value: string | number
  change: string
  icon: React.ElementType
  color: string
}) {
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
          boxShadow: `inset 0 0 25px ${color}15, 0 0 35px ${color}10`,
        }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">{title}</span>
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
        </div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="text-xs mt-1" style={{ color }}>
          {change} this week
        </div>
      </div>
    </motion.div>
  )
}

export function Dashboard() {
  return (
    <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        className="relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <BentoCard className="col-span-full mb-4 p-6">
          <TypewriterWelcome />
        </BentoCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <BentoCard className="lg:col-span-2">
            <FocusChart />
          </BentoCard>

          <BentoCard className="lg:col-span-1">
            <ActivityContribution />
          </BentoCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {STATS.map((stat) => (
            <StatCard key={stat.title} {...stat} icon={stat.icon} />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
