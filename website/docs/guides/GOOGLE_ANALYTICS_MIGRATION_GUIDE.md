# 📊 Google Analytics Migration Guide: WhizzCheck → InspectionWale

## Overview
You're migrating from `whizzcheck.com` to `inspectionwale.com` using the same Google account (prasad.devadiga333@gmail.com). This guide ensures a smooth transition without losing historical data.

---

## 🎯 Two Approaches

### Approach 1: Rename Existing Property (Recommended) ⭐
**Pros:**
- ✅ Keeps all historical data
- ✅ Preserves existing tracking setup
- ✅ Same Measurement ID works for both sites
- ✅ Easy to compare WhizzCheck vs InspectionWale performance
- ✅ No cost increase

**Cons:**
- ⚠️ Mixed data if both sites are active (can be filtered)

**Best for:** You want to see historical trends and compare performance

---

### Approach 2: Create Separate Property
**Pros:**
- ✅ Clean separation of data
- ✅ Easier reporting per site
- ✅ Different team access if needed

**Cons:**
- ❌ Loses historical context
- ❌ Can't compare trends easily
- ❌ More complex setup

**Best for:** You're completely shutting down WhizzCheck

---

## 📋 Approach 1: Rename & Expand (Recommended)

### Step 1: Login to Google Analytics
1. Go to: https://analytics.google.com/
2. Login with: **prasad.devadiga333@gmail.com**
3. You should see your existing account and property

### Step 2: Find Your Current Setup
1. Look at top-left corner - you'll see:
   - **Account name** (e.g., "WhizzCheck Account")
   - **Property name** (e.g., "WhizzCheck Website")
2. Click the property dropdown to confirm which one you're using

### Step 3: Rename Property
1. Click **Admin** (gear icon, bottom-left)
2. You'll see three columns: Account / Property / View (or Data Stream)
3. Under **Property** column:
   - Click "Property settings"
4. Update fields:
   ```
   Property name: WhizzCheck & InspectionWale
   (or just "InspectionWale" if WhizzCheck is shutting down)
   
   Industry category: Automotive
   Reporting time zone: (GMT+05:30) India Standard Time
   Currency: INR - Indian Rupee
   ```
5. Click **Save**

### Step 4: Update Data Stream
1. Still in **Admin** → Under **Property** column
2. Click "Data streams"
3. You'll see your existing web data stream (likely showing whizzcheck.com)
4. Click on the stream name
5. Update:
   ```
   Stream name: InspectionWale Website
   Enhanced measurement: ON (toggle all options for better tracking)
   ```
6. Scroll down to "Configure tag settings"
7. Add cross-domain measurement if needed

### Step 5: Add InspectionWale Domain
**There are two ways to handle this:**

#### Option A: Same Measurement ID for Both Sites (Easiest)
1. Keep the existing Measurement ID
2. Use it on BOTH whizzcheck.com AND inspectionwale.com
3. GA4 will automatically track them separately by hostname
4. You can filter reports by domain

**In your reports, filter like this:**
- Page location → Contains `inspectionwale.com` (new site)
- Page location → Contains `whizzcheck.com` (old site)

#### Option B: Create Second Data Stream (Separate Tracking)
1. In "Data streams" page → Click "Add stream"
2. Select "Web"
3. Enter:
   ```
   Website URL: https://www.inspectionwale.com
   Stream name: InspectionWale Website
   ```
4. Click "Create stream"
5. You'll get a NEW Measurement ID (e.g., G-XYZ456789)
6. Use this ID only on inspectionwale.com
7. Keep old ID on whizzcheck.com

**Recommendation:** Use Option A (same ID) for first 2-3 months to compare traffic, then split if needed.

### Step 6: Get Your Measurement ID
1. In "Data streams" page
2. Click on your stream
3. Top-right corner, you'll see:
   ```
   Measurement ID: G-XXXXXXXXXX
   ```
4. **Copy this ID** - Example: `G-1A2B3C4D5E`
5. Keep this handy for the next step

### Step 7: Update InspectionWale Website Code
**Open index.html:**
```powershell
cd "c:\Users\Administrator\Documents\Inpectionwale\website"
notepad index.html
```

**Find and Replace (around line 48-60):**
```html
<!-- OLD (placeholder): -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  gtag('config', 'G-XXXXXXXXXX', {

<!-- NEW (your actual ID): -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-1A2B3C4D5E"></script>
<script>
  gtag('config', 'G-1A2B3C4D5E', {
```

**Replace in TWO places:**
1. Line ~48: In the `src=` attribute
2. Line ~54: In the `gtag('config', ...)` call

**Save the file.**

### Step 8: Commit and Deploy
```powershell
# Make sure you're in the website directory
cd "c:\Users\Administrator\Documents\Inpectionwale\website"

# Check what changed
git diff index.html

# Should show your Measurement ID replacements
# If it looks good, commit:
git add index.html
git commit -m "Add Google Analytics tracking with Measurement ID"
git push origin main
```

**Wait 2-3 minutes** for AWS Amplify to auto-deploy.

### Step 9: Verify It's Working
**Test 1: Check Network Requests**
1. Open: https://www.inspectionwale.com
2. Press F12 (open DevTools)
3. Go to "Network" tab
4. Reload page (Ctrl+Shift+R for hard reload)
5. In filter box, type: `google`
6. You should see:
   - `gtag/js?id=G-YOUR_ID` ✅
   - `g/collect` (multiple requests) ✅
7. Click on `g/collect` → Preview tab
8. You should see your Measurement ID in the request

**Test 2: Check Real-Time Reports**
1. Go to: https://analytics.google.com/
2. Select your property (now named "InspectionWale" or "WhizzCheck & InspectionWale")
3. Left sidebar → Reports → **Realtime**
4. Keep this tab open
5. In another tab, open: https://www.inspectionwale.com
6. Browse around:
   - Click on listings
   - Click "List Your Car"
   - View different pages
7. Go back to GA4 Realtime tab
8. Within 30-60 seconds, you should see:
   ```
   Users by the minute: 1 user (that's you!)
   Event count by Event name: view_listing, page_view, etc.
   Users by Page title: InspectionWale pages
   ```
9. If you see this → **SUCCESS!** ✅

**Test 3: Check Custom Events**
1. On your website, click on a car listing card
2. In GA4 Realtime → Events
3. You should see: `view_listing` event
4. Click on it to see parameters:
   - `car_make`: Maruti
   - `car_model`: Brezza
   - `listing_id`: abc123
5. If you see these → Custom tracking working! ✅

### Step 10: Update WhizzCheck (if still active)
**If WhizzCheck.com is still running:**

1. Update whizzcheck.com with the SAME Measurement ID
2. Both sites will report to same property
3. GA4 automatically separates by hostname

**To filter data in reports:**
```
InspectionWale traffic:
- Add filter: Page location → Contains → inspectionwale.com

WhizzCheck traffic:
- Add filter: Page location → Contains → whizzcheck.com
```

**To see comparison:**
```
1. Reports → Engagement → Pages and screens
2. Add secondary dimension: "Hostname"
3. You'll see traffic split by domain
```

---

## 📋 Approach 2: Create New Property (Alternative)

### If You Want Completely Separate Tracking:

**Step 1: Create New Property**
1. Go to: https://analytics.google.com/
2. Login with prasad.devadiga333@gmail.com
3. Admin → Account column → Click "Create Property"
4. Enter:
   ```
   Property name: InspectionWale
   Reporting time zone: India Standard Time
   Currency: INR
   Industry category: Automotive
   Business size: Small
   ```
5. Click "Next"
6. Business objectives: Select relevant ones
7. Click "Create"

**Step 2: Create Data Stream**
1. Select platform: **Web**
2. Enter:
   ```
   Website URL: https://www.inspectionwale.com
   Stream name: InspectionWale Website
   Enhanced measurement: ON
   ```
3. Click "Create stream"
4. Copy the NEW Measurement ID

**Step 3: Update Website**
- Follow Step 7-9 from Approach 1 above
- Use the NEW Measurement ID

**Step 4: Keep WhizzCheck Separate**
- WhizzCheck continues using old Measurement ID
- InspectionWale uses new Measurement ID
- Completely independent reporting

---

## 🔑 Google Places API Update (For Reviews)

### Current Setup
You're using WhizzCheck's Google Cloud Project and Places API key to fetch reviews for InspectionWale.

### Option 1: Add InspectionWale to Existing API Key (Easiest) ⭐

**Step 1: Find Your API Key**
1. Go to: https://console.cloud.google.com/
2. Login with: prasad.devadiga333@gmail.com
3. Select your existing project (likely "WhizzCheck" or similar)
4. Left sidebar → APIs & Services → **Credentials**

**Step 2: Update API Key Restrictions**
1. Find your API key (the one used for Places API)
2. Click the **Edit** icon (pencil)
3. Under "Application restrictions":
   - If set to "HTTP referrers", you'll see whizzcheck.com listed
4. Add these referrers:
   ```
   https://inspectionwale.com/*
   https://www.inspectionwale.com/*
   http://localhost/*  (for local testing)
   ```
5. Keep existing WhizzCheck referrers too:
   ```
   https://whizzcheck.com/*
   https://www.whizzcheck.com/*
   ```
6. Click **Save**

**Step 3: Verify API Key Works**
1. Open: https://www.inspectionwale.com
2. Scroll to Google Reviews section
3. Reviews should load correctly
4. Check browser console (F12) for any API errors
5. If reviews show → API key working! ✅

### Option 2: Create New API Key for InspectionWale

**Only if you want separate billing/tracking:**

**Step 1: Enable Places API**
1. In Google Cloud Console
2. APIs & Services → **Library**
3. Search: "Places API"
4. Click "Enable" (if not already enabled)

**Step 2: Create New API Key**
1. APIs & Services → Credentials
2. Click "Create Credentials" → "API key"
3. Copy the generated key
4. Click "Restrict Key"
5. Settings:
   ```
   Name: InspectionWale Places API Key
   Application restrictions: HTTP referrers
   Website restrictions:
     - https://inspectionwale.com/*
     - https://www.inspectionwale.com/*
   API restrictions: Restrict key
   Select APIs: Places API
   ```
6. Click "Save"

**Step 3: Update Your Website**
1. Find where you load Google Places reviews
2. Look for the API key in your code
3. Replace with new key
4. Test that reviews still load

---

## 🧪 Testing Checklist

### Google Analytics Testing
- [ ] Measurement ID replaced in index.html (2 places)
- [ ] Changes committed and pushed to GitHub
- [ ] Amplify deployment completed (check AWS Console)
- [ ] Website loads without console errors
- [ ] Network tab shows `gtag/js` and `g/collect` requests
- [ ] GA4 Realtime shows "1 user" when you visit
- [ ] Custom events firing (view_listing, reserve_listing)
- [ ] Page views tracking correctly
- [ ] Event parameters captured (car_make, car_model, etc.)

### Google Places API Testing  
- [ ] Reviews section visible on homepage
- [ ] Reviews loading without errors
- [ ] No API key errors in console
- [ ] Review photos displaying
- [ ] Review ratings showing
- [ ] Review dates showing
- [ ] "View more on Google" link works

### Cross-Site Testing (if both active)
- [ ] WhizzCheck still tracking correctly
- [ ] InspectionWale tracking correctly
- [ ] Can filter GA4 reports by domain
- [ ] No duplicate events
- [ ] API key works on both sites

---

## 📊 Understanding Your Reports

### Key Reports to Check

**1. Realtime Report**
- Path: Reports → Realtime
- Shows: Users online right now, current page views
- Use for: Immediate verification that tracking works

**2. Engagement Overview**
- Path: Reports → Engagement → Overview
- Shows: Total users, sessions, engagement time
- Use for: Daily/weekly visitor counts

**3. Events Report**
- Path: Reports → Engagement → Events
- Shows: view_listing, reserve_listing, submit_listing counts
- Use for: Feature usage tracking

**4. Pages Report**
- Path: Reports → Engagement → Pages and screens
- Shows: Most viewed pages, time on page
- Use for: Understanding user journey

**5. Traffic Acquisition**
- Path: Reports → Acquisition → Traffic acquisition
- Shows: Where users come from (Google, Direct, Social)
- Use for: Marketing effectiveness

### Custom Reports You Can Create

**1. Listing Views by Car Make**
```
Dimension: Event parameter: car_make
Metric: Event count (view_listing)
```

**2. Reservation Conversion Rate**
```
Metric 1: view_listing events
Metric 2: reserve_listing events
Calculated: (reserve / view) * 100%
```

**3. WhizzCheck vs InspectionWale Traffic**
```
Dimension: Hostname
Metrics: Users, Sessions, Engagement rate
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Not Tracking in GA4"
**Symptoms:** No data in Realtime report, no requests in Network tab

**Solutions:**
1. Check Measurement ID is correct (no typos)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Disable ad blocker
4. Check Content Security Policy (CSP) allows Google domains
5. Wait 5-10 minutes (GA4 can have delay)
6. Check browser console for JavaScript errors

### Issue 2: "Reviews Not Loading"
**Symptoms:** Empty reviews section, console errors about API key

**Solutions:**
1. Verify API key has inspectionwale.com in referrers
2. Check Places API is enabled in Google Cloud Console
3. Check API key billing is active (free tier should work)
4. Verify API key hasn't expired
5. Check browser console for specific error message

### Issue 3: "Duplicate Events in GA4"
**Symptoms:** Same event firing multiple times

**Solutions:**
1. Check you don't have GA4 code loaded twice
2. Verify only ONE gtag.js script in index.html
3. Remove any old Universal Analytics code (analytics.js)
4. Check custom event code isn't in a loop

### Issue 4: "Can't Separate WhizzCheck and InspectionWale Data"
**Symptoms:** All traffic mixed together

**Solutions:**
1. Use "Hostname" dimension in reports
2. Create custom filter: Page location → Contains → inspectionwale.com
3. Create separate data streams (Option B in Approach 1)
4. Use Google Tag Manager for advanced filtering

---

## 💡 Pro Tips

### Tip 1: Set Up Custom Alerts
1. Admin → Property → Custom definitions
2. Create custom alerts for:
   - No traffic for 2 hours (site down?)
   - Spike in traffic (viral post?)
   - Error rate increase

### Tip 2: Create Saved Reports
1. Customize a report with filters
2. Click "Save report" → Name it
3. Access from Reports → Library

### Tip 3: Share Access with Team
1. Admin → Property access management
2. Add email: team@inspectionwale.com
3. Role: Viewer, Analyst, or Administrator
4. They can view data without login credentials

### Tip 4: Set Up Goals (Conversions)
1. Admin → Events
2. Mark these as conversions:
   - `reserve_listing` (main goal)
   - `submit_listing` (secondary goal)
3. Track conversion rates automatically

### Tip 5: Export Data Regularly
1. Reports → Any report
2. Top-right → Export
3. Formats: PDF, Google Sheets, CSV
4. Schedule automated exports if needed

---

## 📞 Need Help?

### Google Analytics Support
- Help center: https://support.google.com/analytics/
- Community: https://support.google.com/analytics/community
- YouTube: Search "Google Analytics 4 tutorial"

### Google Cloud Console Support
- Help center: https://cloud.google.com/support
- Stack Overflow: Tag your question with `google-cloud-platform`

### Check Your Implementation
```javascript
// Open browser console on your website and run:
console.log(window.dataLayer);
console.log(window.gtag);

// You should see objects/functions, not "undefined"
// If undefined, GA4 script didn't load correctly
```

---

## ✅ Final Checklist

### Before Going Live
- [ ] Decided on approach (rename vs new property)
- [ ] Updated property name and settings
- [ ] Updated data stream URL
- [ ] Copied Measurement ID
- [ ] Updated index.html with Measurement ID
- [ ] Committed and pushed to GitHub
- [ ] Verified Amplify deployment

### After Going Live
- [ ] Website loads without errors
- [ ] GA4 tracking confirmed in Realtime
- [ ] Custom events firing
- [ ] Google Reviews loading
- [ ] API key working
- [ ] Can filter reports by domain (if both sites active)

### Ongoing Monitoring
- [ ] Check GA4 daily for first week
- [ ] Monitor event counts
- [ ] Review error logs in console
- [ ] Compare WhizzCheck vs InspectionWale traffic
- [ ] Set up custom reports
- [ ] Mark conversions

---

## 🎉 You're Done!

**Result:**
- ✅ Google Analytics tracking InspectionWale traffic
- ✅ Historical WhizzCheck data preserved (if using rename approach)
- ✅ Custom events tracking user behavior
- ✅ Google Reviews still working
- ✅ Can compare old vs new site performance
- ✅ Real-time visitor monitoring
- ✅ Zero additional cost (GA4 free tier)

**Time Investment:** 30-45 minutes
**Monthly Cost:** $0 (Free tier)
**Data Retention:** 14 months
**Value:** Priceless insights into user behavior! 📊

---

**Last Updated:** January 2025  
**Account:** prasad.devadiga333@gmail.com  
**Sites:** whizzcheck.com → inspectionwale.com  
**Status:** ✅ Ready to implement
