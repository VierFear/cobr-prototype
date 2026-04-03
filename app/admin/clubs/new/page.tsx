'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MobileLayout } from '@/components/mobile-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/image-upload'
import { supabase } from '@/lib/supabase'
import { ClubMaterialItem } from '@/lib/types'
import { Plus, Trash2 } from 'lucide-react'

export default function NewClubPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fullDescription: '',
    category: 'drones' as 'drones' | 'modeling' | '3d',
    ageGroup: '',
    schedule: '',
    leader: '',
    leaderContact: '',
    image: '',
    logo: ''
  })
  const [materials, setMaterials] = useState<ClubMaterialItem[]>([])
  const [newMaterial, setNewMaterial] = useState({ title: '', url: '', type: 'youtube' as 'youtube' | 'article' | 'pdf' | 'other' })

  useEffect(() => {
    const checkAuth = async () => {
      // Получаем текущего пользователя
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        router.push('/login')
        return
      }
      
      setUser(authUser)
      
      // Проверяем, является ли пользователь админом
      const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', authUser.id)
        .single()
      
      const adminStatus = userData?.is_admin || false
      setIsAdmin(adminStatus)
      
      if (!adminStatus) {
        router.push('/')
        return
      }
      
      setCheckingAuth(false)
    }
    
    checkAuth()
  }, [router])

  const addMaterial = () => {
    if (!newMaterial.title.trim() || !newMaterial.url.trim()) return

    setMaterials((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        title: newMaterial.title.trim(),
        url: newMaterial.url.trim(),
        type: newMaterial.type
      }
    ])
    setNewMaterial({ title: '', url: '', type: 'youtube' })
  }

  const removeMaterial = (index: number) => {
    setMaterials((prev) => prev.filter((_, i) => i !== index))
  }

  if (checkingAuth) {
    return (
      <MobileLayout showBack title="Новый клуб">
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <p>Загрузка...</p>
        </div>
      </MobileLayout>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.image) {
      alert('Пожалуйста, загрузите изображение клуба')
      return
    }
    
    setLoading(true)

    // 1. Создаём новый клуб
    const { data: newClub, error: clubError } = await supabase
      .from('clubs')
      .insert({
        name: formData.name,
        description: formData.description,
        full_description: formData.fullDescription,
        category: formData.category,
        age_group: formData.ageGroup,
        schedule: formData.schedule,
        leader: formData.leader,
        leader_contact: formData.leaderContact,
        image: formData.image,
        logo: formData.logo || null,
      })
      .select()
      .single()
    
    if (clubError) {
      console.error('Ошибка при создании клуба:', clubError)
      alert('Ошибка при создании клуба')
      setLoading(false)
      return
    }
    
    // 2. Добавляем материалы, если есть
    if (materials.length > 0 && newClub) {
      const { error: materialsError } = await supabase
        .from('materials')
        .insert(
          materials.map(m => ({
            club_id: newClub.id,
            title: m.title,
            url: m.url,
            type: m.type || 'other'
          }))
        )
      
      if (materialsError) {
        console.error('Ошибка при добавлении материалов:', materialsError)
      }
    }
    
    router.push('/admin/clubs')
    setLoading(false)
  }

  return (
    <MobileLayout showBack title="Новый клуб">
      <div className="p-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Создание клуба</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Название</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Название клуба"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  Краткое описание
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="Краткое описание"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  Полное описание
                </label>
                <Textarea
                  value={formData.fullDescription}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  required
                  placeholder="Подробное описание клуба"
                  rows={4}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Категория</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as 'drones' | 'modeling' | '3d' })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="drones">Дроны</option>
                  <option value="modeling">Моделирование</option>
                  <option value="3d">3D</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  Возрастная группа
                </label>
                <Input
                  value={formData.ageGroup}
                  onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                  required
                  placeholder="Например: 10-14 лет"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Расписание</label>
                <Input
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  required
                  placeholder="Например: Пн, Ср 16:00-18:00"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Руководитель</label>
                <Input
                  value={formData.leader}
                  onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
                  required
                  placeholder="ФИО руководителя"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  Контакт руководителя
                </label>
                <Input
                  value={formData.leaderContact}
                  onChange={(e) => setFormData({ ...formData, leaderContact: e.target.value })}
                  required
                  placeholder="+7 (___) ___-__-__"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  Изображение клуба <span className="text-destructive">*</span>
                </label>
                <ImageUpload
                  value={formData.image}
                  onChange={(value) => setFormData({ ...formData, image: value })}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  Логотип клуба
                </label>
                <ImageUpload
                  value={formData.logo}
                  onChange={(value) => setFormData({ ...formData, logo: value })}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  Учебные материалы
                </label>
                <div className="grid gap-2 md:grid-cols-3">
                  <Input
                    value={newMaterial.title}
                    onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                    placeholder="Название"
                  />
                  <Input
                    value={newMaterial.url}
                    onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })}
                    placeholder="Ссылка"
                  />
                  <select
                    value={newMaterial.type}
                    onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value as any })}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="article">Статья</option>
                    <option value="pdf">PDF</option>
                    <option value="other">Другое</option>
                  </select>
                  <Button type="button" variant="outline" onClick={addMaterial}>
                    <Plus className="h-4 w-4" />
                    Добавить материал
                  </Button>
                </div>
                {materials.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1">
                    {materials.map((material, index) => (
                      <div key={material.id} className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm">
                        <div className="flex-1">
                          <p className="font-medium">{material.title}</p>
                          <a href={material.url} target="_blank" rel="noreferrer" className="text-xs text-primary underline">
                            {material.url}
                          </a>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeMaterial(index)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push('/admin/clubs')}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground"
                  disabled={loading}
                >
                  {loading ? 'Создание...' : 'Создать'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  )
}