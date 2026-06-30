// Pronto logo: "pronto" in Fraunces 800 italic + Bubblegum dot superscript
// variant: 'dark' (Lemon on dark bg) | 'light' (Ink on light bg) | 'outline' (Mint)

const SIZE = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl',
}

export default function Logo({ variant = 'dark', size = 'md', className = '' }) {
  const textColor =
    variant === 'light'   ? 'text-ink' :
    variant === 'outline' ? 'text-mint' :
                            'text-lemon'

  const dotColor =
    variant === 'outline' ? '#A8E6CF' : '#FF6B9D'

  return (
    <span className={`relative inline-flex items-baseline ${className}`}>
      <span className={`font-fraunces ${SIZE[size]} ${textColor} leading-none`}>
        pronto
      </span>
      {/* Bubblegum decorative dot */}
      <span
        aria-hidden="true"
        style={{
          display: 'inline-block',
          width: '0.28em',
          height: '0.28em',
          borderRadius: '50%',
          backgroundColor: dotColor,
          marginLeft: '0.06em',
          marginBottom: '0.55em',
          flexShrink: 0,
        }}
      />
    </span>
  )
}
