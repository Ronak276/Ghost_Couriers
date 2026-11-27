import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { media } from '@/features/catalog/catalog'

export function RestaurantPhotos({ photos, playing }: { photos: string[]; playing: boolean }) {
  const photoRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [index, setIndex] = useState(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    const photo = photoRef.current
    if (!photo) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.25 })
    observer.observe(photo)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || !playing || reduced || photos.length < 2) return
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex(current => (current + 1) % photos.length)
    }, 2000)
    return () => window.clearInterval(timer)
  }, [visible, playing, reduced, photos.length])

  return <div className="restaurant-photos" ref={photoRef} aria-hidden="true">
    {photos.map((photo, position) => <img key={photo} className={position === index ? 'current' : ''} src={media(photo)} alt="" loading="lazy" />)}
  </div>
}