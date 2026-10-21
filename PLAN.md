# 🥗 FoodCheck — Updated Project Plan & Blueprint

## Executive Summary
**FoodCheck** is a cross-platform, mobile-first web application designed to instantly analyze packaged food ingredients and nutrition labels. By leveraging flexible input methods (mobile camera capture or laptop file upload), lightweight Optical Character Recognition (OCR), and a deterministic rules-based matching engine against user health profiles, FoodCheck flags allergens, dietary conflicts, and unwanted additives in real-time.

**Target Users:** Consumers with food allergies, strict dietary preferences (vegan, halal, celiac), or specific health conditions (diabetes, hypertension).  
**Deployment Model:** 100% Free prototype tier on Vercel + Supabase (PostgreSQL).  
**Core Strategy:** Rules engine over custom ML models; client-side or serverless OCR; web app over native store apps.

---

## 📊 Part 1: Core Product Features

### 1.1 Dual Input & Smart OCR Parsing
- **Inputs Supported:**
  - **Mobile:** Direct HTML5 camera stream (`navigator.mediaDevices.getUserMedia`) for instant aisle scanning.
  - **Desktop/Laptop:** Drag-and-drop file upload zone for photos, screenshots, or spec sheets.
- **Layout-Agnostic Extraction:**
  - Extracts text across unstructured, curved, or multi-language label designs.
  - **Boundary & Anchor Detection:** Scans for keywords like `"Ingredients:"`, `"Contains:"`, or `"Ingrédients:"` while stripping away marketing fluff.
  - **Fuzzy Token Matching:** Cross-references synonyms (e.g., matching both *"Sodium Chloride"* and *"Salt"* or *"Whey"* and *"Milk Solids"*).

---

### 1.2 User Health & Dietary Profile

#### Profile Schema Highlights
- **Allergens:** Peanuts, Tree Nuts, Dairy, Gluten/Wheat, Soy, Eggs, Shellfish, Fish, Sesame.
- **Health Conditions:** Hypertension (Sodium limits), Diabetes (Sugar limits), Celiac Disease.
- **Lifestyle / Religious Rules:** Vegan, Vegetarian, Halal, Kosher.
- **Additive Preferences:** Flag artificial preservatives, synthetic dyes (e.g., Tartrazine/E102), or flavor enhancers (e.g., MSG/E621).

---

### 1.3 Color-Coded Verdict & Explanatory Breakdown
Once scanned, FoodCheck presents a simple three-tier verdict card:
- 🟢 **Safe:** No matched allergens or flagged ingredients found.
- 🟡 **Warning:** Contains moderate/high levels of sugar, sodium, or minor restricted additives.
- 🔴 **Danger:** Explicit match with a severe allergy or strict health restriction.

*Tapping any flagged ingredient details why it was highlighted (e.g., "Contains 'Casein' — a dairy derivative matching your Milk allergy").*

---

## 💻 Part 2: Technical Architecture

### 2.1 Stack Overview
- **Frontend Framework:** React or Next.js with Tailwind CSS (Mobile-first responsive UI).
- **Hosting Platform:** **Vercel** (Static frontend + Serverless Edge API routes, 100% Free tier).
- **Database & Auth:** **Supabase** (Free Tier PostgreSQL + Supabase Auth).
- **Text Extraction (OCR):** Tesseract.js (browser-based) or cloud OCR.
- **Analysis Engine:** Rule-based JavaScript parsing script (no custom ML model required).

---

### 2.2 System Architecture Diagram
```
[ User Input ] (Mobile Camera / Laptop Upload)
       │
       ▼
[ Client / Browser ] ───(Run OCR / Tesseract.js)───► [ Clean Text Dump ]
       │                                                     │
       ▼                                                     ▼
[ Vercel API Route ] ◄─────────────────────────────── [ Raw Text Payload ]
       │
       ├──► Query User Health Profile (Supabase DB)
       ├──► Cross-reference Ingredient Dictionary (Supabase DB)
       └──► Execute Rules & Risk Score Algorithm
       │
       ▼
[ Instant Verdict JSON ] ───► Display Color-Coded Card on Mobile/Desktop
```

---

## 🗄️ Part 3: Database Schema (Supabase / Postgres)

### 3.1 Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  allergies TEXT[] DEFAULT '{}', -- ['peanut', 'dairy', 'gluten']
  medical_conditions TEXT[] DEFAULT '{}', -- ['hypertension', 'diabetes']
  dietary_restrictions TEXT[] DEFAULT '{}', -- ['vegan', 'halal']
  flagged_additives TEXT[] DEFAULT '{}', -- ['E621', 'E102']
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 Master Ingredient Knowledge Base - reference to ingredients_data.json
```sql
CREATE TABLE ingredients_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name VARCHAR(255) NOT NULL,
  aliases TEXT[] DEFAULT '{}', -- E.g. ['Susu', 'Whey', 'Casein', 'Pepejal Susu']
  category VARCHAR(100), -- E.g. 'allergen', 'preservative', 'colorant', 'sweetener', 'flavor_enhancer'
  associated_allergens TEXT[] DEFAULT '{}', -- E.g. ['dairy', 'milk']
  health_risk_tags TEXT[] DEFAULT '{}', -- E.g. ['lactose_intolerance', 'hyperactivity_in_children']
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for optimized array searching (useful for alias matching)
CREATE INDEX idx_ingredients_aliases ON ingredients_master USING GIN (aliases);
CREATE INDEX idx_ingredients_category ON ingredients_master (category);

```

### 3.3 Scan Logs / History Table
```sql
CREATE TABLE scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  extracted_raw_text TEXT,
  detected_ingredients TEXT[],
  verdict VARCHAR(20), -- 'safe', 'warning', 'danger'
  flagged_reasons JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 Part 4: Implementation Roadmap

### Phase 1: Setup & Data Modeling (Week 1)
- [x] Initialize Next.js / React repository with Tailwind CSS.
- [x] Set up Supabase project (Auth, Database tables, Row-Level Security).
- [x] Populate `ingredients_master` table with common allergens, E-numbers, and synonyms.

### Phase 2: Frontend & Multi-Input Camera (Week 2)
- [x] Build mobile camera feed component (`navigator.mediaDevices.getUserMedia`).
- [x] Implement drag-and-drop file upload zone for laptop users.
- [x] Integrate OCR text extraction logic.

### Phase 3: Rules Engine & API Integration (Week 3)
- [x] Build Vercel Serverless Function `/api/analyze`.
- [x] Write rule-matching logic (text normalization $\rightarrow$ dictionary lookup $\rightarrow$ profile checking).
- [x] Return structured JSON with verdict status and highlighted risk tags.

### Phase 4: UI Polish & Free Vercel Deployment (Week 4)
- [x] Design clear result views (🟢 Safe, 🟡 Warning, 🔴 Danger cards).
- [x] Deploy prototype to Vercel.
- [x] Conduct mobile browser testing across Safari (iOS) and Chrome (Android).

---

## 🎯 Part 5: Success Metrics for Prototype
- **Zero Cost:** 100% hosted on free tiers (Vercel + Supabase).
- **Execution Speed:** Scan-to-verdict response time under 3 seconds.
- **Accuracy:** >90% detection of critical allergens (peanuts, gluten, dairy) from test label photos.
- **Cross-Platform:** Functional on both smartphone mobile browsers and laptop desktops.