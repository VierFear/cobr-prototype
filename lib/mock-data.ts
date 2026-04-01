import { Club, User, Enrollment } from './types'

export const clubs: Club[] = [
  {
    id: '1',
    name: 'Дроны-новички',
    description: 'Первые шаги в управлении дронами',
    fullDescription: 'Курс для начинающих пилотов дронов. Вы научитесь основам управления, безопасности полётов и базовой аэросъёмке. Подходит для детей без опыта.',
    category: 'drones',
    ageGroup: '10-14 лет',
    schedule: 'Понедельник, Среда 16:00-18:00',
    leader: 'Иванов Алексей Петрович',
    leaderContact: '+7 (999) 123-45-67',
    image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80',
    logo: '',
    materials: [
      { id: 'm1', title: 'Рабочая тетрадь', url: 'https://example.com/workbook', type: 'article' },
      { id: 'm2', title: 'Видео: первые полёты', url: 'https://www.youtube.com/watch?v=ABCDEFGHIJK', type: 'youtube' }
    ],
    lessons: [
      { id: 'l1', date: '2026-04-10', time: '16:00-17:30', topic: 'Конструкция дронов' },
      { id: 'l2', date: '2026-04-12', time: '16:00-18:00', topic: 'Практика симулятора' }
    ]
  },
  {
    id: '2',
    name: '3D-моделирование',
    description: 'Создание 3D-моделей и печать',
    fullDescription: 'Изучение программ для 3D-моделирования (Blender, Tinkercad) и работа с 3D-принтером. Создавайте свои уникальные модели и воплощайте их в реальность!',
    category: '3d',
    ageGroup: '12-16 лет',
    schedule: 'Вторник, Четверг 15:00-17:00',
    leader: 'Смирнова Елена Викторовна',
    leaderContact: '+7 (999) 234-56-78',
    image: 'https://images.unsplash.com/photo-1581091226033-d5c48150dbf5?w=800&auto=format&fit=crop&q=80',
    logo: '',
    materials: [
      { id: 'm3', title: 'Введение в Blender', url: 'https://www.youtube.com/watch?v=BLENDER123', type: 'youtube' },
      { id: 'm4', title: 'Чеклист по печати', url: 'https://example.com/3d-printing-checklist', type: 'article' }
    ],
    lessons: [
      { id: 'l3', date: '2026-04-11', time: '15:00-16:30', topic: 'Моделирование формы' },
      { id: 'l4', date: '2026-04-13', time: '15:00-17:00', topic: 'Подготовка к печати' }
    ]
  },
  {
    id: '3',
    name: 'Авиамоделирование',
    description: 'Сборка и запуск моделей самолётов',
    fullDescription: 'Классическое авиамоделирование: от чертежей до первого полёта. Изучение аэродинамики, сборка моделей из бальзы и запуски на открытом воздухе.',
    category: 'modeling',
    ageGroup: '10-18 лет',
    schedule: 'Суббота 10:00-13:00',
    leader: 'Козлов Дмитрий Сергеевич',
    leaderContact: '+7 (999) 345-67-89',
    image: 'https://images.unsplash.com/photo-1559762705-2123aa9b467f?w=800&auto=format&fit=crop&q=80',
    logo: '',
    materials: [
      { id: 'm5', title: 'Книга по аэродинамике', url: 'https://example.com/aerodynamics', type: 'article' },
      { id: 'm6', title: 'Видеоурок по сборке', url: 'https://www.youtube.com/watch?v=MODEL123', type: 'youtube' }
    ],
    lessons: [
      { id: 'l5', date: '2026-04-15', time: '10:00-12:00', topic: 'Выбор материалов' },
      { id: 'l6', date: '2026-04-22', time: '10:00-13:00', topic: 'Первые полёты' }
    ]
  },
  {
    id: '4',
    name: 'Гоночные дроны',
    description: 'FPV-пилотирование и соревнования',
    fullDescription: 'Продвинутый курс для тех, кто освоил базовое управление. FPV-полёты от первого лица, участие в соревнованиях, настройка и ремонт гоночных дронов.',
    category: 'drones',
    ageGroup: '14-18 лет',
    schedule: 'Пятница 17:00-19:00, Воскресенье 11:00-14:00',
    leader: 'Петров Максим Игоревич',
    leaderContact: '+7 (999) 456-78-90',
    image: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800&auto=format&fit=crop&q=80',
    logo: '',
    materials: [
      { id: 'm7', title: 'FPV гайд', url: 'https://example.com/fpv-guide', type: 'article' },
      { id: 'm8', title: 'Настройка квадрокоптера', url: 'https://www.youtube.com/watch?v=FPV123', type: 'youtube' }
    ],
    lessons: [
      { id: 'l7', date: '2026-04-17', time: '17:00-19:00', topic: 'FPV основы' },
      { id: 'l8', date: '2026-04-24', time: '11:00-14:00', topic: 'Трассы и тактика' }
    ]
  },
  {
    id: '5',
    name: 'Робототехника',
    description: 'Программирование роботов',
    fullDescription: 'Создание и программирование роботов на базе Arduino и Raspberry Pi. От простых механизмов до автономных систем с датчиками и сервоприводами.',
    category: 'modeling',
    ageGroup: '12-16 лет',
    schedule: 'Среда, Пятница 16:00-18:00',
    leader: 'Новикова Анна Александровна',
    leaderContact: '+7 (999) 567-89-01',
    image: 'https://images.unsplash.com/photo-1581092335871-4c7ff3f5b6f0?w=800&auto=format&fit=crop&q=80',
    logo: '',
    materials: [
      { id: 'm9', title: 'Arduino-курс', url: 'https://example.com/arduino', type: 'article' },
      { id: 'm10', title: 'Raspberry Pi проекты', url: 'https://www.youtube.com/watch?v=RPi123', type: 'youtube' }
    ],
    lessons: [
      { id: 'l9', date: '2026-04-18', time: '16:00-17:30', topic: 'Электроника для начинающих' },
      { id: 'l10', date: '2026-04-25', time: '16:00-18:00', topic: 'Алгоритмы управления' }
    ]
  },
  {
    id: '6',
    name: 'Прототипирование',
    description: 'От идеи до рабочей модели',
    fullDescription: 'Комплексный курс по созданию прототипов: 3D-моделирование, печать, электроника. Создайте свой гаджет или устройство с нуля!',
    category: '3d',
    ageGroup: '14-18 лет',
    schedule: 'Суббота, Воскресенье 14:00-17:00',
    leader: 'Федоров Артём Владимирович',
    leaderContact: '+7 (999) 678-90-12',
    image: 'https://images.unsplash.com/photo-1581091226033-d5c48150dba8?w=800&auto=format&fit=crop&q=80',
    logo: '',
    materials: [
      { id: 'm11', title: 'Прототипы и 3D печать', url: 'https://example.com/prototyping', type: 'article' },
      { id: 'm12', title: 'Проектирование устройств', url: 'https://www.youtube.com/watch?v=PROTO123', type: 'youtube' }
    ],
    lessons: [
      { id: 'l11', date: '2026-04-19', time: '14:00-15:30', topic: 'Моделирование идеи' },
      { id: 'l12', date: '2026-04-26', time: '15:30-17:00', topic: 'Реализация проекта' }
    ]
  }
]

export const users: User[] = [
  {
    id: 'u1',
    name: 'Мария Сидорова',
    email: 'maria@example.com',
    phone: '+7 (999) 111-22-33',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    isAdmin: false
  },
  {
    id: 'u2',
    name: 'Павел Кузнецов',
    email: 'pavel@example.com',
    phone: '+7 (999) 222-33-44',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isAdmin: false
  },
  {
    id: 'u3',
    name: 'Администратор',
    email: 'admin@cobr.ru',
    phone: '+7 (999) 000-00-00',
    password: 'admin123',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    isAdmin: true
  }
]

export const enrollments: Enrollment[] = [
  {
    id: 'e1',
    userId: 'u1',
    clubId: '1',
    childName: 'Артём Сидоров',
    childAge: 12,
    parentPhone: '+7 (999) 111-22-33',
    comment: 'Очень интересуется дронами',
    status: 'accepted',
    createdAt: '2024-01-15'
  },
  {
    id: 'e2',
    userId: 'u1',
    clubId: '2',
    childName: 'Артём Сидоров',
    childAge: 12,
    parentPhone: '+7 (999) 111-22-33',
    comment: '',
    status: 'pending',
    createdAt: '2024-02-01'
  },
  {
    id: 'e3',
    userId: 'u2',
    clubId: '3',
    childName: 'Никита Кузнецов',
    childAge: 14,
    parentPhone: '+7 (999) 222-33-44',
    comment: 'Опыт сборки моделей 2 года',
    status: 'completed',
    createdAt: '2023-09-01'
  },
  {
    id: 'e4',
    userId: 'u2',
    clubId: '5',
    childName: 'Никита Кузнецов',
    childAge: 14,
    parentPhone: '+7 (999) 222-33-44',
    comment: 'Хочет научиться программировать',
    status: 'accepted',
    createdAt: '2024-01-20'
  },
  {
    id: 'e5',
    userId: 'u1',
    clubId: '4',
    childName: 'Артём Сидоров',
    childAge: 12,
    parentPhone: '+7 (999) 111-22-33',
    comment: 'После окончания курса для начинающих',
    status: 'pending',
    createdAt: '2024-02-10'
  }
]
