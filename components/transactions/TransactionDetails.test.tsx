import { render, screen } from '@testing-library/react'
import type { Transaction } from '@/types/api'
import { TransactionDetails } from './TransactionDetails'

const transfer: Transaction = {
  id: 'txn_1',
  reference: 'ACM-48213377',
  type: 'transfer_out',
  status: 'successful',
  currency: 'GHS',
  amount: 120000,
  fee: 1200,
  narration: 'Transfer to Kwame Mensah',
  counterparty: 'Kwame Mensah',
  createdAt: '2026-10-05T10:15:00.000Z',
}

describe('TransactionDetails', () => {
  it('shows the counterparty, amount, fee and a total with the fee on top', () => {
    render(<TransactionDetails transaction={transfer} />)

    expect(screen.getByText('Transfer out to Kwame Mensah')).toBeInTheDocument()
    expect(screen.getByText('−GH₵1,200.00')).toBeInTheDocument()
    expect(screen.getByText('GH₵12.00')).toBeInTheDocument()
    expect(screen.getByText('Total').nextElementSibling).toHaveTextContent('GH₵1,212.00')
    expect(screen.getByRole('button', { name: 'Copy reference' })).toBeInTheDocument()
  })
})
