'use client'

import { use } from 'react'
import Link from 'next/link'
import { MobileLayout } from '@/components/mobile-layout'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useApp } from '@/lib/context'
import { Mail, Clock, CheckCircle, UserX } from 'lucide-react'

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { getUserById, clubs, enrollments, isInitialized } = useApp()
  
  const profileUser = getUserById(id)
  const userEnrollments = enrollments.filter(e => e.userId === id && e.status === 'accepted')

  if (!isInitialized) {
    return (
      <MobileLayout header={<Header title="Профиль" showBack backHref="/" />}>
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      </MobileLayout>
    )
  }

  if (!profileUser) {
    return (
      <MobileLayout header={<Header title="Профиль" showBack backHref="/" />}>
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
          <div className="text-center">
            <UserX className="mx-auto h-16 w-16 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold text-foreground">Пользователь не найден</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Возможно, профиль был удалён
            </p>
            <Link href="/">
              <Button className="mt-4 bg-primary text-primary-foreground">
                На главную
              </Button>
            </Link>
          </div>
        </div>
      </MobileLayout>
    )
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Ожидание',
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-800'
        }
      case 'accepted':
        return {
          label: 'Участник',
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800'
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
    <MobileLayout header={<Header title="Профиль участника" showBack backHref="/" />}>
      <div className="flex flex-col gap-4 p-4">
        {/* User Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <img
                src={profileUser.avatar}
                alt={profileUser.name}
                className="h-24 w-24 rounded-full object-cover"
              />
              <h2 className="mt-3 text-xl font-semibold text-foreground">{profileUser.name}</h2>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {profileUser.email}
              </div>
              {profileUser.bio && (
                <p className="mt-4 text-sm text-muted-foreground">{profileUser.bio}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Clubs */}
        {userEnrollments.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Клубы участника</CardTitle>
            </CardHeader>
            <CardContent>
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
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{club.name}</h4>
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
            </CardContent>
          </Card>
        )}

        {userEnrollments.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Пользователь пока не участвует ни в одном клубе
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  )
}
