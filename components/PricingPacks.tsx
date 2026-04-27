'use client'
import { useState } from 'react'

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

const CHECKOUT_URLS: Record<number, string> = {
  5: 'https://lessonscriptor.lemonsqueezy.com/buy/YOUR_5H_PRODUCT_ID',
  12: 'https://lessonscriptor.lemonsqueezy.com/buy/YOUR_15H_PRODUCT_ID',
  21: 'https://lessonscriptor.lemonsqueezy.com/buy/YOUR_30H_PRODUCT_ID',
}

function formatPrice(symbol: string, amount: number, forceDecimals?: number): string {
  const d = forceDecimals !== undefined ? forceDecimals : (amount >= 100 ? 0 : 2)
  const rounded = d > 0 ? amount.toFixed(d) : Math.round(amount).toString()
  return `${symbol}${rounded}`
}

export default function PricingPacks({ packs, currencyDisclaimer, paymentProcessor }: Props) {
  const [currency, setCurrency] = useState('USD')
  const { symbol, rate, decimals } = CURRENCIES[currency]

  return (
    <div>
      <div className="flex justify-end mb-3">
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="bg-white/[0.06] border border-accent-400/25 rounded-lg py-2 px-3 pr-8 text-[13px] text-accent-400 font-semibold cursor-pointer outline-none focus:border-accent-400/50 transition-colors appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23fbbf24' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
        >
          {Object.entries(CURRENCIES).map(([code, { symbol: s, label }]) => (
            <option key={code} value={code} className="bg-[#1a1714] text-cream-50">
              {s} {code} — {label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {packs.map((pack, i) => (
          <a
            key={i}
            href={CHECKOUT_URLS[pack.basePrice] || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`bg-white/[0.04] border rounded-2xl p-4 text-center relative hover:border-accent-400/30 transition-colors block no-underline ${
              pack.badge ? 'border-accent-600' : 'border-white/[0.08]'
            }`}
          >
            {pack.badge && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-accent-600 text-white text-[9px] font-extrabold tracking-wider uppercase py-0.5 px-2 rounded-full whitespace-nowrap">
                {pack.badge}
              </span>
            )}
            <div className="text-xl font-bold text-cream-50 font-serif leading-none tracking-tight">
              {pack.hours}
            </div>
            <div className="text-[10px] text-cream-50/40 my-1 leading-snug">
              {formatPrice(symbol, pack.basePer * rate, decimals !== undefined ? decimals : 2)} / hour
            </div>
            <div className="text-[22px] font-bold text-accent-400 tracking-tight">
              {formatPrice(symbol, pack.basePrice * rate, decimals !== undefined ? decimals : 0)}
            </div>
            {pack.save && (
              <div className="text-[10px] font-extrabold text-accent-400 tracking-wide uppercase mt-1">
                save {formatPrice(symbol, pack.save * rate, decimals !== undefined ? decimals : 0)}
              </div>
            )}
            <div className="text-[10px] text-cream-50/35 mt-[3px]">{pack.per}</div>
          </a>
        ))}
      </div>

      {currency !== 'USD' && (
        <p className="text-[10px] text-cream-50/40 text-center mb-2 leading-snug">
          {currencyDisclaimer}
        </p>
      )}
      <p className="text-[10px] text-cream-50/30 text-center leading-snug">
        {paymentProcessor}
      </p>
    </div>
  )
}
