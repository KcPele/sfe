import { ApiError } from './client'
import { shouldRetry } from './queries'

describe('shouldRetry', () => {
  it('retries server errors and network failures a limited number of times', () => {
    expect(shouldRetry(0, new ApiError(500, 'INTERNAL_ERROR', ''))).toBe(true)
    expect(shouldRetry(1, new TypeError('Failed to fetch'))).toBe(true)
    expect(shouldRetry(2, new ApiError(500, 'INTERNAL_ERROR', ''))).toBe(false)
  })

  it('never retries client errors', () => {
    expect(shouldRetry(0, new ApiError(404, 'NOT_FOUND', ''))).toBe(false)
    expect(shouldRetry(0, new ApiError(400, 'INVALID_PAGINATION', ''))).toBe(false)
  })
})
