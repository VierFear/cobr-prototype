'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { MobileLayout } from '@/components/mobile-layout'
import { useApp } from '@/lib/context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function AdminMaterialsPage() {
  const router = useRouter()
  const { clubs, addClubMaterial, removeClubMaterial, isInitialized, user } = useApp()
  const [clubId, setClubId] = useState<string>(clubs[0]?.id ?? '')
  const [material, setMaterial] = useState<{ title: string; url: string; type: 'youtube' | 'article' | 'pdf' | 'other' }>({ title: '', url: '', type: 'youtube' })

  const currentClub = useMemo(() => clubs.find((c) => c.id === clubId), [clubs, clubId])

  if (!isInitialized) {
    return (
      <MobileLayout showBack backHref="/admin" title="Материалы">
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
      <MobileLayout showBack backHref="/admin" title="Материалы">
        <div className="p-4 text-center text-sm text-muted-foreground">Нет клубов для добавления материалов.</div>
      </MobileLayout>
    )
  }

  const addMaterial = () => {
    if (!material.title || !material.url) return
    addClubMaterial(clubId, { title: material.title, url: material.url, type: material.type })
    setMaterial({ title: '', url: '', type: 'youtube' })
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
            <CardTitle>Добавить материал</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Input placeholder="Название" value={material.title} onChange={(e) => setMaterial({ ...material, title: e.target.value })} />
            <Input placeholder="Ссылка" value={material.url} onChange={(e) => setMaterial({ ...material, url: e.target.value })} />
            <Input placeholder="Тип (youtube/article/pdf/other)" value={material.type} onChange={(e) => setMaterial({ ...material, type: e.target.value as 'youtube' | 'article' | 'pdf' | 'other' })} />
            <Button onClick={addMaterial} className="w-full">Добавить</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Текущее материалы</CardTitle>
          </CardHeader>
          <CardContent>
            {(currentClub?.materials?.length ?? 0) > 0 ? (
              <ul className="space-y-2">
                {currentClub!.materials!.map((item) => (
                  <li key={item.id} className="flex items-center justify-between rounded border border-border p-2">
                    <a href={item.url} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
                      {item.title}
                    </a>
                    <Button variant="ghost" size="icon" onClick={() => removeClubMaterial(clubId, item.id)}>
                      Удалить
                    </Button>
                  </li>
                ))}
              </ul>
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
