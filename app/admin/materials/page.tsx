'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MobileLayout } from '@/components/mobile-layout'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Trash } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Club {
  id: number
  name: string
}

interface Material {
  id: number
  title: string
  url: string
  type: string
}

export default function AdminMaterialsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [clubs, setClubs] = useState<Club[]>([])
  const [clubId, setClubId] = useState<string>('')
  const [materials, setMaterials] = useState<Material[]>([])
  const [material, setMaterial] = useState({ title: '', url: '', type: 'youtube' })

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

  // Загрузка материалов при смене клуба
  useEffect(() => {
    if (!clubId) return
    
    const fetchMaterials = async () => {
      const { data: materialsData } = await supabase
        .from('materials')
        .select('*')
        .eq('club_id', parseInt(clubId))
        .order('title')
      
      setMaterials(materialsData || [])
    }
    
    fetchMaterials()
  }, [clubId])

  const addMaterial = async () => {
    if (!material.title || !material.url) return
    
    const { data: newMaterial, error } = await supabase
      .from('materials')
      .insert({
        club_id: parseInt(clubId),
        title: material.title,
        url: material.url,
        type: material.type,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Ошибка при добавлении материала:', error)
      alert('Не удалось добавить материал')
    } else {
      setMaterials([...materials, newMaterial])
      setMaterial({ title: '', url: '', type: 'youtube' })
    }
  }

  const removeMaterial = async (materialId: number) => {
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', materialId)
    
    if (error) {
      console.error('Ошибка при удалении материала:', error)
      alert('Не удалось удалить материал')
    } else {
      setMaterials(materials.filter(m => m.id !== materialId))
    }
  }

  if (loading) {
    return (
      <MobileLayout showBack backHref="/admin" title="Материалы">
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
      <MobileLayout showBack backHref="/admin" title="Материалы">
        <div className="p-4 text-center text-sm text-muted-foreground">
          Нет клубов для добавления материалов.
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout showBack backHref="/admin" title="Материалы">
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
            <CardTitle>Добавить материал</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Input 
              placeholder="Название" 
              value={material.title} 
              onChange={(e) => setMaterial({ ...material, title: e.target.value })} 
            />
            <Input 
              placeholder="Ссылка" 
              value={material.url} 
              onChange={(e) => setMaterial({ ...material, url: e.target.value })} 
            />
            <select
              value={material.type}
              onChange={(e) => setMaterial({ ...material, type: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="youtube">YouTube</option>
              <option value="article">Статья</option>
              <option value="pdf">PDF</option>
              <option value="other">Другое</option>
            </select>
            <Button onClick={addMaterial} className="w-full">Добавить</Button>
          </CardContent>
        </Card>

        <Card>
  <CardHeader>
    <CardTitle>Текущие материалы</CardTitle>
  </CardHeader>
  <CardContent>
    {materials.length > 0 ? (
      <div className="space-y-2">
        {materials.map((item) => {
          const getIcon = () => {
            if (item.type === 'youtube') return '📺'
            if (item.type === 'pdf') return '📄'
            if (item.type === 'article') return '📖'
            return '🔗'
          }

          const getBgColor = () => {
            if (item.type === 'youtube') return 'bg-red-50 border-red-200'
            if (item.type === 'pdf') return 'bg-blue-50 border-blue-200'
            if (item.type === 'article') return 'bg-green-50 border-green-200'
            return 'bg-gray-50 border-gray-200'
          }

          const getTypeText = () => {
            if (item.type === 'youtube') return 'YouTube'
            if (item.type === 'pdf') return 'PDF'
            if (item.type === 'article') return 'Статья'
            return 'Ссылка'
          }

          return (
            <div
              key={item.id}
              className={`rounded-lg border p-3 ${getBgColor()}`}
            >
              <div className="flex items-start gap-3">
                <span className="shrink-0 text-xl">{getIcon()}</span>
                <div className="min-w-0 flex-1">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm font-medium text-primary hover:underline truncate"
                  >
                    {item.title}
                  </a>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-xs text-muted-foreground">{getTypeText()}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground break-all">
                      {item.url.length > 50 ? item.url.slice(0, 50) + '...' : item.url}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMaterial(item.id)}
                  className="shrink-0 text-destructive hover:text-destructive"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    ) : (
      <p className="text-sm text-muted-foreground">Материалы не добавлены.</p>
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