'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

const SLIDES = [
  { src: '/images/maps/Examples/Colour/New/pathcolour_birthday.png',  label: 'Birthday' },
  { src: '/images/maps/Examples/Colour/New/pathcolour_newbaby1.png',  label: 'New Baby' },
  { src: '/images/maps/Examples/Colour/New/pathcolour_space.png',     label: 'Space' },
  { src: '/images/maps/Examples/Colour/New/pathcolour_holiday1.png',  label: 'Beach Holiday' },
  { src: '/images/maps/Examples/Colour/New/pathcolour_school.png',    label: 'First Day of School' },
  { src: '/images/maps/Examples/Colour/New/pathcolour_newhome.png',   label: 'New Home' },
  { src: '/images/maps/Examples/Colour/New/pathcolour_holiday2.png',  label: 'Holiday' },
  { src: '/images/maps/Examples/Colour/New/pathcolour_newbaby2.png',  label: 'New Baby 2' },
  { src: '/images/maps/Examples/Colour/New/pathcolour_christmas.png', label: 'Christmas Advent' },
  { src: '/images/maps/Examples/Colour/New/pathcolour_notheme.png',   label: 'No Theme' },
  { src: '/images/maps/Examples/Colour/New/pathcolour_holiday3.png',  label: 'Holiday 3' },
]

export default function MapCarousel() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (paused) return
    timerRef.current = setInterval(() => {
      setCurrent(i => (i + 1) % SLIDES.length)
    }, 3000)
    return () => clearInterval(timerRef.current)
  }, [paused])

  return (
    <div
      className="w-full max-w-xs mx-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative w-full rounded-2xl shadow-2xl overflow-hidden bg-white" style={{ paddingBottom: '141.4%' }}>
        {SLIDES.map((slide, i) => (
          <div
            key={slide.src}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === current ? 1 : 0 }}
          >
            <Image
              src={slide.src}
              alt={slide.label}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 80vw, 320px"
              priority={i === 0}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-1.5 mt-3">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Show path ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'bg-lemon w-4' : 'bg-white/40 w-1.5'}`}
          />
        ))}
      </div>
    </div>
  )
}
