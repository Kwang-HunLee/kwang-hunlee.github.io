#!/usr/bin/env python3
"""Publish one day of scEDI drought PNGs into drought/data/<date>/ and update index.json.

Usage:
  python drought/scripts/publish_day.py 2026-09-02
  python drought/scripts/publish_day.py 2026-09-02 /path/to/src_dir

Expected filenames (copied if present):
  scEDI_PREC_VDD_AWRI_2x2_<date>.png
  scEDI_contour_DEM_<date>.png
  Province_scEDI_map_<date>.png   (optional)

If src_dir is omitted, the script looks under the default Dropbox SIG folder
and the Korea scEDI analysis root for the province map.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
from pathlib import Path

DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")

REQUIRED = [
    ("scEDI_PREC_VDD_AWRI_2x2", "scEDI_PREC_VDD_AWRI_2x2_{date}.png"),
    ("scEDI_contour_DEM", "scEDI_contour_DEM_{date}.png"),
]
OPTIONAL = [
    ("Province_scEDI_map", "Province_scEDI_map_{date}.png"),
]

DEFAULT_SIG = Path("/workspace/korea-scedi/SIG")
DEFAULT_ROOT = Path("/workspace/korea-scedi")


def repo_drought_dir() -> Path:
    # .../drought/scripts/publish_day.py -> .../drought
    return Path(__file__).resolve().parents[1]


def load_index(path: Path) -> dict:
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return {"dates": []}


def save_index(path: Path, data: dict) -> None:
    dates = data.get("dates") or []
    dates.sort(key=lambda e: e.get("date", ""), reverse=True)
    data["dates"] = dates
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def find_source(filename: str, date: str, src_dir: Path | None) -> Path | None:
    candidates: list[Path] = []
    if src_dir is not None:
        candidates.append(src_dir / filename)
    # SIG/<date>/ then SIG/ then Korea scEDI root
    candidates.extend(
        [
            DEFAULT_SIG / date / filename,
            DEFAULT_SIG / filename,
            DEFAULT_ROOT / filename,
        ]
    )
    for c in candidates:
        if c.is_file():
            return c
    return None


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("date", help="ISO date YYYY-MM-DD")
    parser.add_argument(
        "src_dir",
        nargs="?",
        default=None,
        help="Optional directory containing the PNG exports for this date",
    )
    args = parser.parse_args(argv)

    if not DATE_RE.match(args.date):
        print(f"error: date must be YYYY-MM-DD, got {args.date!r}", file=sys.stderr)
        return 2

    src_dir = Path(args.src_dir).expanduser().resolve() if args.src_dir else None
    if src_dir is not None and not src_dir.is_dir():
        print(f"error: src_dir is not a directory: {src_dir}", file=sys.stderr)
        return 2

    drought = repo_drought_dir()
    data_dir = drought / "data"
    day_dir = data_dir / args.date
    index_path = data_dir / "index.json"
    day_dir.mkdir(parents=True, exist_ok=True)

    flags: dict[str, bool] = {}
    copied = []
    missing_required = []

    for key, pattern in REQUIRED + OPTIONAL:
        filename = pattern.format(date=args.date)
        src = find_source(filename, args.date, src_dir)
        optional = key.startswith("Province")
        if src is None:
            flags[key] = False
            if optional:
                print(f"skip (optional missing): {filename}")
            else:
                missing_required.append(filename)
                print(f"missing required: {filename}", file=sys.stderr)
            continue
        dest = day_dir / filename
        shutil.copy2(src, dest)
        flags[key] = True
        copied.append(f"{src} -> {dest}")
        print(f"copied: {filename}")

    if missing_required:
        print("error: required PNG(s) not found; index not updated.", file=sys.stderr)
        return 1

    index = load_index(index_path)
    dates = [e for e in index.get("dates", []) if e.get("date") != args.date]
    dates.append({"date": args.date, "files": flags})
    index["dates"] = dates
    save_index(index_path, index)

    print(f"updated {index_path}")
    for line in copied:
        print(line)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
