export const FREQUENCIES = [
  { value: 'daily', label: 'Every day', multiplier: 30 },
  { value: 'weekly', label: 'Every week', multiplier: 4.33 },
  { value: 'fortnightly', label: 'Every 2 weeks', multiplier: 2.17 },
  { value: 'monthly', label: 'Once a month', multiplier: 1 },
  { value: 'every2months', label: 'Every 2 months', multiplier: 0.5 },
  { value: 'quarterly', label: 'Every 3 months', multiplier: 0.3333 },
  { value: 'biannually', label: 'Twice a year', multiplier: 0.1667 },
  { value: 'yearly', label: 'Once a year', multiplier: 0.0833 },
  { value: 'custom', label: 'Custom interval', multiplier: null },
  { value: 'oneTime', label: 'One-time purchase', multiplier: 0 },
]

export function getMonthlyCost(price, frequency) {
  if (!price || !frequency) return 0
  const { type, interval, unit } = frequency

  if (type === 'oneTime') return 0
  if (type === 'custom') {
    if (!interval || !unit) return 0
    let days = interval
    if (unit === 'weeks') days = interval * 7
    if (unit === 'months') days = interval * 30
    return (price / days) * 30
  }

  const freq = FREQUENCIES.find(f => f.value === type)
  if (!freq || freq.multiplier === null) return 0
  return price * freq.multiplier
}

export function getFrequencyLabel(frequency) {
  if (!frequency) return ''
  const { type, interval, unit } = frequency
  if (type === 'custom') return `Every ${interval} ${unit}`
  const freq = FREQUENCIES.find(f => f.value === type)
  return freq ? freq.label : ''
}

export const CURRENCIES = [
  { code: 'PKR', symbol: 'PKR', locale: 'en-PK', decimals: 0 },
  { code: 'USD', symbol: '$', locale: 'en-US', decimals: 2 },
  { code: 'EUR', symbol: '€', locale: 'de-DE', decimals: 2 },
  { code: 'GBP', symbol: '£', locale: 'en-GB', decimals: 2 },
  { code: 'AED', symbol: 'AED', locale: 'ar-AE', decimals: 2 },
  { code: 'SAR', symbol: 'SAR', locale: 'ar-SA', decimals: 2 },
]

export function formatCurrency(amount, currencyCode) {
  const cur = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0]
  if (cur.decimals === 0) {
    return `${cur.symbol} ${Math.round(amount).toLocaleString()}`
  }
  return `${cur.symbol}${amount.toFixed(cur.decimals)}`
}
