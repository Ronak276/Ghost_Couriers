# Ghost Couriers

Mobile-first Denver food delivery prototype built with React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Skiper UI, Motion, Embla and React Icons. The photo assets were generated for this project. The barbecue video loop animates generated artwork.

## Develop

Use Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
npm run lint
npm run build
npm run preview
```

Vite prints the local URL. A static host can serve `dist/`; hash routes support direct navigation on a static host.

## Source layout

- `src/app` assembles providers and routes.
- `src/layouts` holds the shared app shell and address sheet.
- `src/pages` holds route screens.
- `src/components` holds reusable UI, navigation and media components.
- `src/features/catalog` contains the Denver restaurant listings, opening hours and sample menus.
- `src/features/cart` owns cart, addresses, preferences and demo orders.
- `src/styles` holds theme tokens, responsive styles and transition timings.
- `public/media` contains bundled images and video.

The carousel action uses an animated link adapted from [Skiper UI](https://www.skiper-ui.com/docs/quick-start).

## Ordering mode

The current app is a local demo. Restaurant names and listed hours come from the Ghost Couriers website. Menu items, prices, ETA, tax, fees, ZIP rules and progression through order statuses are sample data. Device storage retains favorites, addresses, cart and orders. Checkout does not collect card information, send emails, dispatch couriers or make network requests. The notification toggle saves a preference.

A live rollout requires authoritative menus and availability, service-area validation, an order API, payment processing, courier dispatch and order-status events. No environment variables are required to run the demo.

## Prototype handoff

See the Ghost Couriers App Prototype Specification in the docs folder for the customer flow, five checkout screens, role previews and acceptance checks.
