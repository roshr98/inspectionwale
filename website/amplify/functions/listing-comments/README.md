# listing-comments Lambda

Handles GET and POST for public comments on car listings.

## DynamoDB Table Setup

Create a table named **`ListingComments`** in `us-east-1`:

| Attribute   | Type   | Key       |
|-------------|--------|-----------|
| listingId   | String | Partition |
| commentId   | String | Sort       |

Billing mode: PAY_PER_REQUEST (on-demand)

Other attributes stored: `name`, `comment`, `createdAt` (Number, epoch ms), `listingTitle`

### To delete a comment
In the AWS Console → DynamoDB → ListingComments → Explore Items:
Filter by `listingId` and `commentId` values shown in the email notification, then delete the item.

## Lambda Setup

1. Runtime: Node.js 20.x
2. Handler: `src/index.handler`
3. Environment variables:
   - `LISTING_COMMENTS_TABLE` = `ListingComments`
   - `SITE_BASE_URL` = `https://www.inspectionwale.com`
4. IAM permissions: `dynamodb:PutItem`, `dynamodb:Query` on the table + `ses:SendEmail`
5. Add a **Function URL** (Auth: NONE, CORS: *)
6. Copy the URL and update `amplify-build-spec.yml`:
   ```
   source: /api/listing-comments
   target: https://<your-function-url>.lambda-url.us-east-1.on.aws/
   ```

## Dependencies
```json
{
  "@aws-sdk/client-dynamodb": "^3",
  "@aws-sdk/lib-dynamodb": "^3",
  "@aws-sdk/client-ses": "^3"
}
```
