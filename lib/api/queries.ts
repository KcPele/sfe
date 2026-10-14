import { keepPreviousData, QueryClient, queryOptions } from '@tanstack/react-query'
import { ApiError } from './client'
import { getTransaction, getTransactions, type TransactionQuery } from './endpoints'

/** 4xx responses won't change on retry; 5xx and network errors are often transient (API.md: ~3% fail). */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status < 500) return false
  return failureCount < 2
}

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
      },
    },
  })
}

export const transactionKeys = {
  all: ['transactions'] as const,
  list: (query: TransactionQuery) => [...transactionKeys.all, 'list', query] as const,
  detail: (id: string) => [...transactionKeys.all, 'detail', id] as const,
}

export const transactionListQuery = (query: TransactionQuery) =>
  queryOptions({
    queryKey: transactionKeys.list(query),
    // The signal cancels superseded requests, e.g. while the user is still typing a search.
    queryFn: ({ signal }) => getTransactions(query, { signal }),
    // Keep the current page on screen while the next page or filter loads.
    placeholderData: keepPreviousData,
  })

export const transactionQuery = (id: string) =>
  queryOptions({
    queryKey: transactionKeys.detail(id),
    queryFn: ({ signal }) => getTransaction(id, { signal }).then((res) => res.data),
  })
