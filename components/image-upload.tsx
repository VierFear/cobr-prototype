'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ImagePlus, X } from 'lucide-react'

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB')
      return
    }

    setIsLoading(true)

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      onChange(result)
      setIsLoading(false)
    }
    reader.onerror = () => {
      alert('Ошибка при загрузке изображения')
      setIsLoading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    onChange('')
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Preview"
            className="h-48 w-full rounded-lg border border-border object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="mt-2 w-full"
            onClick={() => inputRef.current?.click()}
            disabled={isLoading}
          >
            {isLoading ? 'Загрузка...' : 'Заменить изображение'}
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
          className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-primary/50 hover:bg-muted"
        >
          {isLoading ? (
            <span className="text-sm text-muted-foreground">Загрузка...</span>
          ) : (
            <>
              <ImagePlus className="h-10 w-10 text-muted-foreground/50" />
              <span className="text-sm text-muted-foreground">
                Нажмите для загрузки изображения
              </span>
              <span className="text-xs text-muted-foreground/70">
                PNG, JPG до 5MB
              </span>
            </>
          )}
        </button>
      )}
    </div>
  )
}
