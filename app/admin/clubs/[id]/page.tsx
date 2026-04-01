'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MobileLayout } from '@/components/mobile-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/image-upload'
import { useApp } from '@/lib/context'
import { ClubMaterialItem } from '@/lib/types'
import { Spinner } from '@/components/ui/spinner'
import { Plus, Trash2 } from 'lucide-react'

export default function EditClubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user, clubs, updateClub, isInitialized } = useApp()
  const [loading, setLoading] = useState(false)
  
  const club = clubs.find(c => c.id === id)
  
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
    if (club) {
      setFormData({
        name: club.name,
        description: club.description,
        fullDescription: club.fullDescription,
        category: club.category,
        ageGroup: club.ageGroup,
        schedule: club.schedule,
        leader: club.leader,
        leaderContact: club.leaderContact,
        image: club.image,
        logo: club.logo || ''
      })
      if (club.materials && club.materials.length > 0) {
        setMaterials(
          club.materials.map((item) =>
            typeof item === 'string'
              ? { id: `m${Date.now()}-${Math.random()}`, title: item, url: '', type: 'other' }
              : item
          )
        )
      } else {
        setMaterials([])
      }
    }
  }, [club])

  const addMaterial = () => {
    if (!newMaterial.title.trim() || !newMaterial.url.trim()) return

    setMaterials((prev) => [
      ...prev,
      {
        id: `m${Date.now()}`,
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

  if (!isInitialized) {
    return (
      <MobileLayout showBack backHref="/admin/clubs" title="Редактирование">
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

  if (!club) {
    return (
      <MobileLayout showBack backHref="/admin/clubs" title="Клуб не найден">
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">Клуб не найден</p>
        </div>
      </MobileLayout>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.image) {
      alert('Пожалуйста, загрузите изображение клуба')
      return
    }
    
    setLoading(true)

    await new Promise(resolve => setTimeout(resolve, 500))

    updateClub(id, { ...formData, materials })
    router.push('/admin/clubs')
  }

  return (
    <MobileLayout showBack backHref="/admin/clubs" title="Редактирование">
      <div className="p-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Редактирование клуба</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Название</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
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
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Расписание</label>
                <Input
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Руководитель</label>
                <Input
                  value={formData.leader}
                  onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
                  required
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
                  Необходимые материалы
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
                  <Input
                    value={newMaterial.type}
                    onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value as 'youtube' | 'article' | 'pdf' | 'other' })}
                    placeholder="Тип"
                  />
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
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  )
}
