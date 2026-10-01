# /// script
# requires-python = ">=3.11"
# dependencies = ["fitdecode==0.11.0", "matplotlib==3.11.2"]
# ///
"""Summarize RunGap FIT sessions and draw 52 weekly blocks for a calendar year.

Run from src/, for example:
uv run scripts/running-year.py --source /path/to/RunGap/Export \
    --through 2026-10-01 --output-dir public/media/an-ai-agent-for-my-running-schedule

Only aggregate dates, distances and durations are written to the public output.
"""

import argparse
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
    return {
        "year": year,
        "through": through.isoformat(),
        "method": {"timezone": "Europe/Brussels", "included_sport": "running",
                   "distance_field": "session.total_distance", "duration_field": "session.total_timer_time",
                   "heatmap": "Running timer hours in 52 consecutive periods from January 1; periods 1-51 are seven days and period 52 includes the remaining days of the year",
                   "empty_weeks": "No recorded running session; other sports are excluded",
                   "deduplication": "Identical start time, distance and timer duration; overlapping sessions require review",
                   "input_files": len(files), "parsed_sessions": len(sessions), "duplicates_removed": duplicates},
        "summary": {"runs": len(runs), "running_days": len(daily),
                    "distance_km": sum(r["distance_m"] for r in runs) / 1000,
                    "timer_hours": sum(r["timer_s"] for r in runs) / 3600},
        "weekly": weekly_from_daily(year, through, daily),
    }


def weekly_from_daily(year, through, daily):
    first = date(year, 1, 1)
    last = date(year, 12, 31)
    weekly = []
    for index in range(52):
        start = first + timedelta(days=7 * index)
        end = last if index == 51 else start + timedelta(days=6)
        recorded_end = min(end, through)
        days = [daily.get((start + timedelta(days=offset)).isoformat(), {})
                for offset in range(max(0, (recorded_end - start).days + 1))]
        weekly.append({
            "week": index + 1,
            "start": start.isoformat(),
            "end": end.isoformat(),
            "status": "future" if start > through else "partial" if end > through else "complete",
            "runs": sum(day.get("runs", 0) for day in days),
            "running_days": sum(bool(day) for day in days),
            "distance_km": sum(day.get("distance_km", 0) for day in days),
            "timer_hours": sum(day.get("timer_minutes", 0) for day in days) / 60,
        })
    return weekly


def draw_heatmap(data, output, columns):
    mobile = columns == 8
    width = 480 if mobile else 720
    cell = 46 if mobile else 40
    gap = 8 if mobile else 10
    rows = (52 + columns - 1) // columns
    height = 160 + rows * (cell + gap) + 90
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
    ax.text(24, 146, "Weeks 01–52 · read left to right, top to bottom", fontsize=10, color=MUTED)
    for index, week in enumerate(data["weekly"]):
        row, column = divmod(index, columns)
        row_items = min(columns, 52 - row * columns)
        row_width = row_items * cell + (row_items - 1) * gap
        x = (width - row_width) / 2 + column * (cell + gap)
        y = 160 + row * (cell + gap)
        if week["status"] == "future":
            patch = Rectangle((x, y), cell, cell, facecolor="white", edgecolor=RULE, linewidth=0.5)
            label_color = MUTED
        else:
            hours = week["timer_hours"]
            level = 0 if hours == 0 else 1 if hours < 2 else 2 if hours < 4 else 3 if hours < 6 else 4
            patch = Rectangle((x, y), cell, cell, facecolor=COLORS[level], linewidth=0)
            label_color = "white" if level == 4 else INK
        patch.set_gid(f"week-{week['week']:02}-{week['start']}-to-{week['end']}-{week['timer_hours']:.2f}-hours")
        ax.add_patch(patch)
        ax.text(x + cell / 2, y + cell / 2 + (4 if mobile else 3), f"{week['week']:02}",
                fontsize=11 if mobile else 10, ha="center", color=label_color)
    ax.text(24, height - 65, "Running hours per week · light to dark: 0, <2, 2–4, 4–6, 6+", fontsize=10, color=INK)
    ax.text(24, height - 20, "Source: RunGap FIT exports · Future weeks outlined", fontsize=9, color=MUTED)
    plt.rcParams["svg.fonttype"] = "none"
    plt.rcParams["svg.hashsalt"] = f"barts-running-{data['year']}"
    suffix = "-mobile" if mobile else ""
    svg_path = output / f"running-{data['year']}{suffix}.svg"
    fig.savefig(svg_path, metadata={"Date": None})
    svg_path.write_text("\n".join(line.rstrip() for line in svg_path.read_text().splitlines()) + "\n")
    fig.savefig(output / f"running-{data['year']}{suffix}.png", dpi=150)
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
    draw_heatmap(data, args.output_dir, 13)
    draw_heatmap(data, args.output_dir, 8)
    print(json.dumps({"summary": data["summary"], "method": data["method"]}, indent=2))


if __name__ == "__main__":
    main()
