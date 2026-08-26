/**
 * Most recent post date in a series, as an ISO string.
 *
 * Shared so the Lab index's ordering and the SeriesCard's "Last updated" label
 * can never disagree. They previously computed it two different ways: the index
 * used `Math.max(...posts.map(p => p.date))`, which returns NaN on ISO date
 * strings and left the comparator always returning -1 (so series rendered in
 * insertion order — oldest first); the card used the date of the highest
 * series_order post, which is only the newest date while a series is authored
 * strictly in order.
 *
 * ISO dates compare correctly as strings, so no Date parsing is needed.
 *
 * @param {{date?: string}[]} posts
 * @returns {string} newest date, or '' if there are none
 */
export function latestPostDate(posts) {
  return (posts ?? []).reduce((max, p) => (p?.date > max ? p.date : max), '')
}
