'use client'

import { useState, useMemo, useEffect } from 'react'
import { MobileLayout } from '@/components/mobile-layout'
import { ClubCard } from '@/components/club-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useApp } from '@/lib/context'
import { CategoryFilter, Club } from '@/lib/types'
import { Search, SlidersHorizontal } from 'lucide-react'

const categories: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'drones', label: 'Дроны' },
  { value: 'modeling', label: 'Моделирование' },
  { value: '3d', label: '3D' },
]

export default function ClubsPage() {
  const { clubs } = useApp()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')

  const filteredClubs = useMemo(() => {
    return clubs.filter((club) => {
      const matchesSearch = club.name.toLowerCase().includes(search.toLowerCase()) ||
        club.description.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'all' || club.category === category
      return matchesSearch && matchesCategory
    })
  }, [clubs, search, category])

  return (
    <MobileLayout>
      <div className="flex flex-col gap-4 p-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск клубов..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="sr-only">Фильтры</span>
          </Button>
        </div>

        {/* Category Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={category === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategory(cat.value)}
              className={`shrink-0 ${
                category === cat.value 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-foreground'
              }`}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground">
          Найдено: {filteredClubs.length} {filteredClubs.length === 1 ? 'клуб' : 'клубов'}
        </p>

        {/* Clubs Grid */}
        <div className="flex flex-col gap-4">
          {filteredClubs.length > 0 ? (
            filteredClubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Клубы не найдены</p>
              <Button 
                variant="link" 
                onClick={() => { setSearch(''); setCategory('all'); }}
                className="mt-2 text-primary"
              >
                Сбросить фильтры
              </Button>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  )
}
