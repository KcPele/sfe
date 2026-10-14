import type { Currency } from '@/types/api'
import { cx } from '@/lib/cx'
import { formatMoney } from '@/lib/format'
import styles from './Money.module.css'

export interface MoneyProps {
  /** Minor units. */
  amount: number
  currency: Currency
  /** Prefix with + or −. */
  sign?: 'credit' | 'debit'
  className?: string
}

export function Money({ amount, currency, sign, className }: MoneyProps) {
  const value = sign === 'debit' ? -Math.abs(amount) : sign === 'credit' ? Math.abs(amount) : amount
  const text = formatMoney(value, currency, { signDisplay: sign ? 'always' : 'auto' })
  // Typographic minus (U+2212), matching the design.
  return <span className={cx(styles.money, className)}>{text.replace('-', '−')}</span>
}
