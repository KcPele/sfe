import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { Icon, type IconName } from '../Icon'
import styles from './StateMessage.module.css'

export interface StateMessageProps {
  icon: IconName
  title: string
  description?: ReactNode
  tone?: 'primary' | 'danger'
  action?: ReactNode
  /** `alert` announces errors to screen readers as soon as they appear. */
  role?: 'status' | 'alert'
  className?: string
}

/** Centred icon + message + optional action, for empty, error and not-found states. */
export function StateMessage({
  icon,
  title,
  description,
  tone = 'primary',
  action,
  role = 'status',
  className,
}: StateMessageProps) {
  return (
    <div className={cx(styles.state, className)} role={role}>
      <span className={cx(styles.icon, styles[tone])}>
        <Icon name={icon} size={24} />
      </span>
      <div className={styles.text}>
        <p className={styles.title}>{title}</p>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {action}
    </div>
  )
}
