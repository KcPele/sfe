import type { TransactionStatus, TransactionType } from '@/types/api'

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  transfer_in: 'Transfer in',
  transfer_out: 'Transfer out',
  conversion: 'Conversion',
  card_payment: 'Card payment',
  bill_payment: 'Bill payment',
}

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  successful: 'Successful',
  pending: 'Pending',
  failed: 'Failed',
}

const CREDIT_TYPES: readonly TransactionType[] = ['deposit', 'transfer_in', 'conversion']

/** Money coming into the wallet. Conversions are recorded in the target currency, so they are credits. */
export const isCredit = (type: TransactionType) => CREDIT_TYPES.includes(type)

/** "Okonkwo-Adeyemi Logistics" -> "OA", "Ada Okafor" -> "AO". */
export function initials(name: string): string {
  return name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}
