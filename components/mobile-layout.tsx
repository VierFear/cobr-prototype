'use client'

import { ReactNode } from 'react'
import { BottomNav } from './bottom-nav'
import { Header } from './header'

interface MobileLayoutProps {
  children: ReactNode
  showHeader?: boolean
  showNav?: boolean
  title?: string
  showBack?: boolean
  backHref?: string
  header?: ReactNode
}

export function MobileLayout({ 
  children, 
  showHeader = true, 
  showNav = true,
  title,
  showBack = false,
  backHref = '/',
  header
}: MobileLayoutProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-[390px] flex-col bg-background">
      {header ? header : (showHeader && <Header title={title} showBack={showBack} backHref={backHref} />)}
      <main className={`flex-1 ${showNav ? 'pb-20' : ''} ${showHeader || header ? 'pt-16' : ''}`}>
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  )
}
