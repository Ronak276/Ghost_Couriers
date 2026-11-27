import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
export type Address = { street: string; unit: string; zip: string; instructions: string }
export type CartItem = { id: string; restaurant: string; name: string; amount: number; quantity: number; option: string; notes: string }
export type Order = { id: string; items: CartItem[]; total: number; address: Address; created: number }
export type PartnerRestaurant = { id: string; name: string; cuisine: string; description: string; image: string; minutes: string; hours: string; items: { name: string; price: number }[] }
export type RestaurantOrderStage = 'new' | 'preparing' | 'ready' | 'completed' | 'rejected'
export type CourierTripStage = 'offered' | 'to_pickup' | 'picked_up' | 'delivered'
export type CourierProfile = { name: string; phone: string; vehicle: 'Bike / Scooter' | 'Bicycle' | 'Car'; plate: string; verified: boolean }
export type PayoutMethod = { id: string; kind: 'bank' | 'upi'; label: string; detail: string }
export type PayoutRecord = { id: string; role: 'restaurant' | 'courier'; amount: number; method: string; created: number; status: 'Settled' | 'Processing' }
type State = {
  address: Address | null; savedAddresses: Address[]; favorites: string[]; hiddenRestaurants: string[]; cart: CartItem[]; orders: Order[]; onboarded: boolean; notifications: boolean
  restaurantOnline: boolean; restaurantOrderStages: Record<string, RestaurantOrderStage>; partnerRestaurants: PartnerRestaurant[]; customDishes: Record<string, { name: string; price: number }[]>; unavailableDishes: string[]
  courierOnline: boolean; courierTripStages: Record<string, CourierTripStage>; courierProfile: CourierProfile
  payoutMethods: PayoutMethod[]; selectedPayoutId: string; payoutHistory: PayoutRecord[]
}
const initialState: State = {
  address: null, savedAddresses: [], favorites: [], hiddenRestaurants: [], cart: [], orders: [], onboarded: false, notifications: false,
  restaurantOnline: true, restaurantOrderStages: {}, partnerRestaurants: [], customDishes: {}, unavailableDishes: [],
  courierOnline: true, courierTripStages: {},
  courierProfile: { name: 'Alex M.', phone: '+1 (720) 555-0194', vehicle: 'Bike / Scooter', plate: 'CO-4829', verified: true },
  payoutMethods: [
    { id: 'bank-1', kind: 'bank', label: 'Chase Business •••• 4821', detail: 'Bank account · Instant transfer' },
    { id: 'upi-1', kind: 'upi', label: 'ghost.partner@okaxis', detail: 'UPI ID · Zero fee' },
  ],
  selectedPayoutId: 'bank-1',
  payoutHistory: [],
}
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
    setRestaurantOnline: (restaurantOnline: boolean) => setState(current => ({ ...current, restaurantOnline })),
    setRestaurantOrderStage: (orderId: string, stage: RestaurantOrderStage) => setState(current => ({
      ...current, restaurantOrderStages: { ...current.restaurantOrderStages, [orderId]: stage },
    })),
    addPartnerRestaurant: (restaurant: Omit<PartnerRestaurant, 'id'>) => setState(current => ({
      ...current, partnerRestaurants: [{ ...restaurant, id: 'partner-' + Date.now() }, ...current.partnerRestaurants],
    })),
    addPartnerDish: (restaurantId: string, dish: { name: string; price: number }) => setState(current => {
      if (restaurantId.startsWith('partner-')) {
        return {
          ...current,
          partnerRestaurants: current.partnerRestaurants.map(r => r.id === restaurantId ? { ...r, items: [...r.items, dish] } : r),
        }
      }
      const existing = current.customDishes[restaurantId] ?? []
      return { ...current, customDishes: { ...current.customDishes, [restaurantId]: [...existing, dish] } }
    }),
    toggleDishAvailable: (restaurantId: string, dishName: string) => setState(current => {
      const key = `${restaurantId}::${dishName}`
      const exists = current.unavailableDishes.includes(key)
      return { ...current, unavailableDishes: exists ? current.unavailableDishes.filter(v => v !== key) : [...current.unavailableDishes, key] }
    }),
    setCourierOnline: (courierOnline: boolean) => setState(current => ({ ...current, courierOnline })),
    setCourierTripStage: (orderId: string, stage: CourierTripStage) => setState(current => ({
      ...current, courierTripStages: { ...current.courierTripStages, [orderId]: stage },
    })),
    updateCourierProfile: (profile: Partial<CourierProfile>) => setState(current => ({
      ...current, courierProfile: { ...current.courierProfile, ...profile },
    })),
    addPayoutMethod: (method: Omit<PayoutMethod, 'id'>) => setState(current => {
      const id = 'payout-' + Date.now()
      return { ...current, payoutMethods: [{ ...method, id }, ...current.payoutMethods], selectedPayoutId: id }
    }),
    selectPayoutMethod: (selectedPayoutId: string) => setState(current => ({ ...current, selectedPayoutId })),
    requestPayout: (role: 'restaurant' | 'courier', amount: number) => setState(current => {
      if (amount <= 0) return current
      const method = current.payoutMethods.find(m => m.id === current.selectedPayoutId)?.label ?? 'Bank account'
      const record: PayoutRecord = { id: 'pay-' + Date.now(), role, amount, method, created: Date.now(), status: 'Settled' }
      return { ...current, payoutHistory: [record, ...current.payoutHistory] }
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