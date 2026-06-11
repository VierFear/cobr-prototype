'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MobileLayout } from '@/components/mobile-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import { Search, User, Phone, Mail, Calendar, Filter } from 'lucide-react'

interface Student {
  id: number
  child_name: string
  child_age: number
  parent_phone: string
  status: string
  created_at: string
  clubs: {
    id: number
    name: string
  }
  users: {
    id: string
    name: string
    email: string
    phone: string
  }
}

export default function AdminStudentsPage() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [clubs, setClubs] = useState<{ id: number; name: string }[]>([])
  const [selectedClub, setSelectedClub] = useState<number | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // 1. Проверяем авторизацию и права админа
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        setLoading(false)
        return
      }
      setUser(authUser)

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

      // 2. Получаем список клубов для фильтра
      const { data: clubsData } = await supabase
        .from('clubs')
        .select('id, name')
        .order('name')

      setClubs(clubsData || [])

      // 3. Получаем всех учеников (подтверждённые заявки со статусом accepted)
      const { data: studentsData } = await supabase
        .from('enrollments')
        .select(`
          id,
          child_name,
          child_age,
          parent_phone,
          status,
          created_at,
          clubs (
            id,
            name
          ),
          users (
            id,
            name,
            email,
            phone
          )
        `)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false })

      setStudents(studentsData as any || [])
      setFilteredStudents(studentsData as any || [])
      setLoading(false)
    }

    fetchData()
  }, [])

  // Фильтрация по клубу и поиску
  useEffect(() => {
    let filtered = [...students]

    if (selectedClub !== 'all') {
      filtered = filtered.filter(s => s.clubs?.id === selectedClub)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(s =>
        s.child_name.toLowerCase().includes(term) ||
        s.users?.name?.toLowerCase().includes(term) ||
        s.users?.email?.toLowerCase().includes(term) ||
        s.parent_phone?.includes(term)
      )
    }

    setFilteredStudents(filtered)
  }, [selectedClub, searchTerm, students])

  if (loading) {
    return (
      <MobileLayout showBack backHref="/admin" title="Ученики">
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <p>Загрузка...</p>
        </div>
      </MobileLayout>
    )
  }

  if (!user || !isAdmin) {
    return (
      <MobileLayout showBack backHref="/" title="Доступ запрещён">
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
          <p className="text-center text-muted-foreground">У вас нет доступа к этой странице</p>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout showBack backHref="/admin" title="Ученики">
      <div className="flex flex-col gap-4 p-4">
        {/* Фильтры */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-3">
              {/* Поиск */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Поиск по имени ребёнка, родителя, email или телефону..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Фильтр по клубу */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={selectedClub}
                  onChange={(e) => setSelectedClub(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">Все клубы</option>
                  {clubs.map(club => (
                    <option key={club.id} value={club.id}>{club.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Статистика */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-blue-50">
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{students.length}</p>
              <p className="text-xs text-muted-foreground">Всего учеников</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50">
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-green-600">{filteredStudents.length}</p>
              <p className="text-xs text-muted-foreground">По текущему фильтру</p>
            </CardContent>
          </Card>
        </div>

        {/* Список учеников */}
        {filteredStudents.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filteredStudents.map((student) => (
              <Card key={student.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Аватар-инициал */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                      {student.child_name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1">
                      {/* Имя ребёнка и возраст */}
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">
                          {student.child_name}, {student.child_age} лет
                        </h3>
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                          {student.status === 'accepted' ? 'Активен' : student.status}
                        </span>
                      </div>

                      {/* Клуб */}
                      <p className="mt-1 text-sm text-primary">
                        {student.clubs?.name || 'Клуб не указан'}
                      </p>

                      {/* Контакты родителя */}
                      <div className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <span>Родитель: {student.users?.name || 'Не указан'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <a href={`mailto:${student.users?.email}`} className="hover:text-primary">
                            {student.users?.email || 'Email не указан'}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <a href={`tel:${student.parent_phone}`} className="hover:text-primary">
                            {student.parent_phone || 'Телефон не указан'}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>Зачислен: {new Date(student.created_at).toLocaleDateString('ru-RU')}</span>
                        </div>
                      </div>

                      {/* Кнопка перехода в профиль родителя */}
                      {student.users?.id && (
                        <Link href={`/users/${student.users.id}`}>
                          <Button variant="outline" size="sm" className="mt-3 w-full">
                            Посмотреть профиль родителя
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Ученики не найдены</p>
          </div>
        )}
      </div>
    </MobileLayout>
  )
}