'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MobileLayout } from '@/components/mobile-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useApp } from '@/lib/context'
import { Mail, Phone, LogOut, Clock, CheckCircle, AlertCircle, Edit2 } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const { user, clubs, logout, getUserEnrollments, isInitialized } = useApp()
  const userEnrollments = getUserEnrollments()

  if (!isInitialized) {
    return (
      <MobileLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <Spinner className="h-8 w-8 text-primary" />
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

  const handleLogout = () => {
    logout()
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

  return (
    <MobileLayout>
      <div className="flex flex-col gap-4 p-4">
        {/* User Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <img
                src={user.avatar}
                alt={user.name}
                className="h-20 w-20 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-semibold text-foreground">{user.name}</h2>
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
                    {user.phone}
                  </div>
                </div>
              </div>
            </div>
            {user.bio && (
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">{user.bio}</p>
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
            {userEnrollments.length > 0 ? (
              <div className="flex flex-col gap-3">
                {userEnrollments.map((enrollment) => {
                  const club = clubs.find((c) => c.id === enrollment.clubId)
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
                            {enrollment.childName}, {enrollment.childAge} лет
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
            {userEnrollments.length > 0 ? (
              <div className="flex flex-col gap-2">
                {userEnrollments.map((enrollment) => {
                  const club = clubs.find((c) => c.id === enrollment.clubId)
                  if (!club) return null

                  return (
                    <div key={enrollment.id} className="flex items-center justify-between border-b border-border py-2 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-foreground">{club.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Заявка от {enrollment.createdAt}
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
