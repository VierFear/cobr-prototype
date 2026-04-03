'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MobileLayout } from '@/components/mobile-layout'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Club {
  id: number
  name: string
}

interface Lesson {
  id: number
  date: string
  time: string
  topic: string
}

export default function AdminSchedulePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [clubs, setClubs] = useState<Club[]>([])
  const [clubId, setClubId] = useState<string>('')
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [lesson, setLesson] = useState({ date: '', time: '', topic: '' })

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

  // Загрузка расписания при смене клуба
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
      })
      .select()
      .single()
    
    if (error) {
      console.error('Ошибка при добавлении занятия:', error)
      alert('Не удалось добавить занятие')
    } else {
      setLessons([...lessons, newLesson])
      setLesson({ date: '', time: '', topic: '' })
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

  return (
    <MobileLayout showBack backHref="/admin" title="Расписание">
      <div className="p-4 space-y-4">
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

        <Card>
          <CardHeader>
            <CardTitle>Добавить занятие</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Input 
              type="date" 
              value={lesson.date} 
              onChange={(e) => setLesson({ ...lesson, date: e.target.value })} 
            />
            <Input 
              type="time" 
              value={lesson.time} 
              onChange={(e) => setLesson({ ...lesson, time: e.target.value })} 
            />
            <Input 
              placeholder="Тема занятия" 
              value={lesson.topic} 
              onChange={(e) => setLesson({ ...lesson, topic: e.target.value })} 
            />
            <Button onClick={addLesson} className="w-full">Добавить занятие</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Текущее расписание</CardTitle>
          </CardHeader>
          <CardContent>
            {lessons.length > 0 ? (
              <ul className="space-y-2">
                {lessons.map((item) => (
                  <li key={item.id} className="flex items-center justify-between rounded border border-border p-2">
                    <div>
                      <p className="text-sm font-medium">{item.date} • {item.time}</p>
                      <p className="text-xs text-muted-foreground">{item.topic}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeLesson(item.id)}>
                      Удалить
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Расписание не задано.</p>
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