import { describe, it, expect } from 'vitest'
import { latestPostDate } from '../lib/series'

describe('latestPostDate', () => {
  it('returns the newest date regardless of array order', () => {
    const posts = [
      { date: '2026-04-15' },
      { date: '2026-08-12' },
      { date: '2026-03-13' },
    ]
    expect(latestPostDate(posts)).toBe('2026-08-12')
  })

  it('is not fooled by Math.max coercion', () => {
    // The original Lab index used Math.max(...posts.map(p => p.date)), which
    // returns NaN on ISO date strings. The comparator then always returned -1
    // and the series list silently rendered oldest-first. Guard the shape of
    // that bug, not just the happy path.
    const posts = [{ date: '2026-04-15' }, { date: '2026-08-12' }]
    expect(Math.max(...posts.map(p => Number(p.date)))).toBeNaN()
    expect(latestPostDate(posts)).toBe('2026-08-12')
  })

  it('sorts series newest-first when used as a comparator key', () => {
    const series: Record<string, { date: string }[]> = {
      sbi: [{ date: '2026-03-28' }],
      aei: [{ date: '2026-03-13' }, { date: '2026-08-12' }],
      heat: [{ date: '2026-07-01' }],
      fabric: [{ date: '2026-06-05' }],
    }
    const order = Object.keys(series).sort((a, b) =>
      latestPostDate(series[b]).localeCompare(latestPostDate(series[a]))
    )
    expect(order).toEqual(['aei', 'heat', 'fabric', 'sbi'])
  })

  it('handles empty and missing input', () => {
    expect(latestPostDate([])).toBe('')
    expect(latestPostDate(undefined)).toBe('')
  })
})
