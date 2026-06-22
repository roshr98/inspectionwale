/**
 * Listing Comments Lambda
 * Handles public comments on car listings
 *
 * Endpoints:
 *   GET  /api/listing-comments?listingId=xxx[&limit=10][&lastKey=xxx]  — fetch comments
 *   POST /api/listing-comments                                          — add comment
 *
 * DynamoDB table: ListingComments
 *   PK  listingId  (String)
 *   SK  commentId  (String)  — ISO timestamp + random suffix  e.g. "2026-06-01T12:34:56.789Z#a1b2c3"
 *   Attributes: name, comment, createdAt (epoch ms), listingTitle
 *
 * After a comment is saved the function also:
 *   • sends a notification email via SES  (from: hello@inspectionwale.com  to: inspectionwale@zohomail.in)
 *   • includes a direct link to the listing in the email body
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
    DynamoDBDocumentClient,
    PutCommand,
    QueryCommand
} = require('@aws-sdk/lib-dynamodb');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const crypto = require('crypto');

const REGION        = process.env.AWS_REGION || 'us-east-1';
const TABLE_NAME    = process.env.LISTING_COMMENTS_TABLE || 'ListingComments';
const SITE_BASE_URL = process.env.SITE_BASE_URL || 'https://www.inspectionwale.com';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
const ses = new SESClient({ region: REGION });

// ── helpers ──────────────────────────────────────────────────────────────────

const cors = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
};

function resp(statusCode, body) {
    return {
        statusCode,
        headers: { 'Content-Type': 'application/json', ...cors },
        body: JSON.stringify(body)
    };
}

function sanitize(str, maxLen = 500) {
    if (typeof str !== 'string') return '';
    return str.trim().slice(0, maxLen).replace(/[<>]/g, '');
}

// ── main handler ──────────────────────────────────────────────────────────────

exports.handler = async (event) => {
    const method = (event.requestContext?.http?.method || event.httpMethod || 'GET').toUpperCase();

    if (method === 'OPTIONS') return resp(200, {});

    // ── GET — fetch comments ──────────────────────────────────────────────────
    if (method === 'GET') {
        const qs          = event.queryStringParameters || {};
        const listingId   = sanitize(qs.listingId || '', 120);
        const limit       = Math.min(parseInt(qs.limit) || 10, 50);
        const lastKeyRaw  = qs.lastKey ? decodeURIComponent(qs.lastKey) : undefined;

        if (!listingId) return resp(400, { error: 'listingId is required' });

        try {
            const params = {
                TableName:              TABLE_NAME,
                KeyConditionExpression: 'listingId = :lid',
                ExpressionAttributeValues: { ':lid': listingId },
                ScanIndexForward:       false,   // newest first
                Limit:                  limit
            };

            if (lastKeyRaw) {
                try { params.ExclusiveStartKey = JSON.parse(lastKeyRaw); } catch (_) {}
            }

            const result = await ddb.send(new QueryCommand(params));

            return resp(200, {
                ok:       true,
                comments: result.Items || [],
                lastKey:  result.LastEvaluatedKey
                    ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey))
                    : null
            });
        } catch (err) {
            console.error('GET comments error:', err);
            return resp(500, { error: 'Failed to fetch comments.' });
        }
    }

    // ── POST — add comment ────────────────────────────────────────────────────
    if (method === 'POST') {
        let body;
        try {
            body = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || {});
        } catch (_) {
            return resp(400, { error: 'Invalid JSON body' });
        }

        const listingId    = sanitize(body.listingId    || '', 120);
        const name         = sanitize(body.name         || '', 80);
        const comment      = sanitize(body.comment      || '', 800);
        const listingTitle = sanitize(body.listingTitle || '', 150);

        if (!listingId || !name || !comment) {
            return resp(400, { error: 'listingId, name and comment are required.' });
        }

        // Simple spam guard — no URLs in comments
        if (/https?:\/\//i.test(comment)) {
            return resp(400, { error: 'Links are not allowed in comments.' });
        }

        const now       = Date.now();
        const suffix    = crypto.randomBytes(3).toString('hex');
        const commentId = `${new Date(now).toISOString()}#${suffix}`;

        const item = { listingId, commentId, name, comment, createdAt: now, listingTitle };

        try {
            await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
        } catch (err) {
            console.error('PUT comment error:', err);
            return resp(500, { error: 'Failed to save comment.' });
        }

        // ── email notification ────────────────────────────────────────────────
        try {
            const listingUrl = `${SITE_BASE_URL}/car-marketplace/index.html?listingId=${encodeURIComponent(listingId)}`;
            const subject    = `${listingTitle || listingId} — New Comment Added`;

            const html = `
<!DOCTYPE html><html><body style="font-family:Montserrat,Arial,sans-serif;background:#f2f4f8;margin:0;padding:24px;">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
  <div style="background:#14213d;padding:20px 24px;">
    <img src="${SITE_BASE_URL}/Images/brand_logo_new_1.png" alt="inspectionWale" height="36" style="filter:brightness(0) invert(1);">
  </div>
  <div style="padding:24px;">
    <h2 style="margin:0 0 4px;color:#14213d;font-size:1.1rem;">New Comment on Listing</h2>
    <p style="color:#6b7280;font-size:0.85rem;margin:0 0 20px;">${listingTitle || listingId}</p>
    <table style="width:100%;border-collapse:collapse;font-size:0.88rem;">
      <tr><td style="padding:8px 0;color:#9aa1ad;width:100px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;font-size:0.7rem;">From</td><td style="color:#14213d;font-weight:700;">${name}</td></tr>
      <tr><td style="padding:8px 0;color:#9aa1ad;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;font-size:0.7rem;vertical-align:top;">Comment</td><td style="color:#374151;line-height:1.6;">${comment}</td></tr>
      <tr><td style="padding:8px 0;color:#9aa1ad;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;font-size:0.7rem;">Posted</td><td style="color:#374151;">${new Date(now).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td></tr>
    </table>
    <div style="margin-top:20px;">
      <a href="${listingUrl}" style="display:inline-block;background:#c0392b;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:700;font-size:0.88rem;">View Listing →</a>
    </div>
    <p style="margin-top:16px;font-size:0.72rem;color:#9aa1ad;">To delete this comment, remove the item from the <b>ListingComments</b> DynamoDB table where <code>listingId = "${listingId}"</code> and <code>commentId = "${commentId}"</code></p>
  </div>
</div>
</body></html>`;

            await ses.send(new SendEmailCommand({
                Source:      'hello@inspectionwale.com',
                Destination: { ToAddresses: ['inspectionwale@zohomail.in'], CcAddresses: ['hello@inspectionwale.com'] },
                Message: {
                    Subject: { Data: subject, Charset: 'UTF-8' },
                    Body: {
                        Html: { Data: html, Charset: 'UTF-8' },
                        Text: { Data: `New comment on ${listingTitle || listingId}\nFrom: ${name}\n${comment}\n\nView: ${listingUrl}`, Charset: 'UTF-8' }
                    }
                }
            }));
        } catch (mailErr) {
            // Don't fail the whole request if email fails
            console.warn('Comment email notification failed:', mailErr.message);
        }

        return resp(201, { ok: true, comment: item });
    }

    return resp(405, { error: 'Method not allowed' });
};
