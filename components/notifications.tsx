'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Notification {
  id: number
  type: string
  title: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string
  metadata: any
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const modalRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    try {
      // Используем getSession вместо getUser для избежания конфликтов блокировки
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Ошибка загрузки уведомлений:', error)
      } else if (data) {
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.is_read).length)
      }
    } catch (error) {
      console.error('Ошибка при загрузке уведомлений:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)

      if (!error) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Ошибка при отметке прочитанным:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', session.user.id)
        .eq('is_read', false)

      if (!error) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, is_read: true }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Ошибка при отметке всех прочитанными:', error)
    }
  }

  const deleteNotification = async (id: number) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)

      if (!error) {
        const updated = notifications.filter(n => n.id !== id)
        setNotifications(updated)
        setUnreadCount(updated.filter(n => !n.is_read).length)
      }
    } catch (error) {
      console.error('Ошибка при удалении уведомления:', error)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    fetchNotifications()

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications(prev => {
            // Проверяем, не существует ли уже такое уведомление
            if (prev.some(n => n.id === newNotification.id)) return prev
            return [newNotification, ...prev.slice(0, 19)]
          })
          if (!newNotification.is_read) {
            setUnreadCount(prev => prev + 1)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'enrollment_accepted': return '✅'
      case 'enrollment_rejected': return '❌'
      case 'enrollment_pending': return '📋'
      case 'new_enrollment': return '📝'
      case 'reminder': return '⏰'
      default: return '🔔'
    }
  }

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'только что'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} мин назад`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} ч назад`
    const days = Math.floor(hours / 24)
    return `${days} дн назад`
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            ref={modalRef}
            className="w-[90%] max-w-md rounded-lg border border-border bg-card shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="font-semibold">Уведомления</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto text-xs"
                    onClick={markAllAsRead}
                  >
                    <CheckCheck className="mr-1 h-3 w-3" />
                    Прочитать всё
                  </Button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded p-1 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto p-2">
              {loading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Загрузка...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Нет уведомлений
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={cn(
                      "group relative rounded-lg p-3 transition-colors hover:bg-muted/50",
                      !notif.is_read && "bg-primary/5"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className="shrink-0 text-lg">{getTypeIcon(notif.type)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium">{notif.title}</p>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {getTimeAgo(notif.created_at)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground break-words">
                          {notif.message}
                        </p>
                        {notif.link && (
                          <Link
                            href={notif.link}
                            onClick={() => {
                              markAsRead(notif.id)
                              setIsOpen(false)
                            }}
                            className="mt-1 inline-block text-xs text-primary hover:underline"
                          >
                            Подробнее →
                          </Link>
                        )}
                      </div>
                      <button
                        onClick={() => deleteNotification(notif.id)}
                        className="shrink-0 self-start rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-destructive"
                        title="Удалить навсегда"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}