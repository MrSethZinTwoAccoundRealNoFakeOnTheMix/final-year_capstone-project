# Customer Storefront Redesign Implementation Plan
**Checkpoint Git Tag:** `checkpoint-before-customer-redesign` (Pushed to `origin/master`)

---

## 1. Objectives & Scope
Transform the customer storefront (`/`, `public/index.html`, `public/js/webview.js`) into a clean, minimalist, mobile-first luxury shopping experience that:
1. **Displays Variants/Styles Visually:** Miniature circular image swatches directly on the product card so customers visually identify styles without clicking into menus.
2. **Handles Dynamic Pricing:** Displays single price if variants share the same price (`$35.00`), or dynamic price range (`$35.00 – $48.00`) if prices differ. Tapping a swatch on the card updates to that style's exact price in real time.
3. **Presents a Quick-View Style Bottom Sheet:** Tapping the card or "Select Style" opens a luxury drawer with a photo gallery of styles (Style 1, Style 2...), stock badges, and sticky "Add to Bag" CTA.
4. **Integrates Minimalist Search:** Live search bar filtering by product name, SKU, category, or style name.
5. **Organizes Categories Elegantly:** Clean category tabs + sectional categorization so products are not jumbled together.
6. **Maintains Full Compatibility with Checkout & Telegram/Messenger:** Sends exact `variantId` with cart line items so inventory is deducted correctly upon order confirmation.

---

## 2. Phase-by-Phase Implementation Steps

### Phase 1: Backend API Preparation
- [x] **Verify `GET /api/products`:**
  - Update `src/repositories/product.repository.js` -> `findAll()` to attach `variant_list` (including `id, product_id, color_name, sell_price, stock, photo_url`) without exposing `import_price`.
- [x] **Update Order Service (`src/services/order.service.js`):**
  - Ensure `placeOrder` accepts optional `variantId` per cart item.
  - Soft-check stock against `product_variants` table if `variantId` is present, or fallback to main `products.stock`.
  - Include variant details in `order_items` record and receipt payload.
- [x] **Update Order Repository (`src/repositories/order.repository.js`):**
  - Added safe auto-migration for `order_items.variant_id`.
  - Updated `confirmOrder` to decrement variant stock and sync parent stock.
  - Updated `cancelOrder` to restore variant stock and sync parent stock.

### Phase 2: Storefront HTML & UI Architecture (`public/index.html`)
- [x] **Search Engine Input:**
  - Add minimalist luxury search bar under the header with instant clear button (`[ ✕ ]`).
- [x] **Dynamic Category Navigation:**
  - Container for dynamically loaded category chips from `/api/categories`.
- [x] **Curated Section Stack:**
  - Added `#catalog-sections` for grouped boutique categories in "ALL" view.
- [x] **Product & Style Drawer (Bottom Sheet Modal):**
  - Added markup for `#style-modal` containing:
    - Large preview photo
    - Model name, category, SKU, and dynamic price ($USD & ៛KHR)
    - Visual Style Swatches (thumbnails with active gold ring)
    - Stock indicator (`In Stock` / `Only X left` / `Sold Out`)
    - Stepper `[ − 1 + ]`
    - Sticky CTA: `Add to Bag • $XX.XX`

### Phase 3: Storefront Logic & Visual Interactions (`public/js/webview.js` & `public/css/webview.css`)
- [x] **Product Card Rendering:**
  - Calculate min/max price for products with `variant_list`.
  - Render mini circular image thumbnails (24px) for products with styles (Option B).
  - Allow tapping mini swatches on the card to switch main image and price immediately without opening modal.
- [x] **Category Layout Rendering:**
  - Curated Section Stack view (up to 4 pieces per section with `Explore All →` button).
  - Smooth category filtering into full 2-column grid.
- [x] **Search Functionality:**
  - Real-time search by name, SKU, category, and style names with instant clear `[ ✕ ]`.
- [x] **Cart State & Variant Support:**
  - Update cart item structure to `cartItemId = ${productId}_${variantId || 'base'}`.
  - Display model name + style name (e.g. `Classic Gold Ring — Style 2`) and style photo in the cart bag.

### Phase 4: Verification & End-to-End Testing
- [x] Run automated script (`scripts/test_customer_storefront.js`) verifying public catalog and end-to-end checkout with variants.
- [x] Verify server returns 200 and all DOM IDs match.
- [x] All integration tests passing 100%.
