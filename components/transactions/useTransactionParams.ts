'use client'
import { useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import type { TransactionStatus, TransactionType } from '@/types/api'
import { TRANSACTION_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '@/lib/format'

export interface TransactionParams {
  q: string
  type: TransactionType | undefined
  status: TransactionStatus | undefined
  page: number
  /** Id of the transaction open in the details drawer. */
  tx: string | undefined
}

type ParamChanges = { [K in keyof TransactionParams]?: TransactionParams[K] | null }

const isType = (value: string | null): value is TransactionType =>
  value !== null && Object.hasOwn(TRANSACTION_TYPE_LABELS, value)

const isStatus = (value: string | null): value is TransactionStatus =>
  value !== null && Object.hasOwn(TRANSACTION_STATUS_LABELS, value)

/** Reads the page state from the URL, ignoring anything malformed (hand-edited or stale links). */
export function parseTransactionParams(params: Pick<URLSearchParams, 'get'>): TransactionParams {
  const type = params.get('type')
  const status = params.get('status')
  const page = Number(params.get('page'))
  return {
    q: params.get('q')?.trim() ?? '',
    type: isType(type) ? type : undefined,
    status: isStatus(status) ? status : undefined,
    page: Number.isInteger(page) && page > 1 ? page : 1,
    tx: params.get('tx') || undefined,
  }
}

/**
 * Keeps search, filters, page and the open transaction in the query string, so refresh, shared links and
 * Back all restore the same view. Unrelated params (e.g. `__scenario`) are left untouched.
 */
export function useTransactionParams() {
  const searchParams = useSearchParams()
  const params = useMemo(() => parseTransactionParams(searchParams), [searchParams])

  const setParams = useCallback((changes: ParamChanges, mode: 'push' | 'replace' = 'push') => {
    const next = new URLSearchParams(window.location.search)
    for (const [key, value] of Object.entries(changes)) {
      const isDefault =
        value === null || value === undefined || value === '' || (key === 'page' && value === 1)
      if (isDefault) next.delete(key)
      else next.set(key, String(value))
    }
    const qs = next.toString()
    const url = qs ? `?${qs}` : window.location.pathname
    // Next.js syncs native history updates with useSearchParams, without a server round trip.
    if (mode === 'push') window.history.pushState(null, '', url)
    else window.history.replaceState(null, '', url)
  }, [])

  return [params, setParams] as const
}
