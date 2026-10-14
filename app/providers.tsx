'use client'
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { makeQueryClient } from '@/lib/api/queries'

let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  // A fresh client per server render; one shared client in the browser.
  if (typeof window === 'undefined') return makeQueryClient()
  browserQueryClient ??= makeQueryClient()
  return browserQueryClient
}

export function Providers({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>
}
