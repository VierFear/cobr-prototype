'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MobileLayout } from '@/components/mobile-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useApp } from '@/lib/context'
import { Spinner } from '@/components/ui/spinner'
import { Plus, Edit, Users, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AdminClubsPage() {
  const router = useRouter()
  const { user, clubs, enrollments, deleteClub, isInitialized } = useApp()

  if (!isInitialized) {
    return (
      <MobileLayout showBack backHref="/admin" title="Управление клубами">
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

  const getClubEnrollmentCount = (clubId: string) => {
    return enrollments.filter(e => e.clubId === clubId && e.status !== 'completed').length
  }

  return (
    <MobileLayout showBack backHref="/admin" title="Управление клубами">
      <div className="flex flex-col gap-4 p-4">
        {/* Add New Club Button */}
        <Link href="/admin/clubs/new">
          <Button className="w-full bg-primary text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" />
            Добавить клуб
          </Button>
        </Link>

        {/* Clubs List */}
        <div className="flex flex-col gap-3">
          {clubs.map((club) => (
            <Card key={club.id} className="overflow-hidden">
              <CardContent className="flex items-center gap-3 p-3">
                <img
                  src={club.image}
                  alt={club.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{club.name}</h3>
                  <p className="text-xs text-muted-foreground">{club.ageGroup}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {getClubEnrollmentCount(club.id)} учеников
                  </div>
                </div>
                <div className="flex items-center">
                  <Link href={`/admin/clubs/${club.id}`}>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4 text-primary" />
                      <span className="sr-only">Редактировать</span>
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Удалить</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Удалить клуб?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Это действие нельзя отменить. Клуб "{club.name}" будет удален вместе со всеми связанными заявками.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteClub(club.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Удалить
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MobileLayout>
  )
}
