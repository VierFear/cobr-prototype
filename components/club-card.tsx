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
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <div className={`relative ${compact ? 'h-32' : 'h-40'}`}>
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
              className="absolute top-2 right-2 h-10 w-10 rounded-lg border border-white object-cover"
            />
          )}

          <div className="absolute bottom-2 left-3 right-3">
            <h3 className="text-balance text-sm font-semibold text-white">{club.name}</h3>
          </div>
        </div>
        <CardContent className={`${compact ? 'p-3' : 'p-4'}`}>
          <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">
            {club.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              {club.ageGroup}
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
