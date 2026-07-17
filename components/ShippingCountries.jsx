import { getTranslations } from 'next-intl/server'

export default async function ShippingCountries() {
  const t = await getTranslations('shipping')

  return (
    <section className="bg-white py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-dm-sans-bold text-sm text-bubblegum uppercase tracking-widest mb-3">
            {t('eyebrow')}
          </p>
          <h2 className="font-fraunces text-4xl sm:text-5xl text-ink italic">
            {t('title')}
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-10">
          {/* World map */}
          <div className="w-full max-w-2xl lg:flex-1">
            <WorldMapSVG />
          </div>

          {/* Country list */}
          <div className="lg:w-64 flex-shrink-0 text-center lg:text-left">
            <p className="font-dm-sans text-base text-ink/70 leading-loose">
              {t('countries')
                .split(' · ')
                .map((country, i, arr) => (
                  <span key={i}>
                    <span className="font-dm-sans-bold text-ink">{country}</span>
                    {i < arr.length - 1 && <span className="text-ink/30"> · </span>}
                  </span>
                ))}
            </p>
            <p className="font-dm-sans text-xs text-ink/40 mt-6 leading-relaxed">
              {t('note')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function WorldMapSVG() {
  const GRAY   = '#D1CBC3'
  const LEMON  = '#F5FF6E'
  const MINT   = '#CAFFB9'
  const STROKE = '#1A1A1A'

  const landStyle   = { fill: GRAY, stroke: STROKE, strokeWidth: 0.5 }
  const lemonStyle  = { fill: LEMON, stroke: STROKE, strokeWidth: 0.8 }
  const mintStyle   = { fill: MINT, stroke: STROKE, strokeWidth: 0.8 }

  return (
    <svg
      viewBox="0 0 1000 480"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto rounded-2xl"
      aria-label="World map showing shipping countries"
    >
      {/* Ocean */}
      <rect width="1000" height="480" fill="#F5F0E8" />

      {/* ── Gray landmasses ── */}

      {/* Greenland */}
      <path {...landStyle} d="M210,48 L308,40 L332,88 L308,116 L220,112 Z" />
      {/* Iceland */}
      <path {...landStyle} d="M344,90 L380,82 L384,106 L358,120 Z" />

      {/* North America (full continent, gray under highlights) */}
      <path {...landStyle} d="M56,102 L292,86 L326,102 L322,196 L294,240 L238,266 L182,280 L126,276 L76,256 L56,220 Z" />
      {/* Mexico + Central America */}
      <path {...landStyle} d="M126,276 L182,280 L228,278 L234,350 L184,375 L140,350 Z" />

      {/* South America */}
      <path {...landStyle} d="M140,350 L234,350 L266,400 L260,466 L196,496 L142,464 L126,408 Z" />

      {/* UK island (gray base) */}
      <path {...landStyle} d="M386,128 L415,118 L425,163 L418,206 L390,208 L380,172 Z" />
      {/* Ireland */}
      <path {...landStyle} d="M368,148 L385,140 L388,170 L374,178 Z" />

      {/* Europe mainland (gray base) */}
      <path {...landStyle} d="M402,144 L554,118 L576,150 L568,234 L544,278 L496,298 L455,302 L416,284 L402,258 L400,198 Z" />

      {/* Africa */}
      <path {...landStyle} d="M408,274 L554,268 L574,352 L548,454 L485,495 L431,473 L405,403 L399,315 Z" />

      {/* Eurasia (Asia east of Europe) */}
      <path {...landStyle} d="M554,102 L966,94 L974,182 L940,274 L880,325 L795,368 L709,374 L646,348 L584,302 L568,234 L554,150 Z" />

      {/* Malay Archipelago */}
      <path {...landStyle} d="M758,300 L838,288 L856,322 L834,348 L758,344 Z" />

      {/* Australia (gray base) */}
      <path {...landStyle} d="M700,342 L864,324 L902,357 L902,436 L850,464 L750,464 L694,433 L684,386 Z" />

      {/* New Zealand */}
      <path {...landStyle} d="M915,432 L935,416 L944,456 L922,470 Z" />

      {/* Japan */}
      <path {...landStyle} d="M912,163 L936,153 L947,192 L936,218 L913,210 Z" />

      {/* ── Highlighted countries (drawn on top) ── */}

      {/* Canada */}
      <path
        {...lemonStyle}
        d="M56,102 L292,86 L326,102 L322,196 L202,206 L126,216 L76,206 L56,178 Z"
      />

      {/* USA (contiguous) */}
      <path
        {...lemonStyle}
        d="M56,178 L76,206 L126,216 L202,206 L322,196 L294,240 L238,266 L182,280 L126,276 L76,256 L56,220 Z"
      />

      {/* UK */}
      <path
        {...mintStyle}
        d="M386,128 L415,118 L425,163 L418,206 L390,208 L380,172 Z"
      />

      {/* European Union mainland */}
      <path
        {...mintStyle}
        d="M402,144 L554,118 L576,150 L568,234 L544,278 L496,298 L455,302 L416,284 L402,258 L400,198 Z"
      />

      {/* Australia */}
      <path
        {...lemonStyle}
        d="M700,342 L864,324 L902,357 L902,436 L850,464 L750,464 L694,433 L684,386 Z"
      />

      {/* ── Legend ── */}
      <g transform="translate(20, 440)">
        <rect x="0" y="0" width="12" height="12" fill={LEMON} stroke={STROKE} strokeWidth="0.8" rx="2" />
        <text x="17" y="10" fontFamily="DM Sans, Arial, sans-serif" fontSize="11" fill="#1A1A1A" opacity="0.7">
          US · CA · AU
        </text>
        <rect x="90" y="0" width="12" height="12" fill={MINT} stroke={STROKE} strokeWidth="0.8" rx="2" />
        <text x="107" y="10" fontFamily="DM Sans, Arial, sans-serif" fontSize="11" fill="#1A1A1A" opacity="0.7">
          UK · EU
        </text>
      </g>
    </svg>
  )
}
