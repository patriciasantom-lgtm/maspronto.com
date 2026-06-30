'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const MAPS = [
  { id: 'space',          thumb: '/images/maps/thumbnails/space.png',          label: 'Space' },
  { id: 'new_baby',       thumb: '/images/maps/thumbnails/new_baby.png',       label: 'New Baby' },
  { id: 'school',         thumb: '/images/maps/thumbnails/school.png',         label: 'First Day of School' },
  { id: 'holiday_beach',  thumb: '/images/maps/thumbnails/holiday_beach.png',  label: 'Beach Holiday' },
  { id: 'new_home',       thumb: '/images/maps/thumbnails/new_home.png',       label: 'New Home' },
  { id: 'happy_birthday', thumb: '/images/maps/thumbnails/happy_birthday.png', label: 'Birthday' },
  { id: 'christmas',      thumb: '/images/maps/thumbnails/christmas.png',      label: 'Christmas Advent' },
  { id: 'no_theme',       thumb: '/images/maps/thumbnails/no_theme.png',       label: 'No Theme' },
]

export default function MapCarousel() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(i => (i + 1) % MAPS.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="relative w-full rounded-2xl shadow-2xl overflow-hidden bg-white" style={{ paddingBottom: '141.4%' }}>
        {MAPS.map((map, i) => (
          <div
            key={map.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === current ? 1 : 0 }}
          >
            <Image
              src={map.thumb}
              alt={map.label}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 80vw, 320px"
              priority={i === 0}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-1.5 mt-3">
        {MAPS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Show map ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'bg-lemon w-4' : 'bg-white/40 w-1.5'}`}
          />
        ))}
      </div>
    </div>
  )
}
