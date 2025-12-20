# Marketplace Email Integration Deployment Guide

## ✅ What's Been Implemented

### 1. Request Info Form (Car Detail Modal)
- **Location**: Car detail modal in marketplace
- **Fields**: First Name, Last Name, Email, Phone, Inquiry Type, Message
- **Button**: "REQUEST INFO" 
- **Functionality**: 
  - Validates all required fields
  - Sends email to InspectionWale with car details
  - Shows success/error messages
  - Subject: `Marketplace <Car Name> - Customer Inquiry`

### 2. Book Inspection Button
- **Location**: Car detail modal (green button at bottom)
- **Functionality**:
  - Opens inspection booking modal with **prefilled car details**
  - Pre-fills: Car make/model, year, KMs, car type, listing ID
  - Customer fills: Name, mobile, email
  - Subject: `Marketplace <Car Name> - Inspection Request Received`

### 3. Enhanced Lambda Function
- **File**: `amplify/functions/quote/src/index.js`
- **New Features**:
  - Handles `formType: 'marketplace-inquiry'` for Request Info
  - Handles `formType: 'marketplace-inspection'` for inspections
  - Custom email subjects with car names
  - Formatted email body with car details, customer info, inquiry type

## 🚀 Deployment Steps

### Step 1: Package Lambda Function

```bash
cd amplify/functions/quote/src
zip -r ../quote-updated.zip index.js package.json node_modules
cd ../../..
```

**Windows PowerShell:**
```powershell
cd amplify\functions\quote\src
Compress-Archive -Path index.js,package.json,node_modules -DestinationPath ..\quote-updated.zip -Force
cd ..\..\..
```

### Step 2: Deploy to AWS Lambda

1. **Open AWS Lambda Console**
   - Go to: https://console.aws.amazon.com/lambda
   - Region: `us-east-1` (match your Amplify region)

2. **Find Your Quote Lambda Function**
   - Search for function name (likely: `inspectionwale-quote` or similar)
   - Click on the function name

3. **Upload New Code**
   - Click "Upload from" → ".zip file"
   - Select: `amplify/functions/quote/quote-updated.zip`
   - Click "Save"
   - Wait for upload to complete

4. **Verify Environment Variables** (Required!)
   - Go to "Configuration" tab → "Environment variables"
   - Ensure these are set:
     - `SES_FROM`: `noreply@inspectionwale.com` (or your verified SES email)
     - `SES_TO`: `info@inspectionwale.com` (where you want to receive emails)
     - `QUOTES_TABLE`: Your DynamoDB table name
   - If missing, click "Edit" and add them

### Step 3: Test the Functionality

#### Test Request Info:
1. Go to marketplace: https://yoursite.com/car-marketplace
2. Click any car to open detail modal
3. Fill in the contact form:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Phone: 9876543210
   - Message: (optional)
4. Click "REQUEST INFO"
5. Should see success message
6. Check email at `info@inspectionwale.com`
   - Subject: `Marketplace <Car Name> - Customer Inquiry`

#### Test Book Inspection:
1. In the same car detail modal
2. Scroll down to green "Book Inspection" button
3. Click it
4. Modal should open with **car details already filled**
5. Fill your name, mobile, email
6. Click "Book Inspection"
7. Check email at `info@inspectionwale.com`
   - Subject: `Marketplace <Car Name> - Inspection Request Received`

## 📧 Email Format Examples

### Request Info Email:
```
Subject: Marketplace Hyundai i10 Sportz - Customer Inquiry

🚗 MARKETPLACE INQUIRY
==================

Car Details:
• Vehicle: Hyundai i10 Sportz
• Year: 2012
• Price: ₹1,30,000
• Listing ID: abc123

Customer Details:
• Name: John Doe
• Mobile: 9876543210
• Email: john@example.com

Inquiry Type: This Vehicle's Availability

Message:
Is this car still available?

Received: 2025-12-20T10:30:00.000Z
```

### Inspection Request Email:
```
Subject: Marketplace Hyundai i10 Sportz - Inspection Request Received

🔍 MARKETPLACE INSPECTION BOOKING
==============================

Car Details:
• Vehicle: Hyundai i10 Sportz
• Year: 2012
• KMs Driven: 95,000
• Listing ID: abc123

Customer Details:
• Name: John Doe
• Mobile: 9876543210
• Email: john@example.com

Inspection Type: Pre-Purchase Inspection
Car Type: Used Car

Received: 2025-12-20T10:30:00.000Z
```

## 🔧 Troubleshooting

### Email Not Received?
1. **Check SES Configuration**:
   - Verify `SES_FROM` is a verified email in AWS SES
   - Check SES is out of sandbox mode (or `SES_TO` is verified)

2. **Check Lambda Logs**:
   - Go to Lambda function → "Monitor" tab → "View CloudWatch logs"
   - Look for "SES send failed" errors

3. **Check Spam Folder**

### Form Not Submitting?
1. **Open Browser Console** (F12)
2. Look for errors
3. Common issues:
   - CORS errors (check Lambda allows origin)
   - Required fields validation

### Button Not Working?
- **Book Inspection redirects to homepage**: Make sure `bookingModal` exists on marketplace page
- **Request Info does nothing**: Check browser console for JavaScript errors

## 📝 Notes

- All changes pushed to GitHub: commit `dc991d9`
- AWS Amplify will auto-deploy frontend changes
- **Lambda must be manually updated** (one-time deployment above)
- After Lambda update, wait 2-3 minutes for deployment
- Hard refresh browser: `Ctrl+Shift+R`

## ✅ Success Checklist

- [ ] Lambda function updated with new code
- [ ] Environment variables configured (SES_FROM, SES_TO)
- [ ] Test Request Info - email received ✉️
- [ ] Test Book Inspection - email received ✉️
- [ ] Emails have correct subject lines with car names
- [ ] Form validation works (try submitting empty)
- [ ] Success/error messages display properly

## 🎯 What Users Will Experience

1. **Browse marketplace** → Click car → Opens detail modal
2. **Want to inquire?** → Fill contact form → Click "Request Info" → ✅ Success message
3. **Want inspection?** → Click "Book Inspection" → Modal with **car already filled** → Add your details → Submit
4. **InspectionWale receives** → Professional emails with car & customer details → Can respond immediately

Perfect marketplace inquiry system! 🚀
