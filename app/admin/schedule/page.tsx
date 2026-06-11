'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MobileLayout } from '@/components/mobile-layout'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Clock } from 'lucide-react'

interface Club {
  id: number
  name: string
}

interface Lesson {
  id: number
  date: string
  time: string
  topic: string
  duration_minutes?: number
}

export default function AdminSchedulePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [clubs, setClubs] = useState<Club[]>([])
  const [clubId, setClubId] = useState<string>('')
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [lesson, setLesson] = useState({ 
    date: '', 
    time: '', 
    topic: '',
    duration_minutes: 60 
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
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
      
      const { data: clubsData } = await supabase
        .from('clubs')
        .select('id, name')
        .order('name')
      
      setClubs(clubsData || [])
      if (clubsData && clubsData.length > 0) {
        setClubId(String(clubsData[0].id))
      }
      
      setLoading(false)
    }
    
    fetchData()
  }, [])

  useEffect(() => {
    if (!clubId) return
    
    const fetchLessons = async () => {
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .eq('club_id', parseInt(clubId))
        .order('date', { ascending: true })
      
      setLessons(lessonsData || [])
    }
    
    fetchLessons()
  }, [clubId])

  const addLesson = async () => {
    if (!lesson.date || !lesson.time || !lesson.topic) return
    
    const { data: newLesson, error } = await supabase
      .from('lessons')
      .insert({
        club_id: parseInt(clubId),
        date: lesson.date,
        time: lesson.time,
        topic: lesson.topic,
        duration_minutes: lesson.duration_minutes,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Ошибка при добавлении занятия:', error)
      alert('Не удалось добавить занятие')
    } else {
      setLessons([...lessons, newLesson])
      setLesson({ date: '', time: '', topic: '', duration_minutes: 60 })
    }
  }

  const removeLesson = async (lessonId: number) => {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId)
    
    if (error) {
      console.error('Ошибка при удалении занятия:', error)
      alert('Не удалось удалить занятие')
    } else {
      setLessons(lessons.filter(l => l.id !== lessonId))
    }
  }

  if (loading) {
    return (
      <MobileLayout showBack backHref="/admin" title="Расписание">
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <span className="text-muted-foreground">Загрузка...</span>
        </div>
      </MobileLayout>
    )
  }

  if (!user || !isAdmin) {
    router.push('/')
    return null
  }

  if (clubs.length === 0) {
    return (
      <MobileLayout showBack backHref="/admin" title="Расписание">
        <div className="p-4 text-center text-sm text-muted-foreground">
          Нет клубов для настройки расписания.
        </div>
      </MobileLayout>
    )
  }

  // Группируем занятия по датам для красивого отображения
  const groupedLessons = lessons.reduce((acc, lesson) => {
    const date = lesson.date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(lesson)
    return acc
  }, {} as Record<string, Lesson[]>)

  // Сортируем даты
  const sortedDates = Object.keys(groupedLessons).sort()

  return (
    <MobileLayout showBack backHref="/admin" title="Расписание">
      <div className="p-4 space-y-4">
        {/* Выбор клуба */}
        <Card>
          <CardHeader>
            <CardTitle>Выберите клуб</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={clubId} onValueChange={(value) => setClubId(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите клуб" />
              </SelectTrigger>
              <SelectContent>
                {clubs.map((club) => (
                  <SelectItem key={club.id} value={String(club.id)}>
                    {club.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Форма добавления занятия */}
        <Card>
          <CardHeader>
            <CardTitle>Добавить занятие</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input 
              type="date" 
              value={lesson.date} 
              onChange={(e) => setLesson({ ...lesson, date: e.target.value })} 
            />
            <div className="flex gap-2">
              <Input 
                type="time" 
                value={lesson.time} 
                onChange={(e) => setLesson({ ...lesson, time: e.target.value })} 
                className="flex-1"
              />
              <select
                value={lesson.duration_minutes}
                onChange={(e) => setLesson({ ...lesson, duration_minutes: parseInt(e.target.value) })}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="30">30 мин</option>
                <option value="45">45 мин</option>
                <option value="60">1 час</option>
                <option value="90">1.5 часа</option>
                <option value="120">2 часа</option>
              </select>
            </div>
            <Input 
              placeholder="Тема занятия" 
              value={lesson.topic} 
              onChange={(e) => setLesson({ ...lesson, topic: e.target.value })} 
            />
            <Button onClick={addLesson} className="w-full">Добавить занятие</Button>
          </CardContent>
        </Card>

        {/* Список занятий с группировкой по датам */}
        <Card>
          <CardHeader>
            <CardTitle>Текущее расписание</CardTitle>
          </CardHeader>
          <CardContent>
            {lessons.length === 0 ? (
              <p className="text-sm text-muted-foreground">Расписание не задано.</p>
            ) : (
              <div className="space-y-4">
                {sortedDates.map((date) => {
                  const dateObj = new Date(date)
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  const isPast = dateObj < today
                  
                  return (
                    <div key={date}>
                      <h4 className={`mb-2 text-sm font-medium ${isPast ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {dateObj.toLocaleDateString('ru-RU', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long' 
                        })}
                        {isPast && <span className="ml-2 text-xs text-muted-foreground">(прошло)</span>}
                      </h4>
                      <div className="space-y-2">
                        {groupedLessons[date].map((item) => (
                          <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <p className="text-sm font-medium">{item.time}</p>
                                {item.duration_minutes && (
                                  <span className="text-xs text-muted-foreground">
                                    ({item.duration_minutes} мин)
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-sm">{item.topic}</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeLesson(item.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Button variant="outline" onClick={() => router.push('/admin')} className="w-full">
          Назад в админку
        </Button>
      </div>
    </MobileLayout>
  )
}