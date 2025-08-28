import { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { 
  Home, 
  Plus, 
  Users, 
  LogOut, 
  Menu, 
  X,
  FileText,
  Settings,
  Sparkles
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Tạo bài viết', href: '/create-post', icon: Plus },
    ...(user?.role === 'admin' ? [{ name: 'Quản lý người dùng', href: '/users', icon: Users }] : []),
  ]

  const isActive = (href: string) => location.pathname === href

  const NavItem = ({ item, onClick }: { item: any; onClick?: () => void }) => {
    const Icon = item.icon
    return (
      <Link
        to={item.href}
        onClick={onClick}
        className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
          isActive(item.href)
            ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25'
            : 'text-muted-foreground hover:bg-gradient-to-r hover:from-accent hover:to-accent/80 hover:text-accent-foreground hover:shadow-md'
        }`}
      >
        <Icon className={`mr-3 h-5 w-5 transition-transform duration-200 ${
          isActive(item.href) ? 'scale-110' : 'group-hover:scale-110'
        }`} />
        {item.name}
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0 bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 border-r-0 shadow-2xl">
          <SheetHeader className="p-6 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-primary to-primary/80">
            <SheetTitle className="flex items-center text-white">
              <Sparkles className="h-6 w-6 mr-2" />
              Blog System
            </SheetTitle>
          </SheetHeader>
          <nav className="flex-1 space-y-2 px-4 py-6">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} onClick={() => setSidebarOpen(false)} />
            ))}
          </nav>
          <div className="border-t border-gray-200 dark:border-slate-700 p-6 space-y-4 bg-gradient-to-t from-gray-50 to-white dark:from-slate-800 dark:to-slate-900">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarFallback className="bg-gradient-to-r from-primary to-primary/80 text-white font-semibold">
                  {user?.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.username}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Đăng xuất
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-slate-700/50 shadow-xl">
          <div className="flex items-center h-20 px-6 border-b border-gray-200/50 dark:border-slate-700/50 bg-gradient-to-r from-primary to-primary/80">
            <h1 className="text-xl font-bold text-white flex items-center">
              <Sparkles className="h-6 w-6 mr-2" />
              Blog System
            </h1>
          </div>
          <nav className="flex-1 space-y-2 px-4 py-6">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>
          <div className="border-t border-gray-200/50 dark:border-slate-700/50 p-6 space-y-4 bg-gradient-to-t from-gray-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-900/50">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarFallback className="bg-gradient-to-r from-primary to-primary/80 text-white font-semibold">
                  {user?.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.username}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-4 shadow-sm lg:hidden">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
          </Sheet>
          <h1 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Blog System
          </h1>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
