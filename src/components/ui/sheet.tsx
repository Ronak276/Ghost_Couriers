import * as Dialog from '@radix-ui/react-dialog'
import { LuX } from 'react-icons/lu'
import type { ReactNode } from 'react'
import { Button } from './button'
export function Sheet({ open, onOpenChange, title, description, children, height = 'auto' }: {
  open: boolean; onOpenChange: (open: boolean) => void; title: string; description: string; children: ReactNode; height?: 'auto' | 'full' | 'tall'
}) {
  return <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal container={document.getElementById("phone-frame")}>
      <Dialog.Overlay className="sheet-overlay" />
      <Dialog.Content className={height === 'full' ? 'sheet-content sheet-full-height' : height === 'tall' ? 'sheet-content sheet-tall' : 'sheet-content'}>
        <Dialog.Close asChild><Button className="sheet-close" variant="ghost" size="icon" aria-label="Close"><LuX /></Button></Dialog.Close>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description>{description}</Dialog.Description>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
}