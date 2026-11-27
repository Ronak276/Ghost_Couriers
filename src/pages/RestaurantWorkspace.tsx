import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { LuCheck, LuChevronLeft, LuClipboardList, LuClock3, LuCreditCard, LuHouse, LuPlus, LuSettings, LuStore, LuUtensils, LuWallet, LuX } from 'react-icons/lu'
import { RoleIntro } from '@/components/navigation/RoleIntro'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet } from '@/components/ui/sheet'
import { media, money, restaurants } from '@/features/catalog/catalog'
import { useDelivery, type RestaurantOrderStage } from '@/features/cart/store'

type Tab = 'home' | 'orders' | 'menu' | 'payouts' | 'settings'

const weekChart = [
  { label: 'Mon', revenue: 42000, orders: 14 },
  { label: 'Tue', revenue: 51500, orders: 18 },
  { label: 'Wed', revenue: 48200, orders: 16 },
  { label: 'Thu', revenue: 63900, orders: 22 },
  { label: 'Fri', revenue: 89400, orders: 31 },
  { label: 'Sat', revenue: 96800, orders: 34 },
  { label: 'Sun', revenue: 74500, orders: 26 },
]

const todayChart = [
  { label: '10a', revenue: 8400, orders: 3 },
  { label: '12p', revenue: 21500, orders: 7 },
  { label: '2p', revenue: 14800, orders: 5 },
  { label: '4p', revenue: 11200, orders: 4 },
  { label: '6p', revenue: 26400, orders: 9 },
  { label: '8p', revenue: 19300, orders: 6 },
]

export function RestaurantWorkspace() {
  const navigate = useNavigate()
  const {
    orders, restaurantOnline, setRestaurantOnline, restaurantOrderStages, setRestaurantOrderStage,
    customDishes, addPartnerDish, unavailableDishes, toggleDishAvailable,
    payoutMethods, selectedPayoutId, selectPayoutMethod, addPayoutMethod, payoutHistory, requestPayout,
  } = useDelivery()

  const activeStore = restaurants[0]
  const extraSampleDishes = [
    { name: 'Crispy Tofu Scramble', price: 1395, category: 'Mains' },
    { name: 'Truffle Sweet Potato Fries', price: 695, category: 'Sides' },
    { name: 'Matcha Oat Latte', price: 545, category: 'Drinks' },
    { name: 'Fresh Pressed Green Juice', price: 695, category: 'Drinks' },
    { name: 'Warm Cinnamon Roll', price: 645, category: 'Desserts' },
  ]
  const baseDishes = [
    ...activeStore.items.map(d => ({ ...d, category: 'Mains' })),
    ...extraSampleDishes,
    ...(customDishes?.[activeStore.id] ?? []).map(d => ({ ...d, category: 'Mains' })),
  ]
  const menuCategories = ['All', 'Mains', 'Sides', 'Drinks', 'Desserts']

  const [introDone, setIntroDone] = useState(false)
  const [tab, setTab] = useState<Tab>('home')
  const reduce = useReducedMotion()
  const [chartRange, setChartRange] = useState<'week' | 'today'>('week')
  const [orderFilter, setOrderFilter] = useState<RestaurantOrderStage>('new')
  const [autoAccept, setAutoAccept] = useState(false)
  const [prepMins, setPrepMins] = useState('20')
  const [dishTargetId, setDishTargetId] = useState<string | null>(null)
  const [dishCategory, setDishCategory] = useState('All')
  const [newDishCategory, setNewDishCategory] = useState('Mains')
  const [dishName, setDishName] = useState('')
  const [dishPrice, setDishPrice] = useState('')
  const activeDishes = dishCategory === 'All' ? baseDishes : baseDishes.filter(d => d.category === dishCategory)
  const [showAddPayout, setShowAddPayout] = useState(false)
  const [payoutKind, setPayoutKind] = useState<'bank' | 'upi'>('upi')
  const [payoutLabel, setPayoutLabel] = useState('')

  const allOrders = orders.length
    ? orders
    : [{ id: 'GC1042DEMO', items: [{ id: 'd1', restaurant: 'Watercourse Foods', name: 'Avocado Toast', amount: 1295, quantity: 2, option: 'Standard', notes: 'Extra chili flakes' }], total: 3222, address: { street: '2525 Washington St', unit: 'Apt 4B', zip: '80205', instructions: '' }, created: Date.now() }]

  const getStage = (id: string): RestaurantOrderStage => restaurantOrderStages[id] ?? 'new'
  const newCount = allOrders.filter(o => getStage(o.id) === 'new').length
  const filteredOrders = allOrders.filter(o => getStage(o.id) === orderFilter)

  const liveSales = allOrders.reduce((s, o) => s + o.total, 0)
  const chartData = chartRange === 'week' ? weekChart : todayChart
  const maxRev = Math.max(...chartData.map(d => d.revenue), 1)
  const grossSales = 74500 + liveSales
  const platformFee = Math.round(grossSales * 0.15)
  const netPayout = grossSales - platformFee
  const withdrawn = payoutHistory.filter(p => p.role === 'restaurant').reduce((s, p) => s + p.amount, 0)
  const availableBalance = Math.max(0, netPayout - withdrawn)

  function submitDish(event: FormEvent, restaurantId: string) {
    event.preventDefault()
    const cents = Math.round(Number(dishPrice) * 100)
    if (!dishName.trim() || !cents) return
    addPartnerDish(restaurantId, { name: dishName.trim(), price: cents })
    setDishName(''); setDishPrice(''); setDishTargetId(null)
  }

  function submitPayout(event: FormEvent) {
    event.preventDefault()
    if (!payoutLabel.trim()) return
    addPayoutMethod({ kind: payoutKind, label: payoutLabel.trim(), detail: payoutKind === 'upi' ? 'UPI ID · Instant' : 'Bank · Instant transfer' })
    setPayoutLabel(''); setShowAddPayout(false)
  }

  if (!introDone) return <RoleIntro role="restaurant" onDone={() => setIntroDone(true)} />

  return (
    <div className="role-shell">
      {tab === 'home' ? (
        <div className="role-home-hero">
          <div className="role-home-topbar">
            <Button variant="ghost" size="icon" aria-label="Back to profile" onClick={() => navigate('/profile')}><LuChevronLeft /></Button>
            <div className="role-home-brand">
              <small>Restaurant Partner</small>
              <strong>{activeStore.name}</strong>
            </div>
            <label className="role-online-toggle">
              <span>{restaurantOnline ? 'Online' : 'Paused'}</span>
              <input className="profile-switch" type="checkbox" checked={restaurantOnline} onChange={e => setRestaurantOnline(e.target.checked)} aria-label="Toggle store online" />
            </label>
          </div>
          <div className="role-hero-summary">
            <div>
              <span>Today’s revenue</span>
              <h2>{money(grossSales)}</h2>
            </div>
            <Button onClick={() => setTab('orders')}>Live queue ({newCount})</Button>
          </div>
        </div>
      ) : (
        <header className="screen-bar">
          <Button variant="ghost" size="icon" aria-label="Back to profile" onClick={() => navigate('/profile')}><LuChevronLeft /></Button>
          <h1>{tab === 'orders' ? 'Kitchen Orders' : tab === 'menu' ? 'Menu & Store' : tab === 'payouts' ? 'Payouts' : 'Store Settings'}</h1>
          <button type="button" className={`role-status-chip ${restaurantOnline ? 'online' : ''}`} onClick={() => setRestaurantOnline(!restaurantOnline)}>
            <span className="role-dot" />{restaurantOnline ? 'Online' : 'Paused'}
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
              { label: 'Today’s revenue', value: money(grossSales), sub: '+14% vs yesterday' },
              { label: 'Active orders', value: String(allOrders.filter(o => getStage(o.id) !== 'completed' && getStage(o.id) !== 'rejected').length), sub: `${newCount} awaiting accept` },
              { label: 'Avg prep time', value: `${prepMins} min`, sub: 'On-time kitchen' },
              { label: 'Store rating', value: '4.7 ★', sub: '184 reviews' },
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
              <div><strong>Revenue & orders</strong><small>{chartRange === 'week' ? 'Last 7 days' : 'Today by hour'}</small></div>
              <div className="role-seg">
                <button type="button" className={chartRange === 'week' ? 'active' : ''} onClick={() => setChartRange('week')}>7D</button>
                <button type="button" className={chartRange === 'today' ? 'active' : ''} onClick={() => setChartRange('today')}>Today</button>
              </div>
            </div>
            <div className="role-chart" role="img" aria-label="Restaurant revenue bar chart" key={chartRange}>
              {chartData.map((bar, idx) => (
                <div className="role-chart-col" key={bar.label}>
                  <span className="role-chart-val">{money(bar.revenue).replace('.00', '')}</span>
                  <div className="role-chart-track">
                    <motion.span
                      className="role-chart-fill"
                      initial={reduce ? false : { height: '0%' }}
                      animate={{ height: `${Math.max(14, (bar.revenue / maxRev) * 100)}%` }}
                      transition={{ duration: 0.45, delay: reduce ? 0 : idx * 0.05, ease: 'easeOut' }}
                    />
                  </div>
                  <small>{bar.label}</small>
                </div>
              ))}
            </div>
          </motion.div>

          {newCount > 0 && (
            <button type="button" className="role-alert-banner" onClick={() => { setOrderFilter('new'); setTab('orders') }}>
              <LuClipboardList /><span><strong>{newCount} new {newCount === 1 ? 'order' : 'orders'}</strong> waiting for kitchen confirmation</span><span>View →</span>
            </button>
          )}

          <div className="role-card">
            <div className="role-card-head"><strong>Top selling dishes</strong><small>Today</small></div>
            <div className="role-mini-list">
              <div><span>Avocado Toast</span><strong>18 orders</strong></div>
              <div><span>Bourbon Chicken Bowl</span><strong>14 orders</strong></div>
              <div><span>Salmon Poke Bowl</span><strong>11 orders</strong></div>
            </div>
          </div>
        </>}

        {tab === 'orders' && <>
          <div className="role-filter-pills">
            {(['new', 'preparing', 'ready', 'completed'] as RestaurantOrderStage[]).map(stage => (
              <button key={stage} type="button" className={orderFilter === stage ? 'active' : ''} onClick={() => setOrderFilter(stage)}>
                {stage.charAt(0).toUpperCase() + stage.slice(1)} ({allOrders.filter(o => getStage(o.id) === stage).length})
              </button>
            ))}
          </div>
          {filteredOrders.length ? filteredOrders.map(order => {
            const stage = getStage(order.id)
            return <div className="role-card" key={order.id}>
              <div className="role-card-head">
                <div><strong>Order #{order.id.slice(0, 8).toUpperCase()}</strong><small>{order.address.street}</small></div>
                <strong>{money(order.total)}</strong>
              </div>
              <div className="role-order-items">
                {order.items.map(item => <div key={item.id}><span>{item.quantity} × {item.name} ({item.option})</span>{item.notes && <small>Note: “{item.notes}”</small>}</div>)}
              </div>
              <div className="role-action-row">
                {stage === 'new' && <>
                  <Button variant="outline" onClick={() => setRestaurantOrderStage(order.id, 'rejected')}><LuX /> Reject</Button>
                  <Button onClick={() => setRestaurantOrderStage(order.id, 'preparing')}><LuCheck /> Accept order</Button>
                </>}
                {stage === 'preparing' && <Button className="wide" onClick={() => setRestaurantOrderStage(order.id, 'ready')}><LuUtensils /> Mark ready for pickup</Button>}
                {stage === 'ready' && <Button className="wide" onClick={() => setRestaurantOrderStage(order.id, 'completed')}><LuCheck /> Handed to courier</Button>}
                {stage === 'completed' && <span className="role-done-tag"><LuCheck /> Completed</span>}
              </div>
            </div>
          }) : <div className="empty"><LuClipboardList /><h3>No {orderFilter} orders</h3><p>Orders in this stage will appear here.</p></div>}
        </>}

        {tab === 'menu' && <>
          <div className="role-section-head">
            <select className="role-inline-select" aria-label="Filter menu category" value={dishCategory} onChange={e => setDishCategory(e.target.value)}>
              {menuCategories.map(cat => <option key={cat} value={cat}>{cat === 'All' ? 'All categories' : cat}</option>)}
            </select>
            <Button variant="outline" onClick={() => setDishTargetId(activeStore.id)}><LuPlus /> Add menu item</Button>
          </div>
          <Sheet open={!!dishTargetId} onOpenChange={open => { if (!open) setDishTargetId(null) }} title="Add menu item" description={`Add a new dish to ${activeStore.name}.`}>
            <form className="form-stack" onSubmit={e => submitDish(e, activeStore.id)}>
              <label>Category
                <select className="input" value={newDishCategory} onChange={e => setNewDishCategory(e.target.value)}>
                  {menuCategories.filter(c => c !== 'All').map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </label>
              <div className="form-pair">
                <label>Dish name<Input required placeholder="e.g. Truffle Burger" value={dishName} onChange={e => setDishName(e.target.value)} /></label>
                <label>Price ($)<Input required type="number" step="0.01" min="1" placeholder="14.95" value={dishPrice} onChange={e => setDishPrice(e.target.value)} /></label>
              </div>
              <Button type="submit">Save menu item</Button>
            </form>
          </Sheet>
          <div className="role-card">
            <div className="role-store-head">
              <img src={media(activeStore.image)} alt="" />
              <div><strong>{activeStore.name}</strong><small>{activeDishes.length} items · {activeStore.hours}</small></div>
            </div>
            <div className="role-dish-list">
              {activeDishes.map(item => {
                const available = !unavailableDishes.includes(`${activeStore.id}::${item.name}`)
                return <label className="role-dish-row" key={item.name}>
                  <span><strong>{item.name}</strong><small>{item.category} · {money(item.price)}</small></span>
                  <input className="profile-switch" type="checkbox" checked={available} onChange={() => toggleDishAvailable(activeStore.id, item.name)} aria-label={`Toggle ${item.name} availability`} />
                </label>
              })}
            </div>
          </div>
        </>}

        {tab === 'payouts' && <>
          <div className="role-balance-card">
            <span>Available for payout</span>
            <strong>{money(availableBalance)}</strong>
            <Button className="wide" disabled={availableBalance <= 0} onClick={() => requestPayout('restaurant', availableBalance)}>Request instant payout</Button>
          </div>
          <div className="role-card">
            <div className="role-mini-list">
              <div><span>Gross sales</span><strong>{money(grossSales)}</strong></div>
              <div><span>Platform fee (15%)</span><strong>−{money(platformFee)}</strong></div>
              <div className="total"><strong>Net earnings</strong><strong>{money(netPayout)}</strong></div>
            </div>
          </div>
          <div className="role-section-head">
            <strong>Payout method</strong>
            <Button variant="outline" onClick={() => setShowAddPayout(v => !v)}><LuPlus /> Add</Button>
          </div>
          {showAddPayout && (
            <form className="role-card form-stack" onSubmit={submitPayout}>
              <div className="role-filter-pills">
                <button type="button" className={payoutKind === 'upi' ? 'active' : ''} onClick={() => setPayoutKind('upi')}>UPI ID</button>
                <button type="button" className={payoutKind === 'bank' ? 'active' : ''} onClick={() => setPayoutKind('bank')}>Bank account</button>
              </div>
              <Input required placeholder={payoutKind === 'upi' ? 'store@okaxis' : 'Bank •••• 1234'} value={payoutLabel} onChange={e => setPayoutLabel(e.target.value)} />
              <Button type="submit">Save payout method</Button>
            </form>
          )}
          <div className="payment-methods">
            {payoutMethods.map(m => (
              <label className="payment-option" data-selected={selectedPayoutId === m.id} key={m.id}>
                <span className="checkout-icon-badge" aria-hidden="true"><LuCreditCard /></span>
                <span className="payment-option-copy"><strong>{m.label}</strong><small>{m.detail}</small></span>
                <input type="radio" name="rest-payout" checked={selectedPayoutId === m.id} onChange={() => selectPayoutMethod(m.id)} />
              </label>
            ))}
          </div>
          {payoutHistory.filter(p => p.role === 'restaurant').length > 0 && (
            <div className="role-card">
              <strong>Payout history</strong>
              <div className="role-mini-list">
                {payoutHistory.filter(p => p.role === 'restaurant').map(p => (
                  <div key={p.id}><span>{p.method} · {p.status}</span><strong>{money(p.amount)}</strong></div>
                ))}
              </div>
            </div>
          )}
        </>}

        {tab === 'settings' && <>
          <div className="profile-group">
            <label className="profile-row">
              <span className="profile-icon"><LuStore /></span>
              <span className="profile-row-copy"><strong>Accepting new orders</strong><small>{restaurantOnline ? 'Store visible to customers' : 'Temporarily paused'}</small></span>
              <input className="profile-switch" type="checkbox" checked={restaurantOnline} onChange={e => setRestaurantOnline(e.target.checked)} />
            </label>
            <label className="profile-row">
              <span className="profile-icon"><LuCheck /></span>
              <span className="profile-row-copy"><strong>Auto-accept incoming orders</strong><small>Send straight to kitchen queue</small></span>
              <input className="profile-switch" type="checkbox" checked={autoAccept} onChange={e => setAutoAccept(e.target.checked)} />
            </label>
            <div className="profile-row">
              <span className="profile-icon"><LuClock3 /></span>
              <span className="profile-row-copy"><strong>Default prep time</strong><small>{prepMins} minutes</small></span>
              <select className="role-inline-select" value={prepMins} onChange={e => setPrepMins(e.target.value)} aria-label="Default prep time">
                <option value="15">15 min</option><option value="20">20 min</option><option value="30">30 min</option>
              </select>
            </div>
          </div>
          <Button asChild variant="outline" className="wide"><Link to="/courier">Switch to Courier workspace</Link></Button>
          <Button asChild className="wide"><Link to="/customer">Back to Customer app</Link></Button>
        </>}
      </motion.div>

      <nav className="role-tab-bar" aria-label="Restaurant navigation">
        {([
          ['home', 'Home', LuHouse],
          ['orders', 'Orders', LuClipboardList],
          ['menu', 'Menu', LuUtensils],
          ['payouts', 'Payouts', LuWallet],
          ['settings', 'Settings', LuSettings],
        ] as const).map(([key, label, Icon]) => (
          <button key={key} type="button" className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>
            <Icon /><span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
