# Plan: Sierra Peaks Map View

## What we're building

A new "Map" sub-view on the Adventures → Sierra Peaks tab. Clicking "Map" in the existing view switcher (Grid / Timeline / Elevation / By Region) shows a minimal California map with dots for every peak Jason has climbed. Clicking a dot opens a popup with ascent details. Only climbed peaks appear — unclimbed peaks are not shown at all in v1.

## Where it lives in the codebase

- **New component**: `src/components/adventures/PeakMap.jsx`
- **AdventuresPage.jsx**: add `{ id: 'map', label: 'Map' }` to the `peakViews` array and render `{peakView === 'map' && <PeakMap />}`
- **Data**: lat/lng coordinates added directly to each climbed peak's object in `src/data/sps-peaks.json`

No new dependencies needed — `react-simple-maps` is already installed.

---

## Data: lat/lng to add to sps-peaks.json

Add `"lat"` and `"lng"` fields to each of the 17 climbed peaks. These are standard coords from peakbagger / Wikipedia:

| Peak | lat | lng |
|------|-----|-----|
| Mount Tyndall | 36.5868 | -118.3621 |
| Middle Palisade | 37.0545 | -118.4986 |
| Mount Sill | 37.0941 | -118.5133 |
| North Palisade | 37.1040 | -118.5149 |
| Thunderbolt Peak | 37.0987 | -118.5189 |
| Mount Emerson | 37.2210 | -118.6557 |
| Mount Humphreys | 37.2708 | -118.6727 |
| Bear Creek Spire | 37.3567 | -118.7284 |
| Clouds Rest | 37.7618 | -119.5088 |
| Cathedral Peak | 37.8516 | -119.4012 |
| Mount Dana | 37.8999 | -119.2218 |
| Mount Conness | 37.9679 | -119.3210 |
| North Peak | 37.9494 | -119.3578 |
| Black Hawk Mountain | 38.5196 | -119.9472 |
| Round Top | 38.6743 | -119.9018 |
| Pyramid Peak | 38.8472 | -120.1450 |
| Castle Peak | 39.4465 | -120.3668 |

**Verify these before shipping** — spot-check 2-3 against Google Maps / peakbagger to confirm they land in the right place.

---

## Map component design

### Projection

Use `react-simple-maps` `ComposableMap` with a Mercator projection configured to frame California tightly. Suggested config:

```jsx
<ComposableMap
  projection="geoMercator"
  projectionConfig={{
    center: [-119.5, 37.5],   // center on the Sierra
    scale: 3200,               // zoom in close
  }}
  style={{ width: '100%', height: 'auto' }}
>
```

Adjust `center` and `scale` until the full Sierra Nevada fits comfortably with breathing room.

### GeoJSON source

Use a US states GeoJSON and filter to California only:
```
https://cdn.jsdelivr.net/gh/PublicaMundi/MappingAPI@master/data/geojson/us-states.json
```
Filter in `<Geographies>`: `geographies.filter(geo => geo.properties.name === 'California')`.

Render CA as a single flat shape:
- Fill: `var(--c-surface)` or a very light tint
- Stroke: `var(--c-border)`, 1px

No county lines, no labels. Just the silhouette.

### Peak dots

Use `<Marker>` from react-simple-maps for each climbed peak:

```jsx
import { Marker } from 'react-simple-maps'

{climbedPeaks.map(peak => (
  <Marker key={peak.id} coordinates={[peak.lng, peak.lat]}>
    <circle
      r={5}
      fill={selected?.id === peak.id ? 'var(--c-accent)' : 'var(--c-invert-bg)'}
      stroke="var(--c-bg)"
      strokeWidth={1.5}
      style={{ cursor: 'pointer' }}
      onClick={() => setSelected(peak)}
    />
  </Marker>
))}
```

- Default state: filled dot in `var(--c-invert-bg)` (the dark/inverted background token)
- Selected: filled in `var(--c-accent)` (site accent color)
- Stroke: `var(--c-bg)` to create separation from the map background

### Popup

Position the popup panel **below the map** (not floating), so it works on mobile and doesn't get clipped. When a dot is clicked, a panel slides in beneath the map showing:

```
Mount Humphreys  ·  13,986 ft
June 20, 2026

Ben and I headed to Upper Buttermilk for an early season attempt...

[Strava link]  [photo thumbnails if present]
```

Style to match the rest of the site — use the same card/surface background (`var(--c-surface)`), border (`var(--c-border)`), and type scale (peak name in `text-sm font-semibold`, date in `text-xs tabular-nums font-data text-muted`, notes in `text-xs leading-relaxed`).

If a peak has multiple ascents, show each as a stacked entry within the panel (same pattern as PeakTimeline).

Photos: if `ascent.photos` exists, show small thumbnails (same `h-16` style as timeline) that open the shared Lightbox.

Dismiss: clicking anywhere on the map (not on a dot) clears the selection.

---

## Component skeleton

```jsx
// src/components/adventures/PeakMap.jsx
import { useState } from 'react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import { climbedPeaks } from '../../data/spsUtils'
import Lightbox from './Lightbox'

const GEO_URL = 'https://cdn.jsdelivr.net/gh/PublicaMundi/MappingAPI@master/data/geojson/us-states.json'

export default function PeakMap() {
  const [selected, setSelected] = useState(null)
  const [lightbox, setLightbox] = useState(null)

  return (
    <div>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [-119.5, 37.5], scale: 3200 }}
        style={{ width: '100%', height: 'auto' }}
        onClick={() => setSelected(null)}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies
              .filter(geo => geo.properties.name === 'California')
              .map(geo => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="var(--c-surface)"
                  stroke="var(--c-border)"
                  strokeWidth={1}
                  style={{ default: { outline: 'none' }, hover: { outline: 'none' }, pressed: { outline: 'none' } }}
                />
              ))
          }
        </Geographies>

        {climbedPeaks.map(peak => (
          <Marker key={peak.id} coordinates={[peak.lng, peak.lat]}>
            <circle
              r={5}
              fill={selected?.id === peak.id ? 'var(--c-accent)' : 'var(--c-invert-bg)'}
              stroke="var(--c-bg)"
              strokeWidth={1.5}
              style={{ cursor: 'pointer' }}
              onClick={e => { e.stopPropagation(); setSelected(peak) }}
            />
          </Marker>
        ))}
      </ComposableMap>

      {selected && (
        <div className="mt-4 p-4 border" style={{ borderColor: 'var(--c-border)', backgroundColor: 'var(--c-surface)' }}>
          {/* peak name, elevation, ascents list, photos */}
        </div>
      )}

      {lightbox && <Lightbox {...lightbox} onClose={() => setLightbox(null)} />}
    </div>
  )
}
```

---

## Build order

1. **Add lat/lng to sps-peaks.json** — verify coords for each of the 17 peaks
2. **Build PeakMap.jsx** — map shell with CA silhouette + dots, no popup yet; check projection looks right in dev
3. **Add popup panel** — wire up selected state, render ascent details
4. **Wire into AdventuresPage** — add "Map" to peakViews, render conditionally
5. **Test themes** — check default, warm, alpine all look good (no hardcoded colors)
6. **Mobile check** — the below-map panel approach avoids float clipping; verify on narrow viewport

---

## Things to watch

- `react-simple-maps` Marker requires `coordinates` as `[lng, lat]` (longitude first — common gotcha)
- If the GeoJSON URL above goes stale, swap for the Natural Earth states file already referenced in WorldMap.jsx's CDN path
- `spsUtils.js` exports `climbedPeaks` which already filters for peaks with ascents — use that directly rather than re-filtering
- Don't hardcode colors — all fills and strokes must use `var(--c-*)` tokens
