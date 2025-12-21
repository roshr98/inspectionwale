# AWS Setup Guide for InspectionWale Quote/Booking System

## Overview
This guide walks you through setting up DynamoDB, SES email, and Lambda function configuration in AWS Console for the InspectionWale quote/booking system.

**Region**: us-east-1 (N. Virginia)

---

## Part 1: Create DynamoDB Table for Quote Storage

### Step 1: Open DynamoDB Console
1. Sign in to AWS Console: https://console.aws.amazon.com/
2. In the search bar at top, type **DynamoDB** and click **DynamoDB** service
3. Ensure you're in **us-east-1 (N. Virginia)** region (check top-right corner)

### Step 2: Create Table
1. Click **Create table** button (orange button on right)
2. Fill in the following:
   - **Table name**: `inspectionwale-quotes`
   - **Partition key**: `id` (Type: **String**)
   - Leave **Sort key** empty
3. Scroll down to **Table settings**:
   - Keep **Default settings** selected (or customize if needed)
4. Click **Create table** at bottom
5. Wait 10-30 seconds for table to become **Active** (refresh if needed)

### Step 3: Note the Table ARN (for Lambda permissions)
1. Click on your new table name `inspectionwale-quotes`
2. Click on **Additional info** tab
3. Copy the **Amazon Resource Name (ARN)** — looks like:
   ```
   arn:aws:dynamodb:us-east-1:123456789012:table/inspectionwale-quotes
   ```
4. Save this ARN — you'll need it when configuring Lambda permissions

---

## Part 2: Configure AWS SES (Simple Email Service) for Sending Emails

### Step 1: Open SES Console
1. In AWS Console search bar, type **SES** or **Simple Email Service**
2. Click **Amazon Simple Email Service**
3. **IMPORTANT**: Ensure you're in **us-east-1 (N. Virginia)** region (top-right)

### Step 2: Verify Your Sender Email Address (SES_FROM)
1. In left sidebar, click **Verified identities**
2. Click **Create identity** button (orange)
3. Select **Email address**
4. Enter the email address you want to send FROM (e.g., `noreply@yourdomain.com` or your personal email)
5. Click **Create identity**
6. **Check your email inbox** — AWS will send a verification email
7. Click the verification link in the email
8. Go back to SES Console > Verified identities — status should show **Verified** (green)

### Step 3: Verify Recipient Email Address (SES_TO) — If in Sandbox
**Note**: New AWS accounts start in SES Sandbox mode, which only allows sending to verified addresses.

1. Repeat Step 2 above to verify the email address where you want to RECEIVE quote notifications
2. If `SES_FROM` and `SES_TO` are the same email, you only need to verify once

### Step 4: (Optional) Request Production Access to Send to Any Email
If you want to send to any email address (not just verified ones):

1. In SES Console left sidebar, click **Account dashboard**
2. Look for **Sending status** — if it says **Sandbox**, click **Request production access**
3. Fill out the form:
   - **Mail type**: Transactional
   - **Website URL**: Your Amplify site URL
   - **Use case description**: "Sending quote request confirmations and booking notifications for vehicle inspection service"
   - **Compliance**: Confirm you will not send spam
4. Submit request — AWS typically approves within 24 hours

### Step 5: Note Your Verified Email Addresses
Write down:
- **SES_FROM**: The verified sender email (e.g., `noreply@yourdomain.com`)
- **SES_TO**: The verified recipient email (e.g., `admin@yourdomain.com`)

---

## Part 3: Configure Lambda Function & API Gateway

**Note**: Since your site is already deployed via Amplify Console and you have the Lambda function code in your repo (`amplify/functions/quote/src/index.js`), you need to either:
1. Create the Lambda + API manually in AWS Console (steps below), OR
2. Use Amplify's backend features to auto-deploy the function

We'll use **Manual Console Setup** (simpler and gives you full control).

---

### Step-by-Step: Create Lambda Function in AWS Console

#### Step 1: Open Lambda Console & Create Function
1. Sign in to AWS Console: https://console.aws.amazon.com/
2. In the search bar at top, type **Lambda** and click **Lambda** service
3. **Ensure region is us-east-1 (N. Virginia)** — check top-right corner
4. Click **Create function** button (orange button on right)

#### Step 2: Configure Function
Choose **Author from scratch**:
- **Function name**: `inspectionwale-quote`
- **Runtime**: **Node.js 18.x** (or latest LTS)
- **Architecture**: x86_64 (default)
- **Permissions**: 
  - Expand **Change default execution role**
  - Select **Create a new role with basic Lambda permissions**
  - Role name will auto-generate
- Click **Create function** at bottom

#### Step 3: Upload Function Code
1. After function is created, you'll see the **Code** tab
2. In the **Code source** section, you'll see an inline editor with `index.mjs`
3. Click on **Upload from** dropdown → **.zip file**
4. **Prepare the zip file on your computer first**:
   - Open File Explorer, navigate to: `C:\Users\Administrator\Documents\Inpectionwale\website\amplify\functions\quote\src\`
   - Right-click on `index.js` → **Send to** → **Compressed (zipped) folder**
   - Name it `quote-function.zip`
   
   **OR** create it with all dependencies (recommended):
   - Open PowerShell in `C:\Users\Administrator\Documents\Inpectionwale\website\amplify\functions\quote\src\`
   - Run:
   ```powershell
   npm init -y
   npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb @aws-sdk/client-ses
   ```
   - Then create zip of entire `src` folder (including `node_modules`, `index.js`, `package.json`)
   
5. Back in Lambda Console, click **Upload** button, select your `quote-function.zip`
6. Click **Save**
7. Wait for upload to complete

**Alternative - Copy/Paste Code** (Simpler):
1. In Lambda Code source, click on `index.mjs` file
2. Delete all existing code
3. Copy the entire content from `C:\Users\Administrator\Documents\Inpectionwale\website\amplify\functions\quote\src\index.js`
4. Paste into the editor
5. Click **File** → **Save** or press Ctrl+S
6. Click **Deploy** button (orange) to save changes
7. **IMPORTANT**: The AWS SDK v3 packages are included in Lambda runtime, so you don't need to upload dependencies if using only AWS SDK

#### Step 4: Add Environment Variables
1. Click **Configuration** tab (at top, next to Code tab)
2. In left sidebar, click **Environment variables**
3. Click **Edit** button (on right)
4. Click **Add environment variable** button for each of these:
   - Key: `QUOTES_TABLE`, Value: `inspectionwale-quotes`
   - Key: `SES_FROM`, Value: `your-verified-sender@example.com` ← Replace with your verified email
   - Key: `SES_TO`, Value: `your-recipient@example.com` ← Replace with email to receive quotes
   - **Note**: Do NOT add `AWS_REGION` — Lambda automatically sets this based on the region where your function is deployed
5. Click **Save** button at bottom
6. Should see "Successfully updated the function inspectionwale-quote"

#### Step 5: Grant DynamoDB Permissions
1. Still in **Configuration** tab, click **Permissions** in left sidebar
2. Under **Execution role**, click the **role name** link (looks like `inspectionwale-quote-role-abc123`) — opens in new tab
3. You're now in the IAM Console showing this role
4. Click **Add permissions** button → **Create inline policy**
5. Click the **JSON** tab
6. Delete the example JSON and paste this:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:*:table/inspectionwale-quotes"
    }
  ]
}
```
7. Click **Next** button (bottom right)
8. Policy name: `InspectionWaleDynamoDBAccess`
9. Click **Create policy**
10. You should see the new policy listed under "Permissions policies"

#### Step 6: Grant SES (Email) Permissions
1. Still in the same IAM role page, click **Add permissions** → **Create inline policy**
2. Click **JSON** tab and paste:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    }
  ]
}
```
3. Click **Next**
4. Policy name: `InspectionWaleSESAccess`
5. Click **Create policy**
6. Close the IAM tab and return to your Lambda function tab

---

## Part 4: Create API Gateway to Expose Lambda Function

### Step 1: Add Lambda Function URL (Simplest Option)
This is the easiest way to expose your Lambda function without setting up API Gateway:

1. Go back to Lambda Console → Your function `inspectionwale-quote`
2. Click **Configuration** tab → **Function URL** in left sidebar
3. Click **Create function URL**
4. Configure:
   - **Auth type**: **NONE** (public access) ← Your website needs to call this
   - **Configure cross-origin resource sharing (CORS)**: **Check this box**
   - **Allow origin**: `*` (or your Amplify domain like `https://main.d123456.amplifyapp.com`)
   - **Allow methods**: `POST, OPTIONS`
   - **Allow headers**: `content-type`
   - **Max age**: `86400`
5. Click **Save**
6. **Copy the Function URL** — looks like:
   ```
   https://abc123xyz456.lambda-url.us-east-1.on.aws/
   ```
7. **Save this URL** — you'll use it in Amplify rewrites

### Step 2 (Alternative): Create API Gateway REST API (More Features)
If you prefer a proper REST API with more control:

#### Step 2a: Open API Gateway Console
1. In AWS Console search bar, type **API Gateway**
2. Click **API Gateway** service
3. Ensure region is **us-east-1**
4. Click **Create API** button

#### Step 2b: Choose API Type
1. Find **REST API** (not Private or HTTP API)
2. Click **Build** button under REST API

#### Step 2c: Configure API
1. Choose **New API**
2. API name: `inspectionwale-api`
3. Description: (optional) "Quote and booking API"
4. Endpoint Type: **Regional**
5. Click **Create API**

#### Step 2d: Create Resource /quote
1. Click **Actions** dropdown → **Create Resource**
2. Resource Name: `quote`
3. Resource Path: `/quote` (auto-filled)
4. Check **Enable API Gateway CORS**
5. Click **Create Resource**

#### Step 2e: Create POST Method
1. Click on the `/quote` resource you just created (should be highlighted)
2. Click **Actions** → **Create Method**
3. In the dropdown that appears under `/quote`, select **POST**
4. Click the checkmark ✓ next to it
5. Configure:
   - **Integration type**: Lambda Function
   - **Use Lambda Proxy integration**: **Check this box** ← Important!
   - **Lambda Region**: us-east-1
   - **Lambda Function**: Start typing `inspectionwale-quote` and select it
6. Click **Save**
7. Popup: "Add Permission to Lambda Function" → Click **OK**

#### Step 2f: Enable CORS (if not already enabled)
1. Click on `/quote` resource
2. Click **Actions** → **Enable CORS**
3. Keep defaults (or customize):
   - Access-Control-Allow-Origin: `'*'` (or your domain)
   - Access-Control-Allow-Methods: POST, OPTIONS
4. Click **Enable CORS and replace existing CORS headers**
5. Click **Yes, replace existing values**

#### Step 2g: Deploy API
1. Click **Actions** → **Deploy API**
2. Deployment stage: **[New Stage]**
3. Stage name: `prod`
4. Click **Deploy**
5. You'll see the **Invoke URL** at top — copy it!
   ```
   https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod
   ```
6. Your full endpoint: `https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod/quote`

---

## Part 5: Configure Amplify Hosting to Proxy /api/quote

### Step 1: Open Amplify Console
1. In AWS Console search, type **Amplify**
2. Click **AWS Amplify**
3. Click on your app name

### Step 2: Add Rewrites and Redirects
1. In left sidebar under **Hosting**, click **Rewrites and redirects**
2. Click **Open text editor** (easier than GUI)
3. Add this rule at the **top** of the file:

**If using Lambda Function URL**:
```json
[
  {
    "source": "/api/quote",
    "target": "https://YOUR_FUNCTION_URL_HERE",
    "type": "200",
    "condition": null
  }
]
```
Replace `YOUR_FUNCTION_URL_HERE` with the Lambda Function URL you copied (e.g., `https://abc123xyz456.lambda-url.us-east-1.on.aws/`)

**If using API Gateway**:
```json
[
  {
    "source": "/api/quote",
    "target": "https://YOUR_API_GATEWAY_URL_HERE/quote",
    "type": "200",
    "condition": null
  }
]
```
Replace `YOUR_API_GATEWAY_URL_HERE/quote` with your API Gateway endpoint (e.g., `https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod/quote`)

4. Keep other existing rules below this one
5. Click **Save**
6. Amplify will redeploy automatically (takes ~1-2 minutes)

---

## Part 6: Test and Verify Everything Works

### Test 1: Verify DynamoDB Table
1. Go to DynamoDB Console > Tables > `inspectionwale-quotes`
2. Click **Explore table items** (or **Items** tab)
3. Should be empty initially
4. After someone submits a quote form, you'll see items appear here
5. Each item will have fields: `id`, `name`, `mobile`, `email`, `make`, `model`, `city`, `receivedAt`

### Test 2: Test Lambda Function Directly
1. Go to Lambda Console > Functions > Your quote function
2. Click **Test** tab
3. Click **Create new test event**
4. Event name: `testQuote`
5. Paste this JSON:
```json
{
  "body": "{\"firstName\":\"Test\",\"lastName\":\"User\",\"mobile\":\"1234567890\",\"email\":\"test@example.com\",\"location\":\"Mumbai\",\"carType\":\"used\"}"
}
```
6. Click **Save**
7. Click **Test** button
8. Check **Execution results**:
   - Should see `statusCode: 200` and `"ok": true`
   - Check CloudWatch Logs for any errors
   - **Check your SES_TO email** — you should receive an email!
   - **Check DynamoDB table** — should see a new item with the test data

### Test 3: Test from Your Live Website
1. Open your Amplify site URL (e.g., `https://main.d1234567890.amplifyapp.com`)
2. Scroll to the **Book an Inspection** section
3. Fill out the form with test data
4. Click **Book Inspection**
5. Should see "Sending..." then "Thank you — we will contact you shortly."
6. **Check your SES_TO email** — you should receive the quote details
7. **Check DynamoDB table** — should see a new item with the form data

### Test 4: Test the Quote Modal
1. On the same page, click **Get A Quote** button in the navbar (top-right)
2. Fill out the modal form
3. Click **Request Quote**
4. Should see success message
5. Check email and DynamoDB as above

---

## Troubleshooting

### Issue: "Unable to reach server" error on form submit
**Solution**:
- Check that API proxy rewrite rule is configured in Amplify Console
- Verify the API Gateway endpoint URL is correct
- Check browser console (F12) for error details
- Verify CORS headers are present in Lambda response (already added in code)

### Issue: Email not sent / "SES send failed" in logs
**Possible causes**:
1. **SES_FROM or SES_TO not verified**
   - Go to SES Console > Verified identities
   - Ensure both emails show **Verified** status
   - Check email inbox for verification emails

2. **Account in SES Sandbox**
   - Can only send to verified addresses
   - Request production access (see Part 2, Step 4)

3. **Wrong region**
   - Ensure Lambda environment variable `AWS_REGION=us-east-1`
   - Ensure SES emails verified in us-east-1 region

4. **Missing SES permissions**
   - Check Lambda execution role has SES SendEmail permission

### Issue: Data not saved to DynamoDB
**Possible causes**:
1. **QUOTES_TABLE environment variable not set**
   - Check Lambda > Configuration > Environment variables
   - Should have `QUOTES_TABLE=inspectionwale-quotes`

2. **Missing DynamoDB permissions**
   - Check Lambda execution role has DynamoDB PutItem permission

3. **Wrong table name**
   - Verify table name matches exactly (case-sensitive)

### Issue: 500 Internal Server Error
**Solution**:
- Go to Lambda Console > Your function > Monitor tab
- Click **View CloudWatch logs**
- Click the latest log stream
- Look for error messages and stack traces
- Common issues:
  - Missing environment variables
  - Missing IAM permissions
  - Invalid table name

---

## Quick Reference: Environment Variables Needed

Set these in Lambda function Configuration > Environment variables:

| Variable | Example Value | Description |
|----------|--------------|-------------|
| `QUOTES_TABLE` | `inspectionwale-quotes` | DynamoDB table name |
| `SES_FROM` | `noreply@yourdomain.com` | Verified sender email |
| `SES_TO` | `admin@yourdomain.com` | Email to receive quotes |

**Note**: `AWS_REGION` is automatically set by Lambda based on where the function is deployed (us-east-1 in your case)

---

## Security Best Practices

1. **Use least-privilege IAM policies** — only grant Lambda the specific permissions it needs
2. **Verify SES emails** — prevents unauthorized use of your email addresses
3. **Enable CloudWatch logging** — helps with debugging and monitoring
4. **Set up CloudWatch alarms** — alert on Lambda errors or high usage
5. **Add rate limiting** — consider using API Gateway throttling to prevent abuse
6. **Validate input** — Lambda already checks for required fields; consider adding phone/email format validation
7. **Add CAPTCHA** — optional: add Google reCAPTCHA to booking form to prevent spam

---

## Next Steps

1. ✅ Create DynamoDB table `inspectionwale-quotes`
2. ✅ Verify SES sender and recipient emails in us-east-1
3. ✅ Configure Lambda environment variables
4. ✅ Grant Lambda permissions (DynamoDB + SES)
5. ✅ Set up API proxy rewrite in Amplify Console
6. ✅ Test Lambda function directly
7. ✅ Test from live website
8. ✅ Monitor CloudWatch logs for errors

Once all steps are complete, your quote/booking system will:
- Accept form submissions from website
- Store submissions in DynamoDB
- Send email notifications via SES
- Show success/error messages to users

---

**Support**: If you encounter issues, check:
- Lambda CloudWatch logs: Console > Lambda > Functions > [Your function] > Monitor > View CloudWatch logs
- API Gateway logs: Console > API Gateway > [Your API] > Stages > Logs
- SES sending statistics: Console > SES > Account dashboard > Sending statistics

Good luck! 🚀
