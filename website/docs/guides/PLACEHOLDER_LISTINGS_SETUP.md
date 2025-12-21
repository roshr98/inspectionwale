# Placeholder Listings - Quick Reference

## 📸 Image Upload Checklist

### Required Images (24 total = 6 per car × 4 cars)

#### Car 1: Honda City 2020
- [ ] honda-city-front.jpg
- [ ] honda-city-back.jpg
- [ ] honda-city-left.jpg
- [ ] honda-city-right.jpg
- [ ] honda-city-seat.jpg
- [ ] honda-city-cluster.jpg

#### Car 2: Maruti Swift 2019
- [ ] swift-front.jpg
- [ ] swift-back.jpg
- [ ] swift-left.jpg
- [ ] swift-right.jpg
- [ ] swift-seat.jpg
- [ ] swift-cluster.jpg

#### Car 3: Hyundai Creta 2021
- [ ] creta-front.jpg
- [ ] creta-back.jpg
- [ ] creta-left.jpg
- [ ] creta-right.jpg
- [ ] creta-seat.jpg
- [ ] creta-cluster.jpg

#### Car 4: Tata Nexon 2022
- [ ] nexon-front.jpg
- [ ] nexon-back.jpg
- [ ] nexon-left.jpg
- [ ] nexon-right.jpg
- [ ] nexon-seat.jpg
- [ ] nexon-cluster.jpg

---

## 🚀 Quick Setup Steps

### 1. Get Images
**Free Stock Photo Sites:**
- [Unsplash](https://unsplash.com/s/photos/honda-city) - Search "honda city", "maruti swift", etc.
- [Pexels](https://www.pexels.com/search/car/) - Free car images
- [Pixabay](https://pixabay.com/images/search/car/) - No attribution required

**What to look for:**
- High resolution (at least 1200px wide)
- Clear, well-lit photos
- Different angles: front, back, left side, right side
- Interior: seats, dashboard/cluster

### 2. Rename Files
Download and rename according to the checklist above. **File names must match exactly!**

### 3. Upload to S3
```
Bucket: inspectionwale-car-listings
Folder: placeholders/
Files: All 24 renamed images
```

### 4. Add to DynamoDB
Use `SEED_CAR_LISTINGS.json` - copy each listing and add via DynamoDB Console.

---

## ⚡ Quick Commands

### Check if S3 folder exists
```bash
aws s3 ls s3://inspectionwale-car-listings/placeholders/
```

### Upload all images at once (if in a folder)
```bash
aws s3 cp ./placeholder-images/ s3://inspectionwale-car-listings/placeholders/ --recursive
```

### Verify all 24 images uploaded
```bash
aws s3 ls s3://inspectionwale-car-listings/placeholders/ --recursive | wc -l
# Should show 24
```

### Check DynamoDB for placeholders
```bash
aws dynamodb scan --table-name CarListings --filter-expression "isPlaceholder = :val" --expression-attribute-values '{":val":{"BOOL":true}}' --region us-east-1
```

---

## 📋 Expected Result

After completing setup, your website carousel will show:

1. **Honda City VX CVT 2020**
   - Price: ₹9.5 Lakh
   - Mileage: 28,000 km
   - 6 photos

2. **Maruti Swift ZXi+ AMT 2019**
   - Price: ₹6.25 Lakh
   - Mileage: 42,000 km
   - 6 photos

3. **Hyundai Creta SX(O) Diesel 2021**
   - Price: ₹14.5 Lakh
   - Mileage: 35,000 km
   - 6 photos

4. **Tata Nexon XZ+ Dark 2022**
   - Price: ₹11.25 Lakh
   - Mileage: 18,000 km
   - 6 photos

---

## 🔧 Troubleshooting

### Images not showing in carousel?
- Check S3 URLs in browser (copy from DynamoDB item)
- Verify file names match exactly (case-sensitive)
- Check S3 bucket CORS configuration
- Verify `status: "approved"` in DynamoDB

### Carousel shows broken image icons?
- Files might not be uploaded or named incorrectly
- Check browser console for 403/404 errors
- Verify S3 bucket name in environment variables

### Listings not appearing at all?
- Check `status` field is `"approved"` (lowercase)
- Verify API Gateway endpoint is correct in `js/main.js`
- Check Lambda CloudWatch logs for errors
- Test Lambda function directly with GET event

---

## 💡 Pro Tips

1. **Use consistent image dimensions** (e.g., 1600×900) for all photos
2. **Compress images** to reduce load time (use tinypng.com)
3. **Update prices** periodically to keep listings fresh
4. **Track which listings get most interest** and adjust accordingly
5. **Add more placeholders** using the same pattern if needed

---

## 🗑️ Cleanup (When Real Listings Arrive)

When you have enough real customer listings:

1. Go to DynamoDB → CarListings table
2. Scan for items where `isPlaceholder = true`
3. Delete those 4 items
4. Optionally delete S3 `placeholders/` folder to save storage costs

**Note:** You can keep them indefinitely if they generate leads!
