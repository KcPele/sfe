import { api, ApiError } from './client'

function mockFetch(status: number, body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(body), { status }))
  )
}

afterEach(() => vi.unstubAllGlobals())

describe('api client', () => {
  it('resolves with the body on success', async () => {
    mockFetch(200, { data: { id: 'txn_1' } })
    await expect(api.get('/transactions/txn_1')).resolves.toEqual({ data: { id: 'txn_1' } })
  })

  it('throws an ApiError with the server code and message on failure', async () => {
    mockFetch(404, { error: { code: 'NOT_FOUND', message: 'Transaction txn_x not found' } })
    const error = await api.get('/transactions/txn_x').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 404, code: 'NOT_FOUND', message: 'Transaction txn_x not found' })
  })

  it('throws an ApiError when the error body is not JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('Bad gateway', { status: 502 }))
    )
    await expect(api.get('/me')).rejects.toMatchObject({ status: 502, code: 'UNKNOWN_ERROR' })
  })
})
