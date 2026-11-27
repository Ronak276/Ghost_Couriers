import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useEmblaCarousel from 'embla-carousel-react'
import { motion, useReducedMotion } from 'motion/react'
import { SlideAction } from '@/components/navigation/SlideAction'
import { Button } from '@/components/ui/button'
import { useDelivery } from '@/features/cart/store'
import { media } from '@/features/catalog/catalog'
const steps = [
  { title: 'Your favorite Denver bites, delivered.', detail: 'Find local favorites and get your next meal delivered to your door.', image: 'welcome-burger' },
]
export function Splash() {
  const reduce = useReducedMotion()
  return <div className="splash" role="status" aria-label="Loading Ghost Couriers"><motion.div initial={reduce ? false : { opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}><img className="splash-logo" src="/media/ghost-couriers-logo.png" alt="" width={500} height={150} fetchPriority="high" /></motion.div></div>
}
export function Welcome() {
  const [ref, api] = useEmblaCarousel()
  const [active, setActive] = useState(0)
  const reduced = useReducedMotion()
  const { finishOnboarding } = useDelivery()
  const navigate = useNavigate()
  useEffect(() => {
    if (!api) return
    const update = () => setActive(api.selectedScrollSnap())
    api.on('select', update)
    return () => { api.off('select', update) }
  }, [api])
  const finish = () => { finishOnboarding(); navigate('/', { replace: true }) }
  return <main className="welcome"><div className="welcome-shell">
    <div className="welcome-toolbar"><Button variant="outline" onClick={finish}>Skip</Button></div>
    <div className="carousel-viewport" ref={ref}><div className="carousel-track">
      {steps.map((step, index) => <div className="welcome-slide" key={step.title} aria-hidden={index !== active}>
        <img src={media(step.image)} alt="" /><div className="welcome-copy"><h1>{step.title}</h1><p>{step.detail}</p></div>
      </div>)}
    </div></div>
    <div className="welcome-footer">{steps.length > 1 && <div className="carousel-dots">{steps.map((step, index) => <button type="button" key={step.title} aria-label={`Go to onboarding step ${index + 1}`} aria-pressed={index === active} onClick={() => api?.scrollTo(index, !!reduced)} />)}</div>}
      <SlideAction label="Get Started" onAdvance={() => active === steps.length - 1 ? finish() : api?.scrollNext(!!reduced)} /></div>
  </div></main>
}