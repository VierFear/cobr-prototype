'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MobileLayout } from '@/components/mobile-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import { Calendar, User, Phone, Package, CheckCircle } from 'lucide-react'
import type { Club } from '@/lib/types'

export default function ClubDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [club, setClub] = useState<Club | null>(null)
  const [user, setUser] = useState<any>(null)
  const [existingEnrollment, setExistingEnrollment] = useState<any>(null)
  const [showEnrollForm, setShowEnrollForm] = useState(false)
  const [enrollSuccess, setEnrollSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<'description' | 'schedule' | 'materials'>('description')
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    childName: '',
    childAge: '',
    parentPhone: '',
    comment: ''
  })

  // Загрузка клуба, пользователя и проверка существующей заявки
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      // 1. Получаем текущего пользователя
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)
      if (currentUser) {
        // Получаем телефон из таблицы users (если есть)
        const { data: userData } = await supabase
          .from('users')
          .select('phone')
          .eq('id', currentUser.id)
          .single()
        if (userData?.phone) {
          setFormData(prev => ({ ...prev, parentPhone: userData.phone }))
        }
      }

      // 2. Получаем клуб с занятиями и материалами
      const { data: clubData, error } = await supabase
        .from('clubs')
        .select('*, lessons(*), materials(*)')
        .eq('id', id)
        .single()

      if (error || !clubData) {
        console.error('Ошибка загрузки клуба:', error)
        setLoading(false)
        return
      }

      // Преобразуем snake_case → camelCase
    const formattedClub = {
      id: clubData.id?.toString() ?? '',
      name: clubData.name ?? '',
      description: clubData.description ?? '',
      fullDescription: (clubData as any).full_description ?? (clubData as any).fullDescription ?? '',
      category: clubData.category ?? 'drones',
      ageGroup: clubData.age_group ?? (clubData as any).ageGroup ?? '',
      schedule: clubData.schedule ?? '',
      leader: clubData.leader ?? '',
      leaderContact: clubData.leader_contact ?? (clubData as any).leaderContact ?? '',
      image: clubData.image ?? '',
      logo: clubData.logo ?? '',
      materials: (clubData.materials || []).map((m: any) => ({
        id: m.id?.toString() ?? '',
        title: m.title ?? '',
        url: m.url ?? '',
        type: m.type ?? 'other',
      })),
      lessons: (clubData.lessons || []).map((l: any) => ({
        id: l.id?.toString() ?? '',
        date: l.date ?? '',
        time: l.time ?? '',
        topic: l.topic ?? '',
      })),
    } as any
    
    setClub(formattedClub)

      // 3. Проверяем, есть ли уже заявка от этого пользователя
      if (currentUser) {
        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('club_id', id)
          .neq('status', 'completed')
          .maybeSingle()
        setExistingEnrollment(enrollment)
      }

      setLoading(false)
    }

    fetchData()
  }, [id])

  const handleEnroll = () => {
    if (!user) {
      router.push('/login')
      return
    }
    if (existingEnrollment) return
    setShowEnrollForm(true)
  }

  const handleSubmitEnrollment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const { error } = await supabase
      .from('enrollments')
      .insert([
        {
          user_id: user.id,
          club_id: parseInt(id),
          child_name: formData.childName,
          child_age: parseInt(formData.childAge),
          parent_phone: formData.parentPhone,
          comment: formData.comment,
          status: 'pending',
        },
      ])

    if (error) {
      console.error('Ошибка при записи:', error)
    } else {
      setEnrollSuccess(true)
      setShowEnrollForm(false)
      // Обновляем статус существующей заявки
      setExistingEnrollment({ id: 'new', status: 'pending' })
    }
  }

  if (loading) {
    return (
      <MobileLayout showBack backHref="/clubs" title="Загрузка">
        <div className="flex justify-center items-center h-64">
          <p>Загрузка...</p>
        </div>
      </MobileLayout>
    )
  }

  if (!club) {
    return (
      <MobileLayout showBack backHref="/clubs" title="Клуб не найден">
        <div className="flex flex-col items-center justify-center p-8">
          <p className="text-muted-foreground">Клуб не найден</p>
          <Button onClick={() => router.push('/clubs')} className="mt-4">
            К списку клубов
          </Button>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout showBack backHref="/clubs" title={club.name}>
      <div className="flex flex-col">
        {/* Cover Image */}
        <div className="relative h-56">
          <img
            src={club.image}
            alt={club.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {club.logo && (
            <img
              src={club.logo}
              alt={`${club.name} logo`}
              className="absolute right-4 top-4 h-16 w-16 rounded-md border border-white object-cover bg-white/80"
            />
          )}

          <div className="absolute bottom-4 left-4 right-4">
            <span className="mb-2 inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              {club.age_group || 'Не указан'}
            </span>
            <h1 className="text-balance text-2xl font-bold text-white">{club.name}</h1>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Расписание</p>
                <p className="text-sm font-medium text-foreground">{club.schedule}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Руководитель</p>
                <p className="text-sm font-medium text-foreground">{club.leader}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Контакт</p>
                <p className="text-sm font-medium text-foreground">{club.leader_contact || 'Не указан'}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveTab('description')}
              className={`rounded-t-lg border-b-2 px-3 py-2 text-sm font-medium ${activeTab === 'description' ? 'border-[#0057B8] text-[#0057B8]' : 'border-transparent text-muted-foreground'}`}
            >
              Описание
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className={`rounded-t-lg border-b-2 px-3 py-2 text-sm font-medium ${activeTab === 'schedule' ? 'border-[#0057B8] text-[#0057B8]' : 'border-transparent text-muted-foreground'}`}
            >
              Расписание
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('materials')}
              className={`rounded-t-lg border-b-2 px-3 py-2 text-sm font-medium ${activeTab === 'materials' ? 'border-[#0057B8] text-[#0057B8]' : 'border-transparent text-muted-foreground'}`}
            >
              Материалы
            </button>
          </div>

          <Card className="rounded-b-lg rounded-t-none">
            <CardContent className="p-4">
              {activeTab === 'description' && (
                <p className="text-sm text-muted-foreground">
                {club.full_description || club.description || 'Описание отсутствует'}
                </p>
              )}

              {activeTab === 'schedule' && (
                <div>
                  {(club.lessons && club.lessons.length > 0) ? (
                    <ul className="space-y-2">
                      {club.lessons.map((lesson) => (
                        <li key={lesson.id} className="rounded border border-border p-3">
                          <p className="text-sm font-medium">{lesson.date} • {lesson.time}</p>
                          <p className="text-xs text-muted-foreground">{lesson.topic}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">Занятия ещё не добавлены.</p>
                  )}
                </div>
              )}

              {activeTab === 'materials' && (
                <div>
                  {(club.materials && club.materials.length > 0) ? (
                    <ul className="space-y-2">
                      {club.materials.map((material) => (
                        <li key={material.id} className="rounded border border-border p-3">
                          <a href={material.url} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
                            {material.title}
                          </a>
                          <p className="text-xs text-muted-foreground">{material.type ?? 'other'}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">Материалы пока не добавлены.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enrollment Success */}
          {enrollSuccess && (
            <Card className="border-green-500 bg-green-50">
              <CardContent className="flex items-center gap-3 pt-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">Заявка отправлена!</p>
                  <p className="text-sm text-green-700">
                    Мы свяжемся с вами в ближайшее время
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enrollment Form */}
          {showEnrollForm && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Запись в клуб</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitEnrollment} className="flex flex-col gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">
                      Имя ребёнка
                    </label>
                    <Input
                      value={formData.childName}
                      onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                      required
                      placeholder="Введите имя"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">
                      Возраст
                    </label>
                    <Input
                      type="number"
                      value={formData.childAge}
                      onChange={(e) => setFormData({ ...formData, childAge: e.target.value })}
                      required
                      min={6}
                      max={18}
                      placeholder="Возраст"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">
                      Телефон родителя
                    </label>
                    <Input
                      type="tel"
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                      required
                      placeholder="+7 (___) ___-__-__"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">
                      Комментарий (необязательно)
                    </label>
                    <Textarea
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      placeholder="Дополнительная информация"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowEnrollForm(false)}
                    >
                      Отмена
                    </Button>
                    <Button type="submit" className="flex-1 bg-primary text-primary-foreground">
                      Отправить
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Enroll Button */}
          {!showEnrollForm && !enrollSuccess && (
            <Button
              onClick={handleEnroll}
              disabled={!!existingEnrollment}
              className="w-full bg-primary text-primary-foreground"
              size="lg"
            >
              {existingEnrollment
                ? 'Вы уже записаны'
                : user
                ? 'Записаться'
                : 'Войти для записи'}
            </Button>
          )}
        </div>
      </div>
    </MobileLayout>
  )
}