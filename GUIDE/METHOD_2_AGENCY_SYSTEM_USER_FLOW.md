# 🏢 BrandFlow — Method 2: Agency System User Onboarding Guide (Zero-Review Workaround)

> **Target Audience:** Agency Operations, Administrators & Engineers  
> **Status in Codebase:** 100% Fully Implemented in Admin Panel (`/admin?tab=users`)  
> **Key Benefit:** 0 Days Waiting Time, 100% Bypass of Meta App Review Restrictions, Permanent Never-Expiring Tokens

---

## 📌 Executive Summary

Method 2 is the **Agency / Business Portfolio Model** used by high-end marketing agencies and SaaS platforms while awaiting Meta App Review approval. 

In this flow, the client grants agency access to their Facebook Page, and the agency generates a permanent **System User Token** in Meta Business Suite. The Admin then links this token directly to the client's BrandFlow account via the **Admin Dashboard** (`/admin?tab=users`). 

The client has **zero technical friction**: they never touch developer settings, tokens, or APIs, and their accounts appear **Already Connected** when they log in.

---

## 🛠️ Complete Step-by-Step Walkthrough & Real-World Gotchas

Every step below was field-tested on real accounts (`rajesh test page` & `@rajeshpatelqm`), recording every trial, error, and solution.

---

### Phase 1: Requesting Page Access from BrandFlow Agency Portfolio

1. Go to: [Meta Business Suite > Pages](https://business.facebook.com/settings/pages)
2. Click the blue **"+ Add"** button.

#### ⚠️ Gotcha #1: "Add a Page" vs "Request access to a Page"
- **The Mistake:** Clicking *"Add a Page"*.
- **The Error:** Meta rejects with: *"You must already be an admin of this page to add it to your Business Portfolio"*.
- **The Fix:** ALWAYS click **"Request access to a Page"** (Agency Mode).

#### ⚠️ Gotcha #2: Mobile Share Link Search Failure
- **The Mistake:** Pasting a mobile share link (e.g. `facebook.com/share/1879...`) into the search box.
- **The Error:** Meta displays *"No Pages found"*.
- **The Fix:** Mobile share links are dynamic redirects. Open the link in a desktop browser, look at the final URL, and copy the numeric ID (e.g. `61595190802205` or `1291828364023394`). Search by **Numeric Page ID**!

#### ⚠️ Gotcha #3: "Full Control" Modal Freeze
- **The Mistake:** Toggling ON *"Full control (everything)"* when requesting access.
- **The Error:** On unverified agency portfolios, Meta freezes the confirmation button or greys it out.
- **The Fix:** Keep *"Full control"* **OFF**. Scroll down to **Partial access** and toggle ON only **"Content"** (Create, manage or delete posts). Click **Confirm** — request sends in 1 second!

---

### Phase 2: Client Approving the Access Request

Send a message to your client with the approval instructions.

#### ⚠️ Gotcha #4: Where is the Notification?
- **The Mistake:** The client checks their personal Facebook profile notifications (`facebook.com/notifications`) and says *"Mujhe koi notification nahi aayi"*.
- **The Reality:** Agency partnership requests **NEVER** go to personal Facebook notifications.
- **The Fix:** Send the client this direct URL:
  ```text
  https://business.facebook.com/settings/requests
  ```
- **Client Steps:**
  1. Open `https://business.facebook.com/settings/requests`.
  2. Click the **"Received"** tab.
  3. Locate the request from **Brandflow**.
  4. Click **"Approve"** -> **"Next"** -> **"Approve Request"**.
  5. Enter Facebook password to confirm.

---

### Phase 3: System User Creation & Asset Assignment

Once approved, return to your BrandFlow Meta Business Suite:

1. Open: [Meta Business Suite > System Users](https://business.facebook.com/settings/system-users).
2. Click **"+ Add"** (or select existing System User `rajesh test page`).
3. Set Role: **Employee** (or Admin) -> Click **Create system user**.
4. With the System User selected, click **"Assign assets"**:
   - Under **Pages**, check the client's page (`rajesh test page`).
   - Under **Content**, toggle ON **"Content"** (Create, edit, delete posts).
   - Click **Save changes**.

#### ⚠️ Gotcha #5: "You can't update access for this asset" (Instagram Tab)
- **The Mistake:** Trying to click the *Instagram Accounts* tab in Assign Assets and assign permissions directly.
- **The Error:** Meta displays: *"You can't update access for this asset"*.
- **The Fix:** Do NOT assign the Instagram asset standalone. In Meta's architecture, publishing to an Instagram Business account linked to a Facebook Page is handled automatically by the **Page Access Token** via Graph API!

#### ⚠️ Gotcha #6: Forgetting to Assign the Meta App
- **The Mistake:** Going directly to "Generate token" without assigning the Meta App to the System User.
- **The Error:** Token generation fails or gives no permissions.
- **The Fix:** In **Assign assets**, click **Apps**, select your BrandFlow App (`1071189275625184`), enable **Full control**, and click **Save changes**.

---

### Phase 4: Generating the Permanent Never-Expiring Token

1. Under the System User, click **"Generate new token"**.
2. Select your BrandFlow Meta App.
3. Set **Token expiration** to: **Never** (Permanent token).
4. Tick the following **6 Scopes**:

```text
✅ pages_manage_posts       (Publishes posts to Facebook Page - Mandatory)
✅ pages_read_engagement    (Reads engagement metrics and comments)
✅ pages_show_list          (Lists managed pages)
✅ instagram_content_publish(Publishes photos/media to Instagram - Mandatory)
✅ instagram_basic          (Reads Instagram profile handle & details)
✅ business_management      (Required for agency portfolio token generation)
```

5. Click **Generate Token**.
6. Copy the token string (starts with `EAAPOP...`).  
   *(Keep this token safe! Meta will only show it once).*

---

### Phase 5: Linking the Token to the Client in BrandFlow Admin Panel

You no longer need to open terminal, SSH, or run database scripts!

1. Log into BrandFlow as SuperAdmin (`admin1@gmail.com`).
2. Navigate to: **`http://localhost:5173/admin?tab=users`** (or production `https://<YOUR_DOMAIN>/admin?tab=users`).
3. In the **Business Users & Payment Subscriptions** directory, locate the client tenant row (e.g. `sam123@gmail.com`).
4. In the **Social Media** column, click the **"Link Meta"** button.
5. The **Link Meta Accounts** modal opens:
   - Displays client name, email, and current business name.
   - Paste the System User Token (`EAAPOP...`).
   - Click **"Verify & Link Accounts"**.

---

### 🛡️ What BrandFlow Backend Does Automatically:

```text
[ ADMIN PASTES TOKEN IN MODAL ]
                │
                ▼
[ POST /api/v1/social/admin/connect-user-token ]
                │
                ├─► 1. Calls Meta Graph API /me/accounts -> Resolves Facebook Page ID & Name
                ├─► 2. Calls /<page_id>?fields=instagram_business_account -> Resolves IG Handle (@rajeshpatelqm)
                ├─► 3. Encrypts tokens with AES-256-GCM
                ├─► 4. Upserts FACEBOOK & INSTAGRAM records in PostgreSQL SocialAccount table
                ├─► 5. Purges Redis cache for target user
                ▼
[ RESPONSE: 200 OK ]
  "Successfully connected Facebook Page 'rajesh test page' and Instagram '@rajeshpatelqm' for sam123!"
```

The user row in the Admin Users table immediately updates to show:
- 📘 `Facebook: @rajesh test page`
- 📸 `Instagram: @rajeshpatelqm`

---

### Phase 6: The Client Experience

When the client (`sam123@gmail.com`) logs into BrandFlow:
1. They visit **Social Connections** (`/connections`) and see both cards **Green & Connected**.
2. They visit **Post Studio** (`/create-post`), design a graphic, select Facebook & Instagram, and click **"Publish Now"**.
3. The post immediately publishes live to:
   - Facebook Page: `https://facebook.com/1291828364023394`
   - Instagram Profile: `https://instagram.com/rajeshpatelqm`

Zero Meta Review delays. Zero confusion for the client. 100% legal under Meta Agency policies.
