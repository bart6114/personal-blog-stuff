# /// script
# requires-python = ">=3.11"
# dependencies = ["fitdecode==0.11.0", "matplotlib==3.11.2"]
# ///
"""Summarize RunGap FIT sessions and draw a calendar using daily timer duration.

Run from src/, for example:
uv run scripts/running-year.py --source /path/to/RunGap/Export \
    --through 2026-10-01 --output-dir public/media/an-ai-agent-for-my-running-schedule

Only aggregate dates, distances and durations are written to the public output.
"""

import argparse
import calendar
import json
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from datetime import date, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

import fitdecode
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

INK = "#232333"
MUTED = (35 / 255, 35 / 255, 51 / 255, 0.7)
RULE = (35 / 255, 35 / 255, 51 / 255, 0.24)
SURFACE = "#f7f7f8"
COLORS = [SURFACE, "#e5eadb", "#c8d2b5", "#a6b488", "#7d9164"]
TZ = ZoneInfo("Europe/Brussels")


def read_sessions(path):
    sessions = []
    with fitdecode.FitReader(path) as reader:
        for frame in reader:
            if isinstance(frame, fitdecode.FitDataMessage) and frame.name == "session":
                values = {field.name: field.value for field in frame.fields}
                start = values["start_time"].astimezone(TZ)
                sessions.append({
                    "start": start,
                    "date": start.date(),
                    "sport": values["sport"],
                    "distance_m": values.get("total_distance"),
                    "timer_s": values.get("total_timer_time"),
                    "elapsed_s": values.get("total_elapsed_time"),
                })
    if not sessions:
        raise ValueError(f"No FIT session found: {path.name}")
    return sessions


def aggregate(source, through):
    year = through.year
    patterns = (f"{year}-*.fit", f"{year - 1}-12-31*.fit", f"{year + 1}-01-01*.fit")
    files = sorted({path for pattern in patterns for path in source.glob(pattern)})
    if not files:
        raise ValueError("No matching FIT files found")
    with ThreadPoolExecutor(max_workers=6) as pool:
        sessions = [session for group in pool.map(read_sessions, files) for session in group]
    runs = []
    seen = set()
    duplicates = 0
    for session in sorted(sessions, key=lambda item: item["start"]):
        if session["sport"] != "running" or not date(year, 1, 1) <= session["date"] <= through:
            continue
        for field in ("distance_m", "timer_s", "elapsed_s"):
            if session[field] is None or session[field] < 0:
                raise ValueError(f"Missing or invalid {field}: {session['start']}")
        key = (session["start"], session["distance_m"], session["timer_s"])
        if key in seen:
            duplicates += 1
            continue
        seen.add(key)
        runs.append(session)
    for previous, current in zip(runs, runs[1:]):
        if (current["start"] - previous["start"]).total_seconds() < previous["elapsed_s"]:
            raise ValueError("Overlapping running sessions need manual duplicate review")
    daily = defaultdict(lambda: {"runs": 0, "distance_km": 0, "timer_minutes": 0})
    for run in runs:
        day = daily[run["date"].isoformat()]
        day["runs"] += 1
        day["distance_km"] += run["distance_m"] / 1000
        day["timer_minutes"] += run["timer_s"] / 60
    monthly = []
    for month in range(1, through.month + 1):
        days = [value for key, value in daily.items() if int(key[5:7]) == month]
        monthly.append({"month": f"{year}-{month:02}", "runs": sum(d["runs"] for d in days),
                        "running_days": len(days), "distance_km": sum(d["distance_km"] for d in days),
                        "timer_hours": sum(d["timer_minutes"] for d in days) / 60})
    return {
        "year": year,
        "through": through.isoformat(),
        "method": {"timezone": "Europe/Brussels", "included_sport": "running",
                   "distance_field": "session.total_distance", "duration_field": "session.total_timer_time",
                   "heatmap": "Sum of running timer minutes per local calendar day",
                   "empty_days": "No recorded running session; other sports are excluded",
                   "deduplication": "Identical start time, distance and timer duration; overlapping sessions require review",
                   "input_files": len(files), "parsed_sessions": len(sessions), "duplicates_removed": duplicates},
        "summary": {"runs": len(runs), "running_days": len(daily),
                    "distance_km": sum(r["distance_m"] for r in runs) / 1000,
                    "timer_hours": sum(r["timer_s"] for r in runs) / 3600},
        "monthly": monthly,
        "daily": dict(sorted(daily.items())),
    }


def draw_heatmap(data, output, columns):
    mobile = columns == 2
    width = 480 if mobile else 720
    month_width = (width - 48) / columns
    month_height = 205
    height = 150 + (12 // columns) * month_height + 95
    fig = plt.figure(figsize=(width / 100, height / 100), dpi=150, facecolor="white")
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set(xlim=(0, width), ylim=(height, 0))
    ax.axis("off")
    ax.text(24, 32, f"My {data['year']} running", fontsize=20, weight="bold", color=INK)
    through = date.fromisoformat(data["through"])
    ax.text(24, 57, f"Recorded runs · 1 Jan to {through.day} {through:%b %Y}", fontsize=10, color=MUTED)
    summary = data["summary"]
    total_minutes = round(summary["timer_hours"] * 60)
    stats = [(f"{summary['runs']}", "runs"), (f"{summary['distance_km']:,.0f}", "km"),
             (f"{total_minutes // 60}h {total_minutes % 60:02}m", "running time")]
    for index, (value, label) in enumerate(stats):
        x = 24 + index * (width - 48) / 3
        ax.text(x, 94, value, fontsize=17 if mobile else 19, weight="bold", color=INK)
        ax.text(x, 115, label, fontsize=10, color=MUTED)
    year = data["year"]
    cell = 21
    step = 25
    for month in range(1, 13):
        x0 = 24 + ((month - 1) % columns) * month_width
        y0 = 151 + ((month - 1) // columns) * month_height
        ax.text(x0, y0, calendar.month_abbr[month], fontsize=12, weight="bold", color=INK if month <= through.month else MUTED)
        for weekday, label in enumerate(["M", "T", "W", "T", "F", "S", "S"]):
            ax.text(x0 + weekday * step + cell / 2, y0 + 20, label, fontsize=8, ha="center", color=MUTED)
        first_weekday, days = calendar.monthrange(year, month)
        for day in range(1, days + 1):
            current = date(year, month, day)
            week, weekday = divmod(first_weekday + day - 1, 7)
            x = x0 + weekday * step
            y = y0 + 29 + week * step
            if current > through:
                ax.add_patch(Rectangle((x, y), cell, cell, facecolor="white", edgecolor=RULE, linewidth=0.5))
                continue
            minutes = data["daily"].get(current.isoformat(), {}).get("timer_minutes", 0)
            level = 0 if minutes == 0 else 1 if minutes < 30 else 2 if minutes < 60 else 3 if minutes < 90 else 4
            patch = Rectangle((x, y), cell, cell, facecolor=COLORS[level], linewidth=0)
            patch.set_gid(f"day-{current.isoformat()}-{minutes:.1f}-minutes")
            ax.add_patch(patch)
    y0 = height - 65
    ax.text(24, y0 - 15, "Running minutes per day", fontsize=10, color=INK)
    for index, label in enumerate(["0", "<30", "30–59", "60–89", "90+"]):
        x = 24 + index * (width - 48) / 5
        ax.add_patch(Rectangle((x, y0), 14, 14, facecolor=COLORS[index], linewidth=0))
        ax.text(x + 20, y0 + 11, label, fontsize=9, color=INK)
    ax.text(24, height - 16, "Source: RunGap FIT exports · Future dates outlined", fontsize=9, color=MUTED)
    plt.rcParams["svg.fonttype"] = "none"
    plt.rcParams["svg.hashsalt"] = f"barts-running-{year}"
    suffix = "-mobile" if mobile else ""
    svg_path = output / f"running-{year}{suffix}.svg"
    fig.savefig(svg_path, metadata={"Date": None})
    svg_path.write_text("\n".join(line.rstrip() for line in svg_path.read_text().splitlines()) + "\n")
    fig.savefig(output / f"running-{year}{suffix}.png", dpi=150)
    plt.close(fig)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--through", type=date.fromisoformat, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    args = parser.parse_args()
    data = aggregate(args.source, args.through)
    args.output_dir.mkdir(parents=True, exist_ok=True)
    (args.output_dir / f"running-{data['year']}-summary.json").write_text(json.dumps(data, indent=2) + "\n")
    draw_heatmap(data, args.output_dir, 3)
    draw_heatmap(data, args.output_dir, 2)
    print(json.dumps({"summary": data["summary"], "method": data["method"], "monthly": data["monthly"]}, indent=2))


if __name__ == "__main__":
    main()
