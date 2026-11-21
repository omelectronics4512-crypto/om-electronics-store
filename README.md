# OM Mobile & Electronics (Branch No. 4 – Dhanore, Pune)
### Modern, Fully Functional & Animated Frontend

A high-performance, responsive e-commerce and retail storefront web application for **OM Mobile & Electronics** (Branch No. 4, PCS Chowk, Dhanore, Pune), converted from a static Stitch design into a **production-ready, fully interactive, and animated frontend experience**.

---

## 🌟 Key Highlights & Enhancements Added

### 1. 🔍 Omni-Search System (`Ctrl + K` / `/`)
- **Keyboard Shortcut Support:** Press `Ctrl + K` (or `Cmd + K` on Mac) anywhere on the page to trigger the search modal.
- **Live Search Filtering:** Real-time search across smartphones, laptops, audio accessories, and home appliances.
- **Quick Query Pills:** One-tap suggestion chips for iPhone, Galaxy S24, Laptops, OnePlus, and Fast Chargers.

### 2. 📱 Dynamic & Filterable Product Catalog
- **Category Tabs:** Filter instantly between *All Products*, *Smartphones*, *Laptops*, *Audio & TWS*, *Smartwatches*, *Accessories*, and *TVs & Home Appliances* with live count indicators.
- **Brand Badges Integration:** Clicking on authorized brands (Apple, Samsung, OnePlus, Vivo, Xiaomi, boAt) filters the catalog immediately.
- **Sorting & In-Catalog Search:** Sort by Featured, Price (Low to High), Price (High to Low), or Customer Rating.
- **Active Filter Indicator:** Real-time dismissible chip showing active filters with a one-click reset.

### 3. 💳 Interactive 0% EMI & Old Phone Exchange Calculator
- **Device Price Slider:** Choose total device cost from ₹10,000 to ₹1,50,000 with quick-preset buttons.
- **Down Payment Slider:** Adjust downpayment from 0% (Zero Down) up to 50%.
- **Tenure Selector:** Interactive tenure buttons for 3, 6, 9, 12, 18, and 24 months.
- **Trade-In Valuation Engine:** Select an old phone brand and condition (Flawless, Good, Damaged) to get an instant trade-in value estimate automatically deducted from the loan principal.
- **1-Click WhatsApp Application:** Formats a complete breakdown (Monthly EMI, Loan Amount, Down Payment, Exchange Bonus) to message the Dhanore store finance desk.

### 4. ⚖️ Side-by-Side Device Comparison Matrix
- **Comparison Dock:** Floating bottom indicator tracking up to 3 selected devices.
- **Zebra-Striped Spec Matrix:** Clean side-by-side table comparing Display, Processor, Camera, Battery, RAM/Storage, OS, Warranty, and Price.
- **1-Click Contact Store:** Contact the Dhanore showroom directly for any compared device from within the modal.

### 5. 👁️ Product Quick View Modal
- Click any product or its thumbnail to inspect high-resolution hardware images, live stock availability across Dhanore & Alandi, color variants, detailed specification tables, and direct store contact links.

### 6. 💬 Product Contact & In-Store Reservation System (Replaced Cart)
- **Direct 1-Tap Inquiry:** Each product features a prominent **"Contact"** button opening an inquiry modal.
- **Pre-Filled WhatsApp Chat:** Instant message with device name, current price, and 0% EMI inquiry pre-formatted for Dhanore Branch No. 4.
- **Direct Store Phone Call:** One-tap calling to the counter (+91 91722 14216).
- **In-Store Reservation Form:** Reserve sealed units for hands-on trial and demo with zero advance payment.

### 7. 🛍️ Dedicated Products Catalog Page (`products.html`)
- **Standalone Products Hub:** Complete dedicated catalog page (`products.html`) linked seamlessly across the header, mobile bottom nav, and hero sections.
- **Empty by Default:** Starts with a clean, branded "No Products Listed Yet" showroom refresh placeholder by default, ready for products added via the Admin Portal.
- **Multi-Level Filters:** Filter simultaneously by Category, Brand chips (Apple, Samsung, OnePlus, Vivo, Xiaomi, boAt), and Budget Tiers (< ₹15k, ₹15k–₹35k, ₹35k–₹70k, > ₹70k).
- **Real-Time Live Search:** Fast in-page search filtering by model name, processor, or specs with a 1-tap clear button.
- **Grid vs. List Switcher:** Toggle between 2-column mobile / 4-column desktop grid and detailed horizontal spec cards.

### 8. 🔐 Secret Admin Portal & Product Manager (`/admin` or `admin.html`)
- **Zero Website Footprint:** Completely unlinked and untracked from the customer storefront. No navigation links, buttons, or trackers point to it.
- **Authentication Gate:** Protected with username and password login screen before granting access:
  - **Username:** `admin`
  - **Password:** `om@dhanore2026`
- **Product Management (CRUD):** Add, edit, and delete products in real time with immediate updates reflecting on both the homepage and products page.
- **Comprehensive Fields:** Product name, brand, category, tag (Bestseller, New Flagship, etc.), pricing (discounted and original), 0% EMI calculation, stock availability status, customer rating, description, and key hardware specs for Quick View and Comparison matrix.
- **Dual Image Input:** Paste an image web URL or upload any local photo file directly from your device (automatically encoded as a local Data URL).
- **1-Click Quick Actions:**
  - **Load 16 Sample Products:** Instantly populates the store with 16 authentic Dhanore showroom devices (iPhone 15, Vivo V60e, S24 Ultra, MacBooks, etc.) for live testing or demo.
  - **Clear All Products:** Instantly wipes the catalog back to 0 products.

### 9. ⚡ Centralized Reactive Store Engine (`store.js`)
- **Single Source of Truth:** Centralized `localStorage` catalog manager (`om_mobile_store_products_v1`).
- **Cross-Tab & Real-Time Sync:** Listens to `storage` and `om_products_changed` events so edits made in the admin portal update open customer tabs instantly without page reloads.
- **Offline & Standalone Ready:** Works 100% locally with zero external database or backend dependencies needed.

### 10. 🎓 Student Tech Pass & Free Backpack Bundle
- Back-to-Campus incentive modal for students of MIT Alandi, DY Patil, PCCOE, COEP, etc.
- Unlocks the instant discount voucher and heavy-duty backpack bundle.

### 11. 🔧 On-Site Repair Desk Estimator & Slot Booking
- Interactive diagnostic tool for cracked displays, fast-draining batteries, loose Type-C ports, and water damage.
- Select brand, model, and issue to get an instant time estimate (1–3 hours turnaround) and book a technician slot on WhatsApp.

### 12. 🕒 Live Store Status Indicator
- Dynamically calculates current local time and displays whether Branch No. 4 is currently open (Operating hours: 9:30 AM to 10:00 PM, all 7 days).

### 13. 📲 Responsive Architecture & Mobile Native App Feel
- **Adaptive Breakpoints:** Flawlessly optimized across 320px–480px (Smartphones / Foldables), 640px–1023px (Tablets & iPads), and 1024px+ (Desktop & Ultra-wide).
- **2-Column Mobile Catalog Grid:** Modern e-commerce layout on phones (`grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6`) with compact typography and aspect-ratio image framing.
- **Interactive View Switcher (Grid vs. List):** Switch between a 2-to-4 column grid and a full-width horizontal specification list card with 1 tap.
- **Horizontal Swipeable Brand Ribbon:** Touch scroll with `snap-x` alignment on mobile screens so all authorized brands swipe smoothly with zero awkward grid wrapping.
- **Sticky Technical Comparison Matrix:** The `Specifications` column stays pinned (`sticky left-0`) on mobile during horizontal scrolling, accompanied by a touch swipe hint.
- **Safe Area Insets & Clearance:** Navigation bars support `env(safe-area-inset-bottom)` (`pb-safe`) and `<main>` reserves bottom clearance (`pb-20 lg:pb-0`) so content is never occluded by the fixed bottom app bar.
- **Sticky Bottom App Bar:** Quick-access mobile bottom navigation bar (*Home*, *Products*, *Compare*, *Contact*, *WhatsApp*).
- **Responsive Modals & Drawers:** All modals and drawers feature `max-h-[90vh]` scrolling to adapt safely to mobile soft keyboards and browser chrome.

### 14. 🎨 Smooth Animations & Micro-Interactions
- Smooth scrolling with active navbar indicator (Scrollspy).
- Floating Desktop Back-to-Top button that emerges upon scrolling.
- Floating WhatsApp specialist chat bubble.
- Animated toast notifications for all user actions (Added to cart, coupon applied, compare toggled, etc.).

---

## 📂 File Structure

| File | Purpose |
|------|---------|
| `index.html` | The primary, fully-functional and animated storefront single-page application (empty by default, dynamic via `store.js`). |
| `products.html` | Dedicated empty products catalog page with placeholder state and inquiry actions (dynamic via `store.js`). |
| `admin.html` | Secret Admin Portal with authentication login, full product CRUD, image upload, and 1-click restore/clear tools. |
| `admin/index.html` | Direct route mirror enabling `/admin` URL access on local servers and static hosts. |
| `store.js` | Centralized hybrid data store (Supabase Cloud + local cache fallback) with real-time broadcast. |
| `supabase_schema.sql` | 1-Click PostgreSQL table schema, Row-Level-Security (RLS) policies, and Realtime pub script. |
| `code.html` | Updated synchronized version matching `index.html`. |
| `DESIGN.md` | Original design system specification (Vibrant Civic Tech Retail). |
| `screen.png` | Visual baseline screenshot from the original Stitch project. |
| `README.md` | Comprehensive project documentation and feature overview. |

---

## ⚡ Supabase Cloud Database Setup (2-Minute Guide)

By default, the web application runs in **Local Storage mode** (zero configuration, works offline, safe for local testing). To make it a **global live cloud application** where products you add sync instantly to every customer across all devices:

1. **Sign Up & Create Project:** Go to [supabase.com](https://supabase.com) (100% free) and create a new project.
2. **Run SQL Schema:** 
   - Open **SQL Editor** in your Supabase dashboard.
   - Copy all content from [`supabase_schema.sql`](file:///c:/Users/vedan/Downloads/stitch_om_mobile_electronics_website/supabase_schema.sql), paste it into the editor, and click **Run**.
3. **Connect from Admin Panel:**
   - Go to your Supabase **Project Settings** -> **API**.
   - Copy your **Project URL** and **anon public key**.
   - Open your store's Admin Panel (`/admin` or `admin.html`), click the **"Local Storage" / "Supabase Cloud"** button in the top bar.
   - Paste your URL and anon key, click **Test Connection**, then **Save & Connect**!

All products, pricing, stock statuses, and specs will now sync live across the cloud in real-time.

---

## 🚀 How to Run & Preview

Open the project files directly in any web browser:
- **Customer Storefront:** Open `index.html` or `products.html` directly in your browser.
- **Secret Admin Portal:** Enter `admin.html` or `/admin` in the browser URL bar:
  - **Username:** `admin`
  - **Password:** `om@dhanore2026`
- **Local HTTP Server (Optional):**
  ```bash
  # Using Node
  npx serve .
  # or using Python (if installed)
  python -m http.server 8000
  ```
