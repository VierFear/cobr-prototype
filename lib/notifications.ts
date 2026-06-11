import { supabase } from './supabase'

interface CreateNotificationParams {
  userId: string
  type: string
  title: string
  message: string
  link?: string
  metadata?: Record<string, any>
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
  metadata = {}
}: CreateNotificationParams) {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      link,
      metadata
    })

  if (error) {
    console.error('Ошибка создания уведомления:', error)
  }
}

// Утилиты для конкретных типов уведомлений
export async function notifyEnrollmentStatusChange(
  userId: string,
  enrollmentId: number,
  clubName: string,
  status: 'accepted' | 'rejected'
) {
  if (status === 'accepted') {
    await createNotification({
      userId,
      type: 'enrollment_accepted',
      title: 'Заявка принята! 🎉',
      message: `Ваша заявка в клуб "${clubName}" принята. Ждём вас на занятиях!`,
      link: `/profile`,
      metadata: { enrollment_id: enrollmentId, club_name: clubName }
    })
  } else {
    await createNotification({
      userId,
      type: 'enrollment_rejected',
      title: 'Заявка отклонена',
      message: `Ваша заявка в клуб "${clubName}" отклонена. Свяжитесь с администратором для уточнения деталей.`,
      link: `/clubs`,
      metadata: { enrollment_id: enrollmentId, club_name: clubName }
    })
  }
}

export async function notifyNewEnrollmentToAdmin(
  adminId: string,
  enrollmentId: number,
  childName: string,
  clubName: string
) {
  await createNotification({
    userId: adminId,
    type: 'new_enrollment',
    title: 'Новая заявка! 📋',
    message: `${childName} записался в клуб "${clubName}"`,
    link: `/admin/enrollments`,
    metadata: { enrollment_id: enrollmentId, child_name: childName, club_name: clubName }
  })
}