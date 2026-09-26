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
- [ ] **Verify `GET /api/products`:**
  - Update `src/repositories/product.repository.js` -> `findAll()` to attach `variant_list` (including `id, product_id, color_name, sell_price, stock, photo_url`) without exposing `import_price`.
- [ ] **Update Order Service (`src/services/order.service.js`):**
  - Ensure `placeOrder` accepts optional `variantId` per cart item.
  - Soft-check stock against `product_variants` table if `variantId` is present, or fallback to main `products.stock`.
  - Include variant details in `order_items` record and receipt payload.

### Phase 2: Storefront HTML & UI Architecture (`public/index.html`)
- [ ] **Search Engine Input:**
  - Add minimalist luxury search bar under the header with instant clear button (`[ ✕ ]`).
- [ ] **Dynamic Category Navigation:**
  - Container for dynamically loaded category chips from `/api/categories`.
- [ ] **Product & Style Drawer (Bottom Sheet Modal):**
  - Add markup for `#style-sheet-modal` containing:
    - Large preview photo
    - Model name, category, SKU, and dynamic price ($USD & ៛KHR)
    - Visual Style Swatches (thumbnails with active gold ring)
    - Stock indicator (`In Stock` / `Only X left` / `Sold Out`)
    - Stepper `[ − 1 + ]`
    - Sticky CTA: `Add to Bag • $XX.XX`

### Phase 3: Storefront Logic & Visual Interactions (`public/js/webview.js`)
- [ ] **Product Card Rendering:**
  - Calculate min/max price for products with `variant_list`.
  - Render mini circular image thumbnails (24px) for products with styles.
  - Allow tapping mini swatches on the card to switch main image and price immediately.
- [ ] **Category Layout Rendering:**
  - Category tabs filter or browse by sectional collections.
  - "View All" interaction to expand specific categories.
- [ ] **Search Functionality:**
  - Live filter on `keyup` / `input` across name, category, SKU, and style numbers.
- [ ] **Cart State & Variant Support:**
  - Update cart item structure to `cartItemId = `${productId}_${variantId || 'base'}`.
  - Display model name + style name (e.g. `Emerald Ring — Style 2`) and style photo in the cart bag.

### Phase 4: Verification & End-to-End Testing
- [ ] Run automated script to test catalog API with variants.
- [ ] Test placing orders with variants and verifying receipt payload.
- [ ] Verify mobile layout responsiveness in browser subagent.
- [ ] Commit and push changes to master.
