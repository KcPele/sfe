import { parseTransactionParams } from './useTransactionParams'

describe('parseTransactionParams', () => {
  it('reads search, filters, page and the open transaction', () => {
    const params = new URLSearchParams('q=%20netflix%20&type=card_payment&status=failed&page=3&tx=txn_1')
    expect(parseTransactionParams(params)).toEqual({
      q: 'netflix',
      type: 'card_payment',
      status: 'failed',
      page: 3,
      tx: 'txn_1',
    })
  })

  it('falls back to defaults for missing or malformed values', () => {
    const params = new URLSearchParams('type=refund&status=reversed&page=-2&tx=')
    expect(parseTransactionParams(params)).toEqual({
      q: '',
      type: undefined,
      status: undefined,
      page: 1,
      tx: undefined,
    })
    expect(parseTransactionParams(new URLSearchParams('page=abc')).page).toBe(1)
    expect(parseTransactionParams(new URLSearchParams('page=1.5')).page).toBe(1)
  })
})
