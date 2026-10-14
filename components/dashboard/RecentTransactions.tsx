'use client'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { Transaction } from '@/types/api'
import { Card, CardHeader, Drawer } from '@/components/ui'
import { TransactionDetails, TransactionRow } from '@/components/transactions'
import { transactionListQuery } from '@/lib/api/queries'
import styles from './RecentTransactions.module.css'

export function RecentTransactions() {
  const [selected, setSelected] = useState<Transaction | null>(null)
  const { data, isPending, isError } = useQuery(transactionListQuery({ limit: 5 }))
  const transactions = data?.data

  return (
    <Card padding="none">
      <div className={styles.header}>
        <CardHeader
          title="Recent transactions"
          action={
            <Link href="/transactions" className={styles.seeAll}>
              See all
            </Link>
          }
        />
      </div>
      {isPending && <p className={styles.message}>Loading…</p>}
      {isError && !transactions && (
        <p className={styles.message}>We couldn&apos;t load your recent transactions.</p>
      )}
      {transactions?.length === 0 && <p className={styles.message}>No transactions yet.</p>}
      {transactions?.map((tx) => (
        <TransactionRow key={tx.id} transaction={tx} onSelect={setSelected} />
      ))}

      <Drawer open={selected !== null} title="Transaction details" onClose={() => setSelected(null)}>
        {selected && <TransactionDetails transaction={selected} />}
      </Drawer>
    </Card>
  )
}
