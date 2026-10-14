import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Transaction } from '@/types/api'
import { TransactionTable } from './TransactionTable'

const tx = (overrides: Partial<Transaction>): Transaction => ({
  id: 'txn_1',
  reference: 'ACM-1',
  type: 'card_payment',
  status: 'successful',
  currency: 'USD',
  amount: 4599,
  fee: 0,
  narration: 'Card payment - Netflix',
  counterparty: null,
  createdAt: new Date().toISOString(),
  ...overrides,
})

describe('TransactionTable', () => {
  it('renders unsanitised narration as text, never as HTML', () => {
    const narration = 'Bill payment - Spectranet <img src="x" onerror="alert(1)">'
    const { container } = render(<TransactionTable transactions={[tx({ narration })]} onSelect={() => {}} />)
    expect(screen.getByText(narration)).toBeInTheDocument()
    expect(container.querySelector('img')).toBeNull()
  })

  it('groups rows under day headings', () => {
    const lastYear = new Date(2025, 0, 6, 9, 0).toISOString()
    render(
      <TransactionTable
        transactions={[tx({ id: 'a' }), tx({ id: 'b', createdAt: lastYear })]}
        onSelect={() => {}}
      />
    )
    const headings = screen
      .getAllByRole('columnheader')
      .filter((th) => th.getAttribute('scope') === 'colgroup')
    expect(headings.map((th) => th.textContent)).toEqual(['Today', 'Mon, 6 Jan 2025'])
  })

  it('shows credits with + and debits with − and opens a row on click', async () => {
    const onSelect = vi.fn()
    const credit = tx({
      id: 'in',
      type: 'transfer_in',
      currency: 'NGN',
      amount: 2500000,
      counterparty: 'Ada Okafor',
    })
    render(<TransactionTable transactions={[tx({}), credit]} onSelect={onSelect} />)

    expect(screen.getByText('−$45.99')).toBeInTheDocument()
    const row = screen.getByText('+₦25,000.00').closest('tr')!
    expect(within(row).getByText('AO')).toBeInTheDocument()

    await userEvent.click(within(row).getByRole('button', { name: 'Transfer in' }))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(credit)
  })
})
