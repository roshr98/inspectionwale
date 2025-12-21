# 🚗 Add 4 Placeholder Cars to DynamoDB - Step by Step Guide

## ✅ **Before You Start**
- Website is live: ✅
- DynamoDB table "CarListings" exists: ✅
- Region set to us-east-1: ✅

---

## 📋 **STEP-BY-STEP INSTRUCTIONS**

### **For Each Car (Repeat 4 Times)**

#### **1. Open DynamoDB Console**
- Go to: https://console.aws.amazon.com/dynamodb
- Click **Tables** → **CarListings**
- Click **"Explore table items"** button (top right)

#### **2. Create New Item**
- Click **"Create item"** button (top right)
- Click **"JSON view"** toggle (top of form)
- You'll see a text editor with `{}`

#### **3. Paste JSON Below**
- **Delete the `{}`** in the editor
- **Copy the JSON for CAR 1** (below)
- **Paste it** into the editor
- Click **"Create item"** button at bottom

#### **4. Verify & Repeat**
- You should see "Item created successfully"
- Repeat steps 2-3 for CAR 2, CAR 3, CAR 4

---

## 🚗 **CAR 1: Tata Altroz (Copy this entire JSON)**

```json
{
  "listingId": "placeholder-001",
  "status": "approved",
  "isPlaceholder": true,
  "createdAt": "2025-10-12T10:00:00.000Z",
  "updatedAt": "2025-10-12T10:00:00.000Z",
  "seller": {
    "name": "Verified Owner",
    "mobile": "9876543210",
    "email": "hello@inspectionwale.com"
  },
  "car": {
    "make": "Tata",
    "model": "Altroz",
    "edition": "XZ Plus",
    "registrationYear": "2021",
    "kmsDriven": "32000",
    "expectedPrice": "750000"
  },
  "photos": {
    "exteriorFront": {
      "key": "Images/Car-3.jpg",
      "url": "Images/Car-3.jpg",
      "contentType": "image/jpeg"
    },
    "exteriorBack": {
      "key": "Images/Car-3.jpg",
      "url": "Images/Car-3.jpg",
      "contentType": "image/jpeg"
    },
    "exteriorLeft": {
      "key": "Images/Car-3.jpg",
      "url": "Images/Car-3.jpg",
      "contentType": "image/jpeg"
    },
    "exteriorRight": {
      "key": "Images/Car-3.jpg",
      "url": "Images/Car-3.jpg",
      "contentType": "image/jpeg"
    },
    "interiorSeat": {
      "key": "Images/Car-3.jpg",
      "url": "Images/Car-3.jpg",
      "contentType": "image/jpeg"
    },
    "interiorCluster": {
      "key": "Images/Car-3.jpg",
      "url": "Images/Car-3.jpg",
      "contentType": "image/jpeg"
    }
  }
}
```

✅ **After pasting, click "Create item"**

---

## 🚗 **CAR 2: Hyundai i10 (Copy this entire JSON)**

**⚠️ IMPORTANT: Don't use JSON view in DynamoDB Console - it expects a different format!**

**Use this method instead:**

1. Click **"Create item"**
2. Stay in **FORM view** (don't click JSON toggle)
3. Click **"Add new attribute"** for each field below:

### **Attributes to Add:**

**String attributes:**
- `listingId` (String) = `placeholder-002`
- `status` (String) = `approved`
- `createdAt` (String) = `2025-10-12T09:30:00.000Z`
- `updatedAt` (String) = `2025-10-12T09:30:00.000Z`

**Boolean attribute:**
- `isPlaceholder` (Boolean) = `true` ✅

**Map attributes (nested objects):**

**seller** (Map):
- Add attribute → name: `seller`, type: `Map`
- Inside seller map, add 3 String attributes:
  - `name` = `Verified Owner`
  - `mobile` = `9876543210`
  - `email` = `hello@inspectionwale.com`

**car** (Map):
- Add attribute → name: `car`, type: `Map`
- Inside car map, add 6 String attributes:
  - `make` = `Hyundai`
  - `model` = `i10`
  - `edition` = `Sportz`
  - `registrationYear` = `2020`
  - `kmsDriven` = `38000`
  - `expectedPrice` = `525000`

**photos** (Map):
- Add attribute → name: `photos`, type: `Map`
- Inside photos map, add 6 Map attributes (exteriorFront, exteriorBack, exteriorLeft, exteriorRight, interiorSeat, interiorCluster)
- Each of those 6 maps contains 3 String attributes:
  - `key` = `Images/Car-4.jpg`
  - `url` = `Images/Car-4.jpg`
  - `contentType` = `image/jpeg`

---

**OR USE THIS EASIER METHOD:**

```json
{
  "listingId": {
    "S": "placeholder-002"
  },
  "status": {
    "S": "approved"
  },
  "isPlaceholder": {
    "BOOL": true
  },
  "createdAt": {
    "S": "2025-10-12T09:30:00.000Z"
  },
  "updatedAt": {
    "S": "2025-10-12T09:30:00.000Z"
  },
  "seller": {
    "name": "Verified Owner",
    "mobile": "9876543210",
    "email": "hello@inspectionwale.com"
  },
  "car": {
    "make": "Hyundai",
    "model": "i10",
    "edition": "Sportz",
    "registrationYear": "2020",
    "kmsDriven": "38000",
    "expectedPrice": "525000"
  },
  "photos": {
    "exteriorFront": {
      "key": "Images/Car-4.jpg",
      "url": "Images/Car-4.jpg",
      "contentType": "image/jpeg"
    },
    "exteriorBack": {
      "key": "Images/Car-4.jpg",
      "url": "Images/Car-4.jpg",
      "contentType": "image/jpeg"
    },
    "exteriorLeft": {
      "key": "Images/Car-4.jpg",
      "url": "Images/Car-4.jpg",
      "contentType": "image/jpeg"
    },
    "exteriorRight": {
      "key": "Images/Car-4.jpg",
      "url": "Images/Car-4.jpg",
      "contentType": "image/jpeg"
    },
    "interiorSeat": {
      "key": "Images/Car-4.jpg",
      "url": "Images/Car-4.jpg",
      "contentType": "image/jpeg"
    },
    "interiorCluster": {
      "key": "Images/Car-4.jpg",
      "url": "Images/Car-4.jpg",
      "contentType": "image/jpeg"
    }
  }
}
```

✅ **After pasting, click "Create item"**

---

## 🚗 **CAR 3: Maruti Baleno (Copy this entire JSON)**

```json
{
  "listingId": "placeholder-003",
  "status": "approved",
  "isPlaceholder": true,
  "createdAt": "2025-10-12T08:45:00.000Z",
  "updatedAt": "2025-10-12T08:45:00.000Z",
  "seller": {
    "name": "Verified Owner",
    "mobile": "9876543210",
    "email": "hello@inspectionwale.com"
  },
  "car": {
    "make": "Maruti Suzuki",
    "model": "Baleno",
    "edition": "Delta CVT",
    "registrationYear": "2022",
    "kmsDriven": "15000",
    "expectedPrice": "825000"
  },
  "photos": {
    "exteriorFront": {
      "key": "Images/Car-1.jpg",
      "url": "Images/Car-1.jpg",
      "contentType": "image/jpeg"
    },
    "exteriorBack": {
      "key": "Images/Car-1.jpg",
      "url": "Images/Car-1.jpg",
      "contentType": "image/jpeg"
    },
    "exteriorLeft": {
      "key": "Images/Car-1.jpg",
      "url": "Images/Car-1.jpg",
      "contentType": "image/jpeg"
    },
    "exteriorRight": {
      "key": "Images/Car-1.jpg",
      "url": "Images/Car-1.jpg",
      "contentType": "image/jpeg"
    },
    "interiorSeat": {
      "key": "Images/Car-1.jpg",
      "url": "Images/Car-1.jpg",
      "contentType": "image/jpeg"
    },
    "interiorCluster": {
      "key": "Images/Car-1.jpg",
      "url": "Images/Car-1.jpg",
      "contentType": "image/jpeg"
    }
  }
}
```

✅ **After pasting, click "Create item"**

---

## 🚗 **CAR 4: Honda Amaze (Copy this entire JSON)**

```json
{
  "listingId": "placeholder-004",
  "status": "approved",
  "isPlaceholder": true,
  "createdAt": "2025-10-12T07:15:00.000Z",
  "updatedAt": "2025-10-12T07:15:00.000Z",
  "seller": {
    "name": "Verified Owner",
    "mobile": "9876543210",
    "email": "hello@inspectionwale.com"
  },
  "car": {
    "make": "Honda",
    "model": "Amaze",
    "edition": "VX Petrol",
    "registrationYear": "2021",
    "kmsDriven": "22000",
    "expectedPrice": "695000"
  },
  "photos": {
    "exteriorFront": {
      "key": "Images/Car-2.jpg",
      "url": "Images/Car-2.jpg",
      "contentType": "image/jpeg"
    },
    "exteriorBack": {
      "key": "Images/Car-2.jpg",
      "url": "Images/Car-2.jpg",
      "contentType": "image/jpeg"
    },
    "exteriorLeft": {
      "key": "Images/Car-2.jpg",
      "url": "Images/Car-2.jpg",
      "contentType": "image/jpeg"
    },
    "exteriorRight": {
      "key": "Images/Car-2.jpg",
      "url": "Images/Car-2.jpg",
      "contentType": "image/jpeg"
    },
    "interiorSeat": {
      "key": "Images/Car-2.jpg",
      "url": "Images/Car-2.jpg",
      "contentType": "image/jpeg"
    },
    "interiorCluster": {
      "key": "Images/Car-2.jpg",
      "url": "Images/Car-2.jpg",
      "contentType": "image/jpeg"
    }
  }
}
```

✅ **After pasting, click "Create item"**

---

## ✅ **VERIFICATION (After Adding All 4 Cars)**

### **1. Check DynamoDB**
- You should see 4 items in the CarListings table
- All should have `status = approved`

### **2. Refresh Your Website**
- Go back to your live website
- Hard refresh: **Ctrl + Shift + R** (Windows) or **Cmd + Shift + R** (Mac)
- Scroll to "Featured Owner Deals" section
- **You should now see all 4 cars!** 🎉

### **3. Test Functionality**
- Click on any car card → Detail modal should open
- Click "Reserve" → Form should appear
- Click "Book an Inspection" → Should scroll to inspection form with pre-filled data

---

## 🎯 **Expected Results:**

After adding all 4 cars, your carousel should show:

1. **Tata Altroz XZ Plus 2021** - ₹7.5 Lakh | 32,000 KMs
2. **Hyundai i10 Sportz 2020** - ₹5.25 Lakh | 38,000 KMs  
3. **Maruti Baleno Delta CVT 2022** - ₹8.25 Lakh | 15,000 KMs
4. **Honda Amaze VX Petrol 2021** - ₹6.95 Lakh | 22,000 KMs

---

## ⚠️ **Common Issues & Fixes**

### **Issue 1: Cars not showing after adding**
- **Fix**: Hard refresh browser (Ctrl + Shift + R)
- **Fix**: Check all 4 items have `"status": "approved"` (not "pending")
- **Fix**: Check browser console (F12) for errors

### **Issue 2: Images not loading**
- **Fix**: Verify Car-1.jpg, Car-2.jpg, Car-3.jpg, Car-4.jpg exist in Images/ folder
- **Fix**: Check image paths in JSON are exactly `Images/Car-X.jpg`

### **Issue 3: JSON paste error**
- **Fix**: Make sure you delete the `{}` before pasting
- **Fix**: Ensure JSON is valid (no missing commas or brackets)
- **Fix**: Switch to "Form view" if JSON view has issues, then paste as JSON attribute by attribute

---

## 🚀 **Ready to Add More Cars Later?**

When real customers submit cars:
1. They'll have status = "pending"
2. You review in DynamoDB
3. Change status to "approved"
4. Car appears on website automatically!

---

**Start with CAR 1 (Altroz) and work your way through. Let me know if you have any issues!** 🎉
