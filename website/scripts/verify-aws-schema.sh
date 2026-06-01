#!/usr/bin/env bash
###############################################################################
# verify-aws-schema.sh
#
# Pre-go-live safety check for the InspectionWale "location / city" dropdown
# rollout. The customer forms (Book Inspection, List/Sell Your Car, Test Drive,
# partner-service) now submit a fixed set of city values. DynamoDB is schemaless
# so no migration is needed, BUT this script guarantees that:
#
#   1. Every table that stores a location/city value EXISTS in the region.
#   2. The location/city ATTRIBUTE is present on existing items (reports how many
#      items are missing it, and can BACKFILL an empty string so report/render
#      code that does item.location.xxx never throws on go-live).
#   3. The pending `ListingComments` table is created if missing.
#
# DynamoDB has no fixed columns, so "does the column exist" == "do items carry
# the attribute". Reads on items that predate the dropdown could otherwise return
# `undefined`; the optional backfill writes "" so downstream code is safe.
#
# USAGE:
#   ./verify-aws-schema.sh                 # report only (read-only, safe)
#   ./verify-aws-schema.sh --backfill      # also write "" to items missing the attr
#   ./verify-aws-schema.sh --create-missing# also create ListingComments if absent
#   AWS_REGION=us-east-1 ./verify-aws-schema.sh --backfill --create-missing
#
# REQUIREMENTS: awscli v2 configured with credentials that can
#   dynamodb:DescribeTable, Scan, UpdateItem, CreateTable
###############################################################################
set -euo pipefail

REGION="${AWS_REGION:-us-east-1}"
BACKFILL=false
CREATE_MISSING=false
for arg in "$@"; do
  case "$arg" in
    --backfill) BACKFILL=true ;;
    --create-missing) CREATE_MISSING=true ;;
    *) echo "Unknown flag: $arg" ; exit 1 ;;
  esac
done

# table-name | partition-key | (optional sort key) | attribute-to-check | nested-path-note
# attribute-to-check is the top-level attribute we scan for.
TABLES=(
  "CarListings|listingId||location|stored under car.location / display.location"
  "InspectionPayments|bookingId||location|inspection booking city"
  "Quotes|id||city|lead capture city/location"
  "CarValueRequests|requestId||city|car-value lead city"
)
# Allow env overrides for table names that differ in your account:
CarListings="${CAR_LISTINGS_TABLE:-${LISTINGS_TABLE:-CarListings}}"
InspectionPayments="InspectionPayments"
Quotes="${QUOTES_TABLE:-${STORAGE_QUOTES_NAME:-Quotes}}"
CarValueRequests="${CAR_VALUE_TABLE:-CarValueRequests}"
ListingComments="${LISTING_COMMENTS_TABLE:-ListingComments}"

echo "============================================================"
echo " InspectionWale AWS schema verification  (region: $REGION)"
echo " backfill=$BACKFILL  create-missing=$CREATE_MISSING"
echo "============================================================"

table_exists () {
  aws dynamodb describe-table --region "$REGION" --table-name "$1" >/dev/null 2>&1
}

check_table () {
  local TABLE="$1" PK="$2" ATTR="$3" NOTE="$4"
  echo ""
  echo "------------------------------------------------------------"
  echo "TABLE: $TABLE   (attr: $ATTR — $NOTE)"
  if ! table_exists "$TABLE"; then
    echo "  [MISSING] table not found in $REGION."
    return
  fi
  echo "  [OK] table exists."

  # Count total items and items missing the attribute (top-level).
  local TOTAL MISSING
  TOTAL=$(aws dynamodb scan --region "$REGION" --table-name "$TABLE" \
            --select COUNT --output text --query 'Count' 2>/dev/null || echo 0)
  MISSING=$(aws dynamodb scan --region "$REGION" --table-name "$TABLE" \
            --filter-expression "attribute_not_exists(#a)" \
            --expression-attribute-names "{\"#a\":\"$ATTR\"}" \
            --select COUNT --output text --query 'Count' 2>/dev/null || echo 0)
  echo "  items total=$TOTAL  missing '$ATTR'=$MISSING"

  if [ "$MISSING" -gt 0 ] && [ "$BACKFILL" = true ]; then
    echo "  [BACKFILL] writing empty '$ATTR' to $MISSING item(s) so reads never error..."
    # Page through keys of items missing the attribute and set it to "".
    local KEYS
    KEYS=$(aws dynamodb scan --region "$REGION" --table-name "$TABLE" \
            --filter-expression "attribute_not_exists(#a)" \
            --expression-attribute-names "{\"#a\":\"$ATTR\"}" \
            --projection-expression "$PK" \
            --output json --query 'Items' )
    echo "$KEYS" | python3 - "$TABLE" "$PK" "$ATTR" "$REGION" <<'PY'
import json,sys,subprocess
items=json.load(sys.stdin); table,pk,attr,region=sys.argv[1:5]
for it in items:
    key=json.dumps({pk: it[pk]})
    subprocess.run(["aws","dynamodb","update-item","--region",region,
        "--table-name",table,"--key",key,
        "--update-expression","SET #a = :v",
        "--expression-attribute-names",json.dumps({"#a":attr}),
        "--expression-attribute-values",json.dumps({":v":{"S":""}})],check=True)
print(f"  backfilled {len(items)} item(s).")
PY
  elif [ "$MISSING" -gt 0 ]; then
    echo "  [HINT] run with --backfill to set empty '$ATTR' on these items."
  fi
}

check_table "$CarListings"        "listingId"  "location" "stored under car.location / display.location"
check_table "$InspectionPayments" "bookingId"  "location" "inspection booking city"
check_table "$Quotes"             "id"         "city"     "lead capture city/location"
check_table "$CarValueRequests"   "requestId"  "city"     "car-value lead city"

# ---- ListingComments (pending deployment) -------------------------------------
echo ""
echo "------------------------------------------------------------"
echo "TABLE: $ListingComments   (comments feature)"
if table_exists "$ListingComments"; then
  echo "  [OK] table exists."
else
  echo "  [MISSING] ListingComments not found."
  if [ "$CREATE_MISSING" = true ]; then
    echo "  [CREATE] creating ListingComments (PK listingId, SK commentId, PAY_PER_REQUEST)..."
    aws dynamodb create-table --region "$REGION" \
      --table-name "$ListingComments" \
      --attribute-definitions AttributeName=listingId,AttributeType=S AttributeName=commentId,AttributeType=S \
      --key-schema AttributeName=listingId,KeyType=HASH AttributeName=commentId,KeyType=RANGE \
      --billing-mode PAY_PER_REQUEST >/dev/null
    aws dynamodb wait table-exists --region "$REGION" --table-name "$ListingComments"
    echo "  [DONE] ListingComments created."
  else
    echo "  [HINT] run with --create-missing to create it."
  fi
fi

echo ""
echo "============================================================"
echo " Verification complete."
echo "============================================================"
