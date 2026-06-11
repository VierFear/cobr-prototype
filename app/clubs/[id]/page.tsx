'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MobileLayout } from '@/components/mobile-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { notifyNewEnrollmentToAdmin } from '@/lib/notifications'
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
  const [currentEnrollments, setCurrentEnrollments] = useState(0)
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
        is_open: clubData.is_open ?? true,
        capacity: clubData.capacity ?? 0,
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

      // 3. Загружаем количество подтверждённых заявок для этого клуба
      const { count: enrollmentsCount } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('club_id', id)
        .eq('status', 'accepted')

      setCurrentEnrollments(enrollmentsCount || 0)

      // 4. Проверяем, есть ли уже заявка от этого пользователя
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

  const { data: newEnrollment, error } = await supabase
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
    .select()
    .single()

  if (error) {
    console.error('Ошибка при записи:', error)
  } else {
    // Получаем ID админа (первого админа в системе)
    const { data: adminData } = await supabase
      .from('users')
      .select('id')
      .eq('is_admin', true)
      .limit(1)
      .single()

    if (adminData && newEnrollment) {
      await notifyNewEnrollmentToAdmin(
        adminData.id,
        newEnrollment.id,
        formData.childName,
        club?.name || 'клуб'
      )
    }

    setEnrollSuccess(true)
    setShowEnrollForm(false)
    // Обновляем статус существующей заявки
    setExistingEnrollment({ id: 'new', status: 'pending' })
   }
  }

  const isFull = () => {
    if (!club?.capacity || club.capacity === 0) return false
    return currentEnrollments >= club.capacity
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
              {club.ageGroup || 'Не указан'}
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
                <p className="text-sm font-medium text-foreground">{club.leaderContact || 'Не указан'}</p>
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
                {club.fullDescription || club.description || 'Описание отсутствует'}
                </p>
              )}

              {activeTab === 'schedule' && (
  <div>
    {(!club.lessons || club.lessons.length === 0) ? (
      <p className="text-sm text-muted-foreground">Занятия ещё не добавлены.</p>
    ) : (
      (() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        
        const grouped = {
          past: [] as any[],
          today: [] as any[],
          tomorrow: [] as any[],
          future: [] as any[]
        }
        
        club.lessons.forEach((lesson: any) => {
          const lessonDate = new Date(lesson.date)
          lessonDate.setHours(0, 0, 0, 0)
          
          if (lessonDate < today) {
            grouped.past.push(lesson)
          } else if (lessonDate.getTime() === today.getTime()) {
            grouped.today.push(lesson)
          } else if (lessonDate.getTime() === tomorrow.getTime()) {
            grouped.tomorrow.push(lesson)
          } else {
            grouped.future.push(lesson)
          }
        })
        
        grouped.future.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        
        const hasActiveLessons = grouped.today.length > 0 || grouped.tomorrow.length > 0 || grouped.future.length > 0
        
        return (
          <div className="space-y-4">
            {/* Счётчик занятий */}
            <div className="flex flex-wrap gap-2">
              {grouped.today.length > 0 && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                  Сегодня: {grouped.today.length}
                </span>
              )}
              {grouped.tomorrow.length > 0 && (
                <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
                  Завтра: {grouped.tomorrow.length}
                </span>
              )}
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-muted-foreground">
                Всего: {club.lessons.length}
              </span>
            </div>
            
            {/* СЕГОДНЯ */}
            {grouped.today.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-green-600">Сегодня</h4>
                <div className="space-y-2">
                  {grouped.today.map((lesson: any) => (
                    <div key={lesson.id} className="rounded-lg border border-green-200 bg-green-50/30 p-3">
                      <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{lesson.topic}</p>
                      <span className="text-xs text-muted-foreground">
                        {lesson.duration_minutes && lesson.time && !lesson.time.includes('-')
                          ? (() => {
                              const [hours, minutes] = lesson.time.split(':').map(Number)
                              const end = new Date(0, 0, 0, hours, (minutes || 0) + lesson.duration_minutes)
                              const endTime = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`
                              return `${lesson.time} → ${endTime}`
                            })()
                          : lesson.time}
                      </span>
                    </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(lesson.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* ЗАВТРА */}
            {grouped.tomorrow.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-yellow-600">Завтра</h4>
                <div className="space-y-2">
                  {grouped.tomorrow.map((lesson: any) => (
                    <div key={lesson.id} className="rounded-lg border border-yellow-200 bg-yellow-50/30 p-3">
                      <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{lesson.topic}</p>
                      <span className="text-xs text-muted-foreground">
                        {lesson.duration_minutes && lesson.time && !lesson.time.includes('-')
                          ? (() => {
                              const [hours, minutes] = lesson.time.split(':').map(Number)
                              const end = new Date(0, 0, 0, hours, (minutes || 0) + lesson.duration_minutes)
                              const endTime = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`
                              return `${lesson.time} → ${endTime}`
                            })()
                          : lesson.time}
                      </span>
                    </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(lesson.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* БУДУЩИЕ ЗАНЯТИЯ */}
            {grouped.future.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-blue-600">Ближайшие занятия</h4>
                <div className="space-y-2">
                  {grouped.future.map((lesson: any) => (
                    <div key={lesson.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{lesson.topic}</p>
                      <span className="text-xs text-muted-foreground">
                        {lesson.duration_minutes && lesson.time && !lesson.time.includes('-')
                          ? (() => {
                              const [hours, minutes] = lesson.time.split(':').map(Number)
                              const end = new Date(0, 0, 0, hours, (minutes || 0) + lesson.duration_minutes)
                              const endTime = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`
                              return `${lesson.time} → ${endTime}`
                            })()
                          : lesson.time}
                      </span>
                    </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(lesson.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* ПРОШЕДШИЕ ЗАНЯТИЯ */}
            {grouped.past.length > 0 && (
              <details className="group">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  Прошедшие занятия ({grouped.past.length})
                </summary>
                <div className="mt-2 space-y-2">
                  {grouped.past.map((lesson: any) => (
                    <div key={lesson.id} className="rounded-lg border border-border bg-muted/30 p-3 opacity-60">
                      <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{lesson.topic}</p>
                      <span className="text-xs text-muted-foreground">
                        {lesson.duration_minutes && lesson.time && !lesson.time.includes('-')
                          ? (() => {
                              const [hours, minutes] = lesson.time.split(':').map(Number)
                              const end = new Date(0, 0, 0, hours, (minutes || 0) + lesson.duration_minutes)
                              const endTime = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`
                              return `${lesson.time} → ${endTime}`
                            })()
                          : lesson.time}
                      </span>
                    </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(lesson.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                  ))}
                </div>
              </details>
            )}
            
            {!hasActiveLessons && grouped.past.length > 0 && (
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Активных занятий нет
              </div>
            )}
          </div>
        )
      })()
    )}
  </div>
)}

              {activeTab === 'materials' && (
            <div>
              {(club.materials && club.materials.length > 0) ? (
                <div className="space-y-3">
                  {club.materials.map((material) => {
                    // Определяем иконку по типу или URL
                    const getIcon = () => {
                      if (material.type === 'youtube' || material.url?.includes('youtube.com') || material.url?.includes('youtu.be')) {
                        return '📺'
                      }
                      if (material.type === 'pdf' || material.url?.endsWith('.pdf')) {
                        return '📄'
                      }
                      if (material.type === 'article') {
                        return '📖'
                      }
                      return '🔗'
                    }
          
                    // Определяем цвет фона по типу
                    const getBgColor = () => {
                      if (material.type === 'youtube' || material.url?.includes('youtube.com')) {
                        return 'bg-red-50 border-red-200'
                      }
                      if (material.type === 'pdf' || material.url?.endsWith('.pdf')) {
                        return 'bg-blue-50 border-blue-200'
                      }
                      if (material.type === 'article') {
                        return 'bg-green-50 border-green-200'
                      }
                      return 'bg-gray-50 border-gray-200'
                    }
          
                    // Определяем текст кнопки
                    const getButtonText = () => {
                      if (material.type === 'youtube') return 'Смотреть на YouTube'
                      if (material.type === 'pdf') return 'Открыть PDF'
                      if (material.type === 'article') return 'Читать статью'
                      return 'Перейти по ссылке'
                    }
          
                    return (
                      <a
                        key={material.id}
                        href={material.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`block rounded-lg border p-4 transition-all hover:shadow-md ${getBgColor()}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{getIcon()}</div>
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{material.title}</h4>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {getButtonText()}
                            </p>
                          </div>
                          <div className="text-muted-foreground">→</div>
                        </div>
                      </a>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Материалы пока не добавлены.</p>
              )}
            </div>
          )}
            </CardContent>
          </Card>

          {/* Информация о наличии мест */}
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Свободных мест:</span>
              <span className={isFull() ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                {!club.capacity || club.capacity === 0 
                  ? 'Неограничено' 
                  : `${Math.max(0, club.capacity - currentEnrollments)} из ${club.capacity}`}
              </span>
            </div>
          </div>

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
              disabled={!!existingEnrollment || !club.is_open || isFull()}
              className="w-full bg-primary text-primary-foreground"
              size="lg"
            >
              {!club.is_open
                ? 'Набор закрыт'
                : isFull()
                ? 'Мест нет'
                : existingEnrollment
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