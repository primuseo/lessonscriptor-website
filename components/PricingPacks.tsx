'use client'
import { useState } from 'react'
import { CursorArrowRaysIcon } from '@heroicons/react/24/outline'

function StripeMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M15.5 9.3c0-1.1-.95-1.7-2.4-1.7-1.6 0-2.9.7-2.9 2 0 2.7 5.1 1.9 5.1 5.3 0 1.6-1.5 2.5-3.4 2.5-1.55 0-2.9-.55-3.4-1.05"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

interface Pack {
  hours: string
  basePrice: number
  basePer: number
  per: string
  badge?: string
  save?: number
}

interface Props {
  packs: Pack[]
  currencyDisclaimer: string
  paymentProcessor: string
  paymentLinkUrls: string[]
  locale: string
}

const CURRENCIES: Record<string, { symbol: string; rate: number; decimals?: number; label: string }> = {
  USD: { symbol: '$', rate: 1, label: 'US Dollar' },
  EUR: { symbol: '€', rate: 0.92, label: 'Euro' },
  GBP: { symbol: '£', rate: 0.79, label: 'British Pound' },
  BRL: { symbol: 'R$', rate: 5.10, decimals: 0, label: 'Brazilian Real' },
  INR: { symbol: '₹', rate: 83.50, decimals: 0, label: 'Indian Rupee' },
  MXN: { symbol: 'MX$', rate: 17.00, decimals: 0, label: 'Mexican Peso' },
  JPY: { symbol: '¥', rate: 150, decimals: 0, label: 'Japanese Yen' },
  AUD: { symbol: 'A$', rate: 1.55, label: 'Australian Dollar' },
  CAD: { symbol: 'C$', rate: 1.37, label: 'Canadian Dollar' },
  TRY: { symbol: '₺', rate: 34.00, decimals: 0, label: 'Turkish Lira' },
}

function formatPrice(symbol: string, amount: number, forceDecimals?: number): string {
  const d = forceDecimals !== undefined ? forceDecimals : (amount >= 100 ? 0 : 2)
  const rounded = d > 0 ? amount.toFixed(d) : Math.round(amount).toString()
  return `${symbol}${rounded}`
}

export default function PricingPacks({ packs, currencyDisclaimer, paymentProcessor, paymentLinkUrls, locale }: Props) {
  const [currency, setCurrency] = useState('USD')
  const { symbol, rate, decimals } = CURRENCIES[currency]

  return (
    <div>
      <div className="flex justify-end mb-3">
        {/* Always on the dark premium card, so always the dark-surface-safe gold -
            text-accent resolves too dark against this card in light mode. */}
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="bg-white/[0.06] border border-[#D4A017]/25 rounded-lg py-2 px-3 pr-8 text-sm text-[#D4A017] font-semibold cursor-pointer outline-none focus:border-[#D4A017]/50 transition-colors appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23D4A017' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
        >
          {Object.entries(CURRENCIES).map(([code, { symbol: s, label }]) => (
            <option key={code} value={code} className="bg-primary text-primary-foreground">
              {s} {code} — {label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 mb-4">
        {packs.map((pack, i) => (
          <a
            key={i}
            href={`${paymentLinkUrls[i]}?client_reference_id=${encodeURIComponent(locale)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`group bg-white/[0.04] border rounded-2xl p-6 text-center relative transition-all block no-underline hover:bg-white/[0.07] hover:-translate-y-0.5 ${
              pack.badge ? 'border-accent hover:border-accent' : 'border-white/[0.08] hover:border-accent/40'
            }`}
          >
            {pack.badge && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-[10px] font-extrabold tracking-wider uppercase py-1 px-2.5 rounded-full whitespace-nowrap">
                {pack.badge}
              </span>
            )}
            <div className="text-2xl font-semibold text-primary-foreground font-serif leading-none tracking-tight">
              {pack.hours}
            </div>
            <div className="text-xs text-primary-foreground/40 my-1.5 leading-snug tabular-nums">
              {formatPrice(symbol, pack.basePer * rate, decimals !== undefined ? decimals : 2)} / hour
            </div>
            {/* This price always sits on the dark premium card (bg-primary), so it
                always needs the dark-surface-safe gold regardless of site theme -
                text-accent resolves too dark against this card in light mode. */}
            <div className="text-[28px] font-bold text-[#D4A017] tracking-tight tabular-nums">
              {formatPrice(symbol, pack.basePrice * rate, decimals !== undefined ? decimals : 0)}
            </div>
            {pack.save && (
              // This label always sits on the dark premium card (bg-primary), so it
              // always needs the dark-surface-safe gold regardless of site theme.
              <div className="text-[11px] font-extrabold text-[#D4A017] tracking-wide uppercase mt-1">
                save {formatPrice(symbol, pack.save * rate, decimals !== undefined ? decimals : 0)}
              </div>
            )}
            <div className="text-[11px] text-primary-foreground/35 mt-1 mb-4">{pack.per}</div>
            <div className="flex items-center justify-center gap-1.5 pt-3 border-t border-white/[0.08] text-xs font-bold text-primary-foreground/60 group-hover:text-[#D4A017] transition-colors whitespace-nowrap">
              <CursorArrowRaysIcon className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
              Buy now
              <StripeMark className="w-[18px] h-[18px] ml-0.5 flex-shrink-0" />
            </div>
          </a>
        ))}
      </div>

      {currency !== 'USD' && (
        <p className="text-[11px] text-primary-foreground/40 text-center mb-2 leading-snug">
          {currencyDisclaimer}
        </p>
      )}
      <p className="text-[11px] text-primary-foreground/30 text-center leading-snug">
        {paymentProcessor}
      </p>
    </div>
  )
}
