export const cuisines = [
  { name: 'All', image: 'hero' }, { name: 'Pizza', image: 'pizza' }, { name: 'Burgers', image: 'burger' },
  { name: 'Bowls', image: 'poke' }, { name: 'BBQ', image: 'bbq' }, { name: 'Brunch', image: 'brunch' },
  { name: 'Indian', image: 'curry' }, { name: 'Sandwiches', image: 'sandwich' },
]
export type Restaurant = { id: string; name: string; cuisine: string; description: string; image: string; minutes: string; hours: string; days: number[]; opens: number; closes: number; items: { name: string; price: number }[] }
const everyDay = [0, 1, 2, 3, 4, 5, 6]
type Listing = [string, string, string, string, string, string, number[], number, number, [string, number][]]
// Restaurant names, order and hours follow https://www.ghostcouriers.com/.
// Menu items, prices, artwork and delivery estimates are demo data.
const listings: Listing[] = [
  ['watercourse','Watercourse Foods','Brunch','Plant-based brunch and comfort food','brunch','25–40',[0,2,3,4,5,6],11,20,[['Avocado Toast',1295],['Breakfast Bowl',1495]]],
  ['city','City, O’ City','Burgers','Vegetarian pizza, comfort food and cocktails','burger','25–40',everyDay,9,22,[['Veggie Burger',1595],['House Pizza',1795]]],
  ['bourbon','Bourbon Grill','Bowls','Flame-grilled chicken & Cajun bowls','chicken','20–35',everyDay,12,21,[['Bourbon Chicken Bowl',1395],['Cajun Rice Bowl',1195]]],
  ['poke','Poke Club','Bowls','Hawaiian-style poke & rice bowls','poke','20–35',[1,2,3,4,5,6],11,21,[['Salmon Poke Bowl',1595],['Tofu Poke Bowl',1395]]],
  ['pit','Pit Fiend Barbecue','BBQ','Texas-style smoked barbecue','bbq','30–45',everyDay,12,20,[['Smoked Brisket Plate',2195],['Pulled Pork Sandwich',1495]]],
  ['sub','Sub Culture','Sandwiches','Stacked gourmet subs & sandwiches','sandwich','20–35',everyDay,11,15,[['Italian Sub',1395],['Veggie Sub',1195]]],
  ['stowaway','Stowaway Kitchen','Brunch','Globally inspired brunch & coffee','brunch','25–40',[0,1,4,5,6],8,14,[['Breakfast Toast',1495],['Coffee',495]]],
  ['mint','Mint Indian Restaurant','Indian','Classic curries, tandoori & naan','curry','30–45',everyDay,11,21.5,[['Chicken Tikka Masala',1695],['Garlic Naan',395]]],
  ['corner','The Corner Beet','Bowls','Plant-based café with fresh juices and smoothie bowls','poke','20–35',everyDay,8,15,[['Green Bowl',1395],['Fresh Juice',695]]],
  ['brooklyn','Brooklyn’s Finest Pizza','Pizza','New York-style pizza by the slice','pizza','25–40',everyDay,15,21,[['Pepperoni Pizza',1895],['Margherita Pizza',1695]]],
  ['jelly','Jelly','Brunch','Scratch-made breakfast & brunch','brunch','25–40',everyDay,7,14,[['Eggs & Toast',1395],['Breakfast Potatoes',595]]],
  ['izzio','Izzio Bakery & Café','Sandwiches','Artisan breads & café sandwiches','sandwich','20–35',everyDay,8,21,[['Café Sandwich',1295],['Butter Croissant',495]]],
]
const specialHours: Record<string, string> = {
  brooklyn: 'Mon–Thu 3–9 PM · Fri 3–11 PM · Sat 10 AM–11 PM · Sun 10 AM–9 PM',
  poke: 'Mon–Fri 11 AM–9 PM · Sat noon–9 PM',
  sub: 'Mon–Thu 11 AM–3 PM · Fri–Sun 11 AM–6 PM',
  jelly: 'Mon–Fri 7 AM–2 PM · Sat–Sun 7 AM–3 PM',
}
const time = (hour: number) => (Math.floor(hour) % 12 || 12) + (hour % 1 ? ':30' : '') + (hour >= 12 ? ' PM' : ' AM')
export const restaurants: Restaurant[] = listings.map(([id,name,cuisine,description,image,minutes,days,opens,closes,items]) => ({
  id,name,cuisine,description,image,minutes,days,opens,closes,
  hours: specialHours[id] ?? ((id === 'watercourse' ? 'Tue–Sun' : id === 'stowaway' ? 'Thu–Mon' : 'Daily') + ' ' + time(opens) + '–' + time(closes)),
  items: items.map(([name,price]) => ({name,price})),
}))
export const media = (name: string) => '/media/' + name + '.jpg'
export const money = (cents: number) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents / 100)
export function isOpen(restaurant: Restaurant, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US',{timeZone:'America/Denver',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now)
  const get = (type: string) => parts.find(part => part.type === type)?.value ?? ''
  const day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(get('weekday'))
  const hour = Number(get('hour')) + Number(get('minute')) / 60
  let { opens, closes } = restaurant
  if (restaurant.id === 'brooklyn') { if (day === 0 || day === 6) opens = 10; if (day === 5 || day === 6) closes = 23 }
  if (restaurant.id === 'sub' && (day === 0 || day >= 5)) closes = 18
  if (restaurant.id === 'jelly' && (day === 0 || day === 6)) closes = 15
  if (restaurant.id === 'poke' && day === 6) opens = 12
  return restaurant.days.includes(day) && hour >= opens && hour < closes
}