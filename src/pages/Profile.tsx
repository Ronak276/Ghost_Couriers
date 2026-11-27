import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { LuChevronLeft, LuHeart, LuMail, LuMapPin, LuMessageSquare, LuPhone, LuShoppingBag } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { restaurants } from '@/features/catalog/catalog'
import { useDelivery } from '@/features/cart/store'
export function Profile() {
  const { savedAddresses, notifications, setNotifications, cart, hiddenRestaurants, setRestaurantHidden } = useDelivery()
  const { openAddress } = useOutletContext<{ openAddress: () => void }>()
  const navigate = useNavigate()
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  return <div className="detail orders-screen">
    <header className="screen-bar">
      <Button variant="ghost" size="icon" aria-label="Go back" onClick={() => window.history.state?.idx > 0 ? navigate(-1) : navigate('/')}><LuChevronLeft /></Button>
      <h1>Your profile</h1>
      <span className="screen-bar-spacer" aria-hidden="true" />
    </header>
    <div className="list">
      <Link className="list-row" to="/cart"><LuShoppingBag /><span><strong>Your cart</strong><small>{cartCount === 1 ? "1 item" : cartCount + " items"}</small></span></Link>
      <button className="list-row" onClick={openAddress}><LuMapPin /><span><strong>Saved addresses</strong><small>{savedAddresses.length} saved</small></span></button>
      <Link className="list-row" to="/explore?saved=1"><LuHeart /><span><strong>Favorite restaurants</strong><small>See your saved spots</small></span></Link>
      <label className="list-row"><span><strong>Order notification preference</strong><small>Saved on this device</small></span><input type="checkbox" checked={notifications} onChange={event => setNotifications(event.target.checked)} /></label>
    </div>
    <Button asChild variant="outline"><Link to="/welcome">Replay onboarding</Link></Button>
    {hiddenRestaurants.length > 0 && <section aria-labelledby="hidden-restaurants">
      <h2 id="hidden-restaurants">Hidden restaurants</h2>
      <div className="list">{restaurants.filter(restaurant => hiddenRestaurants.includes(restaurant.id)).map(restaurant =>
        <div className="list-row" key={restaurant.id}><span>{restaurant.name}</span><Button variant="outline" onClick={() => setRestaurantHidden(restaurant.id, false)}>Show again</Button></div>
      )}</div>
    </section>}
    <h2>Role previews</h2>
    <div className="list">
      <Link className="list-row" to="/preview/restaurant">Restaurant workspace</Link>
      <Link className="list-row" to="/preview/courier">Courier workspace</Link>
      <Link className="list-row" to="/preview/operations">Operations workspace</Link>
    </div>
    <h2>Contact Ghost Couriers</h2><p>Sunday–Thursday 7 AM–10 PM · Friday–Saturday 7 AM–11 PM Denver time.</p>
    <div className="filters"><Button asChild variant="outline"><a href="tel:+17204293989"><LuPhone /> Call</a></Button><Button asChild variant="outline"><a href="sms:+17204293989"><LuMessageSquare /> Text</a></Button><Button asChild variant="outline"><a href="mailto:info@ghostcouriers.com"><LuMail /> Email</a></Button></div>
  </div>
}