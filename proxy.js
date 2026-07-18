import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { REGIONS } from './lib/pricing'

function countryToRegion(countryCode) {
  if (!countryCode) return null
  const c = countryCode.toUpperCase()
  for (const [key, { allowedCountries }] of Object.entries(REGIONS)) {
    if (allowedCountries.includes(c)) return key
  }
  // European-adjacent countries default to EU pricing
  const extraEuropean = [
    'NO', 'CH', 'IS', 'LI', 'MK', 'RS', 'AL', 'BA', 'ME',
    'MD', 'UA', 'BY', 'GE', 'AM', 'AZ', 'TR', 'XK',
  ]
  if (extraEuropean.includes(c)) return 'EU'
  return null
}

const intlMiddleware = createMiddleware(routing)

export default function middleware(request) {
  const response = intlMiddleware(request)

  // Set geo-region cookie once per visitor (30 days)
  // Only when the user has no existing cookie — respects manual selection via localStorage
  const existingGeo = request.cookies.get('pronto-geo-region')
  if (!existingGeo) {
    const country = request.headers.get('x-vercel-ip-country')
    const region = countryToRegion(country)
    if (region) {
      response.cookies.set('pronto-geo-region', region, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
        sameSite: 'lax',
        httpOnly: false, // must be readable by client JS
      })
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|render|admin|.*\\..*).*)'],
}
