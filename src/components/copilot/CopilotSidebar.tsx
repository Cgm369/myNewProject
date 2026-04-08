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
import { Sparkles, Send, Bot, LoaderCircle } from 'lucide-react'
import { useSupabase } from '@/hooks'
import { generateCopilotReply, loadCopilotMessages, saveCopilotExchange } from '@/services'
import type { CopilotMessage } from '@/types'

const MotionButton = motion(Button)
function useCopilotConversation() {
  const { client, userId } = useSupabase()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<CopilotMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    let cancelled = false

    const loadHistory = async () => {
      setIsLoadingHistory(true)
      const loadedMessages = await loadCopilotMessages(client, userId)

      if (cancelled) {
        return
      }

      setMessages(loadedMessages)
      setIsLoadingHistory(false)
    }

    void loadHistory()

    return () => {
      cancelled = true
    }
  }, [client, userId])

  const simulateStream = useCallback((text: string) => {
    return new Promise<void>((resolve) => {
      let index = 0

      setMessages((prev) => [...prev, { role: 'ai', content: '' }])

      const timer = window.setInterval(() => {
        index += 2
        const nextValue = text.slice(0, index)

        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'ai',
            content: index >= text.length ? text : nextValue,
          }
          return updated
        })

        if (index >= text.length) {
          window.clearInterval(timer)
          resolve()
        }
      }, 25)
    })
  }, [])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isTyping || isLoadingHistory) {
      return
    }

    setInput('')
    setIsTyping(true)
    setMessages((prev) => [...prev, { role: 'user', content: text }])

    const reply = await generateCopilotReply(client, userId, text)
    await simulateStream(reply)
    await saveCopilotExchange(client, userId, text, reply)
    setIsTyping(false)
  }, [client, input, isLoadingHistory, isTyping, simulateStream, userId])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        void handleSend()
      }
    },
    [handleSend]
  )

  return {
    input,
    setInput,
    messages,
    isTyping,
    isLoadingHistory,
    bottomRef,
    handleSend,
    handleKeyDown,
  }
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
  const {
    input,
    setInput,
    messages,
    isTyping,
    isLoadingHistory,
    bottomRef,
    handleSend,
    handleKeyDown,
  } = useCopilotConversation()

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
                Reads your goals and study logs before replying.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(100vh-12rem)]">
          <div className="flex flex-col gap-4 p-5">
            {isLoadingHistory ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                正在读取最近对话和学习上下文…
              </div>
            ) : null}

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
              placeholder="问我学习计划、最近数据或算法问题..."
              disabled={isTyping || isLoadingHistory}
              className="flex-1 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-800/50 focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
            />
            <Button
              onClick={() => void handleSend()}
              disabled={!input.trim() || isTyping || isLoadingHistory}
              size="icon"
              className="shrink-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white border-0 shadow-lg shadow-violet-500/20 disabled:opacity-40"
            >
              {isTyping ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function CopilotSidebar() {
  const [open, setOpen] = useState(false)

  return <CopilotSidebarInternal open={open} onOpenChange={setOpen} />
}
