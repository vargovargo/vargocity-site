#!/usr/bin/env python3
"""
Generate Sierra Nevada detail hillshade WebP for the Adventures map zoom=10 view.

Downloads SRTM elevation tiles (Terrarium format, zoom=10) from AWS and computes
a hillshade with the same warm-earthy color ramp used in the z=8 overview image.
The output covers all 17 climbed SPS peaks (Castle Peak at 39.45°N through
Mt Tyndall at 36.59°N, Castle Peak to Mt Whitney), 1792×3328 px — 4× the
linear resolution of the z=8 overview.

Usage: python3 scripts/generate-sierra-hillshade-z10.py
Output: public/sierra-hillshade-z10.webp  (1792×3328, RGBA)
"""

import io
import json
import math
import urllib.request
import numpy as np
from PIL import Image, ImageFilter

# ── Tile parameters ───────────────────────────────────────────────────────────
# Zoom 10 = 4× linear detail vs zoom 8.
# Geographic coverage: -120.59°W to -118.13°W, 39.9°N to 35.9°N
# Covers all 17 climbed SPS peaks including Castle Peak (39.45°N, -120.37°W)

ZOOM = 10

TILE_X_MIN = 169   # left edge  ≈ −120.59 °W
TILE_X_MAX = 175   # right edge ≈ −118.13 °W  (inclusive)
TILE_Y_MIN = 388   # top edge   ≈   39.9  °N  (aligns exactly with z=8 top)
TILE_Y_MAX = 400   # bottom edge ≈  35.9  °N  (inclusive)

TILE_COLS = TILE_X_MAX - TILE_X_MIN + 1  # 7
TILE_ROWS = TILE_Y_MAX - TILE_Y_MIN + 1  # 13
CANVAS_W = TILE_COLS * 256  # 1792
CANVAS_H = TILE_ROWS * 256  # 3328

TERRARIUM_URL = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"

OUTPUT_PATH   = "public/sierra-hillshade-z10.webp"
BOUNDARY_PATH = "public/sierra-nevada-boundary.geojson"

# ── Projection helpers ────────────────────────────────────────────────────────

def lng_to_tile(lng, z):
    return math.floor((lng + 180) / 360 * (2 ** z))

def lat_to_tile(lat, z):
    lat_rad = math.radians(lat)
    return math.floor(
        (1 - math.log(math.tan(lat_rad) + 1 / math.cos(lat_rad)) / math.pi) / 2 * (2 ** z)
    )

def geo_to_pixel(lng, lat):
    """Convert geographic coordinates to canvas pixel position (for this z=10 canvas)."""
    n = 2 ** ZOOM
    tx = (lng + 180) / 360 * n
    lat_rad = math.radians(lat)
    ty = (1 - math.log(math.tan(lat_rad) + 1 / math.cos(lat_rad)) / math.pi) / 2 * n
    return (tx - TILE_X_MIN) * 256, (ty - TILE_Y_MIN) * 256

# ── Elevation tile fetching ───────────────────────────────────────────────────

def fetch_tile_elevation(z, x, y):
    """Download one Terrarium tile and return a 256×256 float32 elevation array (metres)."""
    url = TERRARIUM_URL.format(z=z, x=x, y=y)
    try:
        with urllib.request.urlopen(url, timeout=15) as resp:
            data = resp.read()
        img = Image.open(io.BytesIO(data)).convert("RGB")
        arr = np.array(img, dtype=np.float32)
        return arr[:, :, 0] * 256 + arr[:, :, 1] + arr[:, :, 2] / 256 - 32768
    except Exception as e:
        print(f"  Warning: failed to fetch tile {z}/{x}/{y}: {e}")
        return np.zeros((256, 256), dtype=np.float32)

def build_elevation_grid():
    grid = np.zeros((CANVAS_H, CANVAS_W), dtype=np.float32)
    total = TILE_ROWS * TILE_COLS
    n = 0
    for row in range(TILE_ROWS):
        for col in range(TILE_COLS):
            x = TILE_X_MIN + col
            y = TILE_Y_MIN + row
            n += 1
            print(f"  Fetching tile {n}/{total}: z={ZOOM} x={x} y={y}")
            tile = fetch_tile_elevation(ZOOM, x, y)
            r0, r1 = row * 256, (row + 1) * 256
            c0, c1 = col * 256, (col + 1) * 256
            grid[r0:r1, c0:c1] = tile
    return grid

# ── Hillshade computation ─────────────────────────────────────────────────────

def compute_hillshade(elev, cell_size_m=122.5, azimuth_deg=315.0, altitude_deg=45.0):
    """
    Lambertian hillshade via Horn's gradient formula.
    cell_size_m = 122.5 (≈ 490 / 4) — z=10 is 4× the resolution of z=8.
    """
    az_rad  = math.radians(360 - azimuth_deg + 90)
    alt_rad = math.radians(altitude_deg)

    dz_dx = (np.roll(elev, -1, axis=1) - np.roll(elev,  1, axis=1)) / (2 * cell_size_m)
    dz_dy = (np.roll(elev,  1, axis=0) - np.roll(elev, -1, axis=0)) / (2 * cell_size_m)

    slope  = np.arctan(np.sqrt(dz_dx**2 + dz_dy**2))
    aspect = np.arctan2(-dz_dy, dz_dx)

    shade = (
        np.cos(alt_rad) * np.cos(slope)
        + np.sin(alt_rad) * np.sin(slope) * np.cos(az_rad - aspect)
    )
    return np.clip(shade, 0, 1)

# ── Color ramp (identical to z=8 so the two images blend seamlessly) ──────────

COLOR_RAMP = [
    (0.00, (26,  18,  12)),
    (0.22, (78,  60,  42)),
    (0.45, (150, 128, 102)),
    (0.68, (212, 196, 174)),
    (0.86, (236, 228, 213)),
    (1.00, (250, 248, 241)),
]

def shade_to_rgb(v):
    for i in range(1, len(COLOR_RAMP)):
        t0, c0 = COLOR_RAMP[i - 1]
        t1, c1 = COLOR_RAMP[i]
        if v <= t1:
            a = (v - t0) / (t1 - t0)
            return tuple(int(c0[k] + (c1[k] - c0[k]) * a) for k in range(3))
    return COLOR_RAMP[-1][1]

def apply_color_ramp(shade):
    LUT = 1000
    lut = np.zeros((LUT, 3), dtype=np.uint8)
    for i in range(LUT):
        lut[i] = shade_to_rgb(i / (LUT - 1))
    idx = np.clip((shade * (LUT - 1)).astype(np.int32), 0, LUT - 1)
    return lut[idx]

# ── Boundary masking ──────────────────────────────────────────────────────────

def load_boundary():
    with open(BOUNDARY_PATH) as f:
        gj = json.load(f)
    geom = gj["features"][0]["geometry"]
    if geom["type"] == "Polygon":
        return [geom["coordinates"][0]]
    elif geom["type"] == "MultiPolygon":
        return [ring[0] for ring in geom["coordinates"]]
    return []

def polygon_to_pixels(coords):
    return [geo_to_pixel(lng, lat) for lng, lat in coords]

def rasterize_polygon(pixel_rings, width, height):
    mask = np.zeros((height, width), dtype=bool)
    for ring in pixel_rings:
        pts = list(ring)
        n   = len(pts)
        for y in range(height):
            crossings = []
            for i in range(n):
                x0, y0 = pts[i]
                x1, y1 = pts[(i + 1) % n]
                if (y0 <= y < y1) or (y1 <= y < y0):
                    t  = (y - y0) / (y1 - y0)
                    xc = x0 + t * (x1 - x0)
                    crossings.append(xc)
            crossings.sort()
            for i in range(0, len(crossings) - 1, 2):
                xs = max(0, int(math.ceil(crossings[i])))
                xe = min(width - 1, int(math.floor(crossings[i + 1])))
                if xs <= xe:
                    mask[y, xs:xe + 1] = True
    return mask

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=== Sierra Nevada Detail Hillshade (z=10) ===\n")
    print(f"Canvas: {CANVAS_W}×{CANVAS_H} px  ({TILE_COLS}×{TILE_ROWS} tiles)\n")

    print("1. Building elevation grid from Terrarium tiles...")
    elev = build_elevation_grid()
    print(f"   Elevation range: {elev.min():.0f} m – {elev.max():.0f} m")

    print("\n2. Computing hillshade (cell_size=122.5 m)...")
    shade = compute_hillshade(elev)
    print(f"   Shade range: {shade.min():.3f} – {shade.max():.3f}")

    print("\n3. Applying warm-earthy color ramp...")
    rgb = apply_color_ramp(shade)

    print("\n4. Building soft alpha channel (feathered boundary)...")
    boundary   = load_boundary()
    pxrings    = [polygon_to_pixels(ring) for ring in boundary]
    mask       = rasterize_polygon(pxrings, CANVAS_W, CANVAS_H)

    # Larger blur radius at z=10 (4× more pixels per km → 4× blur to match
    # the same geographic feather distance as z=8's 40px blur).
    BLUR_RADIUS = 160
    mask_img   = Image.fromarray((mask.astype(np.uint8) * 255), "L")
    blurred    = mask_img.filter(ImageFilter.GaussianBlur(BLUR_RADIUS))
    soft_alpha = np.array(blurred, dtype=np.float32) / 255.0

    # Elevation fade: transparent below 600 m, opaque above 1100 m.
    # (Slightly higher than z=8's 400/900 m to hide low-valley floors at
    #  the new detail level where SRTM artefacts are more visible.)
    ELEV_LOW, ELEV_HIGH = 600.0, 1100.0
    elev_fade = np.clip((elev - ELEV_LOW) / (ELEV_HIGH - ELEV_LOW), 0.0, 1.0)

    # Edge-margin fade: taper to 0 at all four canvas edges so the overlay
    # blends seamlessly over the z=8 image underneath.
    EDGE_MARGIN = 160
    ey = np.ones(CANVAS_H, dtype=np.float32)
    ey[:EDGE_MARGIN]  = np.linspace(0, 1, EDGE_MARGIN)
    ey[-EDGE_MARGIN:] = np.linspace(1, 0, EDGE_MARGIN)
    ex = np.ones(CANVAS_W, dtype=np.float32)
    ex[:EDGE_MARGIN]  = np.linspace(0, 1, EDGE_MARGIN)
    ex[-EDGE_MARGIN:] = np.linspace(1, 0, EDGE_MARGIN)
    edge_fade = ey[:, np.newaxis] * ex[np.newaxis, :]

    alpha = np.clip(soft_alpha * elev_fade * edge_fade * 1.4, 0.0, 1.0)

    rgba = np.zeros((CANVAS_H, CANVAS_W, 4), dtype=np.uint8)
    rgba[:, :, :3] = rgb
    rgba[:, :, 3]  = (alpha * 255).astype(np.uint8)

    print(f"   Opaque pixels (alpha>200): {(rgba[:,:,3]>200).sum():,} / {CANVAS_W * CANVAS_H:,}")

    print(f"\n5. Saving to {OUTPUT_PATH}...")
    img = Image.fromarray(rgba, "RGBA")
    img.save(OUTPUT_PATH, "WEBP", quality=88, lossless=False)
    size_kb = __import__('os').path.getsize(OUTPUT_PATH) // 1024
    print(f"   Saved {img.width}×{img.height} RGBA WEBP  ({size_kb} KB)\n")
    print("Done.")

if __name__ == "__main__":
    main()
