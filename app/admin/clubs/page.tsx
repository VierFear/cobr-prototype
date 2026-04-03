'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MobileLayout } from '@/components/mobile-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
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

interface Club {
  id: number
  name: string
  image: string
  age_group: string
}

export default function AdminClubsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [clubs, setClubs] = useState<Club[]>([])
  const [enrollmentsCount, setEnrollmentsCount] = useState<Record<number, number>>({})

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      // 1. Получаем текущего пользователя
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        setLoading(false)
        return
      }
      
      setUser(authUser)
      
      // 2. Проверяем, является ли пользователь админом
      const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', authUser.id)
        .single()
      
      const adminStatus = userData?.is_admin || false
      setIsAdmin(adminStatus)
      
      if (!adminStatus) {
        setLoading(false)
        return
      }
      
      // 3. Получаем список клубов
      const { data: clubsData } = await supabase
        .from('clubs')
        .select('*')
        .order('name')
      
      setClubs(clubsData || [])
      
      // 4. Получаем количество активных заявок для каждого клуба
      const { data: enrollmentsData } = await supabase
        .from('enrollments')
        .select('club_id')
        .neq('status', 'completed')
      
      const counts: Record<number, number> = {}
      enrollmentsData?.forEach((e: any) => {
        counts[e.club_id] = (counts[e.club_id] || 0) + 1
      })
      setEnrollmentsCount(counts)
      
      setLoading(false)
    }
    
    fetchData()
  }, [])

  const handleDeleteClub = async (clubId: number) => {
    const { error } = await supabase
      .from('clubs')
      .delete()
      .eq('id', clubId)
    
    if (error) {
      console.error('Ошибка при удалении клуба:', error)
      alert('Не удалось удалить клуб')
    } else {
      // Обновляем список клубов
      setClubs(clubs.filter(c => c.id !== clubId))
    }
  }

  if (loading) {
    return (
      <MobileLayout showBack backHref="/admin" title="Управление клубами">
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <p>Загрузка...</p>
        </div>
      </MobileLayout>
    )
  }

  if (!user || !isAdmin) {
    router.push('/')
    return null
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
                  <p className="text-xs text-muted-foreground">{club.age_group}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {enrollmentsCount[club.id] || 0} учеников
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
                          onClick={() => handleDeleteClub(club.id)}
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