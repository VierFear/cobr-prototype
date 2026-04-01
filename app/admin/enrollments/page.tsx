'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MobileLayout } from '@/components/mobile-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useApp } from '@/lib/context'
import { Enrollment } from '@/lib/types'
import { Spinner } from '@/components/ui/spinner'
import { Clock, CheckCircle, XCircle, Phone, MessageSquare } from 'lucide-react'

export default function AdminEnrollmentsPage() {
  const router = useRouter()
  const { user, clubs, users, enrollments, updateEnrollmentStatus, isInitialized } = useApp()
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all')

  if (!isInitialized) {
    return (
      <MobileLayout showBack backHref="/admin" title="Заявки">
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      </MobileLayout>
    )
  }

  if (!user?.isAdmin) {
    router.push('/')
    return null
  }

  const filteredEnrollments = enrollments.filter(e => 
    filter === 'all' || e.status === filter
  )

  const getStatusConfig = (status: Enrollment['status']) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Ожидает',
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
          icon: XCircle,
          className: 'bg-gray-100 text-gray-800'
        }
    }
  }

  return (
    <MobileLayout showBack backHref="/admin" title="Заявки">
      <div className="flex flex-col gap-4 p-4">
        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['all', 'pending', 'accepted', 'completed'] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
              className={`shrink-0 ${
                filter === status 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-foreground'
              }`}
            >
              {status === 'all' ? 'Все' : 
               status === 'pending' ? 'Ожидают' :
               status === 'accepted' ? 'Приняты' : 'Завершены'}
              {status !== 'all' && (
                <span className="ml-1.5 rounded-full bg-background/20 px-1.5 text-xs">
                  {enrollments.filter(e => e.status === status).length}
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* Enrollments List */}
        <div className="flex flex-col gap-3">
          {filteredEnrollments.length > 0 ? (
            filteredEnrollments.map((enrollment) => {
              const club = clubs.find(c => c.id === enrollment.clubId)
              const enrollmentUser = users.find(u => u.id === enrollment.userId)
              const statusConfig = getStatusConfig(enrollment.status)
              const StatusIcon = statusConfig.icon

              if (!club) return null

              return (
                <Card key={enrollment.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={club.image}
                        alt={club.name}
                        className="h-14 w-14 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-foreground">
                              {enrollment.childName}, {enrollment.childAge} лет
                            </h4>
                            <p className="text-xs text-muted-foreground">{club.name}</p>
                          </div>
                          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${statusConfig.className}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </span>
                        </div>
                        
                        <div className="mt-2 flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {enrollment.parentPhone}
                          </div>
                          {enrollment.comment && (
                            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                              <MessageSquare className="mt-0.5 h-3 w-3" />
                              {enrollment.comment}
                            </div>
                          )}
                        </div>

                        <p className="mt-2 text-xs text-muted-foreground">
                          Заявка от {enrollment.createdAt}
                        </p>

                        {/* Action Buttons */}
                        {enrollment.status === 'pending' && (
                          <div className="mt-3 flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-green-600 text-white hover:bg-green-700"
                              onClick={() => updateEnrollmentStatus(enrollment.id, 'accepted')}
                            >
                              Принять
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => updateEnrollmentStatus(enrollment.id, 'completed')}
                            >
                              Отклонить
                            </Button>
                          </div>
                        )}

                        {enrollment.status === 'accepted' && (
                          <div className="mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full"
                              onClick={() => updateEnrollmentStatus(enrollment.id, 'completed')}
                            >
                              Завершить обучение
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Заявки не найдены</p>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  )
}
