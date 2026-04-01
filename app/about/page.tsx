'use client'

import { MobileLayout } from '@/components/mobile-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { YandexMap } from '@/components/yandex-map'
import { 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Globe,
  MessageCircle
} from 'lucide-react'

const YANDEX_API_KEY = 'eaba0c59-bef1-41d0-bd1e-97a910b2aa4b'
const ADDRESS = 'улица Чехова, 5, рабочий посёлок Ванино, Хабаровский край, 682860'
const COORDINATES: [number, number] = [49.085576, 140.252950]

export default function AboutPage() {
  return (
    <MobileLayout>
      <div className="flex flex-col gap-4 p-4">
        {/* Hero */}
        <section className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary">
            <img
              src="/logo.svg"
              alt="ЦОБР логотип"
              className="h-16 w-16 rounded-xl object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/80?text=ЦОБР' }}
            />
          </div>
          <h1 className="text-balance text-2xl font-bold text-foreground">
            ЦОБР
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Центр Общественного Развития
          </p>
        </section>

        {/* About */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">О нас</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-pretty text-sm text-muted-foreground">
              ЦОБР — некоммерческий центр развития, где дети, подростки и родители 
              могут погрузиться в мир современных технологий. Мы проводим занятия 
              по управлению дронами, 3D-моделированию и печати, авиамоделированию 
              и робототехнике.
            </p>
            <p className="mt-3 text-pretty text-sm text-muted-foreground">
              Наша миссия — сделать технологии доступными и интересными для каждого, 
              развивать творческое мышление и помогать открывать новые возможности 
              для самореализации.
            </p>
          </CardContent>
        </Card>

        {/* Interactive Yandex Map */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-primary" />
              Наш адрес
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <YandexMap
              apiKey={YANDEX_API_KEY}
              coordinates={COORDINATES}
              address={ADDRESS}
              zoom={17}
              height={320}
              placemarkTitle="ЦОБР"
              placemarkDescription="Центр Общественного Развития ЦБ РФ"
            />
          </CardContent>
          <div className="px-4 py-3">
            <p className="text-sm text-muted-foreground">
              ул. Чехова, 5, рп. Ванино, Хабаровский край, 682860
            </p>
          </div>
        </Card>

        {/* Working Hours */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-primary" />
              Часы работы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Понедельник — Пятница</span>
                <span className="text-sm font-medium text-foreground">10:00 — 20:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Суббота — Воскресенье</span>
                <span className="text-sm font-medium text-foreground">10:00 — 18:00</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contacts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Контакты</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <a 
              href="tel:+79991234567" 
              className="flex items-center gap-3 text-sm text-foreground hover:text-primary"
            >
              <Phone className="h-4 w-4 text-primary" />
              +7 (999) 123-45-67
            </a>
            <a 
              href="mailto:info@cobr.ru" 
              className="flex items-center gap-3 text-sm text-foreground hover:text-primary"
            >
              <Mail className="h-4 w-4 text-primary" />
              info@cobr.ru
            </a>
            <a 
              href="#" 
              className="flex items-center gap-3 text-sm text-foreground hover:text-primary"
            >
              <Globe className="h-4 w-4 text-primary" />
              www.cobr.ru
            </a>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Мы в социальных сетях</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button variant="outline" size="icon" className="h-12 w-12">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.847 2.457 2.27 4.607 2.85 4.607.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.747c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.253-1.406 2.148-3.574 2.148-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
                </svg>
                <span className="sr-only">ВКонтакте</span>
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12">
                <MessageCircle className="h-5 w-5" />
                <span className="sr-only">Telegram</span>
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span className="sr-only">Instagram</span>
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span className="sr-only">YouTube</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  )
}
