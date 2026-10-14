'use client'
import { createColumnHelper, tableFeatures, useTable, type Row } from '@tanstack/react-table'
import type { Transaction } from '@/types/api'
import { cx } from '@/lib/cx'
import { Money, Skeleton } from '@/components/ui'
import { formatDayLabel, formatTime, isCredit, localDayKey, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import { StatusBadge } from './StatusBadge'
import { TransactionAvatar } from './TransactionAvatar'
import styles from './TransactionTable.module.css'

const features = tableFeatures({})
const column = createColumnHelper<typeof features, Transaction>()

const columns = column.columns([
  column.display({
    id: 'avatar',
    header: 'Type',
    cell: ({ row }) => <TransactionAvatar transaction={row.original} />,
  }),
  column.accessor('narration', {
    header: 'Description',
    cell: ({ row }) => (
      <>
        {/* The row is clickable; this button gives keyboard and screen-reader users the same action. */}
        <button type="button" className={styles.title}>
          {TRANSACTION_TYPE_LABELS[row.original.type]}
        </button>
        {/* Unsanitised upstream text: rendered as text, never as HTML. */}
        <span className={styles.narration}>{row.original.narration}</span>
      </>
    ),
  }),
  column.accessor('status', {
    header: 'Status',
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
  }),
  column.accessor('amount', {
    header: 'Amount',
    cell: ({ row }) => {
      const tx = row.original
      const credit = isCredit(tx.type)
      return (
        <>
          <Money
            amount={tx.amount}
            currency={tx.currency}
            sign={credit ? 'credit' : 'debit'}
            className={cx(styles.amount, credit && styles.credit)}
          />
          <time dateTime={tx.createdAt} className={styles.time}>
            {formatTime(tx.createdAt)}
          </time>
          {/* Phones show the status under the amount instead of in its own column. */}
          <StatusBadge status={tx.status} className={styles.inlineStatus} />
        </>
      )
    },
  }),
])

const CELL_CLASSES: Record<string, string | undefined> = {
  avatar: styles.avatarCell,
  narration: styles.mainCell,
  status: styles.statusCell,
  amount: styles.amountCell,
}

/** Splits rows (already newest first) into consecutive local-day groups. */
function groupByDay<T extends { original: Transaction }>(rows: T[]) {
  const groups: { key: string; label: string; rows: T[] }[] = []
  const now = new Date()
  for (const row of rows) {
    const key = localDayKey(new Date(row.original.createdAt))
    const last = groups.at(-1)
    if (last?.key === key) last.rows.push(row)
    else groups.push({ key, label: formatDayLabel(row.original.createdAt, now), rows: [row] })
  }
  return groups
}

export interface TransactionTableProps {
  transactions: Transaction[]
  onSelect: (transaction: Transaction) => void
  /** Dims the rows while newer results load in the background. */
  stale?: boolean
}

export function TransactionTable({ transactions, onSelect, stale }: TransactionTableProps) {
  const table = useTable({
    features,
    columns,
    data: transactions,
    getRowId: (tx) => tx.id,
  })

  const renderRow = (row: Row<typeof features, Transaction>) => (
    <tr key={row.id} className={styles.row} onClick={() => onSelect(row.original)}>
      {row.getAllCells().map((cell) => (
        <td key={cell.id} className={CELL_CLASSES[cell.column.id]}>
          <table.FlexRender cell={cell} />
        </td>
      ))}
    </tr>
  )

  return (
    <table className={cx(styles.table, stale && styles.stale)} aria-busy={stale || undefined}>
      <caption className="visually-hidden">Transactions</caption>
      <thead className="visually-hidden">
        {table.getHeaderGroups().map((group) => (
          <tr key={group.id}>
            {group.headers.map((header) => (
              <th key={header.id} scope="col">
                <table.FlexRender header={header} />
              </th>
            ))}
          </tr>
        ))}
      </thead>
      {groupByDay(table.getRowModel().rows).map((group) => (
        <tbody key={group.key}>
          <tr>
            <th colSpan={columns.length} scope="colgroup" className={styles.day}>
              {group.label}
            </th>
          </tr>
          {group.rows.map(renderRow)}
        </tbody>
      ))}
    </table>
  )
}

/** Placeholder rows matching the table layout, shown on first load. */
export function TransactionTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading transactions">
      <div className={styles.day}>
        <Skeleton width={64} height={10} />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={styles.skeletonRow}>
          <Skeleton circle width={40} />
          <span className={styles.skeletonMain}>
            <Skeleton width={120} />
            <Skeleton width="60%" height={10} className={styles.skeletonNarration} />
          </span>
          <span className={styles.skeletonEnd}>
            <Skeleton width={96} />
            <Skeleton width={40} height={10} />
          </span>
        </div>
      ))}
    </div>
  )
}
