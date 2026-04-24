export interface ClubScheduleItem {
  id: string
  date: string
  time: string
  topic: string
}

export interface ClubMaterialItem {
  id: string
  title: string
  url: string
  type?: 'youtube' | 'article' | 'pdf' | 'other'
}

export interface Club {
  id: string
  name: string
  description: string
  fullDescription: string
  category: 'drones' | 'modeling' | '3d'
  ageGroup: string
  schedule: string
  leader: string
  leaderContact: string
  image: string
  logo?: string
  materials?: ClubMaterialItem[]
  lessons?: ClubScheduleItem[]
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  // password: string  // ← пароль НЕ должен быть в этом типе (удали)
  avatar: string
  is_admin: boolean        // ← было isAdmin
  bio?: string
}

export interface Enrollment {
  id: string
  user_id: string          // ← было userId
  club_id: string          // ← было clubId
  child_name: string       // ← было childName
  child_age: number        // ← было childAge
  parent_phone: string     // ← было parentPhone
  comment: string
  status: 'pending' | 'accepted' | 'completed'
  created_at: string       // ← было createdAt
}

export type CategoryFilter = 'all' | 'drones' | 'modeling' | '3d'