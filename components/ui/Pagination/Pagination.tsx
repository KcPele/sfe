import { cx } from '@/lib/cx'
import { Icon } from '../Icon'
import styles from './Pagination.module.css'

type PageItem = number | 'gap'

/** First, last and the current page's neighbours, e.g. 1 2 3 … 12 or 1 … 5 6 7 … 12. */
export function pageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
  const start = Math.max(2, Math.min(page - 1, totalPages - 3))
  const end = Math.min(totalPages - 1, Math.max(page + 1, 3))
  const items: PageItem[] = [1]
  if (start > 2) items.push('gap')
  for (let p = start; p <= end; p++) items.push(p)
  if (end < totalPages - 1) items.push('gap')
  items.push(totalPages)
  return items
}

export interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Pagination" className={cx(styles.pagination, className)}>
      <button
        type="button"
        className={cx(styles.button, styles.step)}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <Icon name="chevron-left" size={16} />
        Previous
      </button>
      <ul className={styles.pages}>
        {pageItems(page, totalPages).map((item, i) =>
          item === 'gap' ? (
            <li key={`gap-${i}`} className={styles.gap} aria-hidden>
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                className={cx(styles.button, styles.page, item === page && styles.current)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Page ${item}`}
                onClick={() => onPageChange(item)}
              >
                {item}
              </button>
            </li>
          )
        )}
      </ul>
      <button
        type="button"
        className={cx(styles.button, styles.step)}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
        <Icon name="chevron-right" size={16} />
      </button>
    </nav>
  )
}
