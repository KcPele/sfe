import { render, screen } from '@testing-library/react'
import { Money } from './Money'

describe('Money', () => {
  it('formats minor units with two decimals and a sign', () => {
    render(
      <>
        <Money amount={120000} currency="GHS" sign="debit" />
        <Money amount={249999999999} currency="NGN" sign="credit" />
        <Money amount={4500} currency="USD" />
      </>
    )
    expect(screen.getByText('−GH₵1,200.00')).toBeInTheDocument()
    expect(screen.getByText('+₦2,499,999,999.99')).toBeInTheDocument()
    expect(screen.getByText('$45.00')).toBeInTheDocument()
  })
})
