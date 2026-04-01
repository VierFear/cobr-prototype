'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MobileLayout } from '@/components/mobile-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    setSubmitted(true)
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
        </div>

        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Восстановление пароля</CardTitle>
            <CardDescription>
              {submitted 
                ? 'Проверьте вашу почту' 
                : 'Введите email для восстановления'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Если аккаунт с email <span className="font-medium text-foreground">{email}</span> существует, 
                  мы отправили инструкции по восстановлению пароля.
                </p>
                <Link href="/login">
                  <Button className="mt-4 bg-primary text-primary-foreground">
                    Вернуться к входу
                  </Button>
                </Link>
              </div>
            ) : (
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

                <Button 
                  type="submit" 
                  className="w-full bg-primary text-primary-foreground"
                  disabled={loading}
                >
                  {loading ? 'Отправка...' : 'Отправить'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {!submitted && (
          <Link 
            href="/login" 
            className="mt-6 text-sm text-muted-foreground hover:text-foreground"
          >
            Вернуться к входу
          </Link>
        )}
      </div>
    </MobileLayout>
  )
}
