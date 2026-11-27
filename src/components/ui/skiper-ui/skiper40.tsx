// Adapted from Skiper UI’s Skiper40 Link000 (https://www.skiper-ui.com/).
import { Link } from 'react-router-dom'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function AnimatedLink({ className, ...props }: ComponentProps<typeof Link>) {
  return <Link {...props} className={cn(
    'relative inline-flex items-center',
    'before:pointer-events-none before:absolute before:bottom-1 before:left-4 before:right-4 before:h-px before:bg-current before:content-[\'\']',
    'before:origin-right before:scale-x-0 before:transition-transform before:duration-300 hover:before:origin-left hover:before:scale-x-100 focus-visible:before:scale-x-100 motion-reduce:before:transition-none',
    className,
  )} />
}