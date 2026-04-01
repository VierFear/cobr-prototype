'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    ymaps: any
  }
}

interface YandexMapProps {
  apiKey: string
  address?: string
  coordinates?: [number, number] // [latitude, longitude]
  zoom?: number
  height?: number
  placemarkTitle?: string
  placemarkDescription?: string
}

export function YandexMap({
  apiKey,
  address,
  coordinates,
  zoom = 16,
  height = 320,
  placemarkTitle,
  placemarkDescription,
}: YandexMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadYandexMaps = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.ymaps) {
          resolve()
          return
        }

        const script = document.createElement('script')
        script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Failed to load Yandex Maps script'))
        document.head.appendChild(script)
      })
    }

    const initMap = async () => {
      try {
        await loadYandexMaps()

        window.ymaps.ready(() => {
          if (!mapContainerRef.current) return

          const createMap = (coords: [number, number], addressLine?: string) => {
            // Create the map
            mapInstanceRef.current = new window.ymaps.Map(mapContainerRef.current, {
              center: coords,
              zoom: zoom,
              controls: ['zoomControl', 'fullscreenControl', 'geolocationControl'],
            })

            // Add placemark
            const placemark = new window.ymaps.Placemark(
              coords,
              {
                iconCaption: placemarkTitle || addressLine || '',
                balloonContentHeader: placemarkTitle || 'Location',
                balloonContentBody: placemarkDescription || addressLine || '',
              },
              {
                preset: 'islands#blueCircleDotIconWithCaption',
                iconCaptionMaxWidth: '200',
              }
            )

            mapInstanceRef.current.geoObjects.add(placemark)
            setIsLoading(false)
          }

          // Use coordinates directly if provided
          if (coordinates) {
            createMap(coordinates, address)
          } else if (address) {
            // Geocode the address to get coordinates
            window.ymaps.geocode(address, { results: 1 }).then((res: any) => {
              const firstGeoObject = res.geoObjects.get(0)
              
              if (!firstGeoObject) {
                setError('Address not found')
                setIsLoading(false)
                return
              }

              const coords = firstGeoObject.geometry.getCoordinates()
              createMap(coords, firstGeoObject.getAddressLine())
            }).catch(() => {
              setError('Failed to geocode address')
              setIsLoading(false)
            })
          } else {
            setError('No address or coordinates provided')
            setIsLoading(false)
          }
        })
      } catch (err) {
        setError('Failed to load map')
        setIsLoading(false)
      }
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy()
        mapInstanceRef.current = null
      }
    }
  }, [apiKey, address, coordinates, zoom, placemarkTitle, placemarkDescription])

  return (
    <div className="relative w-full overflow-hidden rounded-lg" style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Loading map...</span>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-sm text-destructive">{error}</span>
        </div>
      )}
      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  )
}
