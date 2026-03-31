import { Link, useLocation } from 'react-router-dom'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { User, LayoutDashboard } from 'lucide-react'
import { CopilotTrigger } from '@/components/copilot/CopilotSidebar'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { path: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { path: '/profile', label: '个人中心', icon: User },
]

export function Navbar() {
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 dark:border-white/[0.02] bg-white/10 dark:bg-zinc-950/10 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/5 dark:supports-[backdrop-filter]:bg-zinc-950/5">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
              GeekLearn
            </span>
            <span className="text-foreground ml-1">Copilot</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path
            return (
              <Link key={path} to={path}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'gap-2 backdrop-blur-sm transition-all',
                    isActive
                      ? 'text-foreground bg-white/20 dark:bg-white/10'
                      : 'text-muted-foreground hover:text-foreground bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              </Link>
            )
          })}
          <CopilotTrigger />
          <ModeToggle />

          <Show when="signed-out">
            <div className="flex items-center gap-1 ml-1">
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 backdrop-blur-sm"
                >
                  登录
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white border-0"
                >
                  注册
                </Button>
              </SignUpButton>
            </div>
          </Show>

          <Show when="signed-in">
            <div className="ml-1">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'size-8',
                  },
                }}
              />
            </div>
          </Show>
        </div>
      </div>
    </header>
  )
}
