#!/usr/bin/env python3
"""Extract GPS metadata from a folder of photos into a gpx-story photos.json.

Uses macOS Spotlight metadata (mdls), so it works on DNG/JPEG/HEIC without
extra dependencies. Includes a stale-GPS-fix correction pass: in the mountains
phones sometimes tag a photo with a cached location kilometers away; such
outliers are detected against the consensus of temporally-neighboring photos
and relocated by time interpolation between trusted neighbors.

Usage:
    python3 extract_photos.py "~/Photos/hike folder" -o photos.json \
        [--full-prefix photos/full/] [--thumb-prefix photos/thumb/]
"""
import argparse
import glob
import json
import math
import os
import re
import subprocess
from datetime import datetime

IMG_EXTS = ('.dng', '.jpg', '.jpeg', '.heic', '.png', '.tif', '.tiff')

# fastest plausible sustained movement between photos (m/s); ~6 km/h hiking.
# raise via --max-speed for e.g. trail running or cycling tracks
MAX_SPEED = 1.7
# neighbors within this many seconds are used to judge a photo
WINDOW_S = 15 * 60
# need at least this many neighbors to judge
MIN_NEIGHBORS = 2
# clamp tiny time gaps (burst shots) so speed isn't divide-by-noise
MIN_DT = 10.0


def haversine(a, b):
    R = 6371000
    dlat = math.radians(b['lat'] - a['lat'])
    dlon = math.radians(b['lon'] - a['lon'])
    h = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(a['lat'])) * math.cos(math.radians(b['lat']))
         * math.sin(dlon / 2) ** 2)
    return 2 * R * math.asin(math.sqrt(h))


def mdls(path):
    out = subprocess.run(
        ['mdls', '-name', 'kMDItemLatitude', '-name', 'kMDItemLongitude',
         '-name', 'kMDItemAltitude', '-name', 'kMDItemContentCreationDate', path],
        capture_output=True, text=True).stdout
    d = {}
    for line in out.splitlines():
        m = re.match(r'(\w+)\s+= (.+)', line)
        if m:
            d[m.group(1)] = m.group(2).strip()

    def num(k):
        v = d.get(k, '(null)')
        return None if '(null)' in v else float(v)

    return {
        'lat': num('kMDItemLatitude'),
        'lon': num('kMDItemLongitude'),
        'alt': num('kMDItemAltitude'),
        'time': d.get('kMDItemContentCreationDate') or None,
    }


def parse_time(t):
    return datetime.strptime(t, '%Y-%m-%d %H:%M:%S %z') if t else None


def fix_stale_gps(photos):
    """Detect photos whose GPS disagrees with temporally-close photos and
    relocate them by interpolating between trusted neighbors. Returns the
    ids of corrected photos."""
    located = [p for p in photos if p['lat'] is not None and p['_t'] is not None]
    located.sort(key=lambda p: p['_t'])
    fixed = []

    # detection: a photo is an outlier when reaching most of its temporal
    # neighbors would require impossibly fast movement. Stale fixes only get
    # "support" from other stale fixes, so majority vote isolates them.
    for _round in range(3):  # re-vote as outliers drop out of the electorate
        outliers = []
        for p in located:
            if p.get('_outlier'):
                continue
            nbrs = [q for q in located
                    if q is not p and not q.get('_outlier')
                    and abs((q['_t'] - p['_t']).total_seconds()) <= WINDOW_S]
            if len(nbrs) < MIN_NEIGHBORS:
                continue
            support = sum(
                1 for q in nbrs
                if haversine(p, q) / max(abs((q['_t'] - p['_t']).total_seconds()),
                                         MIN_DT) <= MAX_SPEED)
            if support / len(nbrs) < 0.5:
                outliers.append(p)
        for p in outliers:
            p['_outlier'] = True
        if not outliers:
            break

    # relocation: time-interpolate between the nearest trusted photos
    trusted = [p for p in located if not p.get('_outlier')]
    for p in located:
        if not p.get('_outlier'):
            continue
        before = [q for q in trusted if q['_t'] <= p['_t']]
        after = [q for q in trusted if q['_t'] > p['_t']]
        a = before[-1] if before else None
        b = after[0] if after else None
        if a and b:
            span = (b['_t'] - a['_t']).total_seconds() or 1
            f = (p['_t'] - a['_t']).total_seconds() / span
            new = {'lat': a['lat'] + f * (b['lat'] - a['lat']),
                   'lon': a['lon'] + f * (b['lon'] - a['lon'])}
        elif a or b:
            ref = a or b
            new = {'lat': ref['lat'], 'lon': ref['lon']}
        else:
            continue
        print(f"  fixed {p['id']}: moved {haversine(p, new):.0f} m "
              f"({p['lat']:.5f},{p['lon']:.5f} -> {new['lat']:.5f},{new['lon']:.5f})")
        p['lat'], p['lon'] = round(new['lat'], 6), round(new['lon'], 6)
        p['alt'] = None  # the altitude from a stale fix is equally wrong
        p['gpsFixed'] = True
        fixed.append(p['id'])
    return fixed


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('folder', help='folder with the original photos')
    ap.add_argument('-o', '--out', default='photos.json')
    ap.add_argument('--full-prefix', default='photos/full/')
    ap.add_argument('--thumb-prefix', default='photos/thumb/')
    args = ap.parse_args()

    folder = os.path.expanduser(args.folder)
    files = sorted(f for f in glob.glob(os.path.join(folder, '*'))
                   if f.lower().endswith(IMG_EXTS))
    if not files:
        raise SystemExit(f'no images found in {folder}')

    photos = []
    for f in files:
        base = os.path.splitext(os.path.basename(f))[0]
        meta = mdls(f)
        photos.append({
            'id': base,
            'full': args.full_prefix + base + '.jpg',
            'thumb': args.thumb_prefix + base + '.jpg',
            **meta,
            '_t': parse_time(meta['time']),
        })

    print(f'{len(photos)} photos, '
          f'{sum(1 for p in photos if p["lat"] is None)} without GPS')
    fixed = fix_stale_gps(photos)
    print(f'{len(fixed)} stale GPS fixes corrected' if fixed
          else 'no stale GPS fixes found')

    for p in photos:
        p.pop('_t', None)
        p.pop('_outlier', None)
    with open(args.out, 'w') as fh:
        json.dump(photos, fh, indent=1)
    print(f'wrote {args.out}')


if __name__ == '__main__':
    main()
