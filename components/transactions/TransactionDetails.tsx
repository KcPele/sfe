'use client'
import { useEffect, useState, type ReactNode } from 'react'
import type { Transaction } from '@/types/api'
import { Icon, Money } from '@/components/ui'
import { formatDateTime, formatMoney, isCredit, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import { StatusBadge } from './StatusBadge'
import { TransactionAvatar } from './TransactionAvatar'
import styles from './TransactionDetails.module.css'

function Row({ label, children, total }: { label: string; children: ReactNode; total?: boolean }) {
  return (
    <div className={total ? styles.totalRow : styles.row}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  return (
    <button
      type="button"
      className={styles.copy}
      aria-label={copied ? 'Copied' : 'Copy reference'}
      onClick={() =>
        navigator.clipboard?.writeText(value).then(
          () => setCopied(true),
          () => setCopied(false)
        )
      }
    >
      <Icon name={copied ? 'check' : 'copy'} size={16} />
    </button>
  )
}

export function TransactionDetails({ transaction: tx }: { transaction: Transaction }) {
  const credit = isCredit(tx.type)
  const typeLabel = TRANSACTION_TYPE_LABELS[tx.type]
  const headline = tx.counterparty
    ? `${typeLabel} ${credit ? 'from' : 'to'} ${tx.counterparty}`
    : tx.narration

  return (
    <div className={styles.details}>
      <div className={styles.hero}>
        <TransactionAvatar transaction={tx} size="lg" />
        <p className={styles.headline}>{headline}</p>
        <Money
          amount={tx.amount}
          currency={tx.currency}
          sign={credit ? 'credit' : 'debit'}
          className={styles.amount}
        />
        <StatusBadge status={tx.status} />
      </div>

      <section aria-labelledby="tx-details-heading">
        <h3 id="tx-details-heading" className={styles.sectionTitle}>
          Details
        </h3>
        <dl className={styles.list}>
          <Row label="Reference">
            <span className={styles.reference}>
              <span className={styles.mono}>{tx.reference}</span>
              <CopyButton value={tx.reference} />
            </span>
          </Row>
          <Row label="Date">{formatDateTime(tx.createdAt)}</Row>
          <Row label="Type">{typeLabel}</Row>
          {tx.counterparty && <Row label="Counterparty">{tx.counterparty}</Row>}
          {/* Unsanitised upstream text: rendered as text, never as HTML. */}
          <Row label="Narration">{tx.narration}</Row>
        </dl>
      </section>

      <section aria-labelledby="tx-summary-heading">
        <h3 id="tx-summary-heading" className={styles.sectionTitle}>
          Summary
        </h3>
        <dl className={styles.list}>
          <Row label="Amount">{formatMoney(tx.amount, tx.currency)}</Row>
          <Row label="Fee">{formatMoney(tx.fee, tx.currency)}</Row>
          {/* API.md: the fee is charged on top of the amount, in the same currency. */}
          <Row label="Total" total>
            {formatMoney(tx.amount + tx.fee, tx.currency)}
          </Row>
        </dl>
      </section>
    </div>
  )
}
