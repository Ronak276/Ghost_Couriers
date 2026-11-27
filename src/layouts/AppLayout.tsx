import { useEffect, useState } from 'react'
import { matchPath, Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { LuChevronDown, LuChevronLeft, LuCompass, LuHouse, LuMapPin, LuReceiptText, LuUserRound } from 'react-icons/lu'
import { motion, useReducedMotion } from 'motion/react'
import { HomeSearch } from '@/components/navigation/HomeSearch'
import { MediaCarousel } from '@/components/motion/MediaCarousel'
import { Button } from '@/components/ui/button'
import { useDelivery } from '@/features/cart/store'
import { AddressSheet } from './AddressSheet'
const tabs = [
  { to: '/', label: 'Home', Icon: LuHouse }, { to: '/explore', label: 'Explore', Icon: LuCompass },
  { to: '/orders', label: 'Orders', Icon: LuReceiptText },
]
export function AppLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const home = pathname === '/'
  const restaurantMenu = !!matchPath('/restaurants/:id', pathname)
  const restaurantItem = !!matchPath('/restaurants/:id/items/:itemIndex', pathname)
  const cartOrCheckout = pathname === '/cart' || pathname === '/checkout'
  const orderDetail = !!matchPath('/orders/:id', pathname)
  const ordersList = pathname === '/orders'
  const profilePage = pathname === '/profile'
  const fullBleedHero = restaurantMenu || restaurantItem || orderDetail
  const hideGlobalHeader = fullBleedHero || cartOrCheckout || ordersList || profilePage
  const showHero = home && !params.get('q')
  const reducedMotion = useReducedMotion()
  const { address } = useDelivery()
  const [addressOpen, setAddressOpen] = useState(false)
  const [heroScrolled, setHeroScrolled] = useState(false)
  useEffect(() => {
    if (!showHero) { setHeroScrolled(false); return }
    const scroller = document.querySelector('.phone-scroll')
    const onScroll = () => {
      const top = scroller ? scroller.scrollTop : window.scrollY
      setHeroScrolled(top > 130)
    }
    onScroll()
    scroller?.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      scroller?.removeEventListener('scroll', onScroll)
      window.removeEventListener('scroll', onScroll)
    }
  }, [showHero])
  const topLevel = pathname === '/profile' || tabs.some(tab => tab.to === pathname)
  return <>
    {!hideGlobalHeader && <header className={showHero ? "app-header home-header home-header-hero" : home ? "app-header home-header" : "app-header"}>
      <div className="header-inner">
        {!home &&
          <Button variant="ghost" size="icon" aria-label="Go back" onClick={() => window.history.state?.idx > 0 ? navigate(-1) : navigate('/')}><LuChevronLeft /></Button>}
        <button className="address-trigger" onClick={() => setAddressOpen(true)}>
          <span className="pin"><LuMapPin /></span><span><small>Deliver to</small><strong>{address?.street || 'Denver, CO'}</strong></span><LuChevronDown size={14} />
        </button>
        <Button asChild variant="outline" size="icon" className="header-profile"><NavLink to="/profile" aria-label="Profile"><LuUserRound aria-hidden="true" /></NavLink></Button>
        {home && <HomeSearch />}
      </div>
      {showHero && <MediaCarousel />}
    </header>}
    {showHero && heroScrolled && <div className="home-sticky-bar"><HomeSearch /></div>}
    <motion.main key={pathname} className={restaurantItem ? "page restaurant-menu-page restaurant-item-page" : fullBleedHero ? "page restaurant-menu-page" : home ? "page home-page" : cartOrCheckout ? "page sub-page cart-page" : (ordersList || profilePage) ? "page orders-page" : topLevel ? "page" : "page sub-page"} initial={reducedMotion ? false : { opacity: 0, x: topLevel ? 0 : 12, y: topLevel ? 8 : 0 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.26 }}>
      <Outlet context={{ openAddress: () => setAddressOpen(true) }} />
    </motion.main>
    {topLevel && <nav className="tab-bar" aria-label="Main navigation">
      {tabs.map(({ to, label, Icon }) => <NavLink to={to} end key={to}>
        {({ isActive }) => <>{isActive && <motion.span className="active-tab" layoutId={reducedMotion ? undefined : 'active-tab'} transition={{ duration: 0.26 }} />}<Icon /><span>{label}</span></>}
      </NavLink>)}
    </nav>}
    <AddressSheet open={addressOpen} setOpen={setAddressOpen} />
  </>
}