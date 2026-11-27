import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LuChevronLeft, LuClock3, LuHeart, LuEllipsisVertical, LuMinus, LuPlus, LuSearch, LuX } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RestaurantOptions } from './RestaurantOptions'

import { isOpen, media, money, restaurants, type Restaurant as RestaurantData } from '@/features/catalog/catalog'
import { useDelivery } from '@/features/cart/store'
type MenuItem = RestaurantData['items'][number]
function ItemForm({ item, restaurant, onClose }: { item: MenuItem; restaurant: RestaurantData; onClose: () => void }) {
  const { addItems } = useDelivery()
  const [quantity, setQuantity] = useState(1)
  const [option, setOption] = useState('Standard')
  const [notes, setNotes] = useState('')
  const amount = item.price + (option === 'Add a drink' ? 299 : 0)
  return <form className="form-stack" onSubmit={event => {
    event.preventDefault()
    addItems([{ id: JSON.stringify([restaurant.id, item.name, option, notes.trim()]), restaurant: restaurant.name, name: item.name, amount, quantity, option, notes: notes.trim() }])
    onClose()
  }}>
    <fieldset><legend>Make it a meal</legend>{['Standard', 'Add a drink'].map(name => <label className="radio-row" key={name}><input type="radio" name="option" value={name} checked={option === name} onChange={() => setOption(name)} />{name}<span>{name === 'Add a drink' ? '+$2.99' : 'Included'}</span></label>)}</fieldset>
    <label>Special instructions<textarea rows={3} maxLength={240} value={notes} onChange={event => setNotes(event.target.value)} placeholder="Anything the kitchen should know?" /></label>
    <div className="item-submit-row">
      <div className="quantity"><Button variant="outline" size="icon" type="button" onClick={() => setQuantity(quantity - 1)} disabled={quantity === 1} aria-label="Decrease quantity"><LuMinus /></Button><output aria-label="Quantity">{quantity}</output><Button variant="outline" size="icon" type="button" onClick={() => setQuantity(quantity + 1)} disabled={quantity === 20} aria-label="Increase quantity"><LuPlus /></Button></div>
      <Button type="submit">Add to cart · {money(amount * quantity)}</Button>
    </div>
  </form>
}
export function Restaurant() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { cart, favorites, toggleFavorite } = useDelivery()
  const [optionsOpen, setOptionsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const searchInput = useRef<HTMLInputElement>(null)
  const optionsButton = useRef<HTMLButtonElement>(null)
  const restaurant = restaurants.find(value => value.id === id)
  if (!restaurant) return <div className="empty"><h1>Restaurant not found</h1><Button asChild><Link to="/explore">Explore restaurants</Link></Button></div>
  const liked = favorites.includes(restaurant.id)
  const items = restaurant.items.map((item, index) => ({ item, index }))
    .filter(({ item }) => item.name.toLowerCase().includes(query.trim().toLowerCase()))

  return <>
    <div className="restaurant-hero restaurant-menu-hero">
      <img src={media(restaurant.image)} alt="" fetchPriority="high" />
      <div className="restaurant-hero-controls">
        <Button className="restaurant-back" variant="outline" size="icon" aria-label="Go back" onClick={() => window.history.state?.idx > 0 ? navigate(-1) : navigate('/explore')}><LuChevronLeft /></Button>
        <div className="restaurant-menu-search">
          <LuSearch aria-hidden="true" />
          <Input ref={searchInput} type="search" aria-label="Search menu items" placeholder="Find a dish" value={query}
            onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') setQuery('') }} />
          {query && <Button variant="ghost" size="icon" aria-label="Clear menu search" onClick={() => { setQuery(''); searchInput.current?.focus() }}><LuX /></Button>}
        </div>
        <Button ref={optionsButton} className="restaurant-options-trigger" variant="outline" size="icon" aria-label="Restaurant options" aria-haspopup="dialog" aria-expanded={optionsOpen} onClick={() => setOptionsOpen(true)}><LuEllipsisVertical /></Button>
      </div>
    </div>
    <div className="detail restaurant-menu-body">
      <div className="section-heading restaurant-menu-heading">
        <div><p className="eyebrow">{restaurant.cuisine}</p><h1>{restaurant.name}</h1><p>{restaurant.description}</p></div>
        <Button variant="outline" className={liked ? 'liked' : ''} size="icon" aria-label="Favorite restaurant" aria-pressed={liked} onClick={() => toggleFavorite(restaurant.id)}><LuHeart /></Button>
      </div>
      <div className="restaurant-hours"><LuClock3 /><strong>{isOpen(restaurant) ? 'Open now' : 'Closed now'}</strong><span>{restaurant.hours} · Denver time</span></div>
      <section className="restaurant-menu-items" aria-labelledby="menu-heading">
        <h2 id="menu-heading">Menu</h2>
        {items.length ? <div className="list">{items.map(({ item, index }) => <Link className="menu-item" key={item.name} to={`/restaurants/${restaurant.id}/items/${index}`}><img src={media(restaurant.image)} alt="" /><span><strong>{item.name}</strong><small>{money(item.price)}</small></span><span className="card-arrow"><LuPlus /></span></Link>)}</div> : <div className="empty"><p>No menu items match your search.</p><Button variant="outline" onClick={() => setQuery('')}>Clear search</Button></div>}
      </section>
      {cart.length > 0 && <Button asChild className="sticky-action"><Link to="/cart">View cart · {cart.reduce((count, item) => count + item.quantity, 0)} items</Link></Button>}
    </div>
    <RestaurantOptions restaurant={restaurant} open={optionsOpen} onOpenChange={open => {
      setOptionsOpen(open)
      if (!open) requestAnimationFrame(() => optionsButton.current?.focus())
    }} />
  </>
}
export function RestaurantItem() {
  const { id, itemIndex } = useParams()
  const navigate = useNavigate()
  const restaurant = restaurants.find(entry => entry.id === id)
  const item = restaurant?.items[Number(itemIndex)]
  if (!restaurant || !item) return <div className="empty"><h1>Menu item unavailable</h1><Button asChild><Link to="/explore">Explore restaurants</Link></Button></div>
  const menuPath = '/restaurants/' + restaurant.id
  return <>
    <div className="restaurant-hero restaurant-menu-hero restaurant-item-hero">
      <img src={media(restaurant.image)} alt="" />
      <div className="restaurant-hero-controls">
        <Button asChild className="restaurant-back" variant="outline" size="icon" aria-label="Back to menu"><Link to={menuPath}><LuChevronLeft /></Link></Button>
      </div>
    </div>
    <section className="detail restaurant-item-body">
      <div className="restaurant-item-head">
        <div><p className="eyebrow">{restaurant.name}</p><h1>{item.name}</h1></div>
        <strong className="restaurant-item-price">{money(item.price)}</strong>
      </div>
      <ItemForm key={item.name} item={item} restaurant={restaurant} onClose={() => navigate('/cart')} />
    </section>
  </>
}