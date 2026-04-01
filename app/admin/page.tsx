'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MobileLayout } from '@/components/mobile-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useApp } from '@/lib/context'
import { Spinner } from '@/components/ui/spinner'
import { 
  Users, 
  BookOpen, 
  ClipboardList, 
  Plus,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const { user, clubs, enrollments, users, isInitialized } = useApp()

  if (!isInitialized) {
    return (
      <MobileLayout showBack backHref="/" title="Админ панель">
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      </MobileLayout>
    )
  }

  // Redirect non-admin users
  if (!user?.isAdmin) {
    return (
      <MobileLayout showBack backHref="/" title="Доступ запрещён">
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">Доступ запрещён</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Эта страница доступна только администраторам
            </p>
            <Button 
              onClick={() => router.push('/')} 
              className="mt-4 bg-primary text-primary-foreground"
            >
              На главную
            </Button>
          </div>
        </div>
      </MobileLayout>
    )
  }

  const pendingEnrollments = enrollments.filter(e => e.status === 'pending').length
  const acceptedEnrollments = enrollments.filter(e => e.status === 'accepted').length
  const totalUsers = users.filter(u => !u.isAdmin).length

  return (
    <MobileLayout showBack backHref="/" title="Админ панель">
      <div className="flex flex-col gap-4 p-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-primary/5">
            <CardContent className="flex flex-col items-center pt-4">
              <BookOpen className="mb-2 h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">{clubs.length}</span>
              <span className="text-xs text-muted-foreground">Клубов</span>
            </CardContent>
          </Card>
          <Card className="bg-primary/5">
            <CardContent className="flex flex-col items-center pt-4">
              <Users className="mb-2 h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">{totalUsers}</span>
              <span className="text-xs text-muted-foreground">Пользователей</span>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50">
            <CardContent className="flex flex-col items-center pt-4">
              <Clock className="mb-2 h-8 w-8 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-600">{pendingEnrollments}</span>
              <span className="text-xs text-muted-foreground">Ожидают</span>
            </CardContent>
          </Card>
          <Card className="bg-green-50">
            <CardContent className="flex flex-col items-center pt-4">
              <CheckCircle className="mb-2 h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{acceptedEnrollments}</span>
              <span className="text-xs text-muted-foreground">Активных</span>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link href="/admin/clubs/new">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4 text-primary" />
                Создать новый клуб
              </Button>
            </Link>
            <Link href="/admin/clubs">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="mr-2 h-4 w-4 text-primary" />
                Управление клубами
              </Button>
            </Link>
            <Link href="/admin/enrollments">
              <Button variant="outline" className="w-full justify-start">
                <ClipboardList className="mr-2 h-4 w-4 text-primary" />
                Заявки на запись
                {pendingEnrollments > 0 && (
                  <span className="ml-auto rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                    {pendingEnrollments}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/admin/schedule">
              <Button variant="outline" className="w-full justify-start">
                <Clock className="mr-2 h-4 w-4 text-primary" />
                Расписание
              </Button>
            </Link>
            <Link href="/admin/materials">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="mr-2 h-4 w-4 text-primary" />
                Материалы
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Последние заявки
            </CardTitle>
          </CardHeader>
          <CardContent>
            {enrollments.slice(0, 5).map((enrollment) => {
              const club = clubs.find(c => c.id === enrollment.clubId)
              const enrollmentUser = users.find(u => u.id === enrollment.userId)
              
              return (
                <div 
                  key={enrollment.id} 
                  className="flex items-center justify-between border-b border-border py-2 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {enrollment.childName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {club?.name} • {enrollment.createdAt}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    enrollment.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : enrollment.status === 'accepted'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {enrollment.status === 'pending' ? 'Ожидает' : 
                     enrollment.status === 'accepted' ? 'Принят' : 'Завершён'}
                  </span>
                </div>
              )
            })}
            <Link href="/admin/enrollments">
              <Button variant="link" className="mt-2 w-full text-primary">
                Посмотреть все заявки
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  )
}
