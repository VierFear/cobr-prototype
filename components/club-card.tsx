'use client'

import Link from 'next/link'
import { Club } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ClubCardProps {
  club: Club
  compact?: boolean
}

export function ClubCard({ club, compact = false }: ClubCardProps) {
  return (
    <Link href={`/clubs/${club.id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-lg rounded-t-xl rounded-b-none pt-0">
        <div className={`relative overflow-hidden ${compact ? 'aspect-[4/3]' : 'aspect-video'}`}>
          <img
            src={club.image}
            alt={club.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 rounded-t-xl bg-gradient-to-t from-black/60 to-transparent" />

          {club.logo && (
            <img
              src={club.logo}
              alt={`${club.name} logo`}
              className="absolute top-2 right-2 h-10 w-10 rounded-lg border border-white object-cover"
            />
          )}

          <div className="absolute bottom-2 left-3 right-3">
            <h3 className="text-balance text-sm font-semibold text-white">{club.name}</h3>
          </div>
        </div>
        <CardContent className={`${compact ? 'p-2' : 'p-3'} pb-3`}>
          <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
            {club.description}
          </p>
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
              {club.ageGroup || 'Не указан'}
            </span>
            {!compact && (
              <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                Подробнее
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
