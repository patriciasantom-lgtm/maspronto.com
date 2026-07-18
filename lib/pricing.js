export const REGIONS = {
  AU: {
    label: 'Australia',
    symbol: 'A$',
    currency: 'aud',
    digitalPrice: 990,
    kitProductPrice: 4990,
    kitShippingPrice: 0,
    kitTotalPrice: 4990,
    allowedCountries: ['AU'],
  },
  US: {
    label: 'United States',
    symbol: '$',
    currency: 'usd',
    digitalPrice: 990,
    kitProductPrice: 3000,
    kitShippingPrice: 900,
    kitTotalPrice: 3900,
    allowedCountries: ['US'],
  },
  CA: {
    label: 'Canada',
    symbol: 'CA$',
    currency: 'cad',
    digitalPrice: 1390,
    kitProductPrice: 4100,
    kitShippingPrice: 1300,
    kitTotalPrice: 5400,
    allowedCountries: ['CA'],
  },
  GB: {
    label: 'United Kingdom',
    symbol: '£',
    currency: 'gbp',
    digitalPrice: 990,
    kitProductPrice: 2300,
    kitShippingPrice: 700,
    kitTotalPrice: 3000,
    allowedCountries: ['GB'],
  },
  EU: {
    label: 'European Union',
    symbol: '€',
    currency: 'eur',
    digitalPrice: 990,
    kitProductPrice: 2700,
    kitShippingPrice: 800,
    kitTotalPrice: 3500,
    allowedCountries: [
      'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
      'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
      'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
    ],
  },
}

export const DEFAULT_REGION = 'AU'
export const REGION_ORDER = ['AU', 'US', 'CA', 'GB', 'EU']

export function fmt(cents, symbol) {
  return `${symbol}${(cents / 100).toFixed(2)}`
}
