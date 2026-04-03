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
import { supabase } from '@/lib/supabase'

export default function ProfileEditPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    avatar: '',
    bio: ''
  })

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      
      // Получаем текущего пользователя из Auth
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        setLoading(false)
        return
      }
      
      setUser(authUser)
      
      // Получаем дополнительные данные из таблицы users
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()
      
      setUserProfile(profileData)
      
      // Заполняем форму
      setFormData({
        name: profileData?.name || authUser.user_metadata?.full_name || '',
        phone: profileData?.phone || '',
        avatar: profileData?.avatar || '',
        bio: profileData?.bio || ''
      })
      
      setLoading(false)
    }
    
    fetchUser()
  }, [])

  if (loading) {
    return (
      <MobileLayout header={<Header title="Редактирование" showBack backHref="/profile" />}>
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <p>Загрузка...</p>
        </div>
      </MobileLayout>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    // Обновляем данные в таблице users
    const { error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        name: formData.name,
        phone: formData.phone,
        avatar: formData.avatar,
        bio: formData.bio,
        email: user.email,
      })
    
    if (error) {
      console.error('Ошибка при сохранении:', error)
    }
    
    setIsSaving(false)
    router.push('/profile')
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
                  alt={formData.name || 'Аватар'}
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
                  {isSaving ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  )
}