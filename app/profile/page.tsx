'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MobileLayout } from '@/components/mobile-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { Mail, Phone, LogOut, Clock, CheckCircle, AlertCircle, Edit2 } from 'lucide-react'

interface EnrollmentWithClub {
  id: string
  status: string
  created_at: string
  child_name: string
  child_age: number
  clubs: {
    id: number
    name: string
    image: string
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [enrollments, setEnrollments] = useState<EnrollmentWithClub[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      
      // 1. Получаем текущего пользователя из Auth
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        setLoading(false)
        return
      }
      
      setUser(authUser)
      
      // 2. Получаем дополнительные данные из таблицы users
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()
      
      setUserProfile(profileData)
      
      // 3. Получаем заявки пользователя с данными о клубах
      const { data: enrollmentsData } = await supabase
        .from('enrollments')
        .select(`
          id,
          status,
          created_at,
          child_name,
          child_age,
          clubs (
            id,
            name,
            image
          )
        `)
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
      
      setEnrollments(enrollmentsData as any || [])
      setLoading(false)
    }
    
    fetchProfile()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Запрос отправлен',
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-800'
        }
      case 'accepted':
        return {
          label: 'Принят',
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800'
        }
      case 'completed':
        return {
          label: 'Завершён',
          icon: AlertCircle,
          className: 'bg-gray-100 text-gray-800'
        }
      default:
        return {
          label: status,
          icon: Clock,
          className: 'bg-gray-100 text-gray-800'
        }
    }
  }

  if (loading) {
    return (
      <MobileLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <p>Загрузка...</p>
        </div>
      </MobileLayout>
    )
  }

  if (!user) {
    return (
      <MobileLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">Вы не авторизованы</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Войдите в аккаунт, чтобы увидеть профиль
            </p>
            <Link href="/login">
              <Button className="mt-4 bg-primary text-primary-foreground">
                Войти
              </Button>
            </Link>
          </div>
        </div>
      </MobileLayout>
    )
  }

  // Данные для отображения (из Auth или из таблицы users)
  const displayName = userProfile?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Пользователь'
  const displayPhone = userProfile?.phone || user.user_metadata?.phone || 'Не указан'
  const displayAvatar = userProfile?.avatar || user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0057B8&color=fff`
  const displayBio = userProfile?.bio || ''

  return (
    <MobileLayout>
      <div className="flex flex-col gap-4 p-4">
        {/* User Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <img
                src={displayAvatar}
                alt={displayName}
                className="h-20 w-20 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-semibold text-foreground">{displayName}</h2>
                  <Link href="/profile/edit">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit2 className="h-4 w-4 text-primary" />
                    </Button>
                  </Link>
                </div>
                <div className="mt-2 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {displayPhone}
                  </div>
                </div>
              </div>
            </div>
            {displayBio && (
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">{displayBio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Clubs */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Мои клубы</CardTitle>
          </CardHeader>
          <CardContent>
            {enrollments.length > 0 ? (
              <div className="flex flex-col gap-3">
                {enrollments.map((enrollment) => {
                  const club = enrollment.clubs
                  const statusConfig = getStatusConfig(enrollment.status)
                  const StatusIcon = statusConfig.icon

                  if (!club) return null

                  return (
                    <Link key={enrollment.id} href={`/clubs/${club.id}`}>
                      <div className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted">
                        <img
                          src={club.image}
                          alt={club.name}
                          className="h-14 w-14 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{club.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {enrollment.child_name}, {enrollment.child_age} лет
                          </p>
                          <div className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${statusConfig.className}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground">Вы пока не записаны ни в один клуб</p>
                <Link href="/clubs">
                  <Button variant="link" className="mt-2 text-primary">
                    Выбрать клуб
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* History Section */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">История записей</CardTitle>
          </CardHeader>
          <CardContent>
            {enrollments.length > 0 ? (
              <div className="flex flex-col gap-2">
                {enrollments.map((enrollment) => {
                  const club = enrollment.clubs
                  if (!club) return null

                  return (
                    <div key={enrollment.id} className="flex items-center justify-between border-b border-border py-2 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-foreground">{club.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Заявка от {new Date(enrollment.created_at).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${getStatusConfig(enrollment.status).className}`}>
                        {getStatusConfig(enrollment.status).label}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                История записей пуста
              </p>
            )}
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Выйти из аккаунта
        </Button>
      </div>
    </MobileLayout>
  )
}