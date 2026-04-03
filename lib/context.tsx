'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { User, Enrollment, Club, ClubScheduleItem, ClubMaterialItem } from './types'
import { users as initialUsers, enrollments as initialEnrollments, clubs as initialClubs } from './mock-data'

const SESSION_KEY = 'cobr_session'
const DATA_KEY = 'cobr_data'

interface AppContextType {
  user: User | null
  users: User[]
  clubs: Club[]
  enrollments: Enrollment[]
  isInitialized: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
  register: (name: string, email: string, phone: string, password: string) => boolean
  enroll: (clubId: string, childName: string, childAge: number, parentPhone: string, comment: string) => boolean
  updateEnrollmentStatus: (enrollmentId: string, status: Enrollment['status']) => void
  addClub: (club: Omit<Club, 'id'>) => void
  updateClub: (clubId: string, updates: Partial<Club>) => void
  deleteClub: (clubId: string) => void
  addClubLesson: (clubId: string, lesson: Omit<ClubScheduleItem, 'id'>) => void
  removeClubLesson: (clubId: string, lessonId: string) => void
  addClubMaterial: (clubId: string, material: Omit<ClubMaterialItem, 'id'>) => void
  removeClubMaterial: (clubId: string, materialId: string) => void
  setClubLogo: (clubId: string, logo: string) => void
  updateUser: (userId: string, updates: Partial<User>) => void
  getUserById: (userId: string) => User | undefined
  getUserEnrollments: () => Enrollment[]
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [clubs, setClubs] = useState<Club[]>(initialClubs)
  const [enrollments, setEnrollments] = useState<Enrollment[]>(initialEnrollments)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(SESSION_KEY)
      const savedData = localStorage.getItem(DATA_KEY)
      
      if (savedData) {
        const data = JSON.parse(savedData)
        if (data.users) setUsers(data.users)
        if (data.clubs) setClubs(data.clubs)
        if (data.enrollments) setEnrollments(data.enrollments)
      }
      
      if (savedSession) {
        const sessionUser = JSON.parse(savedSession)
        const currentUsers = savedData ? JSON.parse(savedData).users || initialUsers : initialUsers
        const validUser = currentUsers.find((u: User) => u.id === sessionUser.id)
        if (validUser) {
          setUser(validUser)
        }
      }
    } catch (error) {
      console.error('Error loading session:', error)
    }
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (!isInitialized) return
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify({ users, clubs, enrollments }))
    } catch (error) {
      console.error('Error saving data:', error)
    }
  }, [users, clubs, enrollments, isInitialized])

  const login = useCallback((email: string, password: string): boolean => {
    const foundUser = users.find(u => u.email === email && u.password === password)
    if (foundUser) {
      setUser(foundUser)
      localStorage.setItem(SESSION_KEY, JSON.stringify(foundUser))
      return true
    }
    return false
  }, [users])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
  }, [])

  const register = useCallback((name: string, email: string, phone: string, password: string): boolean => {
    if (users.some(u => u.email === email)) return false
    const newUser: User = {
      id: `u${users.length + 1}`,
      name,
      email,
      phone,
      password,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      isAdmin: false
    }
    setUsers(prev => [...prev, newUser])
    setUser(newUser)
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser))
    return true
  }, [users])

  const enroll = useCallback((clubId: string, childName: string, childAge: number, parentPhone: string, comment: string): boolean => {
    if (!user) return false
    const existingEnrollment = enrollments.find(e => e.userId === user.id && e.clubId === clubId && e.status !== 'completed')
    if (existingEnrollment) return false
    const newEnrollment: Enrollment = {
      id: `e${enrollments.length + 1}`,
      userId: user.id,
      clubId,
      childName,
      childAge,
      parentPhone,
      comment,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    }
    setEnrollments(prev => [...prev, newEnrollment])
    return true
  }, [user, enrollments])

  const updateEnrollmentStatus = useCallback((enrollmentId: string, status: Enrollment['status']) => {
    setEnrollments(prev => prev.map(e => e.id === enrollmentId ? { ...e, status } : e))
  }, [])

  const addClub = useCallback((club: Omit<Club, 'id'>) => {
    const newClub: Club = { ...club, id: `${clubs.length + 1}` }
    setClubs(prev => [...prev, newClub])
  }, [clubs])

  const updateClub = useCallback((clubId: string, updates: Partial<Club>) => {
    setClubs(prev => prev.map(c => c.id === clubId ? { ...c, ...updates } : c))
  }, [])

  const deleteClub = useCallback((clubId: string) => {
    setClubs(prev => prev.filter(c => c.id !== clubId))
    setEnrollments(prev => prev.filter(e => e.clubId !== clubId))
  }, [])

  const addClubLesson = useCallback((clubId: string, lesson: Omit<ClubScheduleItem, 'id'>) => {
    setClubs(prev => prev.map(c => c.id === clubId ? { ...c, lessons: [...(c.lessons ?? []), { ...lesson, id: `l${Date.now()}` }] } : c))
  }, [])

  const removeClubLesson = useCallback((clubId: string, lessonId: string) => {
    setClubs(prev => prev.map(c => c.id === clubId ? { ...c, lessons: (c.lessons ?? []).filter(item => item.id !== lessonId) } : c))
  }, [])

  const addClubMaterial = useCallback((clubId: string, material: Omit<ClubMaterialItem, 'id'>) => {
    setClubs(prev => prev.map(c => c.id === clubId ? { ...c, materials: [...(c.materials ?? []), { ...material, id: `m${Date.now()}` }] } : c))
  }, [])

  const removeClubMaterial = useCallback((clubId: string, materialId: string) => {
    setClubs(prev => prev.map(c => c.id === clubId ? { ...c, materials: (c.materials ?? []).filter(item => item.id !== materialId) } : c))
  }, [])

  const setClubLogo = useCallback((clubId: string, logo: string) => {
    setClubs(prev => prev.map(c => c.id === clubId ? { ...c, logo } : c))
  }, [])

  const updateUser = useCallback((userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u))
    if (user && user.id === userId) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser))
    }
  }, [user])

  const getUserById = useCallback((userId: string): User | undefined => {
    return users.find(u => u.id === userId)
  }, [users])

  const getUserEnrollments = useCallback((): Enrollment[] => {
    if (!user) return []
    return enrollments.filter(e => e.userId === user.id)
  }, [user, enrollments])

  return (
    <AppContext.Provider value={{
      user, users, clubs, enrollments, isInitialized,
      login, logout, register, enroll, updateEnrollmentStatus,
      addClub, updateClub, deleteClub,
      addClubLesson, removeClubLesson,
      addClubMaterial, removeClubMaterial, setClubLogo,
      updateUser, getUserById, getUserEnrollments
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) throw new Error('useApp must be used within an AppProvider')
  return context
}