import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LuBike, LuCheck, LuChevronLeft, LuChevronRight, LuClock3, LuHouse, LuMapPin, LuPhone, LuReceiptText, LuStar, LuStore, LuUtensils } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { media, money, restaurants } from '@/features/catalog/catalog'
import { useDelivery } from '@/features/cart/store'

const statuses = [
  { label: 'Confirmed', headline: 'Order confirmed', sub: 'Restaurant has received your order', eta: '25 mins', Icon: LuCheck },
  { label: 'Preparing', headline: 'Preparing your food', sub: 'Chef is freshly packing your meal', eta: '18 mins', Icon: LuUtensils },
  { label: 'Out for delivery', headline: 'Alex is on the way', sub: 'Picked up order · heading to your location', eta: '7 mins', Icon: LuBike },
  { label: 'Delivered', headline: 'Order delivered', sub: 'Enjoy your meal!', eta: 'Arrived', Icon: LuHouse },
] as const

const date = (timestamp: number) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Denver' }).format(timestamp)

function LiveTrackingMap({ progress, restaurantName, address, active }: { progress: number; restaurantName: string; address: string; active: boolean }) {
  const waypoints = [
    { x: 64, y: 178 },
    { x: 156, y: 152 },
    { x: 238, y: 122 },
    { x: 326, y: 98 },
  ]
  const scaled = Math.max(0, Math.min(1, progress)) * (waypoints.length - 1)
  const seg = Math.min(waypoints.length - 2, Math.floor(scaled))
  const t = scaled - seg
  const riderX = waypoints[seg].x + (waypoints[seg + 1].x - waypoints[seg].x) * t
  const riderY = waypoints[seg].y + (waypoints[seg + 1].y - waypoints[seg].y) * t
  const mapQuery = encodeURIComponent(address ? `${address}, USA` : 'Denver, CO, USA')

  return (
    <div className="tracking-map" aria-label="Live delivery map">
      <iframe
        className="tracking-map-iframe"
        title="Denver USA delivery map"
        src={`https://maps.google.com/maps?q=${mapQuery}&t=m&z=14&ie=UTF8&iwloc=&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        tabIndex={-1}
      />
      <div className="tracking-map-tint" aria-hidden="true" />
      <svg className="tracking-map-route" viewBox="0 0 400 240" preserveAspectRatio="none" aria-hidden="true">
        <path d="M64 178 L156 152 L238 122 L326 98" stroke="#ffffffcc" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M64 178 L156 152 L238 122 L326 98" stroke="#c83c14" strokeWidth="3.5" strokeDasharray="7 6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>

      <div className="map-pin map-pin-store" style={{ left: '16%', top: '74.2%' }} title={restaurantName}>
        <LuStore />
      </div>

      <div className="map-pin map-pin-home" style={{ left: '81.5%', top: '40.8%' }} title={address}>
        <LuHouse />
      </div>

      <div className={`map-rider ${active ? 'riding' : ''}`} style={{ left: `${(riderX / 400) * 100}%`, top: `${(riderY / 240) * 100}%` }}>
        {active && <span className="map-rider-pulse" aria-hidden="true" />}
        <img className="map-rider-img" src="/media/ghost-rider.png" alt="Ghost Couriers rider" />
      </div>
      <a className="map-open-link" href={`https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`} target="_blank" rel="noreferrer">Open in Maps</a>
    </div>
  )
}

export function Orders({ detail = false }: { detail?: boolean }) {
  const { id } = useParams()
  const { orders, addItems } = useDelivery()
  const navigate = useNavigate()
  const [now, setNow] = useState(Date.now)
  const [manualStep, setManualStep] = useState<number | null>(null)
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  const status = (created: number) => Math.max(0, Math.min(3, Math.floor((now - created) / 10000)))
  const order = orders.find(value => value.id === id)
  if (detail && order) {
    const currentStep = manualStep ?? status(order.created)
    const stepInfo = statuses[currentStep]
    const autoProgress = Math.min(1, Math.max(0.06, (now - order.created) / 30000))
    const stepProgress = [0.06, 0.28, 0.66, 1][currentStep]
    const routeProgress = manualStep !== null ? stepProgress : (currentStep === 3 ? 1 : autoProgress)
    const restaurantName = order.items[0]?.restaurant ?? 'Restaurant'
    const fullAddress = [order.address.street, order.address.unit, order.address.zip].filter(Boolean).join(', ')

    return (
      <div className="order-track-screen">
        <div className="order-track-hero">
          <LiveTrackingMap progress={routeProgress} restaurantName={restaurantName} address={fullAddress} active={currentStep < 3} />
          <div className="order-track-topbar">
            <Button className="order-track-back" variant="ghost" size="icon" aria-label="Back to orders" onClick={() => navigate('/orders')}><LuChevronLeft /></Button>
            <div className="order-eta-pill"><LuClock3 /><span>{currentStep === 3 ? 'Delivered' : `Arriving in ${stepInfo.eta}`}</span></div>
          </div>
        </div>

        <div className="order-track-body">
          <div className="order-status-card">
            <div className="order-status-head">
              <div>
                <p className="eyebrow">ORDER #{order.id.slice(0, 8).toUpperCase()}</p>
                <h1>{stepInfo.headline}</h1>
                <p className="order-status-sub">{stepInfo.sub}</p>
              </div>
            </div>
            <div className="order-step-bar" role="group" aria-label="Order progress">
              <div className="order-step-track" aria-hidden="true">
                <span style={{ width: `${(currentStep / (statuses.length - 1)) * 100}%` }} />
              </div>
              {statuses.map(({ label, Icon }, index) => {
                const done = index <= currentStep
                const active = index === currentStep
                return (
                  <button
                    type="button"
                    className={`order-step-item ${done ? 'done' : ''} ${active ? 'active' : ''}`}
                    aria-current={active ? 'step' : undefined}
                    key={label}
                    onClick={() => setManualStep(index)}
                  >
                    <span className="order-step-dot"><Icon /></span>
                    <small>{label}</small>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="order-rider-card">
            <img className="order-rider-photo" src="/media/ghost-rider.png" alt="" />
            <div className="order-rider-info">
              <strong>Alex M. · Delivery Partner</strong>
              <small><LuStar className="rider-star" /> 4.9 · {currentStep >= 2 ? 'On the way on bike' : 'Assigned to your order'}</small>
            </div>
            <Button asChild variant="outline" size="icon" aria-label="Call delivery partner"><a href="tel:+17204293989"><LuPhone /></a></Button>
          </div>

          <div className="list">
            <div className="list-row">
              <span className="checkout-icon-badge" aria-hidden="true"><LuMapPin /></span>
              <span><strong>Deliver to</strong><small>{fullAddress}</small></span>
            </div>
            {order.items.map(item => <div className="list-row" key={item.id}><span><strong>{item.name} × {item.quantity}</strong><small>{item.restaurant} · {item.option}</small></span><strong>{money(item.amount * item.quantity)}</strong></div>)}
            <div className="list-row"><span><strong>Order total</strong><small>{date(order.created)} · Denver time</small></span><strong>{money(order.total)}</strong></div>
          </div>

          <Button className="wide" onClick={() => {
            const available = order.items.flatMap(item => {
              const current = restaurants.find(restaurant => restaurant.name === item.restaurant)?.items.find(entry => entry.name === item.name)
              return current ? [{ ...item, amount: current.price + (item.option === 'Add a drink' ? 299 : 0) }] : []
            })
            if (available.length) { addItems(available); navigate('/cart') }
          }}>Reorder</Button>
        </div>
      </div>
    )
  }
  return <div className="detail orders-screen">
    <header className="screen-bar">
      <Button variant="ghost" size="icon" aria-label="Go back" onClick={() => window.history.state?.idx > 0 ? navigate(-1) : navigate('/explore')}><LuChevronLeft /></Button>
      <h1>{detail ? 'Order not found' : 'Your orders'}</h1>
      <span className="screen-bar-spacer" aria-hidden="true" />
    </header>
    {orders.length ? <div className="list">
    {orders.map(value => {
      const stepIndex = status(value.created)
      const stepLabel = statuses[stepIndex].label
      const firstItem = value.items[0]
      const restaurant = restaurants.find(r => r.name === firstItem?.restaurant)
      const itemSummary = value.items.map(item => `${item.quantity} × ${item.name}`).join(', ')
      return <Link className="order-history-card" to={'/orders/' + value.id} key={value.id}>
        <div className="order-history-top">
          <img className="order-history-thumb" src={media(restaurant?.image ?? 'hero')} alt="" />
          <div className="order-history-meta">
            <strong>{firstItem?.restaurant ?? `Order #${value.id.slice(0, 8).toUpperCase()}`}</strong>
            <small>#{value.id.slice(0, 8).toUpperCase()} · {date(value.created)}</small>
          </div>
          <span className={`order-status-pill ${stepIndex === 3 ? 'delivered' : 'live'}`}>{stepLabel}</span>
        </div>
        <p className="order-history-items">{itemSummary}</p>
        <div className="order-history-foot">
          <strong>{money(value.total)}</strong>
          <span className="order-history-action">{stepIndex === 3 ? 'View order' : 'Track live'} <LuChevronRight /></span>
        </div>
      </Link>
    })}
  </div> : <div className="empty"><LuReceiptText /><h2>No orders yet</h2><Button asChild><Link to="/explore">Find food</Link></Button></div>}</div>
}