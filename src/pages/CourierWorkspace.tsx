import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { LuBike, LuCheck, LuChevronLeft, LuCreditCard, LuHistory, LuHouse, LuMapPin, LuNavigation, LuPhone, LuPlus, LuShieldCheck, LuUserRound, LuWallet } from 'react-icons/lu'
import { RoleIntro } from '@/components/navigation/RoleIntro'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { money } from '@/features/catalog/catalog'
import { useDelivery, type CourierTripStage } from '@/features/cart/store'

type Tab = 'home' | 'delivery' | 'trips' | 'wallet' | 'profile'

const weekEarnings = [
  { label: 'Mon', base: 4200, tip: 1800 },
  { label: 'Tue', base: 5100, tip: 2200 },
  { label: 'Wed', base: 4600, tip: 1950 },
  { label: 'Thu', base: 6400, tip: 2900 },
  { label: 'Fri', base: 8200, tip: 4100 },
  { label: 'Sat', base: 9400, tip: 4600 },
  { label: 'Sun', base: 7100, tip: 3200 },
]

const todayEarnings = [
  { label: '10a', base: 950, tip: 400 },
  { label: '12p', base: 2400, tip: 1100 },
  { label: '2p', base: 1650, tip: 700 },
  { label: '4p', base: 1300, tip: 500 },
  { label: '6p', base: 2900, tip: 1450 },
  { label: '8p', base: 2100, tip: 900 },
]

export function CourierWorkspace() {
  const navigate = useNavigate()
  const {
    orders, courierOnline, setCourierOnline, courierTripStages, setCourierTripStage,
    courierProfile, updateCourierProfile, payoutMethods, selectedPayoutId, selectPayoutMethod,
    addPayoutMethod, payoutHistory, requestPayout,
  } = useDelivery()

  const [introDone, setIntroDone] = useState(false)
  const [tab, setTab] = useState<Tab>('home')
  const reduce = useReducedMotion()
  const [chartRange, setChartRange] = useState<'week' | 'today'>('week')
  const [showAddPayout, setShowAddPayout] = useState(false)
  const [payoutKind, setPayoutKind] = useState<'bank' | 'upi'>('upi')
  const [payoutLabel, setPayoutLabel] = useState('')
  const [savedNotice, setSavedNotice] = useState('')

  const activeOrder = orders[0] ?? {
    id: 'GC1042DEMO',
    items: [{ id: 'd1', restaurant: 'Watercourse Foods', name: 'Avocado Toast', amount: 1295, quantity: 2, option: 'Standard', notes: '' }],
    total: 3222,
    address: { street: '2525 Washington St', unit: 'Apt 4B', zip: '80205', instructions: 'Leave at front door' },
    created: Date.now(),
  }

  const tripStage: CourierTripStage = courierTripStages[activeOrder.id] ?? 'offered'
  const restaurantName = activeOrder.items[0]?.restaurant ?? 'Watercourse Foods'
  const fullAddress = [activeOrder.address.street, activeOrder.address.unit, activeOrder.address.zip].filter(Boolean).join(', ')

  const chartData = chartRange === 'week' ? weekEarnings : todayEarnings
  const maxEarn = Math.max(...chartData.map(d => d.base + d.tip), 1)
  const basePay = 11300
  const tipsEarned = 5050
  const codCollected = 2138
  const withdrawn = payoutHistory.filter(p => p.role === 'courier').reduce((s, p) => s + p.amount, 0)
  const availableBalance = Math.max(0, basePay + tipsEarned - withdrawn)

  const riderCoords = tripStage === 'offered' ? { left: '20%', top: '72%' }
    : tripStage === 'to_pickup' ? { left: '38%', top: '64%' }
    : tripStage === 'picked_up' ? { left: '62%', top: '50%' }
    : { left: '81.5%', top: '40.8%' }

  function submitPayout(event: FormEvent) {
    event.preventDefault()
    if (!payoutLabel.trim()) return
    addPayoutMethod({ kind: payoutKind, label: payoutLabel.trim(), detail: payoutKind === 'upi' ? 'UPI ID · Instant' : 'Bank · Instant transfer' })
    setPayoutLabel(''); setShowAddPayout(false)
  }

  function saveProfile(event: FormEvent) {
    event.preventDefault()
    setSavedNotice('Courier details saved.')
    window.setTimeout(() => setSavedNotice(''), 2500)
  }

  if (!introDone) return <RoleIntro role="courier" onDone={() => setIntroDone(true)} />

  return (
    <div className="role-shell">
      {tab === 'home' ? (
        <div className="role-home-hero">
          <div className="role-home-topbar">
            <Button variant="ghost" size="icon" aria-label="Back to profile" onClick={() => navigate('/profile')}><LuChevronLeft /></Button>
            <div className="role-home-brand">
              <small>Courier Partner</small>
              <strong>{courierProfile.name} · {courierProfile.vehicle}</strong>
            </div>
            <label className="role-online-toggle">
              <span>{courierOnline ? 'Online' : 'Offline'}</span>
              <input className="profile-switch" type="checkbox" checked={courierOnline} onChange={e => setCourierOnline(e.target.checked)} aria-label="Toggle courier online" />
            </label>
          </div>
          <div className="role-hero-summary">
            <div>
              <span>Today’s earnings</span>
              <h2>{money(basePay + tipsEarned)}</h2>
            </div>
            <Button onClick={() => setTab('delivery')}>Active trip</Button>
          </div>
        </div>
      ) : (
        <header className="screen-bar">
          <Button variant="ghost" size="icon" aria-label="Back to profile" onClick={() => navigate('/profile')}><LuChevronLeft /></Button>
          <h1>{tab === 'delivery' ? 'Live Delivery' : tab === 'trips' ? 'Trip History' : tab === 'wallet' ? 'Courier Wallet' : 'Rider Profile'}</h1>
          <button type="button" className={`role-status-chip ${courierOnline ? 'online' : ''}`} onClick={() => setCourierOnline(!courierOnline)}>
            <span className="role-dot" />{courierOnline ? 'Online' : 'Offline'}
          </button>
        </header>
      )}

      <motion.div
        key={tab}
        className="role-content"
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.22 }}
      >
        {tab === 'home' && <>
          <div className="role-kpi-grid">
            {[
              { label: 'Today’s earnings', value: money(basePay + tipsEarned), sub: `Includes ${money(tipsEarned)} tips` },
              { label: 'Completed trips', value: String(orders.length + 11), sub: '98% acceptance' },
              { label: 'Distance', value: '24.6 km', sub: 'Denver metro' },
              { label: 'Rider rating', value: '4.9 ★', sub: 'Top courier' },
            ].map((kpi, idx) => (
              <motion.div
                className="role-kpi-card"
                key={kpi.label}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, delay: reduce ? 0 : idx * 0.05 }}
              >
                <span>{kpi.label}</span>
                <strong>{kpi.value}</strong>
                <small>{kpi.sub}</small>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="role-card"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: reduce ? 0 : 0.15 }}
          >
            <div className="role-card-head">
              <div><strong>Earnings & tips</strong><small>{chartRange === 'week' ? 'Last 7 days' : 'Today by hour'}</small></div>
              <div className="role-seg">
                <button type="button" className={chartRange === 'week' ? 'active' : ''} onClick={() => setChartRange('week')}>7D</button>
                <button type="button" className={chartRange === 'today' ? 'active' : ''} onClick={() => setChartRange('today')}>Today</button>
              </div>
            </div>
            <div className="role-chart" role="img" aria-label="Courier earnings bar chart" key={chartRange}>
              {chartData.map((bar, idx) => (
                <div className="role-chart-col" key={bar.label}>
                  <span className="role-chart-val">{money(bar.base + bar.tip).replace('.00', '')}</span>
                  <div className="role-chart-track">
                    <motion.span
                      className="role-chart-fill"
                      initial={reduce ? false : { height: '0%' }}
                      animate={{ height: `${Math.max(14, ((bar.base + bar.tip) / maxEarn) * 100)}%` }}
                      transition={{ duration: 0.45, delay: reduce ? 0 : idx * 0.05, ease: 'easeOut' }}
                    />
                  </div>
                  <small>{bar.label}</small>
                </div>
              ))}
            </div>
          </motion.div>

          {courierOnline ? (
            <div className="role-card">
              <div className="role-card-head">
                <div><strong>{tripStage === 'offered' ? 'New delivery request' : 'Active delivery'}</strong><small>Order #{activeOrder.id.slice(0, 8).toUpperCase()}</small></div>
                <strong>$6.50 + $2.00 tip</strong>
              </div>
              <div className="role-route-summary">
                <div><LuMapPin /><span>Pickup: <strong>{restaurantName}</strong> (0.8 km)</span></div>
                <div><LuNavigation /><span>Drop-off: <strong>{fullAddress}</strong> (2.1 km)</span></div>
              </div>
              <div className="role-action-row">
                {tripStage === 'offered' ? <>
                  <Button variant="outline" onClick={() => setCourierOnline(false)}>Go offline</Button>
                  <Button onClick={() => { setCourierTripStage(activeOrder.id, 'to_pickup'); setTab('delivery') }}><LuCheck /> Accept trip</Button>
                </> : <Button className="wide" onClick={() => setTab('delivery')}><LuNavigation /> Open live delivery map</Button>}
              </div>
            </div>
          ) : (
            <div className="role-card">
              <strong>You are currently offline</strong>
              <p className="role-muted">Go online to receive nearby Denver delivery requests.</p>
              <Button onClick={() => setCourierOnline(true)}>Go online now</Button>
            </div>
          )}
        </>}

        {tab === 'delivery' && <>
          <div className="order-track-hero role-map-card">
            <div className="tracking-map">
              <iframe className="tracking-map-iframe" title="Courier route map" src={`https://maps.google.com/maps?q=${encodeURIComponent(fullAddress + ', USA')}&t=m&z=14&ie=UTF8&iwloc=&output=embed`} loading="lazy" tabIndex={-1} />
              <svg className="tracking-map-route" viewBox="0 0 400 240" preserveAspectRatio="none" aria-hidden="true">
                <path d="M64 178 L156 152 L238 122 L326 98" stroke="#ffffffcc" strokeWidth="7" strokeLinecap="round" fill="none" />
                <path d="M64 178 L156 152 L238 122 L326 98" stroke="#c83c14" strokeWidth="3.5" strokeDasharray="7 6" strokeLinecap="round" fill="none" />
              </svg>
              <div className="map-rider riding" style={riderCoords}>
                <span className="map-rider-pulse" aria-hidden="true" />
                <img className="map-rider-img" src="/media/ghost-rider.png" alt="Ghost Couriers rider" />
              </div>
              <a className="map-open-link" href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress + ', USA')}`} target="_blank" rel="noreferrer">Navigate</a>
            </div>
          </div>

          <div className="role-card">
            <div className="role-card-head">
              <div><strong>{tripStage === 'offered' ? 'Ready to accept' : tripStage === 'to_pickup' ? `Head to ${restaurantName}` : tripStage === 'picked_up' ? 'Delivering to customer' : 'Delivery complete'}</strong><small>{fullAddress}</small></div>
              <Button asChild variant="outline" size="icon" aria-label="Call customer"><a href="tel:+17204293989"><LuPhone /></a></Button>
            </div>
            <div className="role-action-row">
              {tripStage === 'offered' && <Button className="wide" onClick={() => setCourierTripStage(activeOrder.id, 'to_pickup')}>Accept & start pickup</Button>}
              {tripStage === 'to_pickup' && <Button className="wide" onClick={() => setCourierTripStage(activeOrder.id, 'picked_up')}><LuCheck /> Confirm pickup</Button>}
              {tripStage === 'picked_up' && <Button className="wide" onClick={() => setCourierTripStage(activeOrder.id, 'delivered')}><LuCheck /> Mark delivered</Button>}
              {tripStage === 'delivered' && <Button variant="outline" className="wide" onClick={() => setCourierTripStage(activeOrder.id, 'offered')}>Reset demo trip</Button>}
            </div>
          </div>
        </>}

        {tab === 'trips' && (
          <div className="list">
            {orders.map(order => (
              <div className="role-card" key={order.id}>
                <div className="role-card-head">
                  <div><strong>{order.items[0]?.restaurant ?? 'Restaurant'}</strong><small>{order.address.street} · 2.1 km</small></div>
                  <span className="order-status-pill delivered">+$8.50</span>
                </div>
              </div>
            ))}
            <div className="role-card">
              <div className="role-card-head"><div><strong>Bourbon Grill</strong><small>1750 Blake St · 1.8 km</small></div><span className="order-status-pill delivered">+$7.25</span></div>
            </div>
            <div className="role-card">
              <div className="role-card-head"><div><strong>Poke Club</strong><small>1420 Larimer St · 2.6 km</small></div><span className="order-status-pill delivered">+$9.50</span></div>
            </div>
          </div>
        )}

        {tab === 'wallet' && <>
          <div className="role-balance-card">
            <span>Withdrawable earnings</span>
            <strong>{money(availableBalance)}</strong>
            <Button className="wide" disabled={availableBalance <= 0} onClick={() => requestPayout('courier', availableBalance)}>Withdraw earnings</Button>
          </div>
          <div className="role-card">
            <div className="role-mini-list">
              <div><span>Base delivery pay</span><strong>{money(basePay)}</strong></div>
              <div><span>Customer tips</span><strong>{money(tipsEarned)}</strong></div>
              <div><span>COD cash collected</span><strong>{money(codCollected)}</strong></div>
            </div>
          </div>
          <div className="role-section-head">
            <strong>Payout account</strong>
            <Button variant="outline" onClick={() => setShowAddPayout(v => !v)}><LuPlus /> Add</Button>
          </div>
          {showAddPayout && (
            <form className="role-card form-stack" onSubmit={submitPayout}>
              <div className="role-filter-pills">
                <button type="button" className={payoutKind === 'upi' ? 'active' : ''} onClick={() => setPayoutKind('upi')}>UPI ID</button>
                <button type="button" className={payoutKind === 'bank' ? 'active' : ''} onClick={() => setPayoutKind('bank')}>Bank account</button>
              </div>
              <Input required placeholder={payoutKind === 'upi' ? 'rider@okaxis' : 'Bank •••• 1234'} value={payoutLabel} onChange={e => setPayoutLabel(e.target.value)} />
              <Button type="submit">Save payout method</Button>
            </form>
          )}
          <div className="payment-methods">
            {payoutMethods.map(m => (
              <label className="payment-option" data-selected={selectedPayoutId === m.id} key={m.id}>
                <span className="checkout-icon-badge" aria-hidden="true"><LuCreditCard /></span>
                <span className="payment-option-copy"><strong>{m.label}</strong><small>{m.detail}</small></span>
                <input type="radio" name="courier-payout" checked={selectedPayoutId === m.id} onChange={() => selectPayoutMethod(m.id)} />
              </label>
            ))}
          </div>
          {payoutHistory.filter(p => p.role === 'courier').length > 0 && (
            <div className="role-card">
              <strong>Payout history</strong>
              <div className="role-mini-list">
                {payoutHistory.filter(p => p.role === 'courier').map(p => (
                  <div key={p.id}><span>{p.method} · {p.status}</span><strong>{money(p.amount)}</strong></div>
                ))}
              </div>
            </div>
          )}
        </>}

        {tab === 'profile' && <>
          <div className="profile-hero-card">
            <span className="profile-avatar"><LuBike /></span>
            <div className="profile-hero-copy">
              <strong>{courierProfile.name}</strong>
              <small><LuShieldCheck style={{ display: 'inline', verticalAlign: '-2px' }} /> Verified · {courierProfile.vehicle} ({courierProfile.plate})</small>
            </div>
          </div>
          <form className="role-card form-stack" onSubmit={saveProfile}>
            <label>Rider name<Input required value={courierProfile.name} onChange={e => updateCourierProfile({ name: e.target.value })} /></label>
            <label>Phone number<Input required value={courierProfile.phone} onChange={e => updateCourierProfile({ phone: e.target.value })} /></label>
            <div className="form-pair">
              <label>Vehicle
                <select className="input" value={courierProfile.vehicle} onChange={e => updateCourierProfile({ vehicle: e.target.value as typeof courierProfile.vehicle })}>
                  <option value="Bike / Scooter">Bike / Scooter</option>
                  <option value="Bicycle">Bicycle</option>
                  <option value="Car">Car</option>
                </select>
              </label>
              <label>Plate / ID<Input value={courierProfile.plate} onChange={e => updateCourierProfile({ plate: e.target.value })} /></label>
            </div>
            {savedNotice && <p className="role-done-tag" role="status">{savedNotice}</p>}
            <Button type="submit">Save courier profile</Button>
          </form>
          <Button asChild variant="outline" className="wide"><Link to="/restaurant">Switch to Restaurant workspace</Link></Button>
          <Button asChild className="wide"><Link to="/customer">Back to Customer app</Link></Button>
        </>}
      </motion.div>

      <nav className="role-tab-bar" aria-label="Courier navigation">
        {([
          ['home', 'Home', LuHouse],
          ['delivery', 'Delivery', LuNavigation],
          ['trips', 'Trips', LuHistory],
          ['wallet', 'Wallet', LuWallet],
          ['profile', 'Profile', LuUserRound],
        ] as const).map(([key, label, Icon]) => (
          <button key={key} type="button" className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>
            <Icon /><span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
