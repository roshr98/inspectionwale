# 🚀 Figma to Backend - Complete Quick Start Guide

## For Figma Users New to Development

This guide helps you integrate your Figma Make project with a Python backend - **no prior coding experience required!**

---

## 📚 Table of Contents
1. [What You Have Now](#what-you-have-now)
2. [What You Need](#what-you-need)
3. [5-Step Integration](#5-step-integration)
4. [Testing Your Integration](#testing-your-integration)
5. [Going Live](#going-live)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 What You Have Now

Your Figma Make project is a **React web application** that runs in the browser:

```
┌─────────────────────────────────────┐
│   YOUR CURRENT SYSTEM (Frontend)    │
├─────────────────────────────────────┤
│                                      │
│  User fills form                     │
│       ↓                              │
│  Data saved to browser cache         │
│  (localStorage)                      │
│       ↓                              │
│  Report generated                    │
│                                      │
│  ⚠️ Problem:                         │
│  - Data lost if browser cleared     │
│  - Can't share between devices      │
│  - No central database              │
│                                      │
└─────────────────────────────────────┘
```

---

## 💡 What You Need

A **backend server** to store data permanently:

```
┌─────────────────────────────────────────────────┐
│        INTEGRATED SYSTEM (Full Stack)           │
├─────────────────────────────────────────────────┤
│                                                  │
│  User fills form                                 │
│       ↓                                          │
│  Saved to browser (instant backup)               │
│       ↓                                          │
│  Sent to server (permanent storage)              │
│       ↓                                          │
│  Saved in database                               │
│                                                  │
│  ✅ Benefits:                                    │
│  - Data never lost                               │
│  - Access from any device                        │
│  - Multiple users can share data                 │
│  - Generate reports from old inspections         │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 🛠️ 5-Step Integration

### Step 1: Download Your Figma Make Project

Since Figma Make runs in the browser, you need to get the actual code files:

**Option A: Using Figma Make's Export (if available)**
1. In Figma Make interface, look for "Export" or "Download" button
2. Download the project as ZIP
3. Extract to a folder on your computer

**Option B: Manual Download**
1. Your project files are already visible in the Figma Make editor
2. Copy all code files to your local computer
3. Create this folder structure:

```
inspectionwale-project/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   └── components/
│   ├── utils/
│   └── styles/
├── package.json
└── README.md
```

---

### Step 2: Install Required Software

You need 3 things on your computer:

#### A. **Node.js** (For React frontend)
```bash
# Download from: https://nodejs.org/
# Choose "LTS" version
# After install, verify:
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

#### B. **Python** (For backend server)
```bash
# Download from: https://www.python.org/downloads/
# Choose latest version (3.11+)
# After install, verify:
python --version  # Should show Python 3.11.x or higher
pip --version     # Should show pip 23.x or higher
```

#### C. **PostgreSQL** (For database) - Optional, can use SQLite for testing
```bash
# PostgreSQL (Production): https://www.postgresql.org/download/
# OR
# SQLite (Testing): Built into Python, nothing to install!
```

---

### Step 3: Setup React Frontend

Open terminal/command prompt in your project folder:

```bash
# Navigate to project
cd inspectionwale-project

# Install dependencies
npm install

# Start development server
npm run dev
```

Your app should open at: `http://localhost:5173`

**✅ Test:** Fill the form, click "View Report" - should work!

---

### Step 4: Create Python Backend

Create a new file `backend.py` in your project root:

```python
# backend.py - Simple Flask Backend

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Allow React to communicate with Python

# Simple JSON file storage (No database needed for testing!)
DATA_FILE = 'inspections.json'

# Load existing data
def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return {}

# Save data
def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

# ========================================
# API ENDPOINTS
# ========================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Check if server is running"""
    return jsonify({'status': 'ok', 'message': 'Backend is running!'})

@app.route('/api/inspections', methods=['POST'])
def create_inspection():
    """Save inspection data"""
    try:
        data = request.get_json()
        inspection_id = data.get('inspection', {}).get('id')
        
        if not inspection_id:
            return jsonify({'error': 'Missing inspection ID'}), 400
        
        # Load existing data
        all_data = load_data()
        
        # Save this inspection
        all_data[inspection_id] = {
            'data': data,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        # Save to file
        save_data(all_data)
        
        print(f"✅ Saved inspection: {inspection_id}")
        
        return jsonify({
            'success': True,
            'inspection_id': inspection_id,
            'message': 'Inspection saved successfully!'
        }), 201
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/inspections/<inspection_id>', methods=['GET'])
def get_inspection(inspection_id):
    """Get inspection by ID"""
    try:
        all_data = load_data()
        
        if inspection_id not in all_data:
            return jsonify({'error': 'Inspection not found'}), 404
        
        return jsonify(all_data[inspection_id]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/inspections', methods=['GET'])
def list_inspections():
    """List all inspections"""
    try:
        all_data = load_data()
        
        inspections = []
        for inspection_id, info in all_data.items():
            inspections.append({
                'id': inspection_id,
                'registration': info['data'].get('vehicle', {}).get('registration_number', 'N/A'),
                'date': info['data'].get('inspection', {}).get('date', 'N/A'),
                'created_at': info.get('created_at')
            })
        
        return jsonify({
            'inspections': inspections,
            'total': len(inspections)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Run server
if __name__ == '__main__':
    print("🚀 Starting Inspectionwale Backend...")
    print("📡 Server running at: http://localhost:5000")
    print("🔍 Test: http://localhost:5000/api/health")
    app.run(debug=True, port=5000)
```

#### Install Python dependencies:

```bash
pip install flask flask-cors
```

#### Start Python backend:

```bash
python backend.py
```

You should see:
```
🚀 Starting Inspectionwale Backend...
📡 Server running at: http://localhost:5000
🔍 Test: http://localhost:5000/api/health
```

**✅ Test:** Open browser → `http://localhost:5000/api/health`  
Should show: `{"status": "ok", "message": "Backend is running!"}`

---

### Step 5: Connect React to Python

Update `/src/utils/dataLoader.ts` to add API integration:

Add this code at the top of the file:

```typescript
// ========================================
// API CONFIGURATION
// ========================================

const API_BASE_URL = 'http://localhost:5000/api';
const API_ENABLED = true;  // Set to false to disable backend

// ========================================
// BACKEND SYNC FUNCTION
// ========================================

export async function syncToBackend(data: any): Promise<boolean> {
  if (!API_ENABLED) {
    console.log('⚠️ Backend sync disabled');
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/inspections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Synced to backend:', result);
    return true;
  } catch (error) {
    console.error('❌ Backend sync failed:', error);
    return false;
  }
}
```

Then update the `saveInspectionData` function:

```typescript
export function saveInspectionData(data: any) {
  // Save to localStorage (immediate)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('✅ Saved to localStorage');
  } catch (error) {
    console.error('❌ localStorage save failed:', error);
  }

  // Sync to backend (asynchronous)
  if (data.inspection?.id) {
    syncToBackend(data)
      .then(success => {
        if (success) {
          console.log('✅ Auto-synced to backend');
        }
      })
      .catch(() => {
        console.warn('⚠️ Backend sync failed, data saved locally only');
      });
  }
}
```

---

## 🧪 Testing Your Integration

### Test 1: Backend Health Check

1. Open browser
2. Go to: `http://localhost:5000/api/health`
3. Should see: `{"status": "ok", ...}`

✅ **Pass:** Backend is running!  
❌ **Fail:** Check that `python backend.py` is running

---

### Test 2: Fill Form and Save

1. Open your React app: `http://localhost:5173`
2. Fill out the inspection form (at least inspection ID and vehicle number)
3. Click "Save Data" or wait for auto-save
4. Open browser console (F12)
5. Look for: `✅ Auto-synced to backend`

✅ **Pass:** Data is being sent to backend!  
❌ **Fail:** Check CORS errors in console

---

### Test 3: Check Data Saved

1. Look in your project folder
2. Find file: `inspections.json`
3. Open it - should contain your inspection data!

```json
{
  "INS-2024-001": {
    "data": {
      "inspection": { ... },
      "vehicle": { ... }
    },
    "created_at": "2024-12-28T10:30:00",
    "updated_at": "2024-12-28T10:30:00"
  }
}
```

✅ **Pass:** Data is saved to file!  
❌ **Fail:** Check Python terminal for errors

---

### Test 4: Retrieve Data

1. Open browser
2. Go to: `http://localhost:5000/api/inspections`
3. Should see list of all inspections

```json
{
  "inspections": [
    {
      "id": "INS-2024-001",
      "registration": "MH01AB1234",
      "date": "2024-12-28",
      "created_at": "2024-12-28T10:30:00"
    }
  ],
  "total": 1
}
```

✅ **Pass:** Backend can retrieve data!  
❌ **Fail:** Fill the form again and try

---

## 🌐 Going Live (Production Deployment)

### Option 1: Simple Deployment (Free!)

**A. Deploy Frontend to Netlify:**

1. Build React app:
   ```bash
   npm run build
   ```

2. Sign up at: https://netlify.com (free)

3. Drag & drop the `dist/` or `build/` folder

4. Your app is live! 🎉  
   URL: `https://inspectionwale-abc123.netlify.app`

**B. Deploy Backend to Render:**

1. Create account: https://render.com (free)

2. Create `requirements.txt`:
   ```bash
   pip freeze > requirements.txt
   ```

3. Push code to GitHub

4. Connect GitHub to Render

5. Deploy backend

6. Your API is live! 🎉  
   URL: `https://inspectionwale-api.onrender.com`

**C. Update API URL:**

In `/src/utils/dataLoader.ts`:
```typescript
const API_BASE_URL = 'https://inspectionwale-api.onrender.com/api';
```

Rebuild and redeploy frontend → Done! ✅

---

### Option 2: Professional Deployment

**Frontend:** Vercel, AWS S3 + CloudFront, or your own VPS  
**Backend:** AWS EC2, DigitalOcean Droplet, Google Cloud Run  
**Database:** PostgreSQL on AWS RDS, DigitalOcean Managed Database

See `BACKEND_INTEGRATION_GUIDE.md` for detailed steps.

---

## 🆘 Troubleshooting

### Problem: "CORS Error" in Browser Console

**Error:**
```
Access to fetch at 'http://localhost:5000' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Solution:**
```python
# In backend.py, make sure you have:
from flask_cors import CORS
app = Flask(__name__)
CORS(app)  # ← This line is critical!
```

Restart Python backend: `python backend.py`

---

### Problem: "Connection Refused"

**Error:**
```
Failed to fetch
TypeError: NetworkError when attempting to fetch resource
```

**Solution:**
- Check Python backend is running: `python backend.py`
- Check port is correct: `http://localhost:5000` (not 5173)
- Check firewall isn't blocking port 5000

---

### Problem: "Module not found: flask"

**Error:**
```
ModuleNotFoundError: No module named 'flask'
```

**Solution:**
```bash
pip install flask flask-cors
# OR if using Python 3:
pip3 install flask flask-cors
```

---

### Problem: Data not saving to backend

**Check:**
1. Browser console for errors (F12)
2. Python terminal for errors
3. `inspections.json` file created?

**Debug:**
```typescript
// In dataLoader.ts, add more logs:
export async function syncToBackend(data: any): Promise<boolean> {
  console.log('🔍 Attempting backend sync...');
  console.log('📤 Data to send:', data);
  
  try {
    const response = await fetch(`${API_BASE_URL}/inspections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    console.log('📥 Response status:', response.status);
    const result = await response.json();
    console.log('📥 Response data:', result);
    
    return true;
  } catch (error) {
    console.error('❌ Sync error:', error);
    return false;
  }
}
```

---

## 📊 Quick Reference

### Running Both Servers Simultaneously

**Terminal 1 (React):**
```bash
cd inspectionwale-project
npm run dev
# → http://localhost:5173
```

**Terminal 2 (Python):**
```bash
cd inspectionwale-project
python backend.py
# → http://localhost:5000
```

Keep both running while developing!

---

### File Structure After Integration

```
inspectionwale-project/
├── src/                         # React frontend
│   ├── app/
│   ├── utils/
│   └── styles/
│
├── backend.py                    # Python backend (NEW!)
├── inspections.json              # Data storage (NEW!)
├── requirements.txt              # Python deps (NEW!)
│
├── package.json                  # React deps
├── ARCHITECTURE_GUIDE.md         # System docs
├── BACKEND_INTEGRATION_GUIDE.md  # This guide
└── README.md
```

---

## ✅ Success Checklist

After following this guide, you should have:

- [ ] ✅ React app running on `localhost:5173`
- [ ] ✅ Python backend running on `localhost:5000`
- [ ] ✅ Form data auto-syncs to backend
- [ ] ✅ Data saved in `inspections.json` file
- [ ] ✅ Can retrieve data via API
- [ ] ✅ Console shows "✅ Auto-synced to backend"
- [ ] ✅ No CORS errors
- [ ] ✅ Both servers run without crashes

---

## 🎓 Next Steps

**Level 1 (Current):** File-based storage (JSON)  
**Level 2:** Add PostgreSQL database  
**Level 3:** Add user authentication  
**Level 4:** Deploy to cloud  
**Level 5:** Add email reports, PDF export, analytics

See `BACKEND_INTEGRATION_GUIDE.md` for advanced topics!

---

## 🎉 Congratulations!

You've successfully integrated your Figma design with a Python backend!

Your inspection system now:
- ✅ Saves data permanently
- ✅ Can be accessed by multiple users
- ✅ Has a real API
- ✅ Is ready for production deployment

**Happy Building! 🚀**

---

*Need help? Review the detailed guides:*
- *ARCHITECTURE_GUIDE.md - Complete field structure*
- *BACKEND_INTEGRATION_GUIDE.md - Advanced backend setup*
- *CHANGES_SUMMARY.md - Recent updates*

---

*Last Updated: December 28, 2025*
