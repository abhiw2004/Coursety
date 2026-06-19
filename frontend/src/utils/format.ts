export function formatPrice(price: number): string {
  if (price <= 0) return 'Free'
  return `₹${price.toLocaleString('en-IN')}`
}

export function formatDuration(minutes: number): string {
  if (!minutes) return ''
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h}h ${m}m` : `${h}h`
}
