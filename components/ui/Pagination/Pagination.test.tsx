import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination, pageItems } from './Pagination'

describe('pageItems', () => {
  it('shows every page when there are few', () => {
    expect(pageItems(1, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('collapses the middle around the current page', () => {
    expect(pageItems(1, 12)).toEqual([1, 2, 3, 'gap', 12])
    expect(pageItems(6, 12)).toEqual([1, 'gap', 5, 6, 7, 'gap', 12])
    expect(pageItems(12, 12)).toEqual([1, 'gap', 9, 10, 11, 12])
  })
})

describe('Pagination', () => {
  it('marks the current page and disables Previous on the first page', async () => {
    const onPageChange = vi.fn()
    render(<Pagination page={1} totalPages={12} onPageChange={onPageChange} />)

    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })
})
