'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MobileLayout } from '@/components/mobile-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useApp } from '@/lib/context'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const success = login(email, password)
    if (success) {
      router.push('/')
    } else {
      setError('Неверный email или пароль')
    }
    setLoading(false)
  }

  return (
    <MobileLayout showNav={false}>
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <span className="text-2xl font-bold text-primary-foreground">ЦР</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">ЦОБР</h1>
          <p className="text-sm text-muted-foreground">Центр общественного развития</p>
        </div>

        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Вход в аккаунт</CardTitle>
            <CardDescription>Введите ваши данные для входа</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="email@example.com"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Пароль</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Введите пароль"
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground"
                disabled={loading}
              >
                {loading ? 'Вход...' : 'Войти'}
              </Button>

              <Link 
                href="/forgot-password" 
                className="text-center text-sm text-primary hover:underline"
              >
                Забыли пароль?
              </Link>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Нет аккаунта?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Зарегистрироваться
          </Link>
        </p>

        <Link 
          href="/" 
          className="mt-4 text-sm text-muted-foreground hover:text-foreground"
        >
          Вернуться на главную
        </Link>

        {/* Demo credentials hint */}
        <div className="mt-8 rounded-lg bg-muted p-4 text-center">
          <p className="text-xs text-muted-foreground">Тестовые аккаунты:</p>
          <p className="mt-1 text-xs text-foreground">maria@example.com / password123</p>
          <p className="text-xs text-foreground">admin@cobr.ru / admin123</p>
        </div>
      </div>
    </MobileLayout>
  )
}
