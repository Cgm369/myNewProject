import { motion } from 'framer-motion'

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
      {/* 基础背景色 */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950" />

      {/* 网格背景 - 轻微移动动画 */}
      <motion.div
        className="absolute inset-0"
        style={{
          opacity: 0.35,
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.5) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
        animate={{
          x: [0, 12, 0],
          y: [0, 8, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 赛博蓝光晕 - 左上角 */}
      <motion.div
        className="absolute rounded-full"
        style={{
          top: '-15%',
          left: '-15%',
          width: '70vw',
          height: '70vw',
          maxWidth: '900px',
          maxHeight: '900px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, rgba(37, 99, 235, 0.25) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: [0, 80, 0],
          y: [0, 40, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 极客绿光晕 - 右下角 */}
      <motion.div
        className="absolute rounded-full"
        style={{
          bottom: '-15%',
          right: '-15%',
          width: '60vw',
          height: '60vw',
          maxWidth: '800px',
          maxHeight: '800px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.45) 0%, rgba(5, 150, 105, 0.2) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: [0, -60, 0],
          y: [0, -50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      {/* 紫色光晕 - 中心 */}
      <motion.div
        className="absolute rounded-full"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '50vw',
          height: '50vw',
          maxWidth: '600px',
          maxHeight: '600px',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, rgba(139, 92, 246, 0.15) 40%, transparent 70%)',
          filter: 'blur(50px)',
        }}
        animate={{
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 4,
        }}
      />

      {/* 粉色光晕 - 右上角 */}
      <motion.div
        className="absolute rounded-full"
        style={{
          top: '-10%',
          right: '-10%',
          width: '40vw',
          height: '40vw',
          maxWidth: '500px',
          maxHeight: '500px',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, rgba(219, 39, 119, 0.12) 40%, transparent 70%)',
          filter: 'blur(50px)',
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, 50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 6,
        }}
      />

      {/* 青色光晕 - 左下角 */}
      <motion.div
        className="absolute rounded-full"
        style={{
          bottom: '-10%',
          left: '-10%',
          width: '35vw',
          height: '35vw',
          maxWidth: '450px',
          maxHeight: '450px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, rgba(8, 145, 178, 0.12) 40%, transparent 70%)',
          filter: 'blur(50px)',
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, -40, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 8,
        }}
      />
    </div>
  )
}
