# Meta Client Onboarding & Social Publishing Master Playbook (Agency Model)

> **Document Version:** 2.0.0 (Field-Tested & Battle-Hardened)  
> **Target Audience:** BrandFlow Administrators, Agency Operators & Engineers  
> **Purpose:** Complete protocol for onboarding client Facebook Pages and Instagram Business profiles into BrandFlow with **Zero Meta App Review, Zero Business Verification, and No Developer Tester Invites**.

---

## 📌 Executive Summary

By leveraging the **Meta Business Suite Agency Partner / Asset Model**, you can onboard client Facebook Pages and Instagram accounts immediately.

### **Key Highlights:**
1. **No Meta App Review / Verification Required:** Meta officially permits agency business portfolios to manage and publish to their assigned client assets without public App Review.
2. **Professional Client Experience:** The client receives a standard, official Facebook Page management request—**no developer portal or tester invitations**.
3. **Never-Expiring System User Tokens:** Permanent tokens eliminate the 60-day token expiration issue.
4. **Automated Dual-Publishing:** Supports simultaneous publishing to Instagram Business and Facebook Pages via BrandFlow's Post Studio.

---

## 🔄 High-Level Architecture Flow

```
┌─────────────────────────────────┐
│     Client's Facebook Page      │
│                +                │
│   Instagram Business Profile    │
└────────────────┬────────────────┘
                 │ (1. Client links Instagram to FB Page)
                 ▼
┌─────────────────────────────────┐
│ Brandflow Meta Business Suite   │
│ (https://business.facebook.com) │
└────────────────┬────────────────┘
                 │ (2. Request Access to Page via Page ID)
                 ▼
┌─────────────────────────────────┐
│ Client Approves at Requests URL │
│ business.facebook.com/settings/ │
│            requests             │
└────────────────┬────────────────┘
                 │ (3. Page becomes Brandflow Asset!)
                 ▼
┌─────────────────────────────────┐
│  Brandflow System User Token    │
│  (Permanent / Never-Expiring)   │
└────────────────┬────────────────┘
                 │ (4. Assign Page Asset & Generate Scoped Token)
                 ▼
┌─────────────────────────────────┐
│      BrandFlow PostgreSQL       │
│      "SocialAccount" Table      │
│     (AES-256 Encrypted Token)   │
└────────────────┬────────────────┘
                 │ (5. Automated Publishing via Post Studio)
                 ▼
┌─────────────────────────────────┐
│  Live Posts on Instagram & FB   │
└─────────────────────────────────┘
```

---

## 🚀 Battle-Tested Step-by-Step Walkthrough

---

### **PHASE 1: Client Prerequisites (5 Minutes)**

Ensure the client has completed these standard Meta setup steps:

#### **Step 1.1: Create/Identify the Client's Facebook Page**
* The client must have a standard Facebook Page representing their business (e.g., *"rajesh test page"*).
* If creating a new one:  
  `Facebook → Menu (Top Right) → Pages → Create new Page`.

#### **Step 1.2: Switch Instagram to a Professional (Business) Account**
Meta Graph API strictly prohibits publishing to personal Instagram profiles.
1. Open the Instagram mobile app on the client's device.
2. Navigate to: **Settings and privacy → For professionals → Account type and tools**.
3. Tap **Switch to Professional Account**.
4. Select **Business** (or **Creator**).

#### **Step 1.3: Link Instagram Account to Facebook Page (Mandatory)**
Meta uses the Facebook Page as the authentication bridge to publish to Instagram.
1. In Facebook, switch profile to the client's Facebook Page.
2. Go to: **Settings → Linked Accounts → Instagram**.
3. Click **Connect Account**.
4. Log into the Instagram account and confirm permissions.
5. Ensure the status displays: **"Connected Instagram Account"**.

---

### **PHASE 2: Get the Real Numeric Page ID (10 Seconds)**

> ⚠️ **CRITICAL GOTCHA:** Do **NOT** use mobile share links like `https://www.facebook.com/share/19U7xrjg3e/`. Meta Business Suite does not recognize them and search will fail!

#### **How to extract the Page ID:**
1. Open the client's share link in any desktop browser (Chrome / Safari).
2. The browser automatically resolves the canonical URL:  
   `https://www.facebook.com/p/rajesh-test-page-61595190802205/`
3. Look at the number at the end of the URL:  
   👉 **Page ID:** `61595190802205` (or check Page Settings → About → Page Transparency).

---

### **PHASE 3: Send Access Request from Meta Business Suite (2 Minutes)**

In your **Brandflow Meta Business Suite** (`business.facebook.com/settings`):

1. Go to: **Accounts → Pages**.
2. Click the blue **"+ Add"** button at the top right.
3. ⚠️ **SELECT:** **"Request access to a Page"** (Do **NOT** select *"Add a Page"*—that is only for claiming pages you already own!).
4. In the search box, paste the **Numeric Page ID** (e.g., `61595190802205`).
5. The exact Page will appear immediately. Click it.
6. **Access Selection:**
   * ⚠️ **Do NOT turn ON "Full access"** (Meta blocks or hangs requests with Full Access on unverified portfolios).
   * **Select from top / Partial access:** Select **"Content"** (*Create, manage or delete posts*).
7. Click **Confirm**.
8. Screen will show an orange status:  
   `⚠️ Request sent — Your request for access is pending`.

---

### **PHASE 4: Client Approves the Request (1 Minute)**

Where does the request go? Check in this exact priority order:

#### **Primary Location (If Client has a Business Account - 100% Reliable):**
👉 **`https://business.facebook.com/settings/requests`**
1. Have the client open this link.
2. Click on the **"Received"** tab.
3. You will see the **Brandflow** request.
4. Click **"Approve" / "Accept"**.

#### **Secondary Location (If Client uses Personal Facebook profile):**
👉 **`https://www.facebook.com/settings?tab=profile_access`**
* Under **"Partner requests"** or **"Invitations"**, click **"Review Request" → "Accept"**.

#### **Tertiary Location (Facebook Mobile App):**
* Click top-right profile icon → **"Switch to Page profile"** (`rajesh test page`).
* Tap the **Bell 🔔 (Notifications)** icon.
* Click: *"Brandflow has requested permission to manage your Page"* → **Accept**.

---

### **PHASE 5: Verify & Assign Asset to System User**

1. Go back to your Brandflow Business Suite:  
   👉 `https://business.facebook.com/settings/pages`
2. **Refresh (Reload)** the page.
3. The orange `Request sent` badge will disappear. The client's Page is now an **active asset of Brandflow**!
4. Left sidebar → **Users → System Users**:
   * Click your system user: `Brandflow-Worker`.
   * Click **"Assign Assets"**.
   * Click **Pages** → Check the client's Page (`rajesh test page`).
   * Toggle **"Content / Manage Page"** to **ON**.
   * Click **Save Changes**.

---

### **PHASE 6: Live Posting from BrandFlow**

1. Log into BrandFlow as the client user.
2. Go to **Post Studio (`/create-post`)**.
3. Create your branded graphic.
4. Click **"Publish Post"**:
   - Check **Facebook Page** and **Instagram Business**.
   - Add caption.
   - Click **"Publish Now"**.
5. Within 5–10 seconds, the post is live on both feeds! 🎉

---

## ⚠️ Real-World Trial & Error Playbook (Field Tested)

This section documents every error encountered during real-world execution and its exact tested fix:

---

### **Error 1: "Page search karne par nahi aa raha hai" (Page Not Found in Search)**
* **Root Cause:** 
  1. The Page is newly created and not yet indexed in Meta's global text search.
  2. A mobile share link (`facebook.com/share/...`) was pasted instead of a Page ID.
* **Tested Fix:** 
  Open the share link in a browser, grab the trailing digits from the URL (the **Numeric Page ID**), and paste the ID directly into the search box. It resolves instantly.

---

### **Error 2: "Unable to add Facebook Page: To add an existing Page in Business Manager, you must already be an admin of the Page."**
* **Root Cause:** 
  The operator clicked **"Add a Page"** instead of **"Request access to a Page"**. *"Add a Page"* attempts to claim 100% legal ownership of the page, which requires pre-existing admin rights.
* **Tested Fix:** 
  Close the modal. Click **"+ Add" → "Request access to a Page"**. This is the agency partner flow that allows managing client assets without prior admin status.

---

### **Error 3: Clicking "Confirm" does nothing / Modal freezes**
* **Root Cause:** 
  **"Full access"** was toggled ON. Meta silently rejects or hangs outbound requests for "Full access" from agency portfolios that do not have 2FA enforced or verified status.
* **Tested Fix:** 
  Turn **OFF** "Full access". Only select the permissions needed from the top (specifically **Content: Create, manage or delete posts**). The "Confirm" button will submit immediately.

---

### **Error 4: "Request sent successfully, but client says 'Kahi par bhi notification nahi aayi'"**
* **Root Cause:** 
  Meta routes requests differently depending on whether the Page is attached to a Business Portfolio or a Personal Profile:
  - Personal profile notifications do NOT alert for Page requests unless the user actively switches their profile into the Page.
  - If a Business Portfolio exists, notifications are hidden from standard Facebook and sent directly to Business Suite.
* **Tested Fix:** 
  Send the client directly to:  
  👉 **`https://business.facebook.com/settings/requests`** (Click the **"Received"** tab).  
  The request is guaranteed to be sitting there!

---

### **Error 5: Reverse Method (When Meta UI glitches completely)**
* If Meta UI ever has a localized outage or blocks requests:
  1. Go to Brandflow Business Suite → **Business info** (bottom left).
  2. Copy your **Business Portfolio ID** (15-digit number).
  3. Send the ID to the client:
     - Client opens their Page: **Settings → Page Access → Partners with access → Assign Partner**.
     - Client pastes your Business Portfolio ID and clicks Save.
  4. The Page appears in your portfolio immediately with zero outbound request friction!

---

*Documented and certified by BrandFlow Staff Engineering.*
