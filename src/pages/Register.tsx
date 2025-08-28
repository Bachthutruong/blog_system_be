import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff, Mail, Lock, User, Sparkles, ArrowRight, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function Register() {
  const { register } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }

    if (password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    setLoading(true)
    try {
      await register(username.trim(), email.trim(), password)
      toast.success('Đăng ký thành công!')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  const isPasswordValid = password.length >= 6
  const isConfirmPasswordValid = password === confirmPassword && confirmPassword.length > 0

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">
            Blog System
          </h1>
          <p className="text-muted-foreground">
            Tạo tài khoản mới
          </p>
        </div>

        {/* Register Card */}
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-2xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center">
              Đăng ký
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Tạo tài khoản để bắt đầu
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Tên người dùng
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Nhập tên người dùng"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 bg-white/50 dark:bg-slate-800/50 border-0 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/50 dark:bg-slate-800/50 border-0 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Mật khẩu
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white/50 dark:bg-slate-800/50 border-0 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle className={`h-3 w-3 ${isPasswordValid ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className={isPasswordValid ? 'text-green-600' : 'text-gray-500'}>
                      Mật khẩu phải có ít nhất 6 ký tự
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Xác nhận mật khẩu
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white/50 dark:bg-slate-800/50 border-0 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle className={`h-3 w-3 ${isConfirmPasswordValid ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className={isConfirmPasswordValid ? 'text-green-600' : 'text-gray-500'}>
                      Mật khẩu xác nhận khớp
                    </span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200 h-12 text-base font-medium"
                disabled={loading || !isPasswordValid || !isConfirmPasswordValid}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang đăng ký...
                  </div>
                ) : (
                  <div className="flex items-center">
                    Đăng ký
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Đã có tài khoản?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>

            {/* Demo Accounts */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Hoặc sử dụng tài khoản demo:
              </h3>
              <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                <p><strong>Admin:</strong> admin@example.com / admin123</p>
                <p><strong>Employee:</strong> employee@example.com / employee123</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            © 2024 Blog System. Được xây dựng với ❤️
          </p>
        </div>
      </div>
    </div>
  )
}
