import { useRef, useState } from 'react'
import { Link, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import { LuBanknote, LuChevronLeft, LuCreditCard, LuMail, LuMapPin, LuMinus, LuPlus, LuShoppingBag, LuSmartphone, LuTrash2 } from 'react-icons/lu'
import { motion, useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { media, money, restaurants } from '@/features/catalog/catalog'
import { isDemoAddress, totals, useDelivery } from '@/features/cart/store'
const steps = ['Delivery', 'Payment', 'Review'] as const
const paymentMethods = [
  { id: 'visa', label: 'Demo Visa •••• 4242', detail: 'Credit card · No real charge', Icon: LuCreditCard },
  { id: 'mastercard', label: 'Demo Mastercard •••• 8819', detail: 'Debit card · No real charge', Icon: LuCreditCard },
  { id: 'upi', label: 'UPI (GPay / PhonePe)', detail: 'Instant UPI transfer · Demo', Icon: LuSmartphone },
  { id: 'cod', label: 'Cash on Delivery', detail: 'Pay when your order arrives', Icon: LuBanknote },
] as const

function Summary({ values }: { values: ReturnType<typeof totals> }) {
  return <dl className="summary">{Object.entries(values).map(([key, amount]) => <div key={key} className={key === 'total' ? 'total' : ''}><dt>{key === 'fee' ? 'Delivery fee' : key.charAt(0).toUpperCase() + key.slice(1)}</dt><dd>{money(amount)}</dd></div>)}</dl>
}
export function Cart({ checkout = false }: { checkout?: boolean }) {
  const { cart, address, setQuantity, submitOrder } = useDelivery()
  const { openAddress } = useOutletContext<{ openAddress: () => void }>()
  const [tip, setTip] = useState(0)
  const [email, setEmail] = useState('')
  const [payment, setPayment] = useState('')
  const [direction, setDirection] = useState(1)
  const [params, setParams] = useSearchParams()
  const reduce = useReducedMotion()
  const submitting = useRef(false)
  const navigate = useNavigate()
  const addressReady = !!address && isDemoAddress(address)
  const emailReady = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const requested = steps.findIndex(step => step.toLowerCase() === params.get('step'))
  const index = Math.min(Math.max(0, requested), !addressReady || !emailReady ? 0 : !payment ? 1 : 2)
  const step = steps[index]
  const values = totals(cart, checkout ? tip : 0)
  const go = (next: number) => {
    setDirection(next > index ? 1 : -1)
    setParams({ step: steps[next].toLowerCase() }, { replace: true })
    document.querySelector('.phone-scroll')?.scrollTo(0, 0)
    window.scrollTo(0, 0)
  }
  const screenBar = (heading: string) => <header className="screen-bar">
    <Button variant="ghost" size="icon" aria-label="Go back" onClick={() => window.history.state?.idx > 0 ? navigate(-1) : navigate('/explore')}><LuChevronLeft /></Button>
    <h1>{heading}</h1>
    <span className="screen-bar-spacer" aria-hidden="true" />
  </header>
  if (!cart.length) return <div className="detail cart-screen">{screenBar('Your cart')}<div className="empty"><LuShoppingBag /><h2>Your cart is empty</h2><p>Find something good from a Denver kitchen.</p><Button asChild><Link to="/explore">Browse restaurants</Link></Button></div></div>
  const firstRestaurant = restaurants.find(r => r.name === cart[0].restaurant)
  const items = <div className="list">{cart.map(item => {
    const restaurant = restaurants.find(r => r.name === item.restaurant)
    return <div className="list-row cart-row" key={item.id}>
      <img className="cart-thumb" src={media(restaurant?.image ?? 'hero')} alt="" />
      <div className="cart-item-body">
        <div className="cart-item-top">
          <strong>{item.name}</strong>
          <strong>{money(item.amount * item.quantity)}</strong>
        </div>
        <small>{item.restaurant} · {item.option}{item.notes ? ' · ' + item.notes : ''}</small>
        {checkout ? <span className="cart-qty-label">Qty {item.quantity}</span> : <div className="quantity">
          <Button variant="outline" size="icon" aria-label={item.quantity === 1 ? 'Remove ' + item.name : 'Decrease ' + item.name} onClick={() => setQuantity(item.id, item.quantity - 1)}>{item.quantity === 1 ? <LuTrash2 /> : <LuMinus />}</Button><span>{item.quantity}</span>
          <Button variant="outline" size="icon" aria-label={'Increase ' + item.name} onClick={() => setQuantity(item.id, item.quantity + 1)}><LuPlus /></Button>
        </div>}
      </div>
    </div>
  })}</div>
  if (!checkout) return <div className="detail cart-screen">
    {screenBar('Your cart')}
    {items}
    <Link className="cart-add-more" to={firstRestaurant ? `/restaurants/${firstRestaurant.id}` : '/explore'}><LuPlus /><span>Add more items</span></Link>
    <Summary values={values} />
    <div className="cart-cta"><Button asChild className="wide"><Link to="/checkout">Continue to checkout · {money(values.total)}</Link></Button></div>
  </div>
  return <motion.form key={step} className="detail checkout-screen" initial={reduce ? false : { opacity: 0, x: direction * 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: reduce ? 0 : 0.26 }} onSubmit={event => {
    event.preventDefault()
    if (index < steps.length - 1) { go(index + 1); return }
    if (!addressReady || !emailReady || !payment || submitting.current) return
    submitting.current = true
    const id = crypto.randomUUID()
    submitOrder(id, tip)
    navigate('/orders/' + id, { replace: true })
  }}>
    {screenBar(step === 'Review' ? 'Review your order' : step)}
    <div className="checkout-progress" aria-label={`Step ${index + 1} of ${steps.length}`}>{steps.map((name, part) => <span key={name} className={part <= index ? 'filled' : ''} />)}</div>
    <p className="eyebrow">CHECKOUT · STEP {index + 1} OF {steps.length}</p>
    {step === 'Delivery' && <>
      <p>Where should we bring your order?</p>
      <div className="list-row checkout-address-card">
        <span className="checkout-icon-badge" aria-hidden="true"><LuMapPin /></span>
        <span>
          <strong>Delivery address</strong>
          <small>{address ? [address.street, address.unit, address.zip].filter(Boolean).join(', ') : 'Add a Denver-area address'}</small>
          {address?.instructions && <small className="checkout-note">“{address.instructions}”</small>}
        </span>
        <Button variant="outline" type="button" onClick={openAddress}>{address ? 'Change' : 'Add address'}</Button>
      </div>
      <div className="checkout-card">
        <div className="checkout-card-head">
          <span className="checkout-icon-badge" aria-hidden="true"><LuMail /></span>
          <div><strong>Contact email</strong><small>We’ll send your receipt and order updates here.</small></div>
        </div>
        <Input aria-label="Email for your order" required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" />
      </div>
      <div className="list-row checkout-mini-summary">
        <span><strong>Order total</strong><small>{cart.reduce((count, item) => count + item.quantity, 0)} {cart.reduce((count, item) => count + item.quantity, 0) === 1 ? 'item' : 'items'} · {firstRestaurant?.minutes ?? '25–40'} min</small></span>
        <strong>{money(values.total)}</strong>
      </div>
    </>}
    {step === 'Payment' && <>
      <div className="checkout-card">
        <fieldset>
          <legend>Tip your courier</legend>
          <div className="tip-grid">{[0, 200, 400, 600].map(amount => <Button type="button" variant="outline" className={amount === tip ? 'selected' : ''} aria-pressed={amount === tip} key={amount} onClick={() => setTip(amount)}>{amount ? money(amount) : 'No tip'}</Button>)}</div>
        </fieldset>
      </div>
      <div className="payment-methods" role="radiogroup" aria-label="Payment method">
        <p className="payment-heading">Choose payment method</p>
        {paymentMethods.map(({ id, label, detail, Icon }) => {
          const selected = payment === label
          return <label className="payment-option" data-selected={selected} key={id}>
            <span className="checkout-icon-badge" aria-hidden="true"><Icon /></span>
            <span className="payment-option-copy"><strong>{label}</strong><small>{detail}</small></span>
            <input type="radio" name="payment" checked={selected} onChange={() => setPayment(label)} />
          </label>
        })}
      </div>
    </>}
    {step === 'Review' && <>{items}<div className="list-row"><span><strong>{address?.street}</strong><small>{email} · {payment}</small></span></div><Summary values={values} /></>}
    <div className="checkout-actions">
      {index ? <Button type="button" variant="outline" onClick={() => go(index - 1)}>Previous</Button> : <Button asChild variant="outline"><Link to="/cart">Previous</Link></Button>}
      <Button type="submit" disabled={(index === 0 && (!addressReady || !emailReady)) || (index === 1 && !payment)}>{index === steps.length - 1 ? 'Place demo order' : 'Next'}</Button>
    </div>
  </motion.form>
}