import { useState, type FormEvent } from 'react'
import { LuMapPin } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet } from '@/components/ui/sheet'
import { isDemoAddress, useDelivery, type Address } from '@/features/cart/store'
const emptyAddress: Address = { street: '', unit: '', zip: '', instructions: '' }
const demoAddress: Address = { street: '2525 Washington St', unit: 'Apt 4B', zip: '80205', instructions: 'Leave at the front door' }

function AddressForm({ onSave }: { onSave: () => void }) {
  const { address, savedAddresses, saveAddress } = useDelivery()
  const [value, setValue] = useState(address ?? emptyAddress)
  const [error, setError] = useState('')
  const quickAddresses = savedAddresses.length ? savedAddresses.slice(0, 4) : [demoAddress]
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isDemoAddress(value)) { setError('Enter a street address and a Denver-area ZIP starting with 802 for demo delivery.'); return }
    saveAddress({ street: value.street.trim(), unit: value.unit.trim(), zip: value.zip.trim(), instructions: value.instructions.trim() })
    onSave()
  }
  const update = (key: keyof Address, next: string) => setValue(current => ({ ...current, [key]: next }))
  return <form className="form-stack" onSubmit={submit}>
    {quickAddresses.map(saved => <Button variant="outline" type="button" key={JSON.stringify(saved)} onClick={() => { setValue(saved); setError('') }}><LuMapPin /> {saved.street}{saved.unit && ', ' + saved.unit}</Button>)}
    <label>Street address<Input autoComplete="address-line1" required value={value.street} onChange={e => update('street', e.target.value)} placeholder="2525 Washington St" /></label>
    <div className="form-pair">
      <label>Apartment / suite<Input autoComplete="address-line2" value={value.unit} onChange={e => update('unit', e.target.value)} /></label>
      <label>ZIP code<Input autoComplete="postal-code" inputMode="numeric" maxLength={5} required value={value.zip} onChange={e => update('zip', e.target.value)} placeholder="80205" /></label>
    </div>
    <label>Delivery instructions<textarea value={value.instructions} onChange={e => update('instructions', e.target.value)} placeholder="E.g. leave at the front door" maxLength={240} /></label>
    {error && <p className="error-text" role="alert">{error}</p>}
    <Button type="submit">Save delivery address</Button>
  </form>
}
export function AddressSheet({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  return <Sheet height="full" open={open} onOpenChange={setOpen} title="Delivery address" description="Choose where your food should arrive.">{open && <AddressForm onSave={() => setOpen(false)} />}</Sheet>
}