'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, User, Shield } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  title?: string
  showBack?: boolean
  backHref?: string
}

export function Header({ title, showBack = false, backHref = '/' }: HeaderProps) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [avatar, setAvatar] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setIsLoggedIn(true)
        
        const { data: userData } = await supabase
          .from('users')
          .select('is_admin, avatar')
          .eq('id', user.id)
          .single()
        
        setIsAdmin(userData?.is_admin || false)
        setAvatar(userData?.avatar || null)
      } else {
        setIsLoggedIn(false)
        setIsAdmin(false)
        setAvatar(null)
      }
    }
    
    checkAuth()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth()
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-[390px] items-center justify-between px-4">
        {showBack ? (
          <Link href={backHref}>
            <Button variant="ghost" size="icon" className="text-foreground">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Назад</span>
            </Button>
          </Link>
        ) : (
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 overflow-hidden rounded-lg bg-primary">
              <img
                src="/logo.svg"
                alt="ЦОБР логотип"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/36?text=ЦР'
                }}
              />
            </div>
            <span className="text-lg font-bold text-foreground">ЦОБР</span>
          </Link>
        )}

        {title && (
          <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-foreground">
            {title}
          </h1>
        )}

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="text-primary">
                <Shield className="h-5 w-5" />
                <span className="sr-only">Админ панель</span>
              </Button>
            </Link>
          )}
          <Link href={isLoggedIn ? '/profile' : '/login'}>
            <Button variant="ghost" size="icon" className="text-foreground">
              {avatar ? (
                <img 
                  src={avatar} 
                  alt="Аватар"
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5" />
              )}
              <span className="sr-only">Профиль</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}