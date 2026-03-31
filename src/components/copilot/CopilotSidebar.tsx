import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sparkles, Send, Bot } from 'lucide-react'

const MotionButton = motion(Button)

interface Message {
  role: 'user' | 'ai'
  content: string
}

const MOCK_REPLIES = [
  `快速排序（Quick Sort）是一种基于分治策略的高效排序算法。它的核心思想是：

1. **选择基准（Pivot）**：从数组中选一个元素作为基准。
2. **分区（Partition）**：将小于基准的放左边，大于基准的放右边。
3. **递归排序**：对左右两个子数组重复上述过程。

平均时间复杂度为 O(n log n)，最坏情况 O(n²)。空间复杂度 O(log n)（递归栈）。

💡 **优化建议**：可以使用三数取中法选择 pivot，避免最坏情况。`,

  `记忆单词的最高效方法是 **间隔重复（Spaced Repetition）**。

核心原理：在遗忘曲线即将下降时进行复习，用最少的次数达到长期记忆。

推荐节奏：
- 第 1 次复习：学习后 10 分钟
- 第 2 次复习：1 天后
- 第 3 次复习：3 天后
- 第 4 次复习：7 天后
- 第 5 次复习：14 天后

坚持 5 轮复习，记忆保留率可达 90% 以上。`,

  `今天的目标完成得怎么样？让我看看你的数据...

🔥 你已经连续打卡 12 天了，非常棒！
📊 本周算法完成率 85%，高于平均水平。
📝 单词记忆量稳步增长中。

建议：今天可以重点攻克一道中等难度的动态规划题，配合 50 个新单词的复习。加油！`,
]

export function CopilotSidebar() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: '你好！我是 GeekLearn AI 助教 🤖\n\n我可以帮你解答算法问题、制定学习计划、分析你的学习数据。有什么想问的？',
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const replyIndexRef = useRef(0)

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const simulateStream = useCallback((text: string) => {
    setIsTyping(true)
    let index = 0
    const aiMsg: Message = { role: 'ai', content: '' }

    setMessages((prev) => [...prev, aiMsg])

    const timer = setInterval(() => {
      index += 2
      if (index >= text.length) {
        clearInterval(timer)
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'ai', content: text }
          return updated
        })
        setIsTyping(false)
      } else {
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'ai', content: text.slice(0, index) }
          return updated
        })
      }
    }, 25)
  }, [])

  const handleSend = () => {
    const text = input.trim()
    if (!text || isTyping) return

    setInput('')
    const userMsg: Message = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])

    const reply = MOCK_REPLIES[replyIndexRef.current % MOCK_REPLIES.length]
    replyIndexRef.current++

    setTimeout(() => {
      simulateStream(reply)
    }, 400)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border-l border-zinc-200/50 dark:border-zinc-800/50"
      >
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <Sparkles className="size-4 text-white" />
            </div>
            <div>
              <SheetTitle className="text-base">GeekLearn AI</SheetTitle>
              <SheetDescription className="text-xs">
                Your personal coding & language mentor.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(100vh-12rem)]">
          <div className="flex flex-col gap-4 p-5">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {msg.role === 'ai' && (
                  <Avatar size="sm" className="shrink-0 mt-0.5">
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-[10px]">
                      <Bot className="size-3" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-br-md'
                      : 'bg-zinc-100 dark:bg-zinc-800/50 text-foreground rounded-bl-md'
                  }`}
                >
                  {msg.content}
                  {msg.role === 'ai' && isTyping && i === messages.length - 1 && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="inline-block w-1.5 h-4 ml-0.5 bg-violet-500 align-middle rounded-sm"
                    />
                  )}
                </div>
              </motion.div>
            ))}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="问我任何编程问题..."
              disabled={isTyping}
              className="flex-1 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-800/50 focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              size="icon"
              className="shrink-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white border-0 shadow-lg shadow-violet-500/20 disabled:opacity-40"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function CopilotTrigger() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <MotionButton
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="relative gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-white bg-gradient-to-r from-violet-500 to-fuchsia-500 border-0 shadow-lg cursor-pointer"
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ filter: 'blur(8px)', zIndex: -1 }}
        />
        <Sparkles className="size-4" />
        <span className="hidden sm:inline">AI 助教</span>
      </MotionButton>
      <CopilotSidebarInternal open={open} onOpenChange={setOpen} />
    </>
  )
}

function CopilotSidebarInternal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: '你好！我是 GeekLearn AI 助教 🤖\n\n我可以帮你解答算法问题、制定学习计划、分析你的学习数据。有什么想问的？',
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const replyIndexRef = useRef(0)

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const simulateStream = useCallback((text: string) => {
    setIsTyping(true)
    let index = 0

    setMessages((prev) => [...prev, { role: 'ai', content: '' }])

    const timer = setInterval(() => {
      index += 2
      if (index >= text.length) {
        clearInterval(timer)
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'ai', content: text }
          return updated
        })
        setIsTyping(false)
      } else {
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'ai', content: text.slice(0, index) }
          return updated
        })
      }
    }, 25)
  }, [])

  const handleSend = () => {
    const text = input.trim()
    if (!text || isTyping) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])

    const reply = MOCK_REPLIES[replyIndexRef.current % MOCK_REPLIES.length]
    replyIndexRef.current++

    setTimeout(() => {
      simulateStream(reply)
    }, 400)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border-l border-zinc-200/50 dark:border-zinc-800/50"
      >
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <Sparkles className="size-4 text-white" />
            </div>
            <div>
              <SheetTitle className="text-base">GeekLearn AI</SheetTitle>
              <SheetDescription className="text-xs">
                Your personal coding & language mentor.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(100vh-12rem)]">
          <div className="flex flex-col gap-4 p-5">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {msg.role === 'ai' && (
                  <Avatar size="sm" className="shrink-0 mt-0.5">
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-[10px]">
                      <Bot className="size-3" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-br-md'
                      : 'bg-zinc-100 dark:bg-zinc-800/50 text-foreground rounded-bl-md'
                  }`}
                >
                  {msg.content}
                  {msg.role === 'ai' && isTyping && i === messages.length - 1 && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="inline-block w-1.5 h-4 ml-0.5 bg-violet-500 align-middle rounded-sm"
                    />
                  )}
                </div>
              </motion.div>
            ))}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="问我任何编程问题..."
              disabled={isTyping}
              className="flex-1 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-800/50 focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              size="icon"
              className="shrink-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white border-0 shadow-lg shadow-violet-500/20 disabled:opacity-40"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
