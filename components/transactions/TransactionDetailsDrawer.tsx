'use client'
import { useQuery } from '@tanstack/react-query'
import type { Transaction } from '@/types/api'
import { Button, Drawer, Skeleton, StateMessage } from '@/components/ui'
import { ApiError } from '@/lib/api/client'
import { transactionQuery } from '@/lib/api/queries'
import { TransactionDetails } from './TransactionDetails'
import styles from './TransactionDetailsDrawer.module.css'

export interface TransactionDetailsDrawerProps {
  /** Id from the URL; the drawer is open while it is set. */
  id: string | undefined
  /** The row from the list, if loaded, so opening from the list is instant. */
  initial?: Transaction
  onClose: () => void
}

export function TransactionDetailsDrawer({ id, initial, onClose }: TransactionDetailsDrawerProps) {
  return (
    <Drawer open={id !== undefined} title="Transaction details" onClose={onClose}>
      {id !== undefined && <DetailsContent key={id} id={id} initial={initial} onClose={onClose} />}
    </Drawer>
  )
}

function DetailsContent({
  id,
  initial,
  onClose,
}: {
  id: string
  initial?: Transaction
  onClose: () => void
}) {
  // Opened from a row: use it as-is. Opened from a link: fetch it.
  const { data, error, isPending, refetch, isFetching } = useQuery({
    ...transactionQuery(id),
    initialData: initial,
  })

  if (data) return <TransactionDetails transaction={data} />
  if (isPending) return <DetailsSkeleton />

  if (error instanceof ApiError && error.status === 404) {
    return (
      <StateMessage
        icon="search"
        title="Transaction not found"
        description="It may have been removed, or the link is wrong."
        action={
          <Button variant="secondary" onClick={onClose}>
            Back to transactions
          </Button>
        }
      />
    )
  }

  return (
    <StateMessage
      role="alert"
      icon="alert"
      tone="danger"
      title="We couldn’t load this transaction"
      description="Check your connection and try again."
      action={
        <Button iconLeft="refresh" onClick={() => refetch()} disabled={isFetching}>
          Try again
        </Button>
      }
    />
  )
}

function DetailsSkeleton() {
  return (
    <div className={styles.skeleton} role="status" aria-label="Loading transaction">
      <div className={styles.hero}>
        <Skeleton circle width={48} />
        <Skeleton width={160} />
        <Skeleton width={200} height={24} />
        <Skeleton width={84} height={22} className={styles.pill} />
      </div>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className={styles.line}>
          <Skeleton width={90} />
          <Skeleton width={140} />
        </div>
      ))}
    </div>
  )
}
