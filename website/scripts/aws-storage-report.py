#!/usr/bin/env python3
"""AWS S3 storage report for inspectionwale.

Produces:
- Marketplace per-listing image usage (bucket: inspectionwale-car-listings)
- Inspection report PDF size stats (bucket: inspectionwale-reports)

Requires:
- AWS CLI v2 configured (`aws sts get-caller-identity` works)
- Python 3.9+

Example:
  python scripts/aws-storage-report.py --marketplace --reports

Notes:
- Free-tier projections assume 5 GB S3 Standard storage.
- Marketplace listing metadata is fetched from the public API used by the site.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import os
import re
import subprocess
import sys
import time
import urllib.request
from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Optional, Sequence, Set, Tuple


MARKETPLACE_BUCKET = "inspectionwale-car-listings"
REPORTS_BUCKET = "inspectionwale-reports"
MARKETPLACE_API_ENDPOINT = "https://423cmvhw3g.execute-api.us-east-1.amazonaws.com/prod/customer-listings"

S3_PUBLIC_BASES = [
    "https://inspectionwale-car-listings.s3.amazonaws.com/",
    "https://inspectionwale-car-listings.s3.us-east-1.amazonaws.com/",
    "https://inspectionwale-car-listings.s3-us-east-1.amazonaws.com/",
]

SUBMISSION_PREFIX_RE = re.compile(r"^(submissions/sub_[0-9a-fA-F\-]+/)")


@dataclass(frozen=True)
class PrefixStats:
    prefix: str
    object_count: int
    total_bytes: int


def run_aws_json(args: Sequence[str], *, retries: int = 2, retry_sleep_s: float = 0.8) -> Any:
    """Run an aws cli command that returns JSON."""
    cmd = ["aws", *args, "--output", "json"]
    last_err: Optional[str] = None
    for attempt in range(retries + 1):
        try:
            completed = subprocess.run(
                cmd,
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
            )
            return json.loads(completed.stdout or "{}")
        except subprocess.CalledProcessError as e:
            last_err = (e.stderr or e.stdout or str(e)).strip()
            if attempt < retries:
                time.sleep(retry_sleep_s * (attempt + 1))
                continue
            raise RuntimeError(f"AWS CLI failed: {' '.join(cmd)}\n{last_err}") from e
        except json.JSONDecodeError as e:
            raise RuntimeError(f"AWS CLI returned non-JSON output: {' '.join(cmd)}") from e


def list_prefix_stats(bucket: str, prefix: str) -> PrefixStats:
    """Sum object sizes under a prefix (handles pagination)."""
    object_count = 0
    total_bytes = 0
    continuation: Optional[str] = None

    while True:
        args = ["s3api", "list-objects-v2", "--bucket", bucket, "--prefix", prefix]
        if continuation:
            args += ["--continuation-token", continuation]
        data = run_aws_json(args)

        contents = data.get("Contents") or []
        for obj in contents:
            size = int(obj.get("Size") or 0)
            object_count += 1
            total_bytes += size

        if data.get("IsTruncated"):
            continuation = data.get("NextContinuationToken")
            if not continuation:
                break
        else:
            break

    return PrefixStats(prefix=prefix, object_count=object_count, total_bytes=total_bytes)


def unwrap_value(value: Any) -> Any:
    if not isinstance(value, dict):
        return value
    if "S" in value and isinstance(value["S"], str):
        return value["S"]
    if "url" in value and isinstance(value["url"], str):
        return value["url"]
    if "key" in value and isinstance(value["key"], str):
        return value["key"]
    return value


def normalize_to_s3_key(value: Any) -> str:
    """Convert a listing photo value (URL or key-ish) to an S3 object key."""
    raw = unwrap_value(value)
    if not raw:
        return ""
    if not isinstance(raw, str):
        return ""

    candidate = raw.strip()
    if not candidate:
        return ""

    # data:/blob: are not stored in S3
    if candidate.lower().startswith("data:") or candidate.lower().startswith("blob:"):
        return ""

    # If it's a full URL, strip known bases.
    for base in S3_PUBLIC_BASES:
        if candidate.startswith(base):
            return candidate[len(base) :].lstrip("/")

    # If it looks like an S3 URL but with another hostname, try a generic parse.
    if candidate.lower().startswith("http") and "/" in candidate:
        # Best-effort: keep path part after the host.
        try:
            from urllib.parse import urlparse

            parsed = urlparse(candidate)
            path = (parsed.path or "").lstrip("/")
            # Only accept if it looks like our submissions layout.
            if path.startswith("submissions/"):
                return path
        except Exception:
            return ""

    # Otherwise assume it's already a key-ish string.
    candidate = candidate.lstrip("/")
    if candidate.startswith("submissions/"):
        return candidate

    # Some items might store keys without the leading submissions/
    if candidate.startswith("sub_"):
        return f"submissions/{candidate}"

    return ""


def extract_listing_photo_keys(listing: Dict[str, Any]) -> List[str]:
    keys: List[str] = []
    seen: Set[str] = set()

    hero = listing.get("heroUrl")
    hero_key = normalize_to_s3_key(hero)
    if hero_key and hero_key not in seen:
        keys.append(hero_key)
        seen.add(hero_key)

    photos = listing.get("photos") or {}
    if isinstance(photos, dict):
        for _, val in photos.items():
            key = normalize_to_s3_key(val)
            if key and key not in seen:
                keys.append(key)
                seen.add(key)
    elif isinstance(photos, list):
        for val in photos:
            key = normalize_to_s3_key(val)
            if key and key not in seen:
                keys.append(key)
                seen.add(key)

    return keys


def extract_submission_prefixes(keys: Iterable[str]) -> List[str]:
    prefixes: Set[str] = set()
    for key in keys:
        m = SUBMISSION_PREFIX_RE.match(key)
        if m:
            prefixes.add(m.group(1))
    return sorted(prefixes)


def fmt_bytes(num_bytes: int) -> str:
    if num_bytes < 1024:
        return f"{num_bytes} B"
    units = ["KB", "MB", "GB", "TB"]
    size = float(num_bytes)
    for unit in units:
        size /= 1024.0
        if size < 1024.0:
            return f"{size:.2f} {unit}"
    return f"{size:.2f} PB"


def bytes_to_gb_decimal(num_bytes: int) -> float:
    # S3 pricing uses GB (10^9 bytes), not GiB.
    return float(num_bytes) / 1_000_000_000.0


def fmt_money(amount: float) -> str:
    return f"${amount:,.2f}"


def safe_mkdir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def build_listing_title(listing: Dict[str, Any]) -> str:
    car = listing.get("car") or {}
    make = unwrap_value(car.get("make")) if isinstance(car, dict) else ""
    model = unwrap_value(car.get("model")) if isinstance(car, dict) else ""
    edition = unwrap_value(car.get("edition")) if isinstance(car, dict) else ""
    title = f"{make or ''} {model or ''} {edition or ''}".strip()
    return re.sub(r"\s+", " ", title) or (listing.get("listingId") or "Listing")


def fetch_marketplace_listings() -> List[Dict[str, Any]]:
    req = urllib.request.Request(
        MARKETPLACE_API_ENDPOINT,
        headers={"Accept": "application/json", "User-Agent": "inspectionwale-storage-report/1.0"},
        method="GET",
    )
    with urllib.request.urlopen(req, timeout=25) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    if not data.get("ok") or not isinstance(data.get("items"), list):
        raise RuntimeError(f"Unexpected API response from {MARKETPLACE_API_ENDPOINT}: {data!r}")

    # Filter out non-dict items defensively.
    return [x for x in data["items"] if isinstance(x, dict)]


def compute_marketplace_report(
    *,
    free_tier_gb: float,
    top_n: int,
    csv_out_dir: Optional[str],
    estimate_cost: bool,
    storage_price_per_gb_month: float,
    project_marketplace_count: Optional[int],
) -> None:
    listings = fetch_marketplace_listings()

    per_listing_rows: List[Tuple[int, int, str, str, List[str]]] = []
    # (bytes, objects, title, listingId, prefixes)

    prefix_cache: Dict[str, PrefixStats] = {}

    for listing in listings:
        listing_id = str(listing.get("listingId") or "")
        title = build_listing_title(listing)
        keys = extract_listing_photo_keys(listing)
        prefixes = extract_submission_prefixes(keys)

        total_bytes = 0
        total_objects = 0
        for prefix in prefixes:
            stats = prefix_cache.get(prefix)
            if not stats:
                stats = list_prefix_stats(MARKETPLACE_BUCKET, prefix)
                prefix_cache[prefix] = stats
            total_bytes += stats.total_bytes
            total_objects += stats.object_count

        per_listing_rows.append((total_bytes, total_objects, title, listing_id, prefixes))

    per_listing_rows.sort(key=lambda r: r[0], reverse=True)

    total_cars = len(per_listing_rows)
    total_bytes_all = sum(r[0] for r in per_listing_rows)
    avg_bytes = int(total_bytes_all / total_cars) if total_cars else 0

    nonzero_rows = [r for r in per_listing_rows if r[0] > 0 and r[1] > 0]
    nonzero_count = len(nonzero_rows)
    nonzero_total = sum(r[0] for r in nonzero_rows)
    nonzero_avg = int(nonzero_total / nonzero_count) if nonzero_count else 0

    # Exclude the single largest listing to show a more stable average.
    trimmed_rows = nonzero_rows[1:] if nonzero_rows else []
    trimmed_count = len(trimmed_rows)
    trimmed_total = sum(r[0] for r in trimmed_rows)
    trimmed_avg = int(trimmed_total / trimmed_count) if trimmed_count else 0

    free_tier_bytes = int(free_tier_gb * 1024 * 1024 * 1024)
    avg_cars_to_fill = math.floor(free_tier_bytes / avg_bytes) if avg_bytes else 0
    nonzero_cars_to_fill = math.floor(free_tier_bytes / nonzero_avg) if nonzero_avg else 0
    trimmed_cars_to_fill = math.floor(free_tier_bytes / trimmed_avg) if trimmed_avg else 0

    print("\n=== Marketplace image storage (per listing) ===")
    print(f"API listings found: {total_cars}")
    print(f"Total storage (all listings): {fmt_bytes(total_bytes_all)}")
    print(f"Average per listing: {fmt_bytes(avg_bytes)}")
    if nonzero_count != total_cars:
        print(f"Listings with storage found (non-zero): {nonzero_count}")
        print(f"Average per non-zero listing: {fmt_bytes(nonzero_avg)}")
    if trimmed_count and nonzero_rows:
        largest = nonzero_rows[0]
        print(f"Average per non-zero listing (excluding largest: {largest[2]}): {fmt_bytes(trimmed_avg)}")
    print(f"Free tier assumption: {free_tier_gb:.1f} GB S3 Standard storage")
    print(f"Estimated listings to fill free tier @ average: {avg_cars_to_fill:,}")
    if nonzero_count != total_cars:
        print(f"Estimated listings to fill free tier @ non-zero average: {nonzero_cars_to_fill:,}")
    if trimmed_count:
        print(f"Estimated listings to fill free tier @ trimmed average: {trimmed_cars_to_fill:,}")

    if estimate_cost:
        total_gb = bytes_to_gb_decimal(total_bytes_all)
        billable_gb = max(0.0, total_gb - float(free_tier_gb))
        est_cost = billable_gb * float(storage_price_per_gb_month)
        print("\nEstimated monthly storage cost (storage only):")
        print(f"- Current stored: {total_gb:.3f} GB")
        print(f"- Billable beyond free tier: {billable_gb:.3f} GB")
        print(f"- Rate: {fmt_money(storage_price_per_gb_month)}/GB-month")
        print(f"- Estimated monthly: {fmt_money(est_cost)}")

        if project_marketplace_count is not None and project_marketplace_count > 0:
            projected_bytes = int(nonzero_avg) * int(project_marketplace_count)
            projected_gb = bytes_to_gb_decimal(projected_bytes)
            projected_billable_gb = max(0.0, projected_gb - float(free_tier_gb))
            projected_cost = projected_billable_gb * float(storage_price_per_gb_month)

            projected_trimmed_bytes = int(trimmed_avg) * int(project_marketplace_count) if trimmed_avg else projected_bytes
            projected_trimmed_gb = bytes_to_gb_decimal(projected_trimmed_bytes)
            projected_trimmed_billable_gb = max(0.0, projected_trimmed_gb - float(free_tier_gb))
            projected_trimmed_cost = projected_trimmed_billable_gb * float(storage_price_per_gb_month)

            print(f"\nProjection for {project_marketplace_count:,} marketplace listings:")
            print(f"- Using non-zero avg ({fmt_bytes(nonzero_avg)}): {projected_gb:.2f} GB stored → {fmt_money(projected_cost)}/mo")
            if trimmed_avg:
                print(f"- Using trimmed avg ({fmt_bytes(trimmed_avg)}): {projected_trimmed_gb:.2f} GB stored → {fmt_money(projected_trimmed_cost)}/mo")

    if csv_out_dir:
        safe_mkdir(csv_out_dir)
        out_path = os.path.join(csv_out_dir, "marketplace-listings.csv")
        with open(out_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["listingId", "title", "totalBytes", "totalMB", "objectCount", "submissionPrefixes"])
            for total_b, obj_count, title, listing_id, prefixes in per_listing_rows:
                writer.writerow([
                    listing_id,
                    title,
                    total_b,
                    round(total_b / (1024 * 1024), 4),
                    obj_count,
                    "|".join(prefixes),
                ])
        print(f"\nWrote CSV: {out_path}")

    print(f"\nTop {min(top_n, total_cars)} largest listings:")
    for i, (b, obj_count, title, listing_id, prefixes) in enumerate(per_listing_rows[:top_n], start=1):
        prefix_str = ",".join(prefixes) if prefixes else "(no submissions prefix found)"
        print(f"{i:>2}. {title} [{listing_id}] — {fmt_bytes(b)} across {obj_count} objects — {prefix_str}")

    big_photo = [row for row in per_listing_rows if row[1] >= 15]
    if big_photo:
        print("\nListings with >= 15 stored objects under submission prefix:")
        for b, obj_count, title, listing_id, _ in sorted(big_photo, key=lambda r: r[0], reverse=True):
            print(f"- {title} [{listing_id}] — {obj_count} objects, {fmt_bytes(b)}")


def compute_reports_pdf_report(
    *,
    free_tier_gb: float,
    top_n: int,
    prefix: str,
    csv_out_dir: Optional[str],
    estimate_cost: bool,
    storage_price_per_gb_month: float,
    project_reports_count: Optional[int],
) -> None:
    # List all objects, optionally under a prefix.
    key_sizes: List[Tuple[int, str]] = []

    continuation: Optional[str] = None
    while True:
        args = ["s3api", "list-objects-v2", "--bucket", REPORTS_BUCKET]
        if prefix:
            args += ["--prefix", prefix]
        if continuation:
            args += ["--continuation-token", continuation]

        data = run_aws_json(args)
        contents = data.get("Contents") or []
        for obj in contents:
            key = obj.get("Key") or ""
            size = int(obj.get("Size") or 0)
            if key.lower().endswith(".pdf"):
                key_sizes.append((size, key))

        if data.get("IsTruncated"):
            continuation = data.get("NextContinuationToken")
            if not continuation:
                break
        else:
            break

    key_sizes.sort(key=lambda x: x[0], reverse=True)
    count = len(key_sizes)
    total = sum(sz for sz, _ in key_sizes)
    avg = int(total / count) if count else 0

    free_tier_bytes = int(free_tier_gb * 1024 * 1024 * 1024)
    pdfs_to_fill = math.floor(free_tier_bytes / avg) if avg else 0

    print("\n=== Inspection report PDFs (S3) ===")
    print(f"Bucket: {REPORTS_BUCKET}")
    if prefix:
        print(f"Prefix: {prefix}")
    print(f"PDF count: {count}")
    print(f"Total PDF storage: {fmt_bytes(total)}")
    print(f"Average PDF size: {fmt_bytes(avg)}")
    if key_sizes:
        print(f"Largest PDF: {fmt_bytes(key_sizes[0][0])} — {key_sizes[0][1]}")
    print(f"Free tier assumption: {free_tier_gb:.1f} GB S3 Standard storage")
    print(f"Estimated PDFs to fill free tier @ average: {pdfs_to_fill:,}")

    if estimate_cost:
        total_gb = bytes_to_gb_decimal(total)
        billable_gb = max(0.0, total_gb - float(free_tier_gb))
        est_cost = billable_gb * float(storage_price_per_gb_month)
        print("\nEstimated monthly storage cost (storage only):")
        print(f"- Current stored: {total_gb:.3f} GB")
        print(f"- Billable beyond free tier: {billable_gb:.3f} GB")
        print(f"- Rate: {fmt_money(storage_price_per_gb_month)}/GB-month")
        print(f"- Estimated monthly: {fmt_money(est_cost)}")

        if project_reports_count is not None and project_reports_count > 0:
            projected_bytes = int(avg) * int(project_reports_count)
            projected_gb = bytes_to_gb_decimal(projected_bytes)
            projected_billable_gb = max(0.0, projected_gb - float(free_tier_gb))
            projected_cost = projected_billable_gb * float(storage_price_per_gb_month)
            print(f"\nProjection for {project_reports_count:,} report PDFs:")
            print(f"- Using avg PDF ({fmt_bytes(avg)}): {projected_gb:.2f} GB stored → {fmt_money(projected_cost)}/mo")

    if key_sizes:
        print(f"\nTop {min(top_n, count)} largest PDFs:")
        for i, (sz, key) in enumerate(key_sizes[:top_n], start=1):
            print(f"{i:>2}. {fmt_bytes(sz)} — {key}")

    if csv_out_dir:
        safe_mkdir(csv_out_dir)
        out_path = os.path.join(csv_out_dir, "report-pdfs.csv")
        with open(out_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["key", "sizeBytes", "sizeMB"])
            for sz, key in key_sizes:
                writer.writerow([key, sz, round(sz / (1024 * 1024), 4)])
        print(f"\nWrote CSV: {out_path}")


def main(argv: Sequence[str]) -> int:
    parser = argparse.ArgumentParser(description="InspectionWale S3 storage report")
    parser.add_argument("--marketplace", action="store_true", help="Report marketplace image usage")
    parser.add_argument("--reports", action="store_true", help="Report inspection PDFs usage")
    parser.add_argument("--free-tier-gb", type=float, default=5.0, help="Free tier storage GB (default: 5)")
    parser.add_argument("--top", type=int, default=10, help="How many largest items to print")
    parser.add_argument(
        "--csv-out",
        type=str,
        default="",
        help="If set, writes CSV files to this directory (marketplace-listings.csv, report-pdfs.csv)",
    )
    parser.add_argument(
        "--estimate-cost",
        action="store_true",
        help="Also print estimated monthly S3 Standard storage cost beyond free tier (storage only)",
    )
    parser.add_argument(
        "--storage-price-per-gb-month",
        type=float,
        default=0.023,
        help="S3 Standard storage price per GB-month (default: 0.023 USD; verify for your region)",
    )
    parser.add_argument(
        "--project-marketplace-count",
        type=int,
        default=0,
        help="If set, projects storage/cost for this many marketplace listings using current averages",
    )
    parser.add_argument(
        "--project-reports-count",
        type=int,
        default=0,
        help="If set, projects storage/cost for this many report PDFs using current average size",
    )
    parser.add_argument(
        "--reports-prefix",
        type=str,
        default="",
        help="Optional prefix within the reports bucket (e.g. 'reports/')",
    )

    args = parser.parse_args(list(argv))

    csv_out_dir = args.csv_out.strip() or None
    project_marketplace_count = int(args.project_marketplace_count) if int(args.project_marketplace_count) > 0 else None
    project_reports_count = int(args.project_reports_count) if int(args.project_reports_count) > 0 else None

    run_marketplace = args.marketplace
    run_reports = args.reports
    if not run_marketplace and not run_reports:
        run_marketplace = True
        run_reports = True

    # Quick sanity: aws cli available
    try:
        run_aws_json(["sts", "get-caller-identity"])
    except Exception as e:
        print(f"ERROR: AWS CLI not configured or not available: {e}", file=sys.stderr)
        return 2

    if run_marketplace:
        compute_marketplace_report(
            free_tier_gb=args.free_tier_gb,
            top_n=args.top,
            csv_out_dir=csv_out_dir,
            estimate_cost=bool(args.estimate_cost),
            storage_price_per_gb_month=float(args.storage_price_per_gb_month),
            project_marketplace_count=project_marketplace_count,
        )

    if run_reports:
        compute_reports_pdf_report(
            free_tier_gb=args.free_tier_gb,
            top_n=args.top,
            prefix=args.reports_prefix,
            csv_out_dir=csv_out_dir,
            estimate_cost=bool(args.estimate_cost),
            storage_price_per_gb_month=float(args.storage_price_per_gb_month),
            project_reports_count=project_reports_count,
        )

    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
