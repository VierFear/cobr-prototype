'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MobileLayout } from '@/components/mobile-layout'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useApp } from '@/lib/context'

export default function ProfileEditPage() {
  const router = useRouter()
  const { user, updateUser, isInitialized } = useApp()
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    avatar: '',
    bio: ''
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        bio: user.bio || ''
      })
    }
  }, [user])

  if (!isInitialized) {
    return (
      <MobileLayout header={<Header title="Редактирование" showBack backHref="/profile" />}>
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      </MobileLayout>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    updateUser(user.id, {
      name: formData.name,
      phone: formData.phone,
      avatar: formData.avatar,
      bio: formData.bio
    })
    
    setTimeout(() => {
      router.push('/profile')
    }, 300)
  }

  return (
    <MobileLayout header={<Header title="Редактирование" showBack backHref="/profile" />}>
      <div className="flex flex-col gap-4 p-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Личные данные</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Avatar Preview */}
              <div className="flex flex-col items-center gap-2">
                <img
                  src={formData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={formData.name}
                  className="h-24 w-24 rounded-full object-cover"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  URL аватара
                </label>
                <Input
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  Имя
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  Email
                </label>
                <Input
                  value={user.email}
                  disabled
                  className="bg-muted"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Email нельзя изменить
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  Телефон
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  О себе
                </label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Расскажите о себе..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Link href="/profile" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                  >
                    Отмена
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground"
                  disabled={isSaving}
                >
                  {isSaving ? <Spinner className="h-4 w-4" /> : 'Сохранить'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  )
}
