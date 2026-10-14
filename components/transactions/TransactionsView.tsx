'use client'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'
import type { Transaction, TransactionStatus, TransactionType } from '@/types/api'
import { Button, Card, Pagination, StateMessage } from '@/components/ui'
import { transactionListQuery } from '@/lib/api/queries'
import { TransactionDetailsDrawer } from './TransactionDetailsDrawer'
import { TransactionFilters } from './TransactionFilters'
import { TransactionTable, TransactionTableSkeleton } from './TransactionTable'
import { useTransactionParams } from './useTransactionParams'
import styles from './TransactionsView.module.css'

const PAGE_SIZE = 20

const plural = (n: number, word: string) => `${n.toLocaleString('en-GB')} ${word}${n === 1 ? '' : 's'}`

/** Server-rendered placeholder while the URL-driven view hydrates. */
export function TransactionsViewFallback() {
  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.title}>Transactions</h1>
        <p className={styles.subtitle}>{'\u00a0'}</p>
      </header>
      <Card padding="none">
        <TransactionTableSkeleton />
      </Card>
    </div>
  )
}

export function TransactionsView() {
  const [params, setParams] = useTransactionParams()
  const { q, type, status, page, tx } = params
  const isFiltered = Boolean(q || type || status)

  const { data, error, isPending, isPlaceholderData, isFetching, refetch } = useQuery(
    transactionListQuery({ page, limit: PAGE_SIZE, q: q || undefined, type, status })
  )
  const transactions = data?.data ?? []
  const meta = data?.meta

  // A stale link (or a filter that shrank the results) can point past the last page.
  useEffect(() => {
    if (meta && !isPlaceholderData && meta.total > 0 && page > meta.totalPages) {
      setParams({ page: meta.totalPages }, 'replace')
    }
  }, [meta, isPlaceholderData, page, setParams])

  // Starting a search adds one history entry, so Back returns to the unsearched list; refining it
  // replaces that entry, so Back doesn't step through every pause in typing.
  const onSearch = useCallback(
    (value: string) => setParams({ q: value, page: null }, q ? 'replace' : 'push'),
    [q, setParams]
  )
  const onTypeChange = (value: TransactionType | undefined) => setParams({ type: value, page: null })
  const onStatusChange = (value: TransactionStatus | undefined) => setParams({ status: value, page: null })
  const onClear = () => setParams({ q: null, type: null, status: null, page: null })

  const onPageChange = (next: number) => {
    setParams({ page: next })
    window.scrollTo({ top: 0 })
  }

  // Opening pushes a history entry, so Back closes the drawer. Closing one we opened goes back to it;
  // closing one that arrived in the URL (shared link, refresh) just removes it.
  const openedHere = useRef(false)
  const openDetails = (transaction: Transaction) => {
    openedHere.current = true
    setParams({ tx: transaction.id })
  }
  const closeDetails = () => {
    if (openedHere.current) window.history.back()
    else setParams({ tx: null }, 'replace')
    openedHere.current = false
  }

  const subtitle = !meta ? ' ' : isFiltered ? plural(meta.total, 'result') : plural(meta.total, 'transaction')

  const rangeStart = meta ? (meta.page - 1) * meta.limit + 1 : 0
  const rangeEnd = meta ? Math.min(meta.page * meta.limit, meta.total) : 0

  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.title}>Transactions</h1>
        <p className={styles.subtitle} aria-live="polite">
          {subtitle}
        </p>
      </header>

      <TransactionFilters
        q={q}
        type={type}
        status={status}
        onSearch={onSearch}
        onTypeChange={onTypeChange}
        onStatusChange={onStatusChange}
        onClear={onClear}
      />

      <Card padding="none">
        {isPending ? (
          <TransactionTableSkeleton />
        ) : error && !isPlaceholderData ? (
          <StateMessage
            role="alert"
            icon="alert"
            tone="danger"
            title="We couldn’t load your transactions"
            description="Check your connection and try again."
            action={
              <Button iconLeft="refresh" onClick={() => refetch()} disabled={isFetching}>
                Try again
              </Button>
            }
          />
        ) : transactions.length === 0 && isFiltered ? (
          <StateMessage
            icon="search"
            title="No transactions match your filters"
            description="Try a different search term or remove some filters."
            action={
              <Button variant="secondary" onClick={onClear}>
                Clear filters
              </Button>
            }
          />
        ) : transactions.length === 0 ? (
          <StateMessage
            icon="inbox"
            title="No transactions yet"
            description="When you add money, send a transfer or pay with your card, it will show up here."
          />
        ) : (
          <TransactionTable transactions={transactions} onSelect={openDetails} stale={isPlaceholderData} />
        )}
      </Card>

      {meta && transactions.length > 0 && (
        <div className={styles.footer}>
          <p className={styles.range}>
            Showing {rangeStart}–{rangeEnd} of {meta.total.toLocaleString('en-GB')}
          </p>
          <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={onPageChange} />
        </div>
      )}

      <TransactionDetailsDrawer
        id={tx}
        initial={transactions.find((t) => t.id === tx)}
        onClose={closeDetails}
      />
    </div>
  )
}
