#!/usr/bin/env python3
"""
Generate Sierra Nevada hillshade PNG for the Adventures map.

Downloads SRTM elevation tiles (Terrarium format) from AWS and computes
a hillshade with a blue-gray hypsometric color ramp. Output is clipped
to the Sierra Nevada boundary polygon.

Usage: python3 scripts/generate-sierra-hillshade.py
Output: public/sierra-hillshade.png   (1024×1280, RGBA)
        public/sierra-nevada-boundary.geojson  (if not already present)
"""

import io
import json
import math
import urllib.request
import numpy as np
from PIL import Image

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

# Maps normalized hillshade (0=shadow, 1=lit) to RGBA.
# Dark navy in shadow → icy white on fully lit faces.
# This matches the blue-gray minimalist aesthetic of the reference image.
COLOR_RAMP = [
    (0.00, (10,  30,  50,  255)),  # deep shadow → dark navy
    (0.20, (35,  75, 110,  255)),  # mid shadow  → dark teal
    (0.42, (75, 125, 160,  255)),  # partial light → steel blue
    (0.62, (140, 180, 205, 255)),  # mostly lit   → light blue
    (0.80, (200, 220, 232, 255)),  # bright       → pale blue
    (1.00, (240, 245, 248, 255)),  # fully lit    → near white
]

def shade_to_rgba(shade_val):
    """Interpolate through COLOR_RAMP for a scalar shade value 0–1."""
    for i in range(1, len(COLOR_RAMP)):
        t0, c0 = COLOR_RAMP[i - 1]
        t1, c1 = COLOR_RAMP[i]
        if shade_val <= t1:
            alpha = (shade_val - t0) / (t1 - t0)
            return tuple(int(c0[k] + (c1[k] - c0[k]) * alpha) for k in range(4))
    return COLOR_RAMP[-1][1]

def apply_color_ramp(shade):
    """Vectorised color ramp application. Returns H×W×4 uint8 RGBA array."""
    h, w = shade.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)

    # Build lookup table (1000 steps for smooth interpolation)
    LUT_SIZE = 1000
    lut = np.zeros((LUT_SIZE, 4), dtype=np.uint8)
    for i in range(LUT_SIZE):
        t = i / (LUT_SIZE - 1)
        lut[i] = shade_to_rgba(t)

    indices = np.clip((shade * (LUT_SIZE - 1)).astype(np.int32), 0, LUT_SIZE - 1)
    rgba[:, :, :] = lut[indices]
    return rgba

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

    print("\n3. Applying blue-gray color ramp...")
    rgba = apply_color_ramp(shade)

    print("\n4. Loading Sierra Nevada boundary and creating mask...")
    pixel_rings = [polygon_to_pixels(ring) for ring in load_boundary()]

    print("   Rasterizing boundary polygon (this may take a moment)...")
    mask = rasterize_polygon(pixel_rings, CANVAS_W, CANVAS_H)
    print(f"   Masked pixels: {mask.sum():,} / {CANVAS_W * CANVAS_H:,}")

    # Apply mask: set alpha=0 outside boundary
    rgba[:, :, 3] = np.where(mask, 255, 0)

    print(f"\n5. Saving to {OUTPUT_PATH}...")
    img = Image.fromarray(rgba, "RGBA")
    img.save(OUTPUT_PATH, "WEBP", quality=85)
    print(f"   Saved {img.width}×{img.height} RGBA WEBP")

    print("\nDone.")

if __name__ == "__main__":
    main()
