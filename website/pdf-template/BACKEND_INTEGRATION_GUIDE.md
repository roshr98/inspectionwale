# 🔌 Backend Integration Guide - Python + React

## 📋 Complete Integration Steps

This guide explains how to connect this React frontend with a Python backend (Flask/Django/FastAPI).

---

## 🎯 Integration Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    CURRENT SYSTEM (Frontend Only)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  React App ──▶ localStorage ──▶ Browser Cache                   │
│  (Figma Make)      (JSON)         (Local)                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

                          ⬇️  INTEGRATION  ⬇️

┌─────────────────────────────────────────────────────────────────┐
│                 INTEGRATED SYSTEM (Full Stack)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  React App ──▶ REST API ──▶ Python Backend ──▶ Database         │
│  (Frontend)    (HTTP)       (Flask/Django)      (PostgreSQL)    │
│                                                                  │
│       │                          │                               │
│       │                          │                               │
│       └──▶ localStorage ◀────────┘                               │
│           (Offline Backup)                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Step 1: Export Your React App

### Option A: Static Build (Recommended for Production)

Since this is a Figma Make project, you'll need to export the built files:

1. **Build the React app:**
   ```bash
   # In your Figma Make project
   npm run build
   ```

2. **This creates a `dist/` or `build/` folder** with:
   ```
   build/
   ├── index.html
   ├── assets/
   │   ├── index-abc123.js
   │   ├── index-def456.css
   │   └── images/
   └── ...
   ```

3. **Copy these files** to your Python project's static folder

### Option B: Development Mode (For Testing)

Run React dev server alongside Python:

```bash
# Terminal 1 - React (Port 5173)
npm run dev

# Terminal 2 - Python Backend (Port 5000)
python app.py
```

Enable CORS in Python to allow cross-origin requests.

---

## 🐍 Step 2: Create Python Backend

### Option 1: Flask (Recommended for Beginners)

#### Install Flask

```bash
pip install flask flask-cors sqlalchemy flask-sqlalchemy psycopg2-binary
```

#### Create `app.py`

```python
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

app = Flask(__name__, static_folder='build', static_url_path='')
CORS(app)  # Enable CORS for React dev server

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:password@localhost/inspectionwale_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ========================================
# DATABASE MODELS
# ========================================

class Inspection(db.Model):
    """Main inspection record"""
    __tablename__ = 'inspections'
    
    id = db.Column(db.String(50), primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Inspection info
    inspection_date = db.Column(db.String(50))
    location = db.Column(db.String(200))
    inspector_name = db.Column(db.String(100))
    
    # Vehicle info
    registration_number = db.Column(db.String(50))
    chassis_number = db.Column(db.String(100))
    engine_number = db.Column(db.String(100))
    make_model = db.Column(db.String(200))
    variant = db.Column(db.String(200))
    fuel_type = db.Column(db.String(50))
    manufacturing_date = db.Column(db.String(50))
    registration_date = db.Column(db.String(50))
    
    # Complete inspection data (JSON)
    data = db.Column(db.JSON)
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'data': self.data
        }

# ========================================
# API ENDPOINTS
# ========================================

@app.route('/')
def serve_react_app():
    """Serve React app"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files"""
    return send_from_directory(app.static_folder, path)

# ----- CREATE INSPECTION -----

@app.route('/api/inspections', methods=['POST'])
def create_inspection():
    """
    Create new inspection
    
    Request Body:
    {
        "inspection": { "id": "INS-001", "date": "2024-01-15", ... },
        "vehicle": { "registration_number": "MH01AB1234", ... },
        "ratings": { ... },
        "front": { ... },
        ...
    }
    
    Response:
    {
        "success": true,
        "inspection_id": "INS-001",
        "message": "Inspection saved successfully"
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('inspection', {}).get('id'):
            return jsonify({'error': 'Missing inspection ID'}), 400
        
        inspection_id = data['inspection']['id']
        
        # Check if already exists
        existing = Inspection.query.get(inspection_id)
        if existing:
            return jsonify({'error': 'Inspection already exists'}), 409
        
        # Create new inspection
        inspection = Inspection(
            id=inspection_id,
            inspection_date=data.get('inspection', {}).get('date'),
            location=data.get('inspection', {}).get('location'),
            inspector_name=data.get('inspection', {}).get('inspector_name'),
            registration_number=data.get('vehicle', {}).get('registration_number'),
            chassis_number=data.get('vehicle', {}).get('chassis_number'),
            engine_number=data.get('vehicle', {}).get('engine_number'),
            make_model=data.get('vehicle', {}).get('make_model'),
            variant=data.get('vehicle', {}).get('variant'),
            fuel_type=data.get('vehicle', {}).get('fuel_type'),
            manufacturing_date=data.get('vehicle', {}).get('manufacturing_date'),
            registration_date=data.get('vehicle', {}).get('registration_date'),
            data=data  # Store complete JSON
        )
        
        db.session.add(inspection)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'inspection_id': inspection_id,
            'message': 'Inspection saved successfully'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ----- GET INSPECTION BY ID -----

@app.route('/api/inspections/<inspection_id>', methods=['GET'])
def get_inspection(inspection_id):
    """
    Get inspection by ID
    
    Response:
    {
        "id": "INS-001",
        "created_at": "2024-01-15T10:30:00",
        "data": { ... complete inspection data ... }
    }
    """
    try:
        inspection = Inspection.query.get(inspection_id)
        
        if not inspection:
            return jsonify({'error': 'Inspection not found'}), 404
        
        return jsonify(inspection.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ----- UPDATE INSPECTION -----

@app.route('/api/inspections/<inspection_id>', methods=['PUT'])
def update_inspection(inspection_id):
    """
    Update existing inspection
    
    Request Body: Same as create
    Response: Same as create
    """
    try:
        inspection = Inspection.query.get(inspection_id)
        
        if not inspection:
            return jsonify({'error': 'Inspection not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        inspection.inspection_date = data.get('inspection', {}).get('date')
        inspection.location = data.get('inspection', {}).get('location')
        inspection.inspector_name = data.get('inspection', {}).get('inspector_name')
        inspection.registration_number = data.get('vehicle', {}).get('registration_number')
        inspection.chassis_number = data.get('vehicle', {}).get('chassis_number')
        inspection.engine_number = data.get('vehicle', {}).get('engine_number')
        inspection.make_model = data.get('vehicle', {}).get('make_model')
        inspection.variant = data.get('vehicle', {}).get('variant')
        inspection.fuel_type = data.get('vehicle', {}).get('fuel_type')
        inspection.manufacturing_date = data.get('vehicle', {}).get('manufacturing_date')
        inspection.registration_date = data.get('vehicle', {}).get('registration_date')
        inspection.data = data
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'inspection_id': inspection_id,
            'message': 'Inspection updated successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ----- LIST ALL INSPECTIONS -----

@app.route('/api/inspections', methods=['GET'])
def list_inspections():
    """
    List all inspections with pagination
    
    Query Params:
    - page: Page number (default: 1)
    - per_page: Items per page (default: 20)
    - search: Search by registration number or inspection ID
    
    Response:
    {
        "inspections": [
            {
                "id": "INS-001",
                "registration_number": "MH01AB1234",
                "date": "2024-01-15",
                "inspector": "Rajesh Kumar"
            },
            ...
        ],
        "total": 100,
        "page": 1,
        "per_page": 20,
        "pages": 5
    }
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        
        query = Inspection.query
        
        # Search filter
        if search:
            query = query.filter(
                db.or_(
                    Inspection.id.ilike(f'%{search}%'),
                    Inspection.registration_number.ilike(f'%{search}%')
                )
            )
        
        # Paginate
        pagination = query.order_by(Inspection.created_at.desc()).paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        inspections = [{
            'id': i.id,
            'registration_number': i.registration_number,
            'date': i.inspection_date,
            'inspector': i.inspector_name,
            'created_at': i.created_at.isoformat()
        } for i in pagination.items]
        
        return jsonify({
            'inspections': inspections,
            'total': pagination.total,
            'page': pagination.page,
            'per_page': pagination.per_page,
            'pages': pagination.pages
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ----- DELETE INSPECTION -----

@app.route('/api/inspections/<inspection_id>', methods=['DELETE'])
def delete_inspection(inspection_id):
    """Delete inspection by ID"""
    try:
        inspection = Inspection.query.get(inspection_id)
        
        if not inspection:
            return jsonify({'error': 'Inspection not found'}), 404
        
        db.session.delete(inspection)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Inspection deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ========================================
# INITIALIZE DATABASE
# ========================================

with app.app_context():
    db.create_all()
    print("✅ Database tables created")

# ========================================
# RUN SERVER
# ========================================

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

#### Run Flask Server

```bash
python app.py
```

Server runs on: `http://localhost:5000`

---

### Option 2: Django REST Framework

#### Install Django

```bash
pip install django djangorestframework django-cors-headers psycopg2-binary
```

#### Create Django Project

```bash
django-admin startproject inspectionwale_backend
cd inspectionwale_backend
python manage.py startapp inspections
```

#### Models (`inspections/models.py`)

```python
from django.db import models
from django.contrib.postgres.fields import JSONField

class Inspection(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Inspection info
    inspection_date = models.CharField(max_length=50)
    location = models.CharField(max_length=200)
    inspector_name = models.CharField(max_length=100)
    
    # Vehicle info
    registration_number = models.CharField(max_length=50)
    chassis_number = models.CharField(max_length=100)
    engine_number = models.CharField(max_length=100)
    make_model = models.CharField(max_length=200)
    variant = models.CharField(max_length=200)
    fuel_type = models.CharField(max_length=50)
    manufacturing_date = models.CharField(max_length=50)
    registration_date = models.CharField(max_length=50)
    
    # Complete inspection data
    data = models.JSONField()
    
    class Meta:
        ordering = ['-created_at']
```

#### Serializers (`inspections/serializers.py`)

```python
from rest_framework import serializers
from .models import Inspection

class InspectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inspection
        fields = '__all__'
```

#### Views (`inspections/views.py`)

```python
from rest_framework import viewsets
from .models import Inspection
from .serializers import InspectionSerializer

class InspectionViewSet(viewsets.ModelViewSet):
    queryset = Inspection.objects.all()
    serializer_class = InspectionSerializer
```

---

### Option 3: FastAPI (Modern & Fast)

#### Install FastAPI

```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic
```

#### Create `main.py`

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import json

app = FastAPI(title="Inspectionwale API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class InspectionData(BaseModel):
    inspection: dict
    vehicle: dict
    ratings: dict
    flags: dict
    comments: dict
    front: dict
    rhs: dict
    lhs: dict
    rear: dict
    roof: dict
    interior_dashboard: dict
    seats: dict
    boot: dict
    engine: dict
    tyres: dict
    structure: dict
    performance: dict
    images: dict

@app.post("/api/inspections")
async def create_inspection(data: InspectionData):
    # Save to database logic here
    return {
        "success": True,
        "inspection_id": data.inspection.get('id'),
        "message": "Inspection saved successfully"
    }

@app.get("/api/inspections/{inspection_id}")
async def get_inspection(inspection_id: str):
    # Fetch from database logic here
    return {"id": inspection_id, "data": {}}

# Run: uvicorn main:app --reload
```

---

## 🔗 Step 3: Connect React Frontend to Backend

### Update Data Loader (`/src/utils/dataLoader.ts`)

Add API integration functions:

```typescript
// ========================================
// API CONFIGURATION
// ========================================

const API_BASE_URL = 'http://localhost:5000/api';  // Change in production
const API_ENABLED = true;  // Set to false to use localStorage only

// ========================================
// API FUNCTIONS
// ========================================

/**
 * Save inspection to backend
 */
export async function saveInspectionToBackend(data: any): Promise<any> {
  if (!API_ENABLED) {
    console.log('⚠️ API disabled, using localStorage only');
    return null;
  }

  try {
    const inspectionId = data.inspection.id;
    
    // Check if inspection exists
    const existsResponse = await fetch(`${API_BASE_URL}/inspections/${inspectionId}`);
    const method = existsResponse.ok ? 'PUT' : 'POST';
    const url = existsResponse.ok 
      ? `${API_BASE_URL}/inspections/${inspectionId}` 
      : `${API_BASE_URL}/inspections`;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        // Add authentication token if needed:
        // 'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Inspection saved to backend:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to save to backend:', error);
    throw error;
  }
}

/**
 * Load inspection from backend
 */
export async function loadInspectionFromBackend(inspectionId: string): Promise<any> {
  if (!API_ENABLED) {
    console.log('⚠️ API disabled, using localStorage only');
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/inspections/${inspectionId}`);

    if (!response.ok) {
      if (response.status === 404) {
        console.log('Inspection not found on backend');
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Inspection loaded from backend');
    return result.data;
  } catch (error) {
    console.error('❌ Failed to load from backend:', error);
    throw error;
  }
}

/**
 * List all inspections
 */
export async function listInspectionsFromBackend(page: number = 1, search: string = ''): Promise<any> {
  if (!API_ENABLED) {
    return { inspections: [], total: 0 };
  }

  try {
    const url = new URL(`${API_BASE_URL}/inspections`);
    url.searchParams.append('page', page.toString());
    if (search) {
      url.searchParams.append('search', search);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`✅ Loaded ${result.inspections.length} inspections`);
    return result;
  } catch (error) {
    console.error('❌ Failed to list inspections:', error);
    throw error;
  }
}

// ========================================
// ENHANCED SAVE/LOAD WITH AUTO-SYNC
// ========================================

/**
 * Save inspection data (localStorage + backend)
 */
export function saveInspectionData(data: any) {
  // Save to localStorage immediately
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('✅ Saved to localStorage');
  } catch (error) {
    console.error('❌ Failed to save to localStorage:', error);
  }

  // Sync to backend asynchronously (don't block UI)
  if (API_ENABLED && data.inspection?.id) {
    saveInspectionToBackend(data)
      .then(result => {
        console.log('✅ Auto-synced to backend');
      })
      .catch(error => {
        console.warn('⚠️ Backend sync failed, data saved locally only');
      });
  }
}

/**
 * Load inspection data (try backend first, fallback to localStorage)
 */
export async function getInspectionDataAsync(inspectionId?: string): Promise<any> {
  // Try backend first if ID provided
  if (API_ENABLED && inspectionId) {
    try {
      const backendData = await loadInspectionFromBackend(inspectionId);
      if (backendData) {
        // Save to localStorage as cache
        localStorage.setItem(STORAGE_KEY, JSON.stringify(backendData));
        return backendData;
      }
    } catch (error) {
      console.warn('Backend load failed, using localStorage');
    }
  }

  // Fallback to localStorage
  return getInspectionData();
}
```

### Update InspectorForm (`/src/app/components/InspectorForm.tsx`)

Add backend sync button:

```tsx
import { saveInspectionToBackend } from '../../utils/dataLoader';

// Inside component
const [syncing, setSyncing] = useState(false);

const handleSyncToBackend = async () => {
  setSyncing(true);
  try {
    await saveInspectionToBackend(formData);
    alert('✅ Inspection synced to server successfully!');
  } catch (error) {
    alert('❌ Failed to sync to server. Data saved locally only.');
  } finally {
    setSyncing(false);
  }
};

// In the header buttons
<button 
  onClick={handleSyncToBackend} 
  className="btn-action btn-sync"
  disabled={syncing}
>
  <Database size={18} />
  {syncing ? 'Syncing...' : 'Sync to Server'}
</button>
```

---

## 📦 Step 4: Database Setup

### PostgreSQL (Recommended)

#### Install PostgreSQL

```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# Download from: https://www.postgresql.org/download/windows/
```

#### Create Database

```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE inspectionwale_db;

# Create user
CREATE USER inspectionwale_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE inspectionwale_db TO inspectionwale_user;

# Exit
\q
```

#### Update Connection String

In your Python code:

```python
# Flask
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://inspectionwale_user:your_secure_password@localhost/inspectionwale_db'

# Django (settings.py)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'inspectionwale_db',
        'USER': 'inspectionwale_user',
        'PASSWORD': 'your_secure_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### SQLite (Simple Alternative for Testing)

```python
# Flask
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///inspections.db'

# Django
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

---

## 🌐 Step 5: Deployment

### Deploy Frontend (React)

**Option 1: Netlify (Free)**

```bash
# Build React app
npm run build

# Deploy to Netlify
# 1. Sign up at netlify.com
# 2. Drag & drop 'build' folder
# 3. Done! Your site is live
```

**Option 2: Vercel (Free)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy Backend (Python)

**Option 1: Heroku (Easy)**

```bash
# Install Heroku CLI
# Create Procfile
echo "web: python app.py" > Procfile

# Create requirements.txt
pip freeze > requirements.txt

# Deploy
heroku create inspectionwale-api
git push heroku main
```

**Option 2: DigitalOcean/AWS/GCP**

1. Create a virtual machine
2. Install Python, PostgreSQL
3. Clone your code
4. Setup nginx + gunicorn
5. Configure firewall

---

## 🔒 Step 6: Security

### Add Authentication

#### JWT Token Authentication

```python
# Flask with JWT
from flask_jwt_extended import JWTManager, create_access_token, jwt_required

app.config['JWT_SECRET_KEY'] = 'your-secret-key'
jwt = JWTManager(app)

@app.route('/api/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')
    
    # Verify credentials (use proper password hashing!)
    if username == 'admin' and password == 'password':
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token)
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/inspections', methods=['POST'])
@jwt_required()
def create_inspection():
    # Protected route - requires valid JWT token
    ...
```

#### Frontend Token Storage

```typescript
// Store token after login
localStorage.setItem('auth_token', token);

// Use token in API calls
const response = await fetch(`${API_BASE_URL}/inspections`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
});
```

---

## 📝 Complete Integration Checklist

- [ ] ✅ **Step 1:** Export React build files
- [ ] ✅ **Step 2:** Create Python backend (Flask/Django/FastAPI)
- [ ] ✅ **Step 3:** Setup database (PostgreSQL/MySQL/SQLite)
- [ ] ✅ **Step 4:** Create API endpoints (CRUD operations)
- [ ] ✅ **Step 5:** Update React to call APIs
- [ ] ✅ **Step 6:** Test locally (both servers running)
- [ ] ✅ **Step 7:** Add authentication (JWT/OAuth)
- [ ] ✅ **Step 8:** Deploy frontend (Netlify/Vercel)
- [ ] ✅ **Step 9:** Deploy backend (Heroku/AWS/DO)
- [ ] ✅ **Step 10:** Configure production environment variables
- [ ] ✅ **Step 11:** Setup HTTPS/SSL certificates
- [ ] ✅ **Step 12:** Test end-to-end in production

---

## 🎉 You're Ready!

Your Inspectionwale system is now:
- ✅ **Full-stack** - React frontend + Python backend
- ✅ **Database-backed** - Persistent storage
- ✅ **Production-ready** - Deployed and secure
- ✅ **Scalable** - Can handle multiple inspectors

Need help with a specific step? Refer to the detailed sections above!

---

*Last Updated: December 28, 2025*
