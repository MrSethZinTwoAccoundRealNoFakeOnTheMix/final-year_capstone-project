# PHASE_12B_PLAN.md
# Customer Storefront — 3-Column Grid Redesign

> **Status:** READY TO IMPLEMENT
> **Prerequisite:** Phase 12a is complete and merged (commit `e81fbc9`) — swipeable style modal + multi-select tiles are live.
> **Context doc:** Read `AGENT_HANDOFF.md` for full project architecture before starting.

---

## Problem

The current 2-column product grid (`grid-cols-2`) makes cards too large on mobile. The owner wants to show more products per screen (like the admin Quick Sell tab which uses 3-col).

**Why 3-col is safe now:** Phase 12a replaced the old modal with a swipeable gallery + multi-select tiles. The card mini swatch thumbnails (Phase 11) are now redundant — the modal does variant browsing far better. Removing swatches from cards frees up enough vertical space to make 3-col readable.

---

## Decision Log (already made — do not re-discuss)

| Decision | Choice | Reason |
|---|---|---|
| Grid columns | **3-col** | More products visible per screen, less scrolling |
| Mini swatches on cards | **Remove** | Modal handles variant preview; swatches at ~14px are untappable at 3-col |
| KHR price on card | **Remove** | No room at 3-col; still shown in modal and cart |
| USD price on card | **Keep** | Essential for browsing |
| `✨ N Styles` badge | **Keep** | Sufficient signal that variants exist |
| `selectCardStyle` JS function | **Remove** | Dead code once swatches are removed |

---

## Files to Edit

```
public/js/webview.js       <- main logic changes
public/index.html          <- grid class + cache bust
public/css/webview.css     <- remove swatch CSS, no new rules needed
```

---

## 1. public/js/webview.js

### 1a. Remove swatchesHtml block from renderProductCard()

Find the block that starts with:
```js
// Mini Swatches HTML (Option B: mini 24px circular image thumbnails)
let swatchesHtml = ''
if (hasVariants && product.variant_list.length > 1) {
```
Delete the entire block (the variable declaration + the if block that builds it).

Then inside the card HTML template, find and remove:
```html
<!-- Mini Swatches below title -->
${swatchesHtml}
```

### 1b. Remove KHR price line from card HTML in renderProductCard()

Find and remove this element from the card template:
```html
<div class="text-[11px] font-semibold text-[#e5c36a]" id="card-price-khr-${product.id}">
  ${priceKhrText}
</div>
```

### 1c. Tighten card padding

In the card details section, change:
- `p-3 pb-1` -> `p-2 pb-0.5`

In the button section, change:
- `p-3 pt-2` -> `p-2 pt-1`
- Button `py-2` -> `py-1.5`

### 1d. Remove window.selectCardStyle function entirely

Find and delete the entire function:
```js
window.selectCardStyle = function (e, productId, variantId) {
  ...
};
```
It was only used by the now-removed mini swatch onclick handlers.

### 1e. Update curated sections grid to 3-col

In renderCuratedSections(), find the grid div inside the HTML template:
```html
<div class="grid grid-cols-2 gap-3">
```
Change to:
```html
<div class="grid grid-cols-3 gap-2">
```

---

## 2. public/index.html

### 2a. Change product grid to 3-column

Find:
```html
<div id="product-grid" class="grid grid-cols-2 gap-3 pb-8">
```
Change to:
```html
<div id="product-grid" class="grid grid-cols-3 gap-2 pb-8">
```

### 2b. (Optional) Update skeleton placeholders

Change the 4 skeleton divs inside #product-grid to 6, to fill the 3-col layout visually on load.

### 2c. Bump cache-busting versions

Change both references from `v=1.1.0` to `v=1.2.0`:
```html
<link rel="stylesheet" href="/css/webview.css?v=1.2.0">
...
<script src="/js/webview.js?v=1.2.0"></script>
```

---

## 3. public/css/webview.css

### 3a. Remove dead mini card swatch CSS

Find and delete the entire block under the comment:
```css
/* Mini Card Swatches (Option B) */
```
This covers: .card-swatch-list, .card-swatch-thumb, .card-swatch-thumb:hover, .card-swatch-thumb.active

These classes are no longer rendered anywhere in the HTML after removing swatchesHtml.

### 3b. No new CSS needed

The 3-col layout is handled by the grid class change in index.html.
The padding tightening is done inline in renderProductCard() via Tailwind classes.

---

## Expected Card Layout After Changes

```
+---------------+ +---------------+ +---------------+
|               | |               | |               |
|    [photo]    | |    [photo]    | |    [photo]    |
| [In Stock]    | | [Only 2 left] | | [Sold Out]    |
|       [RG-001]| |       [NC-002]| |       [BR-003]|
|  [* 3 Styles] | |               | |  [* 2 Styles] |
+---------------+ +---------------+ +---------------+
| RING          | | NECKLACE      | | BRACELET      |
| Rose Gold Ring| | Pearl Chain   | | Gold Bangle   |
| $45.00        | | $38.00-$52.00 | | $28.00        |
+---------------+ +---------------+ +---------------+
|[* Select Style| |[* Select Style| |  [Sold Out]   |
+---------------+ +---------------+ +---------------+
```

Each card is ~112px wide on a 375px screen. Photo stays square (aspect-square).
The N Styles badge on photo is the variant signal.
Tapping any card opens the Phase 12a swipeable modal.

---

## What NOT to Touch

- #style-modal and all sm-* modal logic — Phase 12a, do not change
- Cart, checkout, bottom bar — untouched
- Admin panel files (admin.html, admin.js, admin.css) — untouched
- Backend files (src/) — untouched

---

## Git Commit Message (use after implementing)

```
Phase 12b: Switch customer catalog to 3-column grid

- grid-cols-2 -> grid-cols-3, gap-3 -> gap-2 on #product-grid
- Remove mini swatch thumbnails from product cards (modal handles variant preview)
- Remove KHR price from card (shown in modal + cart, no room at 3-col)
- Tighten card padding: p-3 -> p-2, button py-2 -> py-1.5
- Remove dead selectCardStyle() function
- Update curated sections inner grid to grid-cols-3 gap-2
- Remove dead .card-swatch-* CSS rules
- Cache bust: webview.css + webview.js -> v=1.2.0
```

---

## Verification Checklist

After implementing, verify manually in browser at 375px viewport width:

- [ ] 3 cards fit per row without overflow or horizontal scroll
- [ ] Product name is readable (1 line, truncated with ellipsis if long)
- [ ] USD price is visible and not cut off
- [ ] N Styles badge visible on photos of multi-variant products
- [ ] In Stock / Only X left / Sold Out badges visible and not overlapping
- [ ] Tapping any card opens the style modal correctly
- [ ] Curated "All Collections" sections also show 3-col grid
- [ ] No JS console errors on page load
