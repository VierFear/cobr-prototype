'use client'

import Link from 'next/link'
import { MobileLayout } from '@/components/mobile-layout'
import { ClubCard } from '@/components/club-card'
import { Button } from '@/components/ui/button'
import { useApp } from '@/lib/context'
import { ChevronRight } from 'lucide-react'

export default function HomePage() {
  const { user, clubs } = useApp()
  const featuredClubs = clubs.slice(0, 3)

  return (
    <MobileLayout>
      <div className="flex flex-col gap-6 p-4">
        {/* Welcome Section */}
        <section className="text-center">
          <h1 className="text-balance text-2xl font-bold text-foreground">
            {user ? `Привет, ${user.name.split(' ')[0]}!` : 'Добро пожаловать в ЦОБР'}
          </h1>
          <p className="mt-2 text-pretty text-sm text-muted-foreground">
            Центр общественного развития: клубы дронов и моделирования
          </p>
        </section>

        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-2xl">
          <img
            src="https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80"
            alt="Дрон в полёте"
            className="h-48 w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-secondary/70" />
          <div className="absolute inset-0 flex flex-col items-start justify-center p-6">
            <h2 className="text-balance text-xl font-bold text-white">
              Открой мир технологий
            </h2>
            <p className="mt-2 max-w-[200px] text-pretty text-sm text-white/90">
              Дроны, 3D-печать и моделирование для всех возрастов
            </p>
            <Link href="/clubs">
              <Button className="mt-4 bg-white text-primary hover:bg-white/90">
                Выбрать клуб
              </Button>
            </Link>
          </div>
        </section>

        {/* Featured Clubs */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Популярные клубы</h2>
            <Link href="/clubs" className="flex items-center text-sm text-primary">
              Все клубы
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {featuredClubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center rounded-xl bg-primary/5 p-4">
            <span className="text-2xl font-bold text-primary">6+</span>
            <span className="text-xs text-muted-foreground">Клубов</span>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-primary/5 p-4">
            <span className="text-2xl font-bold text-primary">50+</span>
            <span className="text-xs text-muted-foreground">Учеников</span>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-primary/5 p-4">
            <span className="text-2xl font-bold text-primary">10+</span>
            <span className="text-xs text-muted-foreground">Педагогов</span>
          </div>
        </section>

        {/* CTA for non-logged users */}
        {!user && (
          <section className="rounded-xl bg-muted p-4 text-center">
            <h3 className="font-semibold text-foreground">Присоединяйтесь к нам!</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Зарегистрируйтесь, чтобы записаться в клуб
            </p>
            <Link href="/register">
              <Button className="mt-3 w-full bg-primary text-primary-foreground">
                Создать аккаунт
              </Button>
            </Link>
          </section>
        )}
      </div>
    </MobileLayout>
  )
}
