import { useState, type ReactNode } from 'react'
import { LuBookmarkPlus, LuCheck, LuEyeOff, LuInfo, LuMessageSquareWarning, LuShare2 } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { type Restaurant } from '@/features/catalog/catalog'
import { useDelivery } from '@/features/cart/store'

function Action({ icon, title, description, onClick }: { icon: ReactNode; title: string; description: string; onClick: () => void }) {
  return <button type="button" className="restaurant-option" onClick={onClick}>
    <span className="restaurant-option-icon" aria-hidden="true">{icon}</span><span><strong>{title}</strong><small>{description}</small></span>
  </button>
}

export function RestaurantOptions({ restaurant, open, onOpenChange }: {
  restaurant: Restaurant; open: boolean; onOpenChange: (open: boolean) => void
}) {
  const [view, setView] = useState<'actions' | 'about' | 'share' | 'hide' | 'report' | 'reported'>('actions')
  const [copyStatus, setCopyStatus] = useState('')
  const { favorites, toggleFavorite, setRestaurantHidden } = useDelivery()
  const navigate = useNavigate()
  const saved = favorites.includes(restaurant.id)
  const link = new URL(`#/restaurants/${restaurant.id}`, window.location.href).href

  function changeOpen(next: boolean) {
    if (!next) { setView('actions'); setCopyStatus('') }
    onOpenChange(next)
  }

  return <Sheet open={open} onOpenChange={changeOpen} height="tall" title={restaurant.name} description="Manage this restaurant and your collection.">
    {view === 'actions' && <div className="restaurant-option-list">
      <Action icon={saved ? <LuCheck /> : <LuBookmarkPlus />} title={saved ? 'Remove from collection' : 'Add to collection'}
        description={saved ? 'Saved in Favorite restaurants' : 'Save this restaurant to your favorites'} onClick={() => toggleFavorite(restaurant.id)} />
      <Action icon={<LuInfo />} title="More about this restaurant" description="View the cuisine and opening hours" onClick={() => setView('about')} />
      <Action icon={<LuShare2 />} title="Share this restaurant" description="Copy a link to the restaurant menu" onClick={() => setView('share')} />
      <Action icon={<LuEyeOff />} title="Hide this restaurant" description="Remove it from discovery on this device" onClick={() => setView('hide')} />
      <Action icon={<LuMessageSquareWarning />} title="Report fraud or bad practices" description="Describe your concern in the demo report form" onClick={() => setView('report')} />
    </div>}
    {view === 'about' && <div className="form-stack"><h3>About</h3><p>{restaurant.description}</p><p>{restaurant.cuisine} · {restaurant.hours} Denver time</p></div>}
    {view === 'share' && <div className="form-stack">
      <label>Restaurant link<input className="input" readOnly value={link} onFocus={event => event.target.select()} /></label>
      <Button onClick={async () => {
        try { await navigator.clipboard.writeText(link); setCopyStatus('Link copied.') }
        catch { setCopyStatus('Select the link above to copy it.') }
      }}>Copy link</Button>
      <p role="status">{copyStatus}</p>
    </div>}
    {view === 'hide' && <div className="form-stack"><p>You can show this restaurant again from Profile → Hidden restaurants.</p>
      <Button onClick={() => { setRestaurantHidden(restaurant.id, true); changeOpen(false); navigate('/explore', { replace: true }) }}>Hide restaurant</Button>
    </div>}
    {view === 'report' && <form className="form-stack" onSubmit={event => { event.preventDefault(); setView('reported') }}>
      <label>Describe your concern<textarea required maxLength={500} placeholder="What happened?" /></label>
      <p>This demo form does not send reports.</p><Button type="submit">Submit demo report</Button>
    </form>}
    {view === 'reported' && <p role="status">Demo report complete.</p>}
    {view !== 'actions' && <Button className="restaurant-options-back" variant="outline" onClick={() => setView('actions')}>Back to options</Button>}
  </Sheet>
}