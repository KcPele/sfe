'use client'
import { useEffect, useState } from 'react'
import type { TransactionStatus, TransactionType } from '@/types/api'
import { Button, Input, Select } from '@/components/ui'
import { TRANSACTION_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import styles from './TransactionFilters.module.css'

const SEARCH_DEBOUNCE_MS = 300

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  ...Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => ({ value, label })),
]

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...Object.entries(TRANSACTION_STATUS_LABELS).map(([value, label]) => ({ value, label })),
]

export interface TransactionFiltersProps {
  q: string
  type: TransactionType | undefined
  status: TransactionStatus | undefined
  onSearch: (q: string) => void
  onTypeChange: (type: TransactionType | undefined) => void
  onStatusChange: (status: TransactionStatus | undefined) => void
  onClear: () => void
}

export function TransactionFilters({
  q,
  type,
  status,
  onSearch,
  onTypeChange,
  onStatusChange,
  onClear,
}: TransactionFiltersProps) {
  // The input updates on every keystroke; the URL (and the request) follows once typing pauses.
  const [draft, setDraft] = useState(q)
  const [syncedQ, setSyncedQ] = useState(q)
  if (q !== syncedQ) {
    // The URL changed from outside (Back, Clear filters): show what it says.
    setSyncedQ(q)
    setDraft(q)
  }

  useEffect(() => {
    if (draft.trim() === q) return
    const timer = setTimeout(() => onSearch(draft.trim()), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [draft, q, onSearch])

  const hasFilters = Boolean(q || draft || type || status)

  return (
    <div className={styles.filters} role="search">
      <Input
        type="search"
        label="Search"
        leadingIcon="search"
        placeholder="Search by reference, name or narration"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        fieldClassName={styles.search}
      />
      <Select
        label="Type"
        options={TYPE_OPTIONS}
        value={type ?? ''}
        onChange={(event) => onTypeChange((event.target.value || undefined) as TransactionType | undefined)}
        fieldClassName={styles.type}
      />
      <Select
        label="Status"
        options={STATUS_OPTIONS}
        value={status ?? ''}
        onChange={(event) =>
          onStatusChange((event.target.value || undefined) as TransactionStatus | undefined)
        }
        fieldClassName={styles.status}
      />
      {hasFilters && (
        <Button variant="ghost" className={styles.clear} onClick={onClear}>
          Clear filters
        </Button>
      )}
    </div>
  )
}
