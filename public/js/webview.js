/**
 * Luxe Jewelry - Customer Webview Logic (Mobile-First)
 */

(function () {
  'use strict';

  // Constants & Config
  const EXCHANGE_RATE_KHR = 4100;
  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&q=80';

  // State
  const params = new URLSearchParams(window.location.search);
  const psid = params.get('psid');
  const sig = params.get('sig');

  let isVerified = false;
  let productsList = [];
  let currentCategory = 'ALL';
  let cart = [];

  // Local Storage Cart Key (Scoped to PSID or guest)
  const CART_STORAGE_KEY = `luxe_cart_${psid || 'guest'}`;

  // DOM Elements
  const headerConnBadge = document.getElementById('header-conn-badge');
  const authBanner = document.getElementById('auth-banner');
  const authBannerIcon = document.getElementById('auth-banner-icon');
  const authBannerText = document.getElementById('auth-banner-text');

  const productGrid = document.getElementById('product-grid');
  const catalogCountLabel = document.getElementById('catalog-count-label');
  const emptyState = document.getElementById('empty-state');
  const categoryPills = document.querySelectorAll('.category-pill');

  const bottomBar = document.getElementById('bottom-bar');
  const barCartCount = document.getElementById('bar-cart-count');
  const barCartUsd = document.getElementById('bar-cart-usd');
  const barCartKhr = document.getElementById('bar-cart-khr');

  const cartModal = document.getElementById('cart-modal');
  const sheetItemsCount = document.getElementById('sheet-items-count');
  const sheetCartItems = document.getElementById('sheet-cart-items');
  const sheetCartEmpty = document.getElementById('sheet-cart-empty');
  const summarySubtotalUsd = document.getElementById('summary-subtotal-usd');
  const summaryTotalUsd = document.getElementById('summary-total-usd');
  const summaryTotalKhr = document.getElementById('summary-total-khr');
  const khqrDueUsd = document.getElementById('khqr-due-usd');
  const khqrDueKhr = document.getElementById('khqr-due-khr');
  const checkoutAuthAlert = document.getElementById('checkout-auth-alert');
  const submitOrderBtn = document.getElementById('submit-order-btn');
  const submitOrderSpinner = document.getElementById('submit-order-spinner');
  const submitOrderText = document.getElementById('submit-order-text');

  const successModal = document.getElementById('success-modal');
  const successOrderId = document.getElementById('success-order-id');
  const successOrderTotal = document.getElementById('success-order-total');

  const toastContainer = document.getElementById('toast-container');

  // --- Currency Helpers ---
  function formatUSD(amount) {
    return '$' + Number(amount || 0).toFixed(2);
  }

  function formatKHR(amountUSD) {
    const khr = Math.round(Number(amountUSD || 0) * EXCHANGE_RATE_KHR);
    return '៛' + khr.toLocaleString();
  }

  // --- Toast Notifications ---
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const bgColors = {
      success: 'bg-emerald-950/95 border-emerald-500/40 text-emerald-200',
      error: 'bg-rose-950/95 border-rose-500/40 text-rose-200',
      warning: 'bg-amber-950/95 border-amber-500/40 text-amber-200',
      info: 'bg-slate-900/95 border-white/20 text-slate-200',
    };

    toast.className = `p-3 rounded-2xl shadow-2xl border text-xs font-medium flex items-center justify-between transition-all transform duration-300 pointer-events-auto ${bgColors[type] || bgColors.info}`;
    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        <span>${type === 'success' ? '✨' : type === 'error' ? '❌' : 'ℹ️'}</span>
        <span>${message}</span>
      </div>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // --- Identity Verification ---
  async function verifyIdentity() {
    if (!psid || !sig) {
      isVerified = false;
      renderAuthStatus(false, 'Guest Browsing (Link required to order)');
      return;
    }

    try {
      const res = await fetch(`/api/identity?psid=${encodeURIComponent(psid)}&sig=${encodeURIComponent(sig)}`);
      const data = await res.json();

      if (data.verified) {
        isVerified = true;
        const displayId = psid.length > 10 ? `${psid.slice(0, 6)}…${psid.slice(-4)}` : psid;
        renderAuthStatus(true, `Connected: ${displayId}`);
      } else {
        isVerified = false;
        renderAuthStatus(false, 'Invalid or expired Messenger link');
      }
    } catch (err) {
      isVerified = false;
      renderAuthStatus(false, 'Connection error');
    }
  }

  function renderAuthStatus(verified, message) {
    if (verified) {
      headerConnBadge.className = 'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60';
      headerConnBadge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span> Connected';

      authBanner.className = 'max-w-md mx-auto px-4 py-2 text-xs flex items-center justify-between border-b transition-colors bg-emerald-950/40 text-emerald-300 border-emerald-800/40';
      authBannerIcon.textContent = '✅';
      authBannerText.innerHTML = `<strong>${message}</strong> · Order receipts delivered to Messenger`;

      checkoutAuthAlert.classList.add('hidden');
      submitOrderBtn.disabled = false;
    } else {
      headerConnBadge.className = 'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-700/60';
      headerConnBadge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></span> Guest Mode';

      authBanner.className = 'max-w-md mx-auto px-4 py-2 text-xs flex items-center justify-between border-b transition-colors bg-amber-950/30 text-amber-300/90 border-amber-800/30';
      authBannerIcon.textContent = '📱';
      authBannerText.innerHTML = `<strong>${message}</strong>`;

      checkoutAuthAlert.classList.remove('hidden');
      submitOrderBtn.disabled = true;
    }
  }

  // --- Catalog Loading & Rendering ---
  async function loadCatalog() {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to load products');
      productsList = await res.json();
      renderProducts();
    } catch (err) {
      productGrid.innerHTML = `
        <div class="col-span-2 text-center py-12 text-slate-400">
          <p class="text-sm">Unable to load jewelry catalog.</p>
          <button onclick="loadCatalog()" class="mt-3 text-xs text-[#c9a84c] underline">Tap to retry</button>
        </div>
      `;
    }
  }

  function renderProducts() {
    const filtered = currentCategory === 'ALL'
      ? productsList
      : productsList.filter((p) => p.category === currentCategory);

    catalogCountLabel.textContent = `${filtered.length} piece${filtered.length === 1 ? '' : 's'} available`;

    if (filtered.length === 0) {
      productGrid.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    productGrid.innerHTML = filtered.map((product) => {
      const isSoldOut = product.stock <= 0;
      const isLowStock = product.stock > 0 && product.stock <= 3;
      const photoUrl = product.photo_url || DEFAULT_IMAGE;

      return `
        <div class="product-card rounded-2xl overflow-hidden flex flex-col justify-between">
          <div>
            <!-- Image Container -->
            <div class="relative w-full aspect-square bg-slate-900 overflow-hidden">
              <img src="${photoUrl}" alt="${escapeHtml(product.name)}" loading="lazy"
                class="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                onerror="this.onerror=null;this.src='${DEFAULT_IMAGE}'">
              
              <!-- Stock Badge -->
              <div class="absolute top-2 left-2">
                ${
                  isSoldOut
                    ? '<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-950/90 text-rose-300 border border-rose-800/80 backdrop-blur-sm">Sold Out</span>'
                    : isLowStock
                    ? `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950/90 text-amber-300 border border-amber-800/80 backdrop-blur-sm">Only ${product.stock} left</span>`
                    : '<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 backdrop-blur-sm">In Stock</span>'
                }
              </div>

              <!-- SKU pill -->
              <div class="absolute top-2 right-2">
                <span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/60 text-slate-300 backdrop-blur-sm">
                  ${product.id}
                </span>
              </div>
            </div>

            <!-- Details -->
            <div class="p-3">
              <span class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">
                ${product.category || 'Jewelry'}
              </span>
              <h3 class="text-xs font-bold text-white leading-snug line-clamp-1 mb-1">
                ${escapeHtml(product.name)}
              </h3>

              <!-- Optional Variant as Product Description -->
              ${
                product.variants
                  ? `<p class="text-[10px] text-slate-400 line-clamp-1 mb-1.5 font-normal italic">✨ ${escapeHtml(product.variants)}</p>`
                  : ''
              }

              <!-- Dual Currency Pricing -->
              <div class="mt-1">
                <div class="text-sm font-extrabold text-white leading-tight">
                  ${formatUSD(product.sell_price)}
                </div>
                <div class="text-[11px] font-semibold text-[#e5c36a]">
                  ${formatKHR(product.sell_price)}
                </div>
              </div>
            </div>
          </div>

          <!-- Add Button -->
          <div class="p-3 pt-0">
            <button type="button"
              ${isSoldOut ? 'disabled' : ''}
              onclick="window.addToCart('${product.id}')"
              class="${isSoldOut ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'btn-gold'} w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1">
              <span>${isSoldOut ? 'Out of Stock' : '+ Add to Bag'}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- Category Filtering Event Handlers ---
  categoryPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      categoryPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.dataset.category || 'ALL';
      renderProducts();
    });
  });

  // --- Cart Management ---
  function loadCartFromStorage() {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        cart = JSON.parse(stored);
      }
    } catch (e) {
      cart = [];
    }
    updateCartUI();
  }

  function saveCartToStorage() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {}
  }

  window.addToCart = function (productId) {
    const product = productsList.find((p) => p.id === productId);
    if (!product) return;

    if (product.stock <= 0) {
      showToast(`"${product.name}" is currently sold out.`, 'warning');
      return;
    }

    const existingIndex = cart.findIndex((it) => it.productId === productId);
    const currentQtyInCart = existingIndex >= 0 ? cart[existingIndex].quantity : 0;

    if (currentQtyInCart + 1 > product.stock) {
      showToast(`Cannot add more. Only ${product.stock} available in stock.`, 'warning');
      return;
    }

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        price: Number(product.sell_price),
        photo_url: product.photo_url || DEFAULT_IMAGE,
        variants: product.variants || '',
        stock: product.stock,
        quantity: 1,
      });
    }

    saveCartToStorage();
    updateCartUI();
    showToast(`Added "${product.name}" to bag!`, 'success');
  };

  window.updateItemQuantity = function (productId, delta) {
    const index = cart.findIndex((it) => it.productId === productId);
    if (index === -1) return;

    const item = cart[index];
    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      cart.splice(index, 1);
      showToast(`Removed "${item.name}"`, 'info');
    } else {
      const product = productsList.find((p) => p.id === productId);
      const availableStock = product ? product.stock : item.stock;

      if (newQty > availableStock) {
        showToast(`Stock limit reached (${availableStock} max).`, 'warning');
        return;
      }
      item.quantity = newQty;
    }

    saveCartToStorage();
    updateCartUI();
  };

  window.clearCart = function () {
    if (cart.length === 0) return;
    if (confirm('Clear all items from your shopping bag?')) {
      cart = [];
      saveCartToStorage();
      updateCartUI();
      showToast('Shopping bag cleared', 'info');
    }
  };

  function updateCartUI() {
    const totalCount = cart.reduce((sum, it) => sum + it.quantity, 0);
    const totalUSD = cart.reduce((sum, it) => sum + it.price * it.quantity, 0);

    // Floating bottom bar update
    barCartCount.textContent = totalCount;
    barCartUsd.textContent = formatUSD(totalUSD);
    barCartKhr.textContent = formatKHR(totalUSD);

    sheetItemsCount.textContent = totalCount;
    summarySubtotalUsd.textContent = formatUSD(totalUSD);
    summaryTotalUsd.textContent = formatUSD(totalUSD);
    summaryTotalKhr.textContent = formatKHR(totalUSD);
    khqrDueUsd.textContent = formatUSD(totalUSD);
    khqrDueKhr.textContent = formatKHR(totalUSD);

    // Render items in sheet
    if (cart.length === 0) {
      sheetCartItems.innerHTML = '';
      sheetCartEmpty.classList.remove('hidden');
    } else {
      sheetCartEmpty.classList.add('hidden');
      sheetCartItems.innerHTML = cart.map((item) => `
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
          <div class="flex items-center space-x-2.5">
            <img src="${item.photo_url}" alt="${escapeHtml(item.name)}"
              class="w-12 h-12 rounded-lg object-cover bg-slate-900 border border-white/10 flex-shrink-0"
              onerror="this.onerror=null;this.src='${DEFAULT_IMAGE}'">
            <div class="min-w-0 flex-1">
              <h5 class="text-xs font-bold text-white truncate">${escapeHtml(item.name)}</h5>
              <div class="text-[11px] text-[#e5c36a] font-semibold mt-0.5">
                ${formatUSD(item.price)} <span class="text-[10px] text-slate-400 font-normal">(${formatKHR(item.price)})</span>
              </div>
              ${item.variants ? `<p class="text-[10px] text-slate-400 truncate italic">✨ ${escapeHtml(item.variants)}</p>` : ''}
            </div>
          </div>

          <!-- Quantity Stepper -->
          <div class="flex items-center space-x-1 bg-black/40 rounded-lg p-1 border border-white/10 ml-2">
            <button type="button" onclick="window.updateItemQuantity('${item.productId}', -1)"
              class="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-slate-300 hover:text-white bg-white/5 active:scale-95">
              -
            </button>
            <span class="w-6 text-center text-xs font-bold text-white">${item.quantity}</span>
            <button type="button" onclick="window.updateItemQuantity('${item.productId}', 1)"
              class="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-slate-300 hover:text-white bg-white/5 active:scale-95">
              +
            </button>
          </div>
        </div>
      `).join('');
    }
  }

  // --- Modal Open/Close Controls ---
  window.openCartSheet = function () {
    cartModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  window.closeCartSheet = function () {
    cartModal.classList.add('hidden');
    document.body.style.overflow = '';
  };

  window.closeSuccessModal = function () {
    successModal.classList.add('hidden');
    document.body.style.overflow = '';
  };

  // Close modals on clicking overlay backdrop
  cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) {
      window.closeCartSheet();
    }
  });

  successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
      window.closeSuccessModal();
    }
  });

  // --- Order Submission ---
  window.submitCustomerOrder = async function () {
    if (cart.length === 0) {
      showToast('Your shopping bag is empty! Add jewelry pieces first.', 'warning');
      return;
    }

    if (!isVerified) {
      showToast('Messenger link required. Open from Facebook chat to order.', 'error');
      return;
    }

    const nameInput = document.getElementById('cust-name');
    const phoneInput = document.getElementById('cust-phone');
    const addressInput = document.getElementById('cust-address');
    const noteInput = document.getElementById('cust-note');

    const customerName = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const address = addressInput.value.trim();
    const note = noteInput.value.trim();

    if (!customerName || !phone || !address) {
      showToast('Please fill in your Name, Phone, and Delivery Address.', 'warning');
      if (!customerName) nameInput.focus();
      else if (!phone) phoneInput.focus();
      else addressInput.focus();
      return;
    }

    // Set Loading State
    submitOrderBtn.disabled = true;
    submitOrderSpinner.classList.remove('hidden');
    submitOrderText.textContent = 'Submitting Order…';

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          psid,
          sig,
          items: cart.map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
          })),
          customer_name: customerName,
          phone,
          address,
          note,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to place order.');
      }

      // Successful Order!
      const totalUSD = data.total;
      successOrderId.textContent = data.orderId;
      successOrderTotal.textContent = `${formatUSD(totalUSD)} / ${formatKHR(totalUSD)}`;

      // Reset cart
      cart = [];
      saveCartToStorage();
      updateCartUI();

      // Close cart sheet and open success modal
      window.closeCartSheet();
      successModal.classList.remove('hidden');

      // Refresh catalog stock
      loadCatalog();
    } catch (err) {
      showToast(err.message || 'Error submitting order.', 'error');
    } finally {
      submitOrderBtn.disabled = !isVerified;
      submitOrderSpinner.classList.add('hidden');
      submitOrderText.textContent = 'Confirm Order ✨';
    }
  };

  // Helper function to escape HTML
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Initial Boot ---
  verifyIdentity();
  loadCatalog();
  loadCartFromStorage();
})();
