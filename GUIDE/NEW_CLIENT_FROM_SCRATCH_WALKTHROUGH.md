# From Scratch (Ground Zero) Client Onboarding Walkthrough

> **Scenario:** Client ke paas **sirf ek Personal Facebook account hai** (na koi Facebook Page hai, na Instagram Business account).  
> **Goal:** 10 minutes ke andar client ka Facebook Page + Instagram Business banakar BrandFlow se live posting ready karna.

---

## 🧭 Overview: Zero to Posting in 4 Phases

```
[Phase 1] 
Personal Facebook se 2 minute me Business Page banana
       ↓
[Phase 2] 
Naya Instagram account banakar Professional (Business) me switch karna
       ↓
[Phase 3] 
Facebook Page aur Instagram ko aapas me Link karna
       ↓
[Phase 4] 
Aapke Brandflow Business Suite se Page ka Access lena & Posting shuru!
```

---

## 🛠️ PHASE 1: Personal Facebook se Business Page banana (2 Minutes)

Client apne mobile phone ya laptop par Facebook kholega jahan uska personal account login hai:

1. Facebook open karein aur **Menu** (ya 9 dots icon) par click karein.
2. **"Pages"** option select karein aur **"Create new Page"** par click karein.
3. Form me basic details bharein:
   - **Page Name:** Client ka Business Name (jaise: `Shree Krishna Sarees`).
   - **Category:** Business category chunein (jaise: `Clothing Store`, `Jewelry`, `Restaurant`).
   - **Bio (Optional):** Ek line ka description (jaise: `Best Traditional Sarees in Ahmedabad`).
4. Click karein **"Create Page"**.
5. Profile picture aur Cover photo daalna chahein toh dalein, ya seedha **"Done / Skip"** kar dein.

> ✅ **Milestone 1:** Client ka official Facebook Business Page live ho chuka hai!

---

## 📸 PHASE 2: Instagram Profile banana & Professional me Switch karna (3 Minutes)

Client ke paas do options hain:

### Option A: Agar Client ka koi Instagram nahi hai (Bilkul Naya banana hai)
1. Instagram App download karein ya `instagram.com` kholein.
2. **Sign Up** par click karein (Phone number ya business email se).
3. **Full Name:** Business ka naam dalein (e.g., `Shree Krishna Sarees`).
4. **Username:** Clean handle chunein (e.g., `@shreekrishnasarees`).
5. Account ban jane ke baad **Step 2.1 (Switch to Professional)** follow karein.

### Option B: Agar Client ka personal Instagram pehle se hai
Aap chahein toh naya bana sakte hain ya unke existing account ko business me badal sakte hain.

### Step 2.1: Instagram ko "Business / Professional" me convert karna (MANDATORY)
Meta API sirf Professional accounts ko post karne deti hai. Personal account par API posting block hoti hai.

1. Instagram App me profile par jaiye aur top-right me **3 lines (Menu)** par click karein.
2. **Settings and privacy** kholein.
3. Neeche scroll karke **"Account type and tools"** par tap karein.
4. **"Switch to Professional Account"** par click karein.
5. Next, Next karein aur Category select karein (e.g., `Clothing Brand`).
6. Screen par do options aayenge: `Creator` ya `Business` → **"Business"** select karein.
7. Click **Done**.

> ✅ **Milestone 2:** Client ka Instagram ab officially **Instagram Business Account** ban gaya hai!

---

## 🔗 PHASE 3: Facebook Page aur Instagram ko Link karna (Sabse Crucial Step - 2 Minutes)

Meta Graph API dono par ek saath post tabhi kar sakti hai jab Page aur Instagram aapas me jude hon.

1. Client apne Facebook me jaye aur apne naye **Facebook Page** par switch karein.
2. Page ke **Settings** me jaiye.
3. Left menu me **"Linked Accounts"** par click kijiye.
4. **Instagram** select kijiye aur blue button **"Connect Account"** par click kijiye.
5. Screen par confirmation aayega, **"Connect"** dabayein.
6. Ek popup window khulegi: Wahan Phase 2 wale Instagram account ka Username aur Password daal kar login karein.
7. **"Allow access to Instagram messages"** ko Confirm karein.

> ✅ **Milestone 3:** Screen par green tick ke saath likha aayega:  
> **`Connected Instagram Account: @shreekrishnasarees`**

---

## 🏢 PHASE 4: Brandflow Business Suite me Asset Add karna (Aap karenge - 2 Minutes)

Ab aapko client se kuch technical nahi karwana:

1. **Page ID Nikaalna (Gotcha):**  
   Mobile share link (`facebook.com/share/...`) use mat kijiye. Link ko browser me open karke last ka number ya Page Transparency se **Numeric Page ID** (jaise: `61595190802205`) copy kijiye.
2. Aap apne **Meta Business Suite** (`business.facebook.com/settings`) me jaiye.
3. **Accounts → Pages** me jaiye.
4. Blue button **"+ Add"** dabayein aur ⚠️ **"Request access to a Page"** select karein (Do NOT click *"Add a Page"*).
5. Search box me **Page ID** paste karein aur Page select karein.
6. **Permissions:**
   - ⚠️ **"Full access" ko OFF rakhein** (warna confirm button atak jata hai).
   - Sirf **"Content: Create, manage or delete posts"** ko **ON** karein.
7. Click karein **"Confirm"**. Screen par orange badge aayega: `Request sent`.

### Client ka 1-Click Approval (Exact Direct Link):
Agar client ko normal Facebook notification na mile, toh client ko yeh direct link bhejiye:  
👉 **`https://business.facebook.com/settings/requests`**  
*(Wahan **"Received"** tab par click karega aur Brandflow ki request par **"Approve / Accept"** kar dega).*

* Alternative Direct Link for Personal Pages: `https://www.facebook.com/settings?tab=profile_access`

---

## ⚡ PHASE 5: BrandFlow me System User se Link & Live Post Test

1. Aapke Meta Business Suite me **Users → System Users** me jaiye.
2. `Brandflow-Worker` par click karke **Assign Assets** karein aur client ka naya Page tick karke Save karein.
3. Client apne BrandFlow account me login karega:
   - **Post Studio (`/create-post`)** me jayega.
   - Poster compose karega.
   - **Publish to Social** me **Facebook & Instagram** dono tick karega aur **"Publish Now"** dabayega!
4. **10 seconds ke andar** dono naye accounts par live branding post upload ho jayega! 🎉

---

## 📋 Client ke liye WhatsApp Cheat-Sheet (Copy-Paste Message)

Aap yeh message apne client ko direct WhatsApp par bhej sakte hain:

```text
Namaste! Aapke business ke social media automation setup ke liye hume sirf 3 choti cheezein chahiye:

1. Facebook Page: Apne Facebook me jakar apne business ke naam se ek Page bana lijiye (Menu > Pages > Create Page).
2. Instagram Business: Apne Instagram account ko Business me switch kar lijiye (Settings > Account type > Switch to professional > Business).
3. Connect: Apne Facebook Page ki Settings > Linked Accounts > Instagram me jakar apna Instagram link kar dijiye.

Jaise hi aapka Page ban jaye, hume Page ka naam bata dijiye. Hum yahan se ek access request bhejenge jise aapko Facebook notification me "Approve" karna hoga. Uske baad aapka automated posting start ho jayega!
```

---

*Authored by the BrandFlow Engineering Team.*
