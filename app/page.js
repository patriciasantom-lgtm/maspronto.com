import { redirect } from 'next/navigation'
// Root path is handled by proxy.js (next-intl middleware) which redirects to /es or /en.
// This is a safety fallback.
export default function RootPage() {
  redirect('/es')
}
