#!/usr/bin/env node
/**
 * Backfill `car.bodyType` (and optionally fix empty `car.fuelType`) for existing
 * car listings in DynamoDB.
 *
 * SAFETY:
 *  - Only updates the single nested attribute `car.bodyType` (and `car.fuelType`
 *    when provided). It never overwrites the whole `car` map, so no existing
 *    field is touched.
 *  - Runs in --dry-run mode by default. Pass --apply to actually write.
 *
 * USAGE (PowerShell):
 *   $env:CAR_LISTINGS_TABLE="<your-table-name>"
 *   $env:AWS_REGION="us-east-1"   # match your table's region
 *   node scripts/backfill-bodytype.mjs                 # dry run (prints planned updates)
 *   node scripts/backfill-bodytype.mjs --apply         # perform the updates
 *
 * Requires: npm i @aws-sdk/client-dynamodb  (run inside website/ or a temp folder)
 * Credentials: uses the standard AWS credential chain (aws configure / SSO / env vars).
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb'

const __dirname = dirname(fileURLToPath(import.meta.url))

const TABLE = process.env.CAR_LISTINGS_TABLE || process.env.LISTINGS_TABLE
const REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1'
const APPLY = process.argv.includes('--apply')

if (!TABLE) {
  console.error('ERROR: Set CAR_LISTINGS_TABLE (or LISTINGS_TABLE) env var to your DynamoDB table name.')
  process.exit(1)
}

// mapping file: { "<listingId>": { "bodyType": "SUV", "fuelType": "Petrol"? }, ... }
const mappingPath = join(__dirname, 'bodytype-mapping.json')
const mapping = JSON.parse(readFileSync(mappingPath, 'utf8'))

const client = new DynamoDBClient({ region: REGION })

async function run() {
  const entries = Object.entries(mapping)
  console.log(`Table: ${TABLE}  Region: ${REGION}  Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}  Items: ${entries.length}\n`)

  let ok = 0
  let skipped = 0
  let failed = 0

  for (const [listingId, fields] of entries) {
    const bodyType = (fields && fields.bodyType) ? String(fields.bodyType).trim() : ''
    const fuelType = (fields && fields.fuelType) ? String(fields.fuelType).trim() : ''

    if (!bodyType && !fuelType) {
      console.log(`SKIP  ${listingId}  (no bodyType/fuelType provided)`)
      skipped++
      continue
    }

    const sets = []
    const names = { '#car': 'car' }
    const values = {}
    if (bodyType) { sets.push('#car.#bodyType = :bt'); names['#bodyType'] = 'bodyType'; values[':bt'] = { S: bodyType } }
    if (fuelType) { sets.push('#car.#fuelType = :ft'); names['#fuelType'] = 'fuelType'; values[':ft'] = { S: fuelType } }

    const cmd = new UpdateItemCommand({
      TableName: TABLE,
      Key: { listingId: { S: listingId } },
      UpdateExpression: 'SET ' + sets.join(', '),
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ConditionExpression: 'attribute_exists(listingId)'
    })

    if (!APPLY) {
      console.log(`PLAN  ${listingId}  -> bodyType=${bodyType || '(keep)'}${fuelType ? `, fuelType=${fuelType}` : ''}`)
      ok++
      continue
    }

    try {
      await client.send(cmd)
      console.log(`DONE  ${listingId}  -> bodyType=${bodyType || '(keep)'}${fuelType ? `, fuelType=${fuelType}` : ''}`)
      ok++
    } catch (err) {
      console.error(`FAIL  ${listingId}  ${err.name}: ${err.message}`)
      failed++
    }
  }

  console.log(`\nSummary: ${ok} ${APPLY ? 'updated' : 'planned'}, ${skipped} skipped, ${failed} failed.`)
  if (!APPLY) console.log('Re-run with --apply to perform the updates.')
}

run().catch(err => { console.error(err); process.exit(1) })
