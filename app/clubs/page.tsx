'use client'

import { useState, useMemo, useEffect } from 'react'
import { MobileLayout } from '@/components/mobile-layout'
import { ClubCard } from '@/components/club-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { CategoryFilter, Club } from '@/lib/types'
import { Search, SlidersHorizontal } from 'lucide-react'

const categories: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'drones', label: 'Дроны' },
  { value: 'modeling', label: 'Моделирование' },
  { value: '3d', label: '3D' },
]

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [loading, setLoading] = useState(true)
  const [ageFilter, setAgeFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'popular'>('name')
  const [showFilters, setShowFilters] = useState(false)
  const [enrollmentsCount, setEnrollmentsCount] = useState<Record<number, number>>({})

  // Получаем уникальные возрастные группы из клубов
  const ageGroups = useMemo(() => {
    const groups = new Set<string>()
    clubs.forEach(club => {
      if (club.ageGroup) groups.add(club.ageGroup)
    })
    return ['all', ...Array.from(groups)]
  }, [clubs])

  useEffect(() => {
    const fetchClubs = async () => {
      setLoading(true)
      
      // Загружаем клубы
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
      
      if (error) {
        console.error('Ошибка загрузки клубов:', error)
        setClubs([])
      } else {
        const formattedClubs = (data || []).map((club: any) => ({
          id: String(club.id),
          name: club.name || '',
          description: club.description || '',
          fullDescription: club.full_description || '',
          category: club.category || 'drones',
          ageGroup: club.age_group || '',
          schedule: club.schedule || '',
          leader: club.leader || '',
          leaderContact: club.leader_contact || '',
          image: club.image || '',
          logo: club.logo || '',
          is_open: club.is_open ?? true,
          capacity: club.capacity ?? 0,
          materials: club.materials || [],
          lessons: club.lessons || [],
        })) as any
        
        setClubs(formattedClubs)
      }

      // Загружаем количество заявок для сортировки по популярности
      const { data: enrollmentsData } = await supabase
        .from('enrollments')
        .select('club_id')
        .neq('status', 'completed')

      const counts: Record<number, number> = {}
      enrollmentsData?.forEach((e: any) => {
        counts[e.club_id] = (counts[e.club_id] || 0) + 1
      })
      setEnrollmentsCount(counts)
      
      setLoading(false)
    }

    fetchClubs()
  }, [])

  const filteredClubs = useMemo(() => {
    let result = clubs.filter((club) => {
      const matchesSearch = club.name.toLowerCase().includes(search.toLowerCase()) ||
        club.description.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'all' || club.category === category
      const matchesAge = ageFilter === 'all' || club.ageGroup === ageFilter
      return matchesSearch && matchesCategory && matchesAge
    })

    // Сортировка
    if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name))
    } else {
      // По популярности (количество записей)
      result = [...result].sort((a, b) => {
        const countA = enrollmentsCount[parseInt(a.id)] || 0
        const countB = enrollmentsCount[parseInt(b.id)] || 0
        return countB - countA
      })
    }

    return result
  }, [clubs, search, category, ageFilter, sortBy, enrollmentsCount])

  if (loading) {
    return (
      <MobileLayout>
        <div className="flex justify-center items-center h-64">
          <p>Загрузка клубов...</p>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout>
      <div className="flex flex-col gap-4 p-4">
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
          <Button 
            variant="outline" 
            size="icon" 
            className="shrink-0"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="sr-only">Фильтры</span>
          </Button>
        </div>

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

        {/* Панель фильтров */}
        {showFilters && (
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
            {/* Возрастной фильтр */}
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Возрастная группа</label>
              <select
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">Все возрасты</option>
                {ageGroups.filter(g => g !== 'all').map((group) => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>

            {/* Сортировка */}
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Сортировка</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'popular')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="name">По названию</option>
                <option value="popular">По популярности</option>
              </select>
            </div>

            {/* Кнопка сброса фильтров */}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => {
                setAgeFilter('all')
                setSortBy('name')
                setSearch('')
                setCategory('all')
                setShowFilters(false)
              }}
            >
              Сбросить все фильтры
            </Button>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Найдено: {filteredClubs.length} {filteredClubs.length === 1 ? 'клуб' : 'клубов'}
        </p>

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
                onClick={() => { 
                  setSearch('')
                  setCategory('all')
                  setAgeFilter('all')
                  setSortBy('name')
                }}
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