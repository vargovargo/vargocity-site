import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SocialFabricMap } from '../components/writing/SocialFabricMap'

// react-simple-maps uses SVG — mock it to avoid jsdom SVG limitations
vi.mock('react-simple-maps', () => ({
  ComposableMap: ({ children }: { children: React.ReactNode }) => <svg>{children}</svg>,
  Geographies: ({ children }: { children: (arg: { geographies: never[] }) => React.ReactNode }) =>
    <>{children({ geographies: [] })}</>,
  Geography: () => null,
}))

describe('SocialFabricMap', () => {
  it('renders dimension toggle buttons', () => {
    render(<SocialFabricMap />)
    expect(screen.getByText('Social Fabric Score')).toBeInTheDocument()
    expect(screen.getByText('Institutional Access')).toBeInTheDocument()
    expect(screen.getByText('Civic Life')).toBeInTheDocument()
    expect(screen.getByText('Community Connections')).toBeInTheDocument()
  })

  it('shows county count from data', () => {
    render(<SocialFabricMap />)
    // Footer should show the record count (e.g. "3,222 U.S. counties")
    expect(screen.getByText(/U\.S\. counties/)).toBeInTheDocument()
  })

  it('shows legend with Weaker/Stronger labels', () => {
    render(<SocialFabricMap />)
    expect(screen.getByText('Weaker')).toBeInTheDocument()
    expect(screen.getByText('Stronger')).toBeInTheDocument()
  })
})
