import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/layout/Navbar'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { AnimatedCircularProgressBar } from '@/components/ui/animated-circular-progress-bar'
import { FlickeringGrid } from '@/components/ui/flickering-grid'

export function Layout() {
  const [scrollPercent, setScrollPercent] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const percent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0
      setScrollPercent(percent)
      setVisible(scrollTop > 100)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <div className="fixed inset-0 pointer-events-none z-[1]">
        <FlickeringGrid
          className="w-full h-full"
          squareSize={4}
          gridGap={6}
          flickerChance={0.3}
          color="rgb(168, 85, 247)"
          maxOpacity={0.12}
        />
      </div>
      <Navbar />
      <Outlet />

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <AnimatedCircularProgressBar
              value={scrollPercent}
              max={100}
              gaugePrimaryColor="#a855f7"
              gaugeSecondaryColor="rgba(168, 85, 247, 0.15)"
              className="size-12 text-xs [&>span]:text-xs [&>span]:text-muted-foreground [&>svg]:stroke-[6]"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
