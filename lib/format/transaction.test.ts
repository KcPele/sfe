import { formatDayLabel } from './date'
import { initials, isCredit } from './transaction'

describe('initials', () => {
  it('uses the first letters of the first two words, splitting on hyphens too', () => {
    expect(initials('Ada Okafor')).toBe('AO')
    expect(initials('Okonkwo-Adeyemi Logistics & Haulage International Ltd')).toBe('OA')
    expect(initials('kwame')).toBe('K')
  })
})

describe('isCredit', () => {
  it('treats money in (including conversions, recorded in the target currency) as credit', () => {
    expect(isCredit('deposit')).toBe(true)
    expect(isCredit('conversion')).toBe(true)
    expect(isCredit('card_payment')).toBe(false)
    expect(isCredit('transfer_out')).toBe(false)
  })
})

describe('formatDayLabel', () => {
  const now = new Date(2026, 9, 14, 12, 0)

  it('labels today and yesterday in local time', () => {
    expect(formatDayLabel(new Date(2026, 9, 14, 0, 5).toISOString(), now)).toBe('Today')
    expect(formatDayLabel(new Date(2026, 9, 13, 23, 59).toISOString(), now)).toBe('Yesterday')
  })

  it('falls back to the full date', () => {
    expect(formatDayLabel(new Date(2026, 9, 5, 10, 15).toISOString(), now)).toBe('Mon, 5 Oct 2026')
  })
})
