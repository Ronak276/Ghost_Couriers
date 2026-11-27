import type { ReactNode } from 'react'
export function PhoneFrame({ children }: { children: ReactNode }) {
  return <div className="phone-stage"><div className="phone-frame" id="phone-frame"><div className="phone-scroll">{children}</div></div></div>
}