import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useDelivery } from '@/features/cart/store'
import { CourierWorkspace } from './CourierWorkspace'
import { RestaurantWorkspace } from './RestaurantWorkspace'

const previews = {
  operations: { title: 'Operations workspace', actions: ['Confirm order', 'Assign demo courier', 'Close delivery'] },
}
export function RolePreview() {
  const { role = '' } = useParams()
  const { orders } = useDelivery()
  const [progress, setProgress] = useState(0)
  if (role === 'restaurant') return <RestaurantWorkspace />
  if (role === 'courier') return <CourierWorkspace />
  const preview = Object.hasOwn(previews, role) ? previews[role as keyof typeof previews] : undefined
  const order = orders[0]
  if (!preview) return <div className="detail"><h1>Preview unavailable</h1><Button asChild><Link to="/profile">Back to profile</Link></Button></div>
  return <section className="detail">
    <p className="eyebrow">ROLE PREVIEW</p>
    <h1>{preview.title}</h1>
    <p>Use the controls to try this role’s workflow with a demo order.</p>
    <div className="list-row"><span><strong>{order ? 'Order #' + order.id.slice(0, 8).toUpperCase() : 'Sample order #GC1042'}</strong><small>{order ? order.items.map(item => item.name).join(', ') : 'Bourbon Chicken Bowl × 1'}</small></span></div>
    <ol className="timeline">{preview.actions.map((action, index) => <li key={action} className={index < progress ? 'complete' : ''} aria-current={index === progress ? 'step' : undefined}><span>{index < progress ? '✓' : index + 1}</span>{action}</li>)}</ol>
    {progress < preview.actions.length ? <Button onClick={() => setProgress(value => value + 1)}>{preview.actions[progress]}</Button> : <><p role="status">Demo workflow complete.</p><Button variant="outline" onClick={() => setProgress(0)}>Reset preview</Button></>}
    <Button asChild variant="outline"><Link to="/profile">Back to profile</Link></Button>
  </section>
}