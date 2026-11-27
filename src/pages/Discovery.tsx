import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LuArrowUpRight, LuBike, LuClock3, LuHeart, LuMapPin, LuSearch, LuSlidersHorizontal, LuStar } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { RestaurantPhotos } from '@/components/motion/RestaurantPhotos'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useDelivery } from '@/features/cart/store'
import { cuisines, isOpen, media, money, restaurants, type Restaurant } from '@/features/catalog/catalog'

const previews: Record<string, { photo: string; rating: string; distance: string; discount: number }> = {
  watercourse: { photo: 'poke', rating: '4.6', distance: '2.1', discount: 30 },
  city: { photo: 'pizza', rating: '4.5', distance: '2.4', discount: 25 },
  bourbon: { photo: 'poke', rating: '4.2', distance: '3.4', discount: 70 },
  poke: { photo: 'chicken', rating: '4.7', distance: '1.8', discount: 20 },
  pit: { photo: 'sandwich', rating: '4.8', distance: '2.7', discount: 30 },
  sub: { photo: 'burger', rating: '4.4', distance: '3.2', discount: 25 },
  stowaway: { photo: 'sandwich', rating: '4.7', distance: '1.6', discount: 20 },
  mint: { photo: 'chicken', rating: '4.5', distance: '4.1', discount: 30 },
  corner: { photo: 'brunch', rating: '4.6', distance: '3.1', discount: 25 },
  brooklyn: { photo: 'hero', rating: '4.6', distance: '3.8', discount: 30 },
  jelly: { photo: 'sandwich', rating: '4.5', distance: '3.6', discount: 20 },
  izzio: { photo: 'brunch', rating: '4.7', distance: '2.3', discount: 25 },
}
export function RestaurantCard({ restaurant, detailed = false, playing = false }: { restaurant: Restaurant; detailed?: boolean; playing?: boolean }) {
  const { favorites, toggleFavorite } = useDelivery()
  const liked = favorites.includes(restaurant.id)
  const preview = detailed ? previews[restaurant.id] : undefined
  const featured = restaurant.items[0]
  return <Card className={`restaurant-card gap-0 py-0 shadow-none ${preview ? 'restaurant-card-detailed' : ''}`}>
    <Link className="restaurant-link" to={`/restaurants/${restaurant.id}`}>
      <div className="card-image">
        {preview ? <><RestaurantPhotos photos={[restaurant.image, preview.photo]} playing={playing} />
          {featured && <span className="featured-dish"><strong>{featured.name}</strong><span>{money(featured.price)}</span></span>}</> :
          <><img src={media(restaurant.image)} alt="" loading="lazy" /><span className="glass-tag"><LuClock3 /> {restaurant.minutes} min</span></>}
      </div>
      <div className="card-copy"><div><h3>{restaurant.name}</h3><p>{restaurant.description}</p></div><span className="card-arrow"><LuArrowUpRight /></span></div>
      {preview && <div className="restaurant-meta">
        <div className="restaurant-stats">
          <span><LuClock3 /> {restaurant.minutes} min</span>
          <span><LuMapPin /> {preview.distance} km</span>
          <span className="free-delivery"><LuBike /> Free delivery</span>
          <span className="restaurant-rating" aria-label={`Rating ${preview.rating} out of 5`}>{preview.rating} <LuStar /></span>
        </div>
        <div className="restaurant-offer">{preview.discount}% off up to $15 on orders over $25</div>
      </div>}
    </Link>
    <Button className={`favorite ${liked ? 'liked' : ''}`} variant="outline" size="icon" aria-label={`${liked ? 'Remove' : 'Save'} ${restaurant.name} favorite`} aria-pressed={liked} onClick={() => toggleFavorite(restaurant.id)}><LuHeart /></Button>
  </Card>
}
export function Discovery({ home = false }: { home?: boolean }) {
  const [params, setParams] = useSearchParams()
  const [playing, setPlaying] = useState(true)
  const { favorites, hiddenRestaurants } = useDelivery()
  const query = params.get('q') ?? ''
  const cuisine = params.get('cuisine') ?? 'All'
  const filter = (key: string, value: string) => setParams(current => {
    const updated = new URLSearchParams(current)
    if (value) updated.set(key, value); else updated.delete(key)
    return updated
  }, { replace: true })
  const showOpen = params.has('open')
  const showSaved = params.has('saved')
  const recommended = home && !query.trim() && cuisine === 'All' && !showOpen && !showSaved
  const results = restaurants.filter(restaurant => !hiddenRestaurants.includes(restaurant.id) && (cuisine === 'All' || restaurant.cuisine === cuisine)
    && (!showOpen || isOpen(restaurant)) && (!showSaved || favorites.includes(restaurant.id))
    && [restaurant.name, restaurant.description, ...restaurant.items.map(item => item.name)].some(name => name.toLowerCase().includes(query.trim().toLowerCase())))
  const visibleRestaurants = recommended ? results.slice(0, 5) : results
  return <div className="discovery">
    {!home && <div className="discovery-head"><div><h1>Explore restaurants</h1><p>Browse menus and find something you’ll love.</p></div>
      <div className="search-row"><label className="search"><LuSearch /><Input aria-label="Search restaurants or dishes" value={query} onChange={event => filter('q', event.target.value)} placeholder="Search restaurants or dishes" /></label><Button variant="outline" size="icon" aria-label="Toggle Open now filter" aria-pressed={showOpen} className={showOpen ? 'selected' : ''} onClick={() => filter('open', showOpen ? '' : '1')}><LuSlidersHorizontal /></Button></div>
    </div>}
    <section className="categories" aria-label="Cuisine categories">{cuisines.map(item => <button key={item.name} className={item.name === cuisine ? 'selected' : ''} aria-pressed={item.name === cuisine} onClick={() => filter('cuisine', item.name === 'All' ? '' : item.name)}><span><img src={media(item.image)} alt="" width={58} height={58} /></span>{item.name}</button>)}</section>
    <section aria-labelledby="restaurants-title">
      <div className={recommended ? "section-heading recommended-heading" : "section-heading"}><div><h2 id="restaurants-title">{recommended ? 'Recommended' : 'Restaurants'}</h2>{!recommended && <p>{results.length} Denver {results.length === 1 ? 'restaurant' : 'restaurants'}</p>}</div>
        {recommended ? <Button asChild variant="outline"><Link to="/explore">See all</Link></Button> : <div className="filters"><Button variant="outline" aria-pressed={showOpen} className={showOpen ? 'selected' : ''} onClick={() => filter('open', showOpen ? '' : '1')}>Open now</Button><Button variant="outline" aria-pressed={showSaved} className={showSaved ? 'selected' : ''} onClick={() => filter('saved', showSaved ? '' : '1')}><LuHeart /> Saved</Button></div>}</div>
      {visibleRestaurants.length ? <div className={recommended ? "restaurant-grid recommended-grid" : "restaurant-grid"} tabIndex={recommended ? 0 : undefined} role={recommended ? "region" : undefined} aria-label={recommended ? "Scroll recommended restaurants" : undefined}>{visibleRestaurants.map(restaurant => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}</div> : <div className="empty"><LuSearch /><h3>No restaurants found</h3><Button variant="outline" onClick={() => setParams({})}>Clear filters</Button></div>}
    </section>
    {recommended && <section aria-labelledby="all-restaurants-title">
      <div className="section-heading"><div><h2 id="all-restaurants-title">All restaurants</h2><p>Sample ratings, distances and offers</p></div>
        <Button variant="outline" className="photo-playback" onClick={() => setPlaying(value => !value)}>{playing ? 'Pause restaurant photos' : 'Play restaurant photos'}</Button>
      </div>
      <div className="all-restaurant-list">{results.map(restaurant => <RestaurantCard key={restaurant.id} restaurant={restaurant} detailed playing={playing} />)}</div>
    </section>}
  </div>
}