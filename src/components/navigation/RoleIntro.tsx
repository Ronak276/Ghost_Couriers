import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'motion/react'
import { SlideAction } from './SlideAction'
import { Button } from '@/components/ui/button'
import { media } from '@/features/catalog/catalog'

const roleCopy = {
  restaurant: {
    badge: 'Restaurant Partner',
    title: 'Grow your Denver kitchen.',
    detail: 'Accept live orders, manage your menu, and track daily payouts.',
    image: 'brunch',
  },
  courier: {
    badge: 'Courier Partner',
    title: 'Deliver across Denver.',
    detail: 'Accept nearby trips, navigate live routes, and cash out anytime.',
    image: 'courier',
  },
} as const

export function RoleIntro({ role, onDone }: { role: 'restaurant' | 'courier'; onDone: () => void }) {
  const [phase, setPhase] = useState<'splash' | 'onboarding'>('splash')
  const reduce = useReducedMotion()
  const copy = roleCopy[role]

  useEffect(() => {
    const timer = window.setTimeout(() => setPhase('onboarding'), 900)
    return () => window.clearTimeout(timer)
  }, [])

  const target = document.getElementById('phone-frame') ?? document.body

  if (phase === 'splash') {
    return createPortal(
      <div className="role-intro-overlay">
        <div className="splash role-splash" role="status" aria-label={`Loading ${copy.badge}`}>
          <motion.div
            className="role-splash-inner"
            initial={reduce ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
          >
            <img className="splash-logo" src="/media/ghost-couriers-logo.png" alt="" width={500} height={150} />
            <span className="role-splash-badge">{copy.badge}</span>
          </motion.div>
        </div>
      </div>,
      target,
    )
  }

  return createPortal(
    <div className="role-intro-overlay">
      <main className="welcome">
        <div className="welcome-shell">
          <div className="welcome-toolbar">
            <Button variant="outline" onClick={onDone}>Skip</Button>
          </div>
          <div className="welcome-slide">
            <img src={media(copy.image)} alt="" />
            <div className="welcome-copy role-welcome-copy">
              <span className="role-onboard-pill">{copy.badge}</span>
              <h1>{copy.title}</h1>
              <p>{copy.detail}</p>
            </div>
          </div>
          <div className="welcome-footer">
            <SlideAction label="Get Started" onAdvance={onDone} />
          </div>
        </div>
      </main>
    </div>,
    target,
  )
}
