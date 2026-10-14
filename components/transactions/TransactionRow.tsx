import type { Transaction } from '@/types/api'
import { Money } from '@/components/ui'
import { formatDateTime, isCredit, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import { StatusBadge } from './StatusBadge'
import { TransactionAvatar } from './TransactionAvatar'
import styles from './TransactionRow.module.css'

export interface TransactionRowProps {
  transaction: Transaction
  onSelect?: (transaction: Transaction) => void
}

export function TransactionRow({ transaction: tx, onSelect }: TransactionRowProps) {
  const credit = isCredit(tx.type)

  return (
    <button type="button" className={styles.row} onClick={() => onSelect?.(tx)}>
      <TransactionAvatar transaction={tx} />
      <span className={styles.main}>
        <span className={styles.title}>{TRANSACTION_TYPE_LABELS[tx.type]}</span>
        {/* Narration is unsanitised upstream data: always render it as text. */}
        <span className={styles.narration}>{tx.narration}</span>
      </span>
      <StatusBadge status={tx.status} />
      <span className={styles.end}>
        <Money
          amount={tx.amount}
          currency={tx.currency}
          sign={credit ? 'credit' : 'debit'}
          className={credit ? styles.credit : styles.amount}
        />
        <span className={styles.meta}>{formatDateTime(tx.createdAt)}</span>
      </span>
    </button>
  )
}
