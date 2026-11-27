import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { LuBell, LuBike, LuChevronLeft, LuChevronRight, LuHeart, LuLayoutGrid, LuMail, LuMapPin, LuMessageSquare, LuPhone, LuRotateCcw, LuShoppingBag, LuStore, LuUserRound } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { restaurants } from '@/features/catalog/catalog'
import { useDelivery } from '@/features/cart/store'

export function Profile() {
  const { address, savedAddresses, notifications, setNotifications, cart, hiddenRestaurants, setRestaurantHidden } = useDelivery()
  const { openAddress } = useOutletContext<{ openAddress: () => void }>()
  const navigate = useNavigate()
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return <div className="detail profile-screen">
    <header className="screen-bar">
      <Button variant="ghost" size="icon" aria-label="Go back" onClick={() => window.history.state?.idx > 0 ? navigate(-1) : navigate('/')}><LuChevronLeft /></Button>
      <h1>Your profile</h1>
      <span className="screen-bar-spacer" aria-hidden="true" />
    </header>

    <div className="profile-hero-card">
      <span className="profile-avatar" aria-hidden="true"><LuUserRound /></span>
      <div className="profile-hero-copy">
        <strong>Ghost Couriers Guest</strong>
        <small>{address ? `${address.street}, ${address.zip}` : 'Denver, CO · Demo account'}</small>
      </div>
    </div>

    <div className="profile-group">
      <Link className="profile-row" to="/cart">
        <span className="profile-icon" aria-hidden="true"><LuShoppingBag /></span>
        <span className="profile-row-copy"><strong>Your cart</strong><small>{cartCount === 1 ? '1 item' : `${cartCount} items`}</small></span>
        <LuChevronRight className="profile-chevron" aria-hidden="true" />
      </Link>
      <button type="button" className="profile-row" onClick={openAddress}>
        <span className="profile-icon" aria-hidden="true"><LuMapPin /></span>
        <span className="profile-row-copy"><strong>Saved addresses</strong><small>{savedAddresses.length} saved</small></span>
        <LuChevronRight className="profile-chevron" aria-hidden="true" />
      </button>
      <Link className="profile-row" to="/explore?saved=1">
        <span className="profile-icon" aria-hidden="true"><LuHeart /></span>
        <span className="profile-row-copy"><strong>Favorite restaurants</strong><small>See your saved spots</small></span>
        <LuChevronRight className="profile-chevron" aria-hidden="true" />
      </Link>
      <label className="profile-row">
        <span className="profile-icon" aria-hidden="true"><LuBell /></span>
        <span className="profile-row-copy"><strong>Order notifications</strong><small>Saved on this device</small></span>
        <input className="profile-switch" type="checkbox" checked={notifications} onChange={event => setNotifications(event.target.checked)} />
      </label>
      <Link className="profile-row" to="/welcome">
        <span className="profile-icon" aria-hidden="true"><LuRotateCcw /></span>
        <span className="profile-row-copy"><strong>Replay onboarding</strong><small>View welcome screens again</small></span>
        <LuChevronRight className="profile-chevron" aria-hidden="true" />
      </Link>
    </div>

    {hiddenRestaurants.length > 0 && <section className="profile-section" aria-labelledby="hidden-restaurants">
      <h2 id="hidden-restaurants" className="profile-section-title">Hidden restaurants</h2>
      <div className="profile-group">{restaurants.filter(restaurant => hiddenRestaurants.includes(restaurant.id)).map(restaurant =>
        <div className="profile-row" key={restaurant.id}>
          <span className="profile-row-copy"><strong>{restaurant.name}</strong></span>
          <Button variant="outline" onClick={() => setRestaurantHidden(restaurant.id, false)}>Show</Button>
        </div>
      )}</div>
    </section>}

    <section className="profile-section" aria-labelledby="role-previews-heading">
      <h2 id="role-previews-heading" className="profile-section-title">Role previews</h2>
      <div className="profile-group">
        <Link className="profile-row" to="/preview/restaurant">
          <span className="profile-icon" aria-hidden="true"><LuStore /></span>
          <span className="profile-row-copy"><strong>Restaurant workspace</strong></span>
          <LuChevronRight className="profile-chevron" aria-hidden="true" />
        </Link>
        <Link className="profile-row" to="/preview/courier">
          <span className="profile-icon" aria-hidden="true"><LuBike /></span>
          <span className="profile-row-copy"><strong>Courier workspace</strong></span>
          <LuChevronRight className="profile-chevron" aria-hidden="true" />
        </Link>
        <div className="profile-row profile-row-disabled" aria-disabled="true">
          <span className="profile-icon" aria-hidden="true"><LuLayoutGrid /></span>
          <span className="profile-row-copy"><strong>Operations workspace</strong><small>Disabled in demo</small></span>
        </div>
      </div>
    </section>

    <section className="profile-section" aria-labelledby="contact-heading">
      <h2 id="contact-heading" className="profile-section-title">Contact Ghost Couriers</h2>
      <div className="profile-contact-card">
        <p>Sun–Thu 7 AM–10 PM · Fri–Sat 7 AM–11 PM Denver time</p>
        <div className="profile-contact-actions">
          <Button asChild variant="outline"><a href="tel:+17204293989"><LuPhone /> Call</a></Button>
          <Button asChild variant="outline"><a href="sms:+17204293989"><LuMessageSquare /> Text</a></Button>
          <Button asChild variant="outline"><a href="mailto:info@ghostcouriers.com"><LuMail /> Email</a></Button>
        </div>
      </div>
    </section>
  </div>
}