'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

const THEMES = [
  { src: '/images/maps/spacepath/space-girl1.png',         label: 'Space' },
  { src: '/images/maps/newbabypath/newbaby-girl1.png',     label: 'New Baby' },
  { src: '/images/maps/schoolpath/school-girl1.png',       label: 'First Day of School' },
  { src: '/images/maps/holidaypath/holiday-girl1.png',     label: 'Beach Holiday' },
  { src: '/images/maps/newhomepath/newhome-girl1.png',     label: 'New Home' },
  { src: '/images/maps/birthdaypath/birthday-girl1.png',   label: 'Birthday' },
  { src: '/images/maps/nothemepath/notheme-girl1.png',     label: 'No Theme' },
  { src: '/images/maps/christmaspath/christmas.png',       label: 'Christmas Advent' },
]

export default function ThemeCarousel() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (paused) return
    timerRef.current = setInterval(() => {
      setCurrent(i => (i + 1) % THEMES.length)
    }, 3000)
    return () => clearInterval(timerRef.current)
  }, [paused])

  return (
    <div
      className="w-full max-w-xs mx-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative w-full rounded-2xl shadow-xl overflow-hidden bg-white" style={{ paddingBottom: '141.4%' }}>
        {THEMES.map((theme, i) => (
          <div
            key={theme.src}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === current ? 1 : 0 }}
          >
            <Image
              src={theme.src}
              alt={theme.label}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 80vw, 320px"
              priority={i === 0}
            />
          </div>
        ))}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/30 to-transparent py-3 px-4">
          <p className="text-white font-dm-sans text-xs text-center">{THEMES[current].label}</p>
        </div>
      </div>
      <div className="flex justify-center gap-1.5 mt-3">
        {THEMES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Show theme ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'bg-ink w-4' : 'bg-ink/20 w-1.5'}`}
          />
        ))}
      </div>
    </div>
  )
}
