import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { PeriodSelector } from './period-selector'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  useSearch: () => ({
    period: 'last_5_minutes',
  }),
}))

describe('PeriodSelector Component in gráficos', () => {
  test('renders without needing value or onChange props', () => {
    render(<PeriodSelector />)
    expect(screen.getByRole('combobox')).toBeDefined()
  })
})
