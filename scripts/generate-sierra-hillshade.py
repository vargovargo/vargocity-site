#!/usr/bin/env python3
"""
Generate Sierra Nevada hillshade WebP for the Adventures map.

Downloads SRTM elevation tiles (Terrarium format) from AWS and computes
a hillshade with a blue-gray color ramp.  The alpha channel is a
Gaussian-blurred version of the boundary mask, so the range fades
softly into the page background — no hard clip line.

Usage: python3 scripts/generate-sierra-hillshade.py
Output: public/sierra-hillshade.webp  (1024×1280, RGBA)
"""

import io
import json
import math
import urllib.request
import numpy as np
from PIL import Image, ImageFilter

# ── Tile parameters ──────────────────────────────────────────────────────────

ZOOM = 8

# These tile ranges cover the Sierra Nevada plus some margin
TILE_X_MIN = 41  # corresponds to ~−122.3°
TILE_X_MAX = 44  # corresponds to ~−116.7° (inclusive)
TILE_Y_MIN = 97  # corresponds to ~40.0°N (north, y increases southward)
TILE_Y_MAX = 101 # corresponds to ~34.3°N (south, inclusive)

TILE_COLS = TILE_X_MAX - TILE_X_MIN + 1  # 4
TILE_ROWS = TILE_Y_MAX - TILE_Y_MIN + 1  # 5
CANVAS_W = TILE_COLS * 256  # 1024
CANVAS_H = TILE_ROWS * 256  # 1280

TERRARIUM_URL = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"

OUTPUT_PATH = "public/sierra-hillshade.webp"
BOUNDARY_PATH = "public/sierra-nevada-boundary.geojson"

# ── Projection helpers ────────────────────────────────────────────────────────

def lng_to_tile(lng, z):
    return math.floor((lng + 180) / 360 * (2 ** z))

def lat_to_tile(lat, z):
    lat_rad = math.radians(lat)
    return math.floor((1 - math.log(math.tan(lat_rad) + 1 / math.cos(lat_rad)) / math.pi) / 2 * (2 ** z))

def geo_to_pixel(lng, lat):
    """Convert geographic coordinates to canvas pixel position."""
    n = 2 ** ZOOM
    tx = (lng + 180) / 360 * n
    lat_rad = math.radians(lat)
    ty = (1 - math.log(math.tan(lat_rad) + 1 / math.cos(lat_rad)) / math.pi) / 2 * n
    px = (tx - TILE_X_MIN) * 256
    py = (ty - TILE_Y_MIN) * 256
    return px, py

# ── Elevation tile fetching ───────────────────────────────────────────────────

def fetch_tile_elevation(z, x, y):
    """Download one Terrarium tile and return a 256×256 float32 elevation array (meters)."""
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
    """Fetch all tiles and stitch into a CANVAS_H×CANVAS_W elevation grid."""
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

def compute_hillshade(elev, cell_size_m=490.0, azimuth_deg=315.0, altitude_deg=45.0):
    """
    Compute Lambertian hillshade using Horn's gradient formula.
    Returns a 0..1 float array (1 = fully illuminated, 0 = shadow).
    cell_size_m: approximate ground resolution per pixel at Sierra latitudes.
    """
    az_rad = math.radians(360 - azimuth_deg + 90)
    alt_rad = math.radians(altitude_deg)

    # Padded gradient via Horn's formula (vectorised)
    dz_dx = (
        np.roll(elev, -1, axis=1) * np.array([[[1,2,1]]])
        if False else
        (
            (np.roll(elev, -1, axis=1) - np.roll(elev, 1, axis=1)) / (2 * cell_size_m)
        )
    )
    dz_dy = (np.roll(elev, 1, axis=0) - np.roll(elev, -1, axis=0)) / (2 * cell_size_m)

    slope = np.arctan(np.sqrt(dz_dx**2 + dz_dy**2))
    aspect = np.arctan2(-dz_dy, dz_dx)

    shade = (
        np.cos(alt_rad) * np.cos(slope)
        + np.sin(alt_rad) * np.sin(slope) * np.cos(az_rad - aspect)
    )
    shade = np.clip(shade, 0, 1)
    return shade

# ── Color ramp ────────────────────────────────────────────────────────────────

# Warm-earthy ramp: shadows → dark tan-brown, lit faces → site bg cream (#FAFAF8).
# Significant warmth (R-B gap ≈ 36-48 in midtones) so terrain reads tan, not gray.
COLOR_RAMP = [
    (0.00, (26,  18,  12)),   # deep shadow  → warm black
    (0.22, (78,  60,  42)),   # heavy shadow → dark tan
    (0.45, (150, 128, 102)),  # midtone      → warm tan
    (0.68, (212, 196, 174)),  # soft lit     → warm sand
    (0.86, (236, 228, 213)),  # bright       → warm cream
    (1.00, (250, 248, 241)),  # full light   → site bg cream
]

def shade_to_rgb(shade_val):
    """Interpolate through COLOR_RAMP for a scalar shade value 0–1."""
    for i in range(1, len(COLOR_RAMP)):
        t0, c0 = COLOR_RAMP[i - 1]
        t1, c1 = COLOR_RAMP[i]
        if shade_val <= t1:
            a = (shade_val - t0) / (t1 - t0)
            return tuple(int(c0[k] + (c1[k] - c0[k]) * a) for k in range(3))
    return COLOR_RAMP[-1][1]

def apply_color_ramp(shade):
    """Vectorised color ramp → H×W×3 uint8 RGB array."""
    LUT_SIZE = 1000
    lut = np.zeros((LUT_SIZE, 3), dtype=np.uint8)
    for i in range(LUT_SIZE):
        lut[i] = shade_to_rgb(i / (LUT_SIZE - 1))
    indices = np.clip((shade * (LUT_SIZE - 1)).astype(np.int32), 0, LUT_SIZE - 1)
    return lut[indices]

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
    """Project a list of [lng, lat] pairs to canvas pixel coordinates."""
    return [geo_to_pixel(lng, lat) for lng, lat in coords]

def rasterize_polygon(pixel_rings, width, height):
    """
    Rasterize polygon rings into a boolean mask using scanline fill.
    Returns a (height, width) boolean array where True = inside polygon.
    """
    mask = np.zeros((height, width), dtype=bool)
    for ring in pixel_rings:
        pts = [(px, py) for px, py in ring]
        n = len(pts)
        for y in range(height):
            crossings = []
            for i in range(n):
                x0, y0 = pts[i]
                x1, y1 = pts[(i + 1) % n]
                if (y0 <= y < y1) or (y1 <= y < y0):
                    # Compute x at y
                    t = (y - y0) / (y1 - y0)
                    xc = x0 + t * (x1 - x0)
                    crossings.append(xc)
            crossings.sort()
            for i in range(0, len(crossings) - 1, 2):
                x_start = max(0, int(math.ceil(crossings[i])))
                x_end = min(width - 1, int(math.floor(crossings[i + 1])))
                if x_start <= x_end:
                    mask[y, x_start:x_end + 1] = True
    return mask

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=== Sierra Nevada Hillshade Generator ===\n")

    print("1. Building elevation grid from Terrarium tiles...")
    elev = build_elevation_grid()
    print(f"   Elevation range: {elev.min():.0f}m – {elev.max():.0f}m")

    print("\n2. Computing hillshade...")
    shade = compute_hillshade(elev)
    print(f"   Shade range: {shade.min():.3f} – {shade.max():.3f}")

    print("\n3. Applying warm-earthy color ramp...")
    rgb = apply_color_ramp(shade)

    print("\n4. Building soft alpha channel (feathered boundary)...")
    pixel_rings = [polygon_to_pixels(ring) for ring in load_boundary()]
    mask = rasterize_polygon(pixel_rings, CANVAS_W, CANVAS_H)

    # Gaussian blur on the binary mask creates a smooth fade at the edges.
    # Radius 40px ≈ 20 km at 490 m/px — wide enough to lose the polygon outline.
    BLUR_RADIUS = 40
    mask_img = Image.fromarray((mask.astype(np.uint8) * 255), "L")
    blurred = mask_img.filter(ImageFilter.GaussianBlur(BLUR_RADIUS))
    soft_alpha = np.array(blurred, dtype=np.float32) / 255.0

    # Additionally taper via elevation: flatten valley floors within the clip.
    # Pixels below ~600 m that happen to be inside the polygon fade out naturally.
    ELEV_LOW  = 400.0   # fully transparent below this
    ELEV_HIGH = 900.0   # fully opaque above this
    elev_fade = np.clip((elev - ELEV_LOW) / (ELEV_HIGH - ELEV_LOW), 0.0, 1.0)

    # Combine: boundary feathering controls the outer edge;
    # elevation fade softens any flat inland valley floors inside the clip.
    # Edge-margin fade: linearly taper alpha to 0 within EDGE_MARGIN pixels of
    # all four canvas edges.  This prevents a hard line when the boundary polygon
    # sits very close to the canvas edge and the Gaussian blur gets clipped there.
    EDGE_MARGIN = 80
    ey = np.ones(CANVAS_H, dtype=np.float32)
    ey[:EDGE_MARGIN] = np.linspace(0, 1, EDGE_MARGIN)
    ey[-EDGE_MARGIN:] = np.linspace(1, 0, EDGE_MARGIN)
    ex = np.ones(CANVAS_W, dtype=np.float32)
    ex[:EDGE_MARGIN] = np.linspace(0, 1, EDGE_MARGIN)
    ex[-EDGE_MARGIN:] = np.linspace(1, 0, EDGE_MARGIN)
    edge_fade = ey[:, np.newaxis] * ex[np.newaxis, :]

    alpha = soft_alpha * elev_fade * edge_fade
    # Slightly boost so the main mountain body stays fully opaque.
    alpha = np.clip(alpha * 1.4, 0.0, 1.0)

    # Assemble RGBA
    rgba = np.zeros((CANVAS_H, CANVAS_W, 4), dtype=np.uint8)
    rgba[:, :, :3] = rgb
    rgba[:, :, 3] = (alpha * 255).astype(np.uint8)

    print(f"   Opaque pixels (alpha>200): {(rgba[:,:,3]>200).sum():,} / {CANVAS_W * CANVAS_H:,}")

    print(f"\n5. Saving to {OUTPUT_PATH}...")
    img = Image.fromarray(rgba, "RGBA")
    img.save(OUTPUT_PATH, "WEBP", quality=85, lossless=False)
    print(f"   Saved {img.width}×{img.height} RGBA WEBP")

    print("\nDone.")

if __name__ == "__main__":
    main()
