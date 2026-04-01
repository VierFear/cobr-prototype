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
  materials: ClubMaterialItem[]
  lessons?: ClubScheduleItem[]
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  password: string
  avatar: string
  isAdmin: boolean
  bio?: string
}

export interface Enrollment {
  id: string
  userId: string
  clubId: string
  childName: string
  childAge: number
  parentPhone: string
  comment: string
  status: 'pending' | 'accepted' | 'completed'
  createdAt: string
}

export type CategoryFilter = 'all' | 'drones' | 'modeling' | '3d'
