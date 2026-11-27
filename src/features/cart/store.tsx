import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
export type Address = { street: string; unit: string; zip: string; instructions: string }
export type CartItem = { id: string; restaurant: string; name: string; amount: number; quantity: number; option: string; notes: string }
export type Order = { id: string; items: CartItem[]; total: number; address: Address; created: number }
type State = { address: Address | null; savedAddresses: Address[]; favorites: string[]; hiddenRestaurants: string[]; cart: CartItem[]; orders: Order[]; onboarded: boolean; notifications: boolean }
const initialState: State = { address: null, savedAddresses: [], favorites: [], hiddenRestaurants: [], cart: [], orders: [], onboarded: false, notifications: false }
const storageKey = 'ghost-couriers:v1'

function loadState(): State {
  try { return { ...initialState, ...JSON.parse(localStorage.getItem(storageKey) ?? '{}') } }
  catch { return initialState }
}
export function totals(cart: CartItem[], tip = 0) {
  const subtotal = cart.reduce((sum, item) => sum + item.amount * item.quantity, 0)
  const fee = subtotal ? 399 : 0
  const tax = Math.round(subtotal * 0.09)
  return { subtotal, fee, tax, tip, total: subtotal + fee + tax + tip }
}
export function isDemoAddress(address: Address) {
  return address.street.trim().length >= 4 && /^802\d{2}$/.test(address.zip.trim())
}
function mergeItems(cart: CartItem[], items: CartItem[]) {
  const result = new Map(cart.map(item => [item.id, item]))
  for (const item of items) {
    const existing = result.get(item.id)
    result.set(item.id, { ...item, quantity: (existing?.quantity ?? 0) + item.quantity })
  }
  return [...result.values()]
}
function useStore() {
  const [state, setState] = useState(loadState)
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(state)) } catch { /* Session state stays available. */ } }, [state])
  return {
    ...state,
    finishOnboarding: () => setState(current => ({ ...current, onboarded: true })),
    saveAddress: (address: Address) => setState(current => {
      const key = (value: Address) => [value.street, value.unit, value.zip].join('|').toLowerCase()
      return { ...current, address, savedAddresses: [address, ...current.savedAddresses.filter(saved => key(saved) !== key(address))] }
    }),
    toggleFavorite: (id: string) => setState(current => ({
      ...current, favorites: current.favorites.includes(id) ? current.favorites.filter(value => value !== id) : [...current.favorites, id],
    })),
    setRestaurantHidden: (id: string, hidden: boolean) => setState(current => ({
      ...current,
      hiddenRestaurants: hidden
        ? [...new Set([...current.hiddenRestaurants, id])]
        : current.hiddenRestaurants.filter(value => value !== id),
    })),
    setNotifications: (notifications: boolean) => setState(current => ({ ...current, notifications })),
    addItems: (items: CartItem[]) => setState(current => ({ ...current, cart: mergeItems(current.cart, items) })),
    setQuantity: (id: string, quantity: number) => setState(current => ({
      ...current, cart: current.cart.map(item => item.id === id ? { ...item, quantity } : item).filter(item => item.quantity > 0),
    })),
    submitOrder: (id: string, tip: number) => setState(current => {
      if (!current.address || !isDemoAddress(current.address) || !current.cart.length || current.orders.some(order => order.id === id)) return current
      const order = { id, items: current.cart, total: totals(current.cart, tip).total, address: current.address, created: Date.now() }
      return { ...current, orders: [order, ...current.orders], cart: [] }
    }),
  }
}
const StoreContext = createContext<ReturnType<typeof useStore> | null>(null)
export function StoreProvider({ children }: { children: ReactNode }) {
  return <StoreContext.Provider value={useStore()}>{children}</StoreContext.Provider>
}
export function useDelivery() {
  const store = useContext(StoreContext)
  if (!store) throw new Error('Delivery state requires StoreProvider')
  return store
}