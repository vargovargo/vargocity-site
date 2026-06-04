import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import HeatMapToggle from '../components/writing/HeatMapToggle'

// fetch is called on mount to load heat panel data
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ counties: [] }),
  } as Response)
)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('HeatMapToggle', () => {
  it('renders three type toggle buttons', () => {
    render(<HeatMapToggle />)
    expect(screen.getByText('Shock')).toBeInTheDocument()
    expect(screen.getByText('Stress')).toBeInTheDocument()
    expect(screen.getByText('Shift')).toBeInTheDocument()
  })

  it('defaults to stress type selected', () => {
    render(<HeatMapToggle />)
    const stressBtn = screen.getByText('Stress')
    // active button has font-weight 600 via inline style
    expect(stressBtn).toHaveStyle({ fontWeight: 600 })
  })

  it('switches active type on button click', () => {
    render(<HeatMapToggle />)
    fireEvent.click(screen.getByText('Shock'))
    expect(screen.getByText('Shock')).toHaveStyle({ fontWeight: 600 })
  })
})
