import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Settings, Sparkles, Code, BookOpen, Brain } from 'lucide-react'

const FEATURES = [
  { icon: Code, label: '算法训练', desc: 'LeetCode 刷题追踪与 AI 解析' },
  { icon: BookOpen, label: '语言学习', desc: '单词记忆曲线与智能复习' },
  { icon: Brain, label: 'AI Copilot', desc: '个性化助教，三种性格模式' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 80,
      damping: 12,
    },
  },
}

export function Home() {
  const navigate = useNavigate()

  return (
    <div className="relative z-10 min-h-[calc(100vh-4rem)] flex flex-col">
      <motion.div
        className="flex-1 flex flex-col items-center justify-center text-center px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 dark:border-white/[0.06] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-sm text-sm text-muted-foreground">
            <Sparkles className="size-3.5 text-violet-500" />
            <span>AI-Powered Learning Platform</span>
          </div>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight max-w-4xl leading-[1.1]"
        >
          <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
            Supercharge
          </span>
          <br />
          <span className="text-foreground">Your Learning with AI</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-6 text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed"
        >
          The ultimate copilot for coding, algorithms, and languages.
          <br className="hidden sm:block" />
          Track, learn, and evolve — all in one place.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-3 mt-10">
          <Button
            onClick={() => navigate('/dashboard')}
            size="lg"
            className="gap-2 px-8 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white border-0 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"
          >
            进入控制台
            <ArrowRight className="size-4" />
          </Button>
          <Button
            onClick={() => navigate('/profile')}
            variant="ghost"
            size="lg"
            className="gap-2 px-8 border border-white/10 dark:border-white/[0.06] bg-white/10 dark:bg-white/5 backdrop-blur-sm hover:bg-white/20 dark:hover:bg-white/10 text-foreground"
          >
            <Settings className="size-4" />
            配置引擎
          </Button>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full"
        >
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <motion.div
              key={label}
              whileHover={{ y: -4 }}
              className="rounded-xl border border-white/10 dark:border-white/[0.06] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-sm p-5 text-left"
            >
              <div className="p-2 rounded-lg bg-violet-500/10 w-fit mb-3">
                <Icon className="size-5 text-violet-500" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{label}</h3>
              <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="text-center pb-8 text-xs text-muted-foreground"
      >
        Built with React + Tailwind + Framer Motion
      </motion.div>
    </div>
  )
}
