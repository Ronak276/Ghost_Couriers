import { useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { useReducedMotion } from 'motion/react'
import { AnimatedLink } from '@/components/ui/skiper-ui/skiper40'
import { Button } from '@/components/ui/button'
import { media } from '@/features/catalog/catalog'
const slides = [
  { image: 'hero', title: 'Good food.\nCloser to home.', caption: 'Your favorite Denver kitchens, delivered.', route: '/explore', video: '' },
  { image: 'bbq', title: 'Slow smoked.\nFast delivered.', caption: 'Explore Denver’s barbecue spots.', route: '/explore?cuisine=BBQ', video: '/media/barbecue.webm' },
  { image: 'poke', title: 'Fresh looks\ngood on you.', caption: 'Find a bowl worth staying in for.', route: '/explore?cuisine=Bowls', video: '' },
]
export function MediaCarousel() {
  const [ref, api] = useEmblaCarousel({ loop: true, duration: 30 })
  const [active, setActive] = useState(0)
  const reducedMotion = useReducedMotion()
  useEffect(() => {
    if (!api) return
    const update = () => setActive(api.selectedScrollSnap())
    api.on('select', update)
    return () => { api.off('select', update) }
  }, [api])
  return <section aria-label="Featured food" aria-roledescription="carousel" className="featured">
    <div className="carousel-viewport" ref={ref}>
      <div className="carousel-track">
        {slides.map((slide, index) => <div className="hero-slide" key={slide.title} aria-hidden={active !== index}>
          <img src={media(slide.image)} alt="" fetchPriority={index === 0 ? 'high' : 'auto'} />
          {slide.video && active === index && !reducedMotion && <video muted playsInline autoPlay poster={media(slide.image)} src={slide.video} aria-hidden="true" />}
          <div className="hero-copy"><h2>{slide.title}</h2><p>{slide.caption}</p><Button asChild><AnimatedLink to={slide.route} tabIndex={active === index ? 0 : -1}>Explore restaurants</AnimatedLink></Button></div>
        </div>)}
      </div>
    </div>
    <div className="carousel-controls">
      <div className="carousel-dots">{slides.map((slide, index) => <button type="button" key={slide.title} aria-label={`Show feature ${index + 1}`} aria-pressed={active === index} onClick={() => api?.scrollTo(index, !!reducedMotion)} />)}</div>
    </div>
  </section>
}