'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { MobileLayout } from '@/components/mobile-layout'
import { useApp } from '@/lib/context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function AdminSchedulePage() {
  const router = useRouter()
  const { clubs, addClubLesson, removeClubLesson, isInitialized, user } = useApp()
  const [clubId, setClubId] = useState<string>(clubs[0]?.id ?? '')
  const [lesson, setLesson] = useState({ date: '', time: '', topic: '' })

  const currentClub = useMemo(() => clubs.find((c) => c.id === clubId), [clubs, clubId])

  if (!isInitialized) {
    return (
      <MobileLayout showBack backHref="/admin" title="Расписание">
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <span className="text-muted-foreground">Загрузка...</span>
        </div>
      </MobileLayout>
    )
  }

  if (!user?.isAdmin) {
    router.push('/')
    return null
  }

  if (clubs.length === 0) {
    return (
      <MobileLayout showBack backHref="/admin" title="Расписание">
        <div className="p-4 text-center text-sm text-muted-foreground">Нет клубов для настройки расписания.</div>
      </MobileLayout>
    )
  }

  const addLesson = () => {
    if (!lesson.date || !lesson.time || !lesson.topic) return
    addClubLesson(clubId, lesson)
    setLesson({ date: '', time: '', topic: '' })
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
                  <SelectItem key={club.id} value={club.id}>
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
            <Input type="date" value={lesson.date} onChange={(e) => setLesson({ ...lesson, date: e.target.value })} />
            <Input type="time" value={lesson.time} onChange={(e) => setLesson({ ...lesson, time: e.target.value })} />
            <Input placeholder="Тема" value={lesson.topic} onChange={(e) => setLesson({ ...lesson, topic: e.target.value })} />
            <Button onClick={addLesson} className="w-full">Добавить</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Текущее расписание</CardTitle>
          </CardHeader>
          <CardContent>
            {(currentClub?.lessons?.length ?? 0) > 0 ? (
              <ul className="space-y-2">
                {currentClub!.lessons!.map((item) => (
                  <li key={item.id} className="flex items-center justify-between rounded border border-border p-2">
                    <div>
                      <p className="text-sm font-medium">{item.date} {item.time}</p>
                      <p className="text-xs text-muted-foreground">{item.topic}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeClubLesson(clubId, item.id)}>
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
