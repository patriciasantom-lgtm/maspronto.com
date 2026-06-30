import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bubblegum+Sans&family=Caveat&family=DM+Sans:opsz,wght@9..40,400;9..40,700&family=Fredoka+One&family=Fraunces:ital,wght@1,800&family=Lilita+One&family=Nunito:wght@900&family=Pacifico&family=Righteous&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
