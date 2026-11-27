import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import { StoreProvider, useDelivery } from '@/features/cart/store'
import { AppLayout } from '@/layouts/AppLayout'
import { Cart } from '@/pages/Cart'
import { Discovery } from '@/pages/Discovery'
import { Orders } from '@/pages/Orders'
import { Profile } from '@/pages/Profile'
import { Restaurant, RestaurantItem } from '@/pages/Restaurant'
import { RolePreview } from '@/pages/RolePreview'
import { PhoneFrame } from '@/layouts/PhoneFrame'
import { Splash, Welcome } from '@/pages/Welcome'
function Screens() {
  const { onboarded } = useDelivery()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [starting, setStarting] = useState(() => pathname === '/' ||
    (pathname === '/welcome' && (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined)?.type === 'reload'))
  useEffect(() => {
    if (!starting) return
    const timer = window.setTimeout(() => {
      navigate('/welcome', { replace: true })
      setStarting(false)
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [navigate, starting])
  useEffect(() => { window.scrollTo(0, 0); document.querySelector('.phone-scroll')?.scrollTo(0, 0) }, [pathname])
  if (starting) return <Splash />
  if (pathname === '/welcome' || (!onboarded && pathname === '/')) return <Welcome />
  return <Routes>
    <Route element={<AppLayout />}>
      <Route index element={<Discovery home />} />
      <Route path="explore" element={<Discovery />} />
      <Route path="restaurants/:id" element={<Restaurant />} />
      <Route path="restaurants/:id/items/:itemIndex" element={<RestaurantItem />} />
      <Route path="cart" element={<Cart />} />
      <Route path="checkout" element={<Cart checkout />} />
      <Route path="orders" element={<Orders />} />
      <Route path="orders/:id" element={<Orders detail />} />
      <Route path="profile" element={<Profile />} />
      <Route path="preview/:role" element={<RolePreview />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
export function App() {
  return <StoreProvider><MotionConfig reducedMotion="user"><PhoneFrame><Screens /></PhoneFrame></MotionConfig></StoreProvider>
}