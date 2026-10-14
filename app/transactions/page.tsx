import type { Metadata } from 'next'
import { Suspense } from 'react'
import { TransactionsView, TransactionsViewFallback } from '@/components/transactions'

export const metadata: Metadata = { title: 'Transactions' }

export default function TransactionsPage() {
  // TransactionsView reads the URL (useSearchParams), so it renders on the client below this boundary.
  return (
    <Suspense fallback={<TransactionsViewFallback />}>
      <TransactionsView />
    </Suspense>
  )
}
