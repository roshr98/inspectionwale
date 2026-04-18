# 🎨 PDF Template Redesign - Implementation Plan

**Date**: December 21, 2025  
**Status**: 🚧 In Progress  
**Scope**: Complete PDF template redesign with Hindi support

---

## 📋 Overview

Major redesign of vehicle inspection PDF report from 3 pages to 7+ pages with:
- **Bilingual**: English + Hindi (Devanagari script)
- **New Header/Footer**: Tagline, contact info, achievements
- **100+ New Fields**: Paint depth, company fitted status, detailed interior, tire details
- **Professional Layout**: Cards with light borders, consistent fonts, grouped content
- **Structural Diagram**: FYI car parts diagram for customer understanding

---

## 📄 Page Structure (New Design)

### **Header (Every Page)**
```
[Logo] inspectionwale.com | [Mail] hello@inspectionwale.com | [Phone] +91 91675 58998 | [Globe] inspectionwale.com
```

### **Footer (Every Page)**
```
[Logo] | [Green Check] 2000+ Cars inspected | [Icon] Easy to understand reports | [Icon] Pricing assistance
```

---

### **Page 1: Vehicle Registration + Ratings**

#### Header Section (Centered)
```
VEHICLE INSPECTION REPORT
The Hassle-Free Car Buying Experience
Repair Estimate | Price Advice Neutral | Uncomplicated | Comprehensive
```

#### Right Table (4 fields)
- Inspection ID
- **[NEW]** Report Number / Generation Date
- Inspection Date
- Location
- Inspector Name

#### Vehicle Registration Details (वाहन पंजीकरण विवरण)
**2-column card layout**:
1. Vehicle Number (गाड़ी नंबर)
2. Vehicle Manufacturing Date (वाहन निर्माण की तारीख)
3. Chassis Number (चेसिस नंबर)
4. Insurance Validity (बीमा वैधता)
5. Engine Number (इंजन नंबर)
6. Vehicle Registration Date (वाहन पंजीकरण तारीख)
7. Owner's Name on RC (आरसी पर मालिक का नाम)
8. Make, Model, Variant (कंपनी, मॉडल, वेरिएंट)
9. Fuel Type (ईंधन प्रकार)
10. Number of Owners (मालिकों की संख्या)
11. RC Type (आर सी प्रकार)

#### CNG Details (Conditional - if CNG fitted)
12. **[NEW]** CNG Fitment Type (सीएनजी फिटमेंट): Company/Private/Authorized
13. **[NEW]** CNG Validity Date (सीएनजी वैधता तारीख)
14. **[NEW]** CNG Endorsed on RC (क्या आरसी पर सीएनजी का समर्थन किया गया है?)

#### Hypothecation
15. Hypothecation (Loan on Car) (क्या कार पर लोन है?)

#### Ratings Section ⭐
**6 Categories with 5-star ratings**:
1. Interior (आंतरिक)
2. Exterior (बाहरी)
3. Engine (इंजन)
4. Test Drive (टेस्ट ड्राइव)
5. Structure (संरचना)
6. Electrical (इलेक्ट्रिकल)

---

### **Page 2: Key Highlights + Documents**

#### Card 1: Key Highlights
1. Is car Accidental? (क्या कार दुर्घटनाग्रस्त है?)
2. Flood Damage (बाढ़ क्षति)
3. Does RC and Chassis details match? (क्या RC और चेसिस विवरण मेल खाते हैं?)
4. Fire Damage (आग क्षति)
5. Service Log Available (सर्विस लॉग उपलब्ध)

#### Card 2: Additional Comments
1. Engine (इंजन)
2. Structure (संरचना)
3. Test Drive (टेस्ट ड्राइव)
4. Exterior (बाहरी)
5. Interior (आंतरिक)

#### Document Images (2x2 Grid)
1. RHS Apron Image (दाहिनी ओर एप्रन फोटो)
2. LHS Apron Image (बाईं तरफ एप्रन फोटो)
3. Chassis Plate (चेसिस प्लेट)
4. **[NEW]** CNG Plate (सीएनजी प्लेट)

---

### **Page 3: Front Exterior**

#### Vehicle Front Image (Left)

#### Details (Right - Card Format)

**Front Bumper**:
1. **[NEW]** Front Bumper Condition (सामने बम्पर की स्थिति)
2. **[NEW]** Paint Depth Reading (पेंट की गहराई रीडिंग)
3. **[NEW]** Is Front Bumper Repainted? (क्या सामने बम्पर फिर से रंगा गया?)

**Hood/Bonnet**:
4. **[NEW]** Hood/Bonnet Condition (बोनट की स्थिति)
5. **[NEW]** Is Bonnet Repainted? (क्या बोनट फिर से रंगा गया?)
6. **[NEW]** Bonnet Paint Depth Reading (बोनट पेंट की गहराई)
7. **[NEW]** Is Bonnet Company Fitted? (क्या बोनट कंपनी फिटेड है?)

**Below Image**:
8. **[NEW]** Front Grill Condition (सामने ग्रिल की स्थिति)
9. **[NEW]** Is Front Windshield Original? (क्या सामने विंडशील्ड मूल है?)
10. **[NEW]** Front Windshield Condition (सामने विंडशील्ड की स्थिति)
11. **[NEW]** Headlight Condition (हेडलाइट की स्थिति)

---

### **Page 4: RHS (Right Side)**

#### Vehicle RHS Image (Left)

#### Details (Right - Multi-column card)

**RHS Fender**:
1. **[NEW]** RHS Fender Condition (दाईं ओर फेंडर की स्थिति)
2. **[NEW]** Is RHS Fender Repainted? (क्या दाईं ओर फेंडर फिर से रंगा गया?)
3. **[NEW]** RHS Fender Paint Depth Reading (दाईं ओर फेंडर पेंट की गहराई)

**RHS Front Door**:
4. **[NEW]** RHS Front Door Condition (दाईं ओर सामने दरवाजा की स्थिति)
5. **[NEW]** Is RHS Front Door Repainted? (क्या दाईं ओर सामने दरवाजा फिर से रंगा गया?)
6. **[NEW]** RHS Front Door Paint Depth (दाईं ओर सामने दरवाजा पेंट की गहराई)
7. **[NEW]** Is RHS Front Door Company Fitted? (क्या कंपनी फिटेड है?)

**RHS Quarter Panel**:
8. **[NEW]** RHS Quarter Panel Condition (दाईं ओर क्वार्टर पैनल की स्थिति)
9. **[NEW]** Is RHS Quarter Panel Repainted? (क्या फिर से रंगा गया?)
10. **[NEW]** RHS Quarter Panel Paint Depth (पेंट की गहराई)

**RHS Rear Door**:
11. **[NEW]** RHS Rear Door Condition (दाईं ओर पीछे दरवाजा की स्थिति)
12. **[NEW]** Is RHS Rear Door Repainted? (क्या फिर से रंगा गया?)
13. **[NEW]** RHS Rear Door Paint Depth (पेंट की गहराई)
14. **[NEW]** Is RHS Rear Door Company Fitted? (क्या कंपनी फिटेड है?)

**Windows & Mirror**:
15. **[NEW]** Is RHS Door Windows Glass Company Fitted? (क्या विंडो मूल है?)
16. **[NEW]** RHS Side View Mirror Condition (दाईं ओर साइड व्यू मिरर की स्थिति)
17. **[NEW]** Is RHS Front Window Glass Original? (क्या सामने विंडो मूल है?)

---

### **Page 5: LHS (Left Side)**

**Same structure as Page 4, but for Left Side**:
- LHS Fender (3 fields)
- LHS Front Door (4 fields)
- LHS Quarter Panel (3 fields)
- LHS Rear Door (4 fields)
- LHS Windows & Mirror (3 fields)

---

### **Page 6: Rear Exterior**

#### Vehicle Rear Image (Left)

#### Details (Right)

**Rear Bumper**:
1. **[NEW]** Rear Bumper Condition (पीछे बम्पर की स्थिति)
2. **[NEW]** Is Rear Bumper Repainted? (क्या फिर से रंगा गया?)
3. **[NEW]** Rear Bumper Paint Depth Reading (पेंट की गहराई)

**Rear Windshield**:
4. **[NEW]** Rear Windshield Condition (पीछे विंडशील्ड की स्थिति)
5. **[NEW]** Is Rear Windshield Original? (क्या मूल है?)

**Tail Gate**:
6. **[NEW]** Tail Gate Condition (टेल गेट की स्थिति)
7. **[NEW]** Tail Gate Paint Depth Reading (पेंट की गहराई)
8. **[NEW]** Is Tail Gate Repainted? (क्या फिर से रंगा गया?)
9. **[NEW]** Is Tail Gate Original Condition? (क्या मूल स्थिति है?)
10. **[NEW]** Tail Lights Condition (टेल लाइट की स्थिति)

**Roof**:
11. **[NEW]** Exterior Roof Top Condition (बाहरी छत की स्थिति)
12. **[NEW]** Roof Type (छत का प्रकार)
13. **[NEW]** Roof Top Paint Depth Reading (छत पेंट की गहराई)
14. **[NEW]** Roof Top Repainted? (क्या फिर से रंगा गया?)

---

### **Page 7: Interior Inspection**

#### Dashboard Image + Cluster Image (2 images in row)

**Below Dashboard Image**:
1. **[NEW]** Is MIL Light On? (क्या MIL लाइट चालू है?)
2. **[NEW]** Dashboard Condition (डैशबोर्ड की स्थिति)
3. **[NEW]** Is Music System Working Properly? (क्या म्यूजिक सिस्टम ठीक से काम कर रहा है?)
4. **[NEW]** Are Steering Controls Working? (क्या स्टीयरिंग कंट्रोल काम कर रहे हैं?)
5. **[NEW]** Are Paddle Shifters Working Well? (क्या पैडल शिफ्टर्स ठीक काम कर रहे हैं?)
6. **[NEW]** Is Hand Brake Working Well? (क्या हैंड ब्रेक ठीक काम कर रहा है?)
7. **[NEW]** Are Speakers Working Properly? (क्या स्पीकर ठीक काम कर रहे हैं?)
8. **[NEW]** Are AC Vents in Good Condition? (क्या AC वेंट अच्छी स्थिति में हैं?)
9. **[NEW]** Is AC Working? (क्या AC काम कर रहा है?)

**Below Cluster Meter Image**:
10. **[NEW]** Steering Type (स्टीयरिंग प्रकार)
11. **[NEW]** Is Cruise Control Available? (क्या क्रूज़ कंट्रोल उपलब्ध है?)
12. **[NEW]** Is Navigation System Working? (क्या नेविगेशन सिस्टम काम कर रहा है?)
13. **[NEW]** Is Glove Box in Good Condition? (क्या ग्लव बॉक्स अच्छी स्थिति में है?)
14. **[NEW]** Are Cabin Lights Working Properly? (क्या केबिन लाइट ठीक काम कर रही हैं?)
15. **[NEW]** Are Tail Lights Working? (क्या टेल लाइट काम कर रही हैं?)

**Additional Controls** (Below both images):
16. **[NEW]** Are Headlights Working Well? (क्या हेडलाइट ठीक काम कर रही हैं?)
17. **[NEW]** Are Wiper Blades in Good Condition? (क्या वाइपर ब्लेड अच्छी स्थिति में हैं?)
18. **[NEW]** Is Trip Switch Working? (क्या ट्रिप स्विच काम कर रहा है?)
19. **[NEW]** Is Boot Lever Working Properly? (क्या बूट लीवर ठीक काम कर रहा है?)
20. **[NEW]** Are Indicator Lights Working? (क्या इंडिकेटर लाइट काम कर रही हैं?)
21. **[NEW]** Is Central Lock Working Properly? (क्या सेंट्रल लॉक ठीक काम कर रहा है?)
22. **[NEW]** Is Rear Wiper Working Properly? (क्या रियर वाइपर ठीक काम कर रहा है?)
23. **[NEW]** Is Rear View Mirror in Good Condition? (क्या रियर व्यू मिरर अच्छी स्थिति में है?)
24. **[NEW]** Is Bonnet Lever Working Properly? (क्या बोनट लीवर ठीक काम कर रहा है?)
25. **[NEW]** Are Side View Mirror Adjustments Working? (क्या साइड व्यू मिरर एडजस्टमेंट काम कर रहे हैं?)
26. **[NEW]** Is Fuel Lid Lever Working Properly? (क्या फ्यूल लिड लीवर ठीक काम कर रहा है?)
27. **[NEW]** Are Power Windows Working Properly? (क्या पावर विंडो ठीक काम कर रही हैं?)

#### Driver Cabin Interior Image

**Details**:
1. **[NEW]** Front Seat Condition (सामने सीट की स्थिति)
2. **[NEW]** Seat Adjustment Type (सीट एडजस्टमेंट प्रकार)
3. **[NEW]** Are Seat Adjustments Working Well? (क्या सीट एडजस्टमेंट ठीक काम कर रहे हैं?)
4. **[NEW]** Are Seat Belts Working Properly? (क्या सीट बेल्ट ठीक काम कर रही हैं?)
5. **[NEW]** Front RHS Interior Door Panel (सामने दाईं ओर आंतरिक दरवाजा पैनल)
6. **[NEW]** Arm Rest Condition (आर्म रेस्ट की स्थिति)
7. **[NEW]** Front LHS Interior Panel (सामने बाईं ओर आंतरिक पैनल)

---

### **Page 8: Rear Cabin + Boot**

#### Rear Cabin Image

**Details**:
1. **[NEW]** Rear Seat Condition (पीछे सीट की स्थिति)
2. **[NEW]** Are Seatbelts Working? (क्या सीटबेल्ट काम कर रही हैं?)
3. **[NEW]** Arm-rest Condition (आर्म-रेस्ट की स्थिति)
4. **[NEW]** RHS Interior Panel Condition (दाईं ओर आंतरिक पैनल की स्थिति)
5. **[NEW]** Rear AC Vent Condition (पीछे AC वेंट की स्थिति)
6. **[NEW]** LHS Interior Panel Condition (बाईं ओर आंतरिक पैनल की स्थिति)

#### Boot Space/Dickey Image

**Details**:
1. **[NEW]** Boot Condition (बूट की स्थिति)
2. **[NEW]** Is Jack Car Kit Available? (क्या जैक कार किट उपलब्ध है?)
3. **[NEW]** Additional Comments Interior (अतिरिक्त टिप्पणियां आंतरिक)

---

### **Page 9: Engine Inspection**

#### 3 Images in Row
1. Engine Compartment Image (इंजन कम्पार्टमेंट इमेज)
2. Firewall Image (फायरवॉल इमेज)
3. Battery Image (बैटरी इमेज)

**Details Below**:
1. **[NEW]** Is Engine Free from Oil Leaks? (क्या इंजन तेल रिसाव से मुक्त है?)
2. **[NEW]** Battery Condition (बैटरी की स्थिति)
3. **[NEW]** Hose Pipes Condition (होज़ पाइप की स्थिति)
4. **[NEW]** Engine Oil Condition (इंजन ऑयल की स्थिति)
5. **[NEW]** Wiring Condition (वायरिंग की स्थिति)
6. **[NEW]** Engine Mounting (इंजन माउंटिंग)
7. **[NEW]** Brake Oil Level (ब्रेक ऑयल स्तर)
8. **[NEW]** Coolant Level (कूलेंट स्तर)
9. **[NEW]** Belts (बेल्ट)
10. **[NEW]** Is Firewall Free from Rusting/Corrosion? (क्या फायरवॉल जंग/संक्षारण से मुक्त है?)
11. **[NEW]** Estimated Repair Cost (अनुमानित मरम्मत लागत)

---

### **Page 10: Tires/Wheels**

#### 5 Tire Images (Each with details card)

**For Each Tire (Front RHS, Rear RHS, Front LHS, Rear LHS, Spare)**:
1. **[NEW]** Tire Brand (टायर ब्रांड)
2. **[NEW]** Wheel Type (व्हील प्रकार)
3. **[NEW]** Remaining Tire Life (शेष टायर जीवन)
4. **[NEW]** Estimated Replacement Cost (अनुमानित प्रतिस्थापन लागत)

---

### **Page 11: Structure Inspection**

#### Structure Comments (All text fields)

1. **[NEW]** Upper Member (ऊपरी सदस्य)
2. **[NEW]** LHS Apron (बाईं ओर एप्रन)
3. **[NEW]** RHS Apron (दाईं ओर एप्रन)
4. **[NEW]** RHS C Pillar (दाईं ओर C पिलर)
5. **[NEW]** RHS B Pillar (दाईं ओर B पिलर)
6. **[NEW]** RHS A Pillar (दाईं ओर A पिलर)
7. **[NEW]** Tail Gate/Boot Frame (टेल गेट/बूट फ्रेम)
8. **[NEW]** LHS C Pillar (बाईं ओर C पिलर)
9. **[NEW]** LHS B Pillar (बाईं ओर B पिलर)
10. **[NEW]** LHS A Pillar (बाईं ओर A पिलर)
11. **[NEW]** RHS Fender Wall (दाईं ओर फेंडर वॉल)
12. **[NEW]** LHS Fender Wall (बाईं ओर फेंडर वॉल)
13. **[NEW]** Rear Tail Gate/Dicky Frame (पीछे टेल गेट/डिकी फ्रेम)
14. **[NEW]** Lower Member (निचला सदस्य)
15. **[NEW]** Cross Member (क्रॉस सदस्य)
16. **[NEW]** Dicky Tub (डिकी टब)

#### **FYI Structure Diagram** (Static image embedded in PDF)
- Show all parts labeled (A/B/C Pillars, Apron, Fender Wall, Upper/Lower Member, Cross Member, Dicky Tub, Running Board, Backend Panel, Fire Wall)
- Use provided reference image

---

### **Page 12: Test Drive**

**Test Drive Details**:
1. **[NEW]** Steering Performance (स्टीयरिंग प्रदर्शन)
2. **[NEW]** Steering Alignment (स्टीयरिंग संरेखण)
3. **[NEW]** Ignition (इग्निशन)
4. **[NEW]** Clutch Performance (क्लच प्रदर्शन)
5. **[NEW]** Brake Performance (ब्रेक प्रदर्शन)
6. **[NEW]** Gear Shifting (गियर शिफ्टिंग)
7. **[NEW]** Acceleration (त्वरण)
8. **[NEW]** Does the Car Run Fine on CNG Mode? (क्या कार CNG मोड में ठीक चलती है?)
9. **[NEW]** Suspension (सस्पेंशन)
10. **[NEW]** Engine Noise (इंजन शोर)
11. **[NEW]** Wheel Alignment (व्हील संरेखण)
12. **[NEW]** Estimated Repair Cost (अनुमानित मरम्मत लागत)

---

### **Page 13: Disclaimer**

**Disclaimer (English + Hindi)**:

inspectionwale.com offers comprehensive vehicle information based on visual inspections conducted on certain parameters. However, we do not guarantee the condition of the engine or any other mechanical components post-inspection. We recommend referencing the vehicle's service history to confirm meter tampering and conducting an OBD scan to identify major engine issues.

Please note that our inspection reports do not serve as guarantees or warranties. Additionally, these reports are valid for two days or 20 kilometers after the inspection. Any alterations made to the vehicle by the seller or dealer after our inspection are not within our purview.

By availing of our services, you acknowledge and accept these terms and conditions. inspectionwale.com shall not be held liable for any discrepancies or damages arising post-inspection.

**Hindi Translation**:
inspectionwale.com कुछ मापदंडों पर किए गए दृश्य निरीक्षण के आधार पर व्यापक वाहन जानकारी प्रदान करता है। हालाँकि, हम निरीक्षण के बाद इंजन या किसी अन्य यांत्रिक घटक की स्थिति की गारंटी नहीं देते हैं। हम मीटर से छेड़छाड़ की पुष्टि करने के लिए वाहन के सेवा इतिहास का संदर्भ लेने और प्रमुख इंजन समस्याओं की पहचान करने के लिए ओबीडी स्कैन करने की सलाह देते हैं।

कृपया ध्यान दें कि हमारी निरीक्षण रिपोर्ट गारंटी या वारंटी के रूप में काम नहीं करती हैं। साथ ही, ये रिपोर्ट निरीक्षण के बाद दो दिन या 20 किलोमीटर तक वैध होती हैं। हमारे निरीक्षण के बाद विक्रेता या डीलर द्वारा वाहन में किया गया कोई भी बदलाव हमारे दायरे में नहीं है।

हमारी सेवाओं का लाभ उठाकर, आप इन नियमों और शर्तों को स्वीकार करते हैं। निरीक्षण के बाद उत्पन्न होने वाली किसी भी विसंगति या क्षति के लिए inspectionwale.com को उत्तरदायी नहीं ठहराया जाएगा।

---

## 📊 Field Count Summary

| Category | New Fields | Total Fields |
|----------|-----------|--------------|
| **Vehicle Registration** | 3 (CNG) | 15 |
| **Ratings** | 6 | 6 |
| **Key Highlights** | 5 | 5 |
| **Documents** | 1 (CNG Plate) | 4 images |
| **Front Exterior** | 11 | 11 |
| **RHS Exterior** | 17 | 17 |
| **LHS Exterior** | 17 | 17 |
| **Rear Exterior** | 14 | 14 |
| **Interior Dashboard/Cluster** | 27 | 27 |
| **Interior Seats** | 7 | 7 |
| **Rear Cabin + Boot** | 9 | 9 |
| **Engine** | 11 | 11 |
| **Tires** | 20 (5x4) | 20 |
| **Structure** | 16 | 16 |
| **Test Drive** | 12 | 12 |
| **TOTAL** | **~175** | **~175** |

---

## 🛠️ Technical Implementation

### 1. Hindi Font Support

**Download & Add Font**:
```bash
# Download Noto Sans Devanagari
wget https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansDevanagari/NotoSansDevanagari-Regular.ttf

# Add to Lambda layer or include in deployment package
```

**Register in ReportLab**:
```python
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Register Hindi font
pdfmetrics.registerFont(TTFont('NotoSansDevanagari', 'NotoSansDevanagari-Regular.ttf'))

# Use in ParagraphStyle
hindi_style = ParagraphStyle(
    'Hindi',
    fontName='NotoSansDevanagari',
    fontSize=9,
    textColor=COLOR_LABEL
)
```

### 2. Page Header/Footer Functions

```python
def create_page_header(canvas_obj):
    """Compressed single-line header"""
    # Logo (left)
    # Mail icon + hello@inspectionwale.com
    # Phone icon + +91 91675 58998
    # Globe icon + inspectionwale.com

def create_page_footer(canvas_obj):
    """Compressed single-line footer"""
    # Logo (left)
    # Green check + 2000+ Cars inspected
    # Icon + Easy to understand reports
    # Icon + Pricing assistance
```

### 3. Bilingual Text Helper

```python
def bilingual_text(english, hindi):
    """Create English/Hindi bilingual text"""
    return f"{english} / {hindi}"

# Usage
bilingual_text("Vehicle Number", "गाड़ी नंबर")
```

### 4. Paint Depth Field

```python
def create_paint_depth_row(label_en, label_hi, value):
    """Create paint depth measurement row"""
    return [
        Paragraph(bilingual_text(label_en, label_hi), label_style),
        Paragraph(f"{value} µm" if value else "N/A", value_style)
    ]
```

### 5. Star Rating Function

```python
def create_star_rating(rating):
    """Create golden star rating (1-5)"""
    full_stars = int(rating)
    return "★" * full_stars + "☆" * (5 - full_stars)
```

### 6. Structure Diagram

```python
def add_structure_diagram(elements):
    """Add static FYI structure diagram"""
    # Embed base64-encoded diagram image
    # Or load from S3/local file
    img = RLImage('structure_diagram.png', width=500, height=300)
    elements.append(img)
```

---

## 📝 Implementation Phases

### **Phase 1: Setup (30 min)** ✅
- [x] Download Noto Sans Devanagari font
- [x] Add font to Lambda deployment
- [x] Test Hindi rendering

### **Phase 2: Header/Footer (1 hour)**
- [ ] Update header design (tagline, contact info)
- [ ] Update footer design (achievements icons)
- [ ] Compress to single line
- [ ] Test on all pages

### **Phase 3: Page 1 - Registration + Ratings (2 hours)**
- [ ] Create bilingual vehicle registration section
- [ ] Add CNG details (conditional)
- [ ] Create ratings section with stars
- [ ] Update inspector form for new fields

### **Phase 4: Page 2 - Highlights + Documents (1 hour)**
- [ ] Create key highlights card
- [ ] Create additional comments card
- [ ] Create 2x2 document image grid
- [ ] Add CNG plate upload to form

### **Phase 5: Pages 3-6 - Exterior (3 hours)**
- [ ] Create exterior page template function
- [ ] Add paint depth readings
- [ ] Add repainted status
- [ ] Add company fitted checks
- [ ] Update form with 60+ exterior fields

### **Phase 6: Pages 7-8 - Interior (2 hours)**
- [ ] Dashboard + Cluster with 27 controls
- [ ] Driver cabin details
- [ ] Rear cabin details
- [ ] Boot inspection
- [ ] Update form with 40+ interior fields

### **Phase 7: Pages 9-10 - Engine + Tires (1.5 hours)**
- [ ] Engine 3-image layout
- [ ] Tire 5-image layout with details
- [ ] Update form with tire/engine fields

### **Phase 8: Pages 11-13 - Structure + Disclaimer (2 hours)**
- [ ] Structure comments (16 fields)
- [ ] Add static FYI diagram
- [ ] Test drive details
- [ ] Bilingual disclaimer

### **Phase 9: Testing + Refinement (2 hours)**
- [ ] Deploy to staging
- [ ] Test all 13 pages
- [ ] Check Hindi rendering
- [ ] Verify page breaks
- [ ] Adjust spacing/grouping

### **Phase 10: Production Deploy (30 min)**
- [ ] Final testing on staging
- [ ] Deploy to main branch
- [ ] Update documentation

**Total Estimated Time**: 15-16 hours

---

## ⚠️ Important Notes

1. **Form Complexity**: 175 fields will make form very long. Consider:
   - Collapsible sections
   - Progress indicator
   - Auto-save to localStorage
   - Multi-page form wizard

2. **Lambda Timeout**: With 46+ photos + complex PDF, may need:
   - Increase timeout to 120s (from 60s)
   - Increase memory to 2048MB (from 1024MB)

3. **DynamoDB**: Current table may not need schema changes (NoSQL), but consider:
   - Adding inspectionDetails table for metadata
   - Storing S3 URLs instead of base64 in future

4. **Testing**: Use staging environment exclusively:
   - https://staging.daouxvnc3zwm.amplifyapp.com

5. **Hindi Font Size**: May need to adjust for readability:
   - English: 9pt
   - Hindi: 8pt (slightly smaller due to Devanagari complexity)

---

*Next Step: Begin Phase 1 - Setup Hindi font support*
