import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { SelectPeriod } from './period-select'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  useSearch: () => ({ period: 'last_5_minutes', type: 'voltage_fn', phase: ['A', 'B', 'C'] }),
  useRouteContext: () => ({ queryClient: new QueryClient() }),
}))

describe('SelectPeriod Component', () => {
  test('renders without needing queryClient or search props', () => {
    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <SelectPeriod />
      </QueryClientProvider>
    )
    expect(screen.getByRole('combobox')).toBeDefined()
  })
})
