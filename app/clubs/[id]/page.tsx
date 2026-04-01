'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MobileLayout } from '@/components/mobile-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useApp } from '@/lib/context'
import { Calendar, User, Phone, Package, CheckCircle } from 'lucide-react'

export default function ClubDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { clubs, user, enroll, getUserEnrollments } = useApp()
  const [showEnrollForm, setShowEnrollForm] = useState(false)
  const [enrollSuccess, setEnrollSuccess] = useState(false)
  const [formData, setFormData] = useState({
    childName: '',
    childAge: '',
    parentPhone: user?.phone || '',
    comment: ''
  })

  const club = clubs.find((c) => c.id === id)
  const userEnrollments = getUserEnrollments()
  const existingEnrollment = userEnrollments.find(
    (e) => e.clubId === id && e.status !== 'completed'
  )

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

  const handleEnroll = () => {
    if (!user) {
      router.push('/login')
      return
    }
    if (existingEnrollment) return
    setShowEnrollForm(true)
  }

  const handleSubmitEnrollment = (e: React.FormEvent) => {
    e.preventDefault()
    const success = enroll(
      club.id,
      formData.childName,
      parseInt(formData.childAge),
      formData.parentPhone,
      formData.comment
    )
    if (success) {
      setEnrollSuccess(true)
      setShowEnrollForm(false)
    }
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
              {club.ageGroup}
            </span>
            <h1 className="text-balance text-2xl font-bold text-white">{club.name}</h1>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-4">
          {/* Description */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">О клубе</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-pretty text-sm text-muted-foreground">{club.fullDescription}</p>
            </CardContent>
          </Card>

          {/* Schedule & Info */}
          <Card>
            <CardContent className="flex flex-col gap-3 pt-4">
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
                  <p className="text-sm font-medium text-foreground">{club.leaderContact}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lessons */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Расписание занятий</CardTitle>
            </CardHeader>
            <CardContent>
              {club.lessons && club.lessons.length > 0 ? (
                <ul className="space-y-2">
                  {club.lessons.map((lesson) => (
                    <li key={lesson.id} className="rounded border border-border p-2">
                      <p className="text-sm font-medium">{lesson.date} {lesson.time}</p>
                      <p className="text-xs text-muted-foreground">{lesson.topic}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Занятия ещё не добавлены.</p>
              )}
            </CardContent>
          </Card>

          {/* Materials */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Материалы</CardTitle>
            </CardHeader>
            <CardContent>
              {club.materials && club.materials.length > 0 ? (
                <ul className="space-y-2">
                  {club.materials.map((material) => (
                    <li key={material.id} className="flex items-center justify-between rounded border border-border p-2">
                      <a href={material.url} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
                        {material.title}
                      </a>
                      <span className="text-xs text-muted-foreground">{material.type ?? 'other'}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Материалы пока не добавлены.</p>
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
