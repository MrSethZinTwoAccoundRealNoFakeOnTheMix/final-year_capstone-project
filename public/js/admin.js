/**
 * Luxe Jewelry - Admin Dashboard Logic (Mobile-First + Bilingual EN/KM)
 * Container SPU/SKU Variant Model, Dynamic Categories & Quick Sell POS
 */

(function () {
  'use strict';

  const EXCHANGE_RATE_KHR = 4100;
  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&q=80';

  // Language & Translations
  let currentLang = localStorage.getItem('luxe_lang') || 'en';

  const translations = {
    en: {
      langLabel: 'KM',
      langFlag: '🇰🇭',
      portalTitle: 'Shop Owner Portal',
      live: 'Live',
      storefront: 'Storefront ↗',
      signOut: 'Sign Out',
      tabOrders: '📦 Orders',
      tabInventory: '💎 Inventory',
      tabQuickSell: '🛒 Quick Sell',
      tabOverview: '📊 Overview',
      filterActionNeeded: 'Action Needed',
      filterShipped: 'In Transit',
      filterArchive: 'Archive',
      filterAll: 'All Orders',
      noOrdersFound: 'No orders found',
      noOrdersSub: 'There are currently no orders in this status category.',
      confirmAndPack: '✓ Confirm & Pack',
      cancelOrder: '✕ Cancel',
      markShipped: '🚚 Mark Shipped',
      cancelRefund: '✕ Cancel (Refund)',
      markDelivered: 'Mark as Delivered',
      markReturnedSecondary: 'Return & Restock',
      markReturned: '📦 Mark as Returned',
      completedState: 'Delivered & Settled',
      archivedState: 'Archived · No further actions needed',
      orderTotal: 'Order Total:',
      addJewelry: '+ Add Jewelry',
      catalogTitle: 'Product Catalog',
      catalogSub: 'Manage pricing, margin, and stock levels',
      inStock: '{n} in stock',
      edit: 'Edit',
      del: 'Del',
      totalSales: 'Total Sales',
      confirmedShipped: 'Confirmed + Shipped',
      pendingActions: 'Pending Actions',
      awaitingReview: 'Awaiting KHQR review',
      allOrders: 'All Orders',
      lifetimeSubmissions: 'Lifetime submissions',
      activeSkus: 'Active SKUs',
      lowStock: '{n} low stock',
      welcomeAdmin: 'Welcome back, Shop Owner!',
      signedOut: 'You have been signed out.',
      sessionExpired: 'Session expired. Please sign in again.',
    },
    km: {
      langLabel: 'EN',
      langFlag: '🇬🇧',
      portalTitle: 'ផ្ទាំងគ្រប់គ្រងម្ចាស់ហាង',
      live: 'ផ្សាយផ្ទាល់',
      storefront: 'ទំព័រហាង ↗',
      signOut: 'ចាកចេញ',
      tabOrders: '📦 ការបញ្ជាទិញ',
      tabInventory: '💎 ស្តុកទំនិញ',
      tabQuickSell: '🛒 លក់រហ័ស',
      tabOverview: '📊 ទិដ្ឋភាពទូទៅ',
      filterActionNeeded: 'ការងារត្រូវចាត់ចែង',
      filterShipped: 'កំពុងដឹកជញ្ជូន',
      filterArchive: 'បណ្ណសារ',
      filterAll: 'ការកុម្ម៉ង់ទាំងអស់',
      noOrdersFound: 'មិនមានការបញ្ជាទិញទេ',
      noOrdersSub: 'បច្ចុប្បន្នមិនទាន់មានការបញ្ជាទិញក្នុងផ្នែកនេះនៅឡើយទេ។',
      confirmAndPack: '✓ បញ្ជាក់ & វេចខ្ចប់',
      cancelOrder: '✕ បោះបង់',
      markShipped: '🚚 ដឹកជញ្ជូន',
      cancelRefund: '✕ បោះបង់ (សងប្រាក់)',
      markDelivered: 'បានប្រគល់ទំនិញជោគជ័យ',
      markReturnedSecondary: 'ប្រគល់ឥវ៉ាន់មកវិញ',
      markReturned: '📦 បញ្ជូនចូលស្តុកវិញ',
      completedState: 'បានដឹកជញ្ជូនរួចរាល់',
      archivedState: 'បានបញ្ចប់ · មិនមានសកម្មភាពបន្ត',
      orderTotal: 'សរុបការបញ្ជាទិញ:',
      addJewelry: '+ បន្ថែមគ្រឿងអលង្ការ',
      catalogTitle: 'បញ្ជីគ្រឿងអលង្ការ',
      catalogSub: 'គ្រប់គ្រងតម្លៃ ផលចំណេញ និងចំនួនស្តុក',
      inStock: 'សល់ {n} ក្នុងស្តុក',
      edit: 'កែប្រែ',
      del: 'លុប',
      totalSales: 'ចំណូលសរុប',
      confirmedShipped: 'បានបញ្ជាក់ + បានដឹកជញ្ជូន',
      pendingActions: 'ការងាររង់ចាំពិនិត្យ',
      awaitingReview: 'រង់ចាំពិនិត្យ KHQR',
      allOrders: 'ការកុម្ម៉ង់ទាំងអស់',
      lifetimeSubmissions: 'ការបញ្ជាទិញសរុប',
      activeSkus: 'មុខទំនិញសកម្ម',
      lowStock: 'សល់ស្តុកតិច {n} មុខ',
      welcomeAdmin: 'សូមស្វាគមន៍មកកាន់ផ្ទាំងគ្រប់គ្រង!',
      signedOut: 'លោកអ្នកបានចាកចេញដោយជោគជ័យ។',
      sessionExpired: 'សម័យការផុតកំណត់។ សូមចូលម្តងទៀត។',
    }
  };

  function t(key, vars = {}) {
    const dict = translations[currentLang] || translations.en;
    let text = dict[key] || translations.en[key] || key;
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    return text;
  }

  // State
  let adminToken = localStorage.getItem('admin_token');
  let ordersList = [];
  let productsList = [];
  let categoriesList = [];
  let currentOrderFilter = 'ACTION_NEEDED';
  let activeTab = 'orders';
  let isInitialOrdersLoaded = false;
  let qsCategory = 'All';
  let qsSearchQuery = '';
  let invCategory = 'All';
  let invSearchQuery = '';
  const expandedStylesSet = new Set();
  const qsBasket = new Map(); // Key: itemKey -> { key, productId, variantId, product, variant, name, category, unitPrice, photoUrl, maxStock, qty }
  let sessionDeductions = [];
  let currentConfirmAction = null;

  // DOM Elements
  const adminLangFlag = document.getElementById('admin-lang-flag');
  const adminLangLabel = document.getElementById('admin-lang-label');
  const labelLive = document.getElementById('label-live');
  const linkStorefront = document.getElementById('link-storefront');
  const btnSignout = document.getElementById('btn-signout');

  const tabButtons = document.querySelectorAll('.nav-tab');
  const tabContentOrders = document.getElementById('tab-content-orders');
  const tabContentInventory = document.getElementById('tab-content-inventory');
  const tabContentQuicksell = document.getElementById('tab-content-quicksell');
  const tabContentOverview = document.getElementById('tab-content-overview');
  const tabPendingBadge = document.getElementById('tab-pending-badge');
  const tabStockBadge = document.getElementById('tab-stock-badge');

  const ordersListEl = document.getElementById('orders-list');
  const ordersEmptyEl = document.getElementById('orders-empty');
  const orderFilterPills = document.querySelectorAll('[data-order-filter]');
  const countActionOrdersEl = document.getElementById('count-action-orders');
  const countShippedOrdersEl = document.getElementById('count-shipped-orders');
  const countArchiveOrdersEl = document.getElementById('count-archive-orders');
  const countAllOrdersEl = document.getElementById('count-all-orders');

  // Inventory & Product Modal Elements
  const inventoryListEl = document.getElementById('inventory-list');
  const invTotalCountEl = document.getElementById('inv-total-count');
  const invSearchInput = document.getElementById('inv-search-input');
  const invSearchClear = document.getElementById('inv-search-clear');
  const invCategoryChips = document.getElementById('inv-category-chips');
  const imageLightboxModal = document.getElementById('image-lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxSub = document.getElementById('lightbox-sub');
  const invStagedBar = document.getElementById('inv-staged-bar');
  const invStagedCount = document.getElementById('inv-staged-count');
  const invStagedPreview = document.getElementById('inv-staged-preview');
  const invSaveBtn = document.getElementById('inv-save-btn');
  const invStagedChanges = new Map(); // Key: changeKey -> { key, productId, variantId, productName, styleName, originalStock, newStock, delta }
  const productModal = document.getElementById('product-modal');
  const productForm = document.getElementById('product-form');
  const prodIdInput = document.getElementById('prod-id');
  const prodCategoryInput = document.getElementById('prod-category');
  const btnToggleNewCat = document.getElementById('btn-toggle-new-cat');
  const newCatBox = document.getElementById('new-cat-box');
  const newCatNameInput = document.getElementById('new-cat-name-input');
  const newCatError = document.getElementById('new-cat-error');
  const newCatCancelBtn = document.getElementById('new-cat-cancel-btn');
  const newCatSaveBtn = document.getElementById('new-cat-save-btn');

  const prodNameInput = document.getElementById('prod-name');
  const prodVariantsInput = document.getElementById('prod-variants');
  const prodImportInput = document.getElementById('prod-import');
  const prodSellInput = document.getElementById('prod-sell');
  const prodStockInput = document.getElementById('prod-stock');
  const stockVariantsHint = document.getElementById('stock-variants-hint');
  const marginPreview = document.getElementById('margin-preview');

  // Variant Builder Elements
  const prodHasVariantsCheckbox = document.getElementById('prod-has-variants');
  const variantsSection = document.getElementById('variants-section');
  const variantsRowsContainer = document.getElementById('variants-rows-container');
  const btnAddVariant = document.getElementById('btn-add-variant');

  // Cover Image Elements
  const prodFileInput = document.getElementById('prod-file');
  const prodPhotoUrlInput = document.getElementById('prod-photo-url');
  const prodPhotoPreviewContainer = document.getElementById('prod-photo-preview-container');
  const prodPhotoPreview = document.getElementById('prod-photo-preview');
  const prodPhotoPreviewText = document.getElementById('prod-photo-preview-text');
  const prodPhotoError = document.getElementById('prod-photo-error');

  // Confirm Dialog Elements
  const confirmDialog = document.getElementById('confirm-dialog');
  const confirmDialogMessage = document.getElementById('confirm-dialog-message');
  const confirmDialogSub = document.getElementById('confirm-dialog-sub');
  const confirmDialogNo = document.getElementById('confirm-dialog-no');
  const confirmDialogYes = document.getElementById('confirm-dialog-yes');

  // Quick Sell POS Elements
  const qsSearchInput = document.getElementById('qs-search-input');
  const qsSearchClear = document.getElementById('qs-search-clear');
  const qsCategoryChips = document.getElementById('qs-category-chips');
  const qsDeductionBar = document.getElementById('qs-deduction-bar');
  const qsDeductionCount = document.getElementById('qs-deduction-count');
  const qsGrid = document.getElementById('qs-grid');
  const qsCartBar = document.getElementById('qs-cart-bar');
  const qsCartCount = document.getElementById('qs-cart-count');
  const qsCartTotal = document.getElementById('qs-cart-total');
  const qsCartDrawer = document.getElementById('qs-cart-drawer');
  const qsCartDrawerTitle = document.getElementById('qs-cart-drawer-title');
  const qsCartDrawerBadge = document.getElementById('qs-cart-drawer-badge');
  const qsCartItemList = document.getElementById('qs-cart-item-list');
  const qsCartTotalBadge = document.getElementById('qs-cart-total-badge');
  const qsCartConfirmBtn = document.getElementById('qs-cart-confirm-btn');
  const qsLogDrawer = document.getElementById('qs-log-drawer');
  const qsLogList = document.getElementById('qs-log-list');
  const qsVariantDrawer = document.getElementById('qs-variant-drawer');
  const qsVariantDrawerTitle = document.getElementById('qs-variant-drawer-title');
  const qsVariantDrawerSub = document.getElementById('qs-variant-drawer-sub');
  const qsVariantList = document.getElementById('qs-variant-list');

  // Overview Stats Elements
  const statRevenueUsd = document.getElementById('stat-revenue-usd');
  const statRevenueKhr = document.getElementById('stat-revenue-khr');
  const statPendingCount = document.getElementById('stat-pending-count');
  const statTotalOrders = document.getElementById('stat-total-orders');
  const statTotalSkus = document.getElementById('stat-total-skus');
  const statLowStock = document.getElementById('stat-low-stock');

  // Auth & Notifications
  const loginModal = document.getElementById('login-modal');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const adminPasswordInput = document.getElementById('admin-password-input');
  const toastContainer = document.getElementById('toast-container');

  // Currency Helpers
  function formatUSD(amount) {
    return '$' + Number(amount || 0).toFixed(2);
  }

  function formatKHR(amountUSD) {
    const khr = Math.round(Number(amountUSD || 0) * EXCHANGE_RATE_KHR);
    return '៛' + khr.toLocaleString();
  }

  // Toast Notifications
  function showToast(message, type = 'info', undoCallback = null) {
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
        <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
        <span>${message}</span>
      </div>
      ${undoCallback ? `<button type="button" class="toast-undo-btn ml-3 px-2 py-0.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-[11px] underline">Undo</button>` : ''}
    `;

    if (undoCallback) {
      const undoBtn = toast.querySelector('.toast-undo-btn');
      if (undoBtn) {
        undoBtn.addEventListener('click', () => {
          undoCallback();
          toast.remove();
        });
      }
    }

    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 300);
    }, undoCallback ? 5000 : 2800);
  }

  // Reusable Confirmation Dialog Modal
  function showConfirmDialog(title, subtitle, onConfirm) {
    if (!confirmDialog) {
      if (confirm(title + (subtitle ? '\n' + subtitle : ''))) onConfirm();
      return;
    }
    confirmDialogMessage.textContent = title;
    confirmDialogSub.textContent = subtitle || '';
    currentConfirmAction = onConfirm;
    confirmDialog.classList.remove('hidden');
  }

  if (confirmDialogNo) {
    confirmDialogNo.addEventListener('click', () => {
      confirmDialog.classList.add('hidden');
      currentConfirmAction = null;
    });
  }

  if (confirmDialogYes) {
    confirmDialogYes.addEventListener('click', () => {
      confirmDialog.classList.add('hidden');
      if (currentConfirmAction) {
        currentConfirmAction();
        currentConfirmAction = null;
      }
    });
  }

  // Language Toggle Handler
  window.toggleAdminLanguage = function () {
    currentLang = currentLang === 'en' ? 'km' : 'en';
    localStorage.setItem('luxe_lang', currentLang);
    applyLanguage();
    showToast(currentLang === 'km' ? 'បានប្តូរទៅជា ភាសាខ្មែរ 🇰🇭' : 'Switched to English 🇬🇧', 'info');
  };

  function applyLanguage() {
    if (adminLangFlag) adminLangFlag.textContent = t('langFlag');
    if (adminLangLabel) adminLangLabel.textContent = t('langLabel');
    if (labelLive) labelLive.textContent = t('live');
    if (linkStorefront) linkStorefront.textContent = t('storefront');
    if (btnSignout) btnSignout.textContent = t('signOut');

    // Tab buttons text
    tabButtons.forEach((btn) => {
      const tab = btn.dataset.tab;
      const textSpan = btn.querySelector('span:first-child');
      if (!textSpan) return;
      if (tab === 'orders') textSpan.textContent = t('tabOrders');
      else if (tab === 'inventory') textSpan.textContent = t('tabInventory');
      else if (tab === 'quicksell') textSpan.textContent = t('tabQuickSell');
      else if (tab === 'overview') textSpan.textContent = t('tabOverview');
    });

    // Filter pills text
    orderFilterPills.forEach((pill) => {
      const filter = pill.dataset.orderFilter;
      const label = pill.querySelector('.filter-label');
      if (!label) return;
      if (filter === 'ACTION_NEEDED') label.textContent = `⚡ ${t('filterActionNeeded')}`;
      else if (filter === 'SHIPPED') label.textContent = `🚚 ${t('filterShipped')}`;
      else if (filter === 'ARCHIVE') label.textContent = `✅ ${t('filterArchive')}`;
      else if (filter === 'ALL') label.textContent = `📋 ${t('filterAll')}`;
    });

    renderOrders();
    renderProducts();
    updateOverviewStats();
  }

  // Authenticated Fetch Wrapper
  async function authFetch(url, options = {}) {
    options.headers = options.headers || {};
    if (adminToken) {
      options.headers['x-admin-token'] = adminToken;
    }

    const res = await fetch(url, options);

    if (res.status === 401) {
      localStorage.removeItem('admin_token');
      adminToken = null;
      showLoginModal(t('sessionExpired'));
      throw new Error('Unauthorized');
    }

    if (!res.ok) {
      let errMsg = `Request failed (${res.status})`;
      try {
        const errJson = await res.json();
        if (errJson && errJson.error) errMsg = errJson.error;
      } catch (_) {}
      throw new Error(errMsg);
    }

    return res;
  }

  // Login & Logout
  function showLoginModal(errMsg = '') {
    if (errMsg) {
      loginError.textContent = errMsg;
      loginError.classList.remove('hidden');
    } else {
      loginError.classList.add('hidden');
    }
    loginModal.classList.remove('hidden');
    setTimeout(() => adminPasswordInput.focus(), 100);
  }

  function hideLoginModal() {
    loginModal.classList.add('hidden');
    loginError.classList.add('hidden');
  }

  window.adminLogout = function () {
    localStorage.removeItem('admin_token');
    adminToken = null;
    showLoginModal(t('signedOut'));
  };

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pass = adminPasswordInput.value.trim();
    if (!pass) return;

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        adminToken = data.token;
        localStorage.setItem('admin_token', adminToken);
        hideLoginModal();
        adminPasswordInput.value = '';
        showToast(t('welcomeAdmin'), 'success');
        refreshData();
      } else {
        showLoginModal(data.error || 'Incorrect admin password.');
      }
    } catch (err) {
      showLoginModal('Network error: ' + err.message);
    }
  });

  // Tab Switching
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.dataset.tab;

      tabContentOrders.classList.toggle('hidden', activeTab !== 'orders');
      tabContentInventory.classList.toggle('hidden', activeTab !== 'inventory');
      if (activeTab === 'inventory') {
        renderInvCategories();
        renderProducts();
        updateInvStagedBar();
      } else if (invStagedBar) {
        invStagedBar.classList.add('hidden');
      }
      if (tabContentQuicksell) {
        tabContentQuicksell.classList.toggle('hidden', activeTab !== 'quicksell');
        if (activeTab === 'quicksell') {
          renderQsCategories();
          renderQsGrid();
          updatePosCartBar();
        } else if (qsCartBar) {
          qsCartBar.classList.add('hidden');
        }
      }
      tabContentOverview.classList.toggle('hidden', activeTab !== 'overview');
    });
  });

  // Order Filter Switching
  orderFilterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      orderFilterPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      currentOrderFilter = pill.dataset.orderFilter;
      renderOrders();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // CATEGORIES MANAGEMENT (Dynamic, Zero-prefix)
  // ─────────────────────────────────────────────────────────────
  async function loadCategories(selectedName = '') {
    if (!adminToken) return;
    try {
      const res = await authFetch('/api/admin/categories');
      const data = await res.json();
      categoriesList = Array.isArray(data) ? data : [];
      populateCategoryDropdown(selectedName);
      renderQsCategories();
      renderInvCategories();
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }

  function populateCategoryDropdown(selectedName = '') {
    if (!prodCategoryInput) return;
    prodCategoryInput.innerHTML = categoriesList.map((cat) => {
      const isSel = cat.name === selectedName ? 'selected' : '';
      return `<option value="${escapeHtml(cat.name)}" ${isSel}>${escapeHtml(cat.name)}</option>`;
    }).join('');
  }

  if (btnToggleNewCat) {
    btnToggleNewCat.addEventListener('click', () => {
      newCatBox.classList.toggle('hidden');
      if (!newCatBox.classList.contains('hidden')) {
        newCatNameInput.value = '';
        newCatError.classList.add('hidden');
        newCatNameInput.focus();
      }
    });
  }

  if (newCatCancelBtn) {
    newCatCancelBtn.addEventListener('click', () => {
      newCatBox.classList.add('hidden');
      newCatError.classList.add('hidden');
      newCatNameInput.value = '';
    });
  }

  if (newCatSaveBtn) {
    newCatSaveBtn.addEventListener('click', async () => {
      const name = newCatNameInput.value.trim();
      if (!name) {
        newCatError.textContent = 'Please enter a category name.';
        newCatError.classList.remove('hidden');
        return;
      }

      newCatSaveBtn.disabled = true;
      newCatSaveBtn.textContent = 'Saving…';
      newCatError.classList.add('hidden');

      try {
        const res = await authFetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          newCatBox.classList.add('hidden');
          newCatNameInput.value = '';
          await loadCategories(name);
          showToast(`Category "${name}" added!`, 'success');
        } else {
          newCatError.textContent = data.error || 'Failed to add category.';
          newCatError.classList.remove('hidden');
        }
      } catch (err) {
        newCatError.textContent = err.message || 'Error creating category.';
        newCatError.classList.remove('hidden');
      } finally {
        newCatSaveBtn.disabled = false;
        newCatSaveBtn.textContent = 'Save';
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // VARIANT BUILDER (Style Variations inside SPU container)
  // ─────────────────────────────────────────────────────────────
  function recalculateVariantStock() {
    if (!prodHasVariantsCheckbox.checked) return;
    const stockInputs = variantsRowsContainer.querySelectorAll('.variant-stock-input');
    let total = 0;
    stockInputs.forEach((input) => {
      total += parseInt(input.value, 10) || 0;
    });
    prodStockInput.value = total;
  }

  function addVariantRow(data = {}) {
    const parentCost = prodImportInput.value || '';
    const parentSell = prodSellInput.value || '';

    const rowId = 'var-row-' + Math.random().toString(36).substring(2, 9);
    const rowEl = document.createElement('div');
    rowEl.className = 'variant-item-row bg-white/5 border border-white/10 rounded-2xl p-2.5 space-y-2';
    rowEl.id = rowId;

    const rowCost = data.import_price != null ? data.import_price : parentCost;
    const rowSell = data.sell_price != null ? data.sell_price : parentSell;
    const rowStock = data.stock != null ? data.stock : 1; // Default stock: 1
    const rowPhoto = data.photo_url || '';

    // Smart auto-incremented style name (Style 1, Style 2, Style 3...)
    let rowColor = data.color_name || data.style_name || '';
    if (!rowColor) {
      const existingInputs = variantsRowsContainer.querySelectorAll('.variant-color-input');
      let maxNum = 0;
      existingInputs.forEach((inp) => {
        const match = inp.value.trim().match(/^Style\s+(\d+)$/i);
        if (match) {
          const n = parseInt(match[1], 10);
          if (n > maxNum) maxNum = n;
        }
      });
      const nextNum = Math.max(existingInputs.length + 1, maxNum + 1);
      rowColor = `Style ${nextNum}`;
    }

    rowEl.innerHTML = `
      <div class="flex items-center space-x-2">
        <!-- Variant Mini Photo -->
        <div class="relative w-11 h-11 rounded-xl bg-black/40 border border-white/15 flex-shrink-0 flex items-center justify-center overflow-hidden cursor-pointer group">
          <img src="${rowPhoto || DEFAULT_IMAGE}" class="variant-img-preview w-full h-full object-cover ${rowPhoto ? '' : 'opacity-40'}">
          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-[10px] text-white font-bold">
            📷
          </div>
          <input type="file" accept="image/*" class="variant-file-input absolute inset-0 opacity-0 cursor-pointer" title="Upload style photo">
        </div>
        <input type="hidden" class="variant-photo-url-input" value="${escapeHtml(rowPhoto)}">
        <input type="hidden" class="variant-id-input" value="${data.id || ''}">

        <!-- Style Name Input -->
        <div class="flex-1 min-w-0">
          <input type="text" required placeholder="Style name (e.g. Style 1, Small Gem)" value="${escapeHtml(rowColor)}"
            class="variant-color-input w-full bg-[#0e101a] border border-white/15 focus:border-[#c9a84c] rounded-xl px-2.5 py-1.5 text-xs text-white outline-none">
        </div>

        <!-- Remove Row Button -->
        <button type="button" class="btn-remove-variant w-7 h-7 rounded-xl bg-white/10 hover:bg-rose-950/80 hover:text-rose-300 text-slate-400 flex items-center justify-center text-xs font-bold transition">
          ✕
        </button>
      </div>

      <!-- Price & Stock Row (Auto-filled from parent) -->
      <div class="grid grid-cols-3 gap-2 pt-1 border-t border-white/5">
        <div>
          <label class="block text-[9px] font-semibold text-slate-400">Cost ($)</label>
          <input type="number" step="0.01" required value="${rowCost}"
            class="variant-cost-input w-full bg-[#0e101a] border border-white/15 focus:border-[#c9a84c] rounded-lg px-2 py-1 text-xs text-white outline-none">
        </div>
        <div>
          <label class="block text-[9px] font-semibold text-slate-400">Sell ($)</label>
          <input type="number" step="0.01" required value="${rowSell}"
            class="variant-sell-input w-full bg-[#0e101a] border border-white/15 focus:border-[#c9a84c] rounded-lg px-2 py-1 text-xs text-white outline-none">
        </div>
        <div>
          <label class="block text-[9px] font-semibold text-slate-400">Stock (Qty)</label>
          <input type="number" min="0" required value="${rowStock}"
            class="variant-stock-input w-full bg-[#0e101a] border border-white/15 focus:border-[#c9a84c] rounded-lg px-2 py-1 text-xs text-white outline-none">
        </div>
      </div>
    `;

    // Hook events for this row
    const removeBtn = rowEl.querySelector('.btn-remove-variant');
    removeBtn.addEventListener('click', () => {
      rowEl.remove();
      recalculateVariantStock();
    });

    const stockInput = rowEl.querySelector('.variant-stock-input');
    stockInput.addEventListener('input', recalculateVariantStock);

    const fileInput = rowEl.querySelector('.variant-file-input');
    const imgPreview = rowEl.querySelector('.variant-img-preview');
    const photoUrlInput = rowEl.querySelector('.variant-photo-url-input');

    fileInput.addEventListener('change', async () => {
      if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        // Instant visual preview
        imgPreview.src = URL.createObjectURL(file);
        imgPreview.classList.remove('opacity-40');

        // Immediate background upload
        const fd = new FormData();
        fd.append('image', file);
        try {
          const res = await authFetch('/api/admin/upload-image', {
            method: 'POST',
            body: fd,
          });
          const imgData = await res.json();
          if (res.ok && imgData.photo_url) {
            photoUrlInput.value = imgData.photo_url;
            imgPreview.src = imgData.photo_url;
            // If parent cover photo is missing, set it to this variant photo
            if (!prodPhotoUrlInput.value && (!prodFileInput.files || !prodFileInput.files[0])) {
              setParentPhotoPreview(imgData.photo_url);
            }
          }
        } catch (err) {
          showToast('Failed to upload variant image: ' + err.message, 'error');
        }
      }
    });

    variantsRowsContainer.appendChild(rowEl);
    recalculateVariantStock();
  }

  function setParentPhotoPreview(url) {
    prodPhotoUrlInput.value = url;
    if (prodPhotoPreview && prodPhotoPreviewContainer) {
      prodPhotoPreview.src = url;
      if (prodPhotoPreviewText) prodPhotoPreviewText.textContent = 'Auto-assigned from first style';
      prodPhotoPreviewContainer.classList.remove('hidden');
      prodPhotoPreviewContainer.classList.add('flex');
    }
    if (prodPhotoError) prodPhotoError.classList.add('hidden');
  }

  if (prodHasVariantsCheckbox) {
    prodHasVariantsCheckbox.addEventListener('change', () => {
      const isChecked = prodHasVariantsCheckbox.checked;
      if (isChecked) {
        variantsSection.classList.remove('hidden');
        prodStockInput.readOnly = true;
        prodStockInput.classList.add('opacity-60', 'bg-white/5');
        stockVariantsHint.classList.remove('hidden');

        if (variantsRowsContainer.children.length === 0) {
          const currentPhoto = prodPhotoUrlInput.value.trim();
          const currentStock = parseInt(prodStockInput.value, 10) || 1;
          const currentCost = prodImportInput.value || '';
          const currentSell = prodSellInput.value || '';

          if (currentPhoto) {
            // Migrating an existing single product with a photo to styles:
            // 1. Preserve existing product as Style 1 with its photo, stock, and pricing
            addVariantRow({
              color_name: 'Style 1',
              photo_url: currentPhoto,
              stock: currentStock,
              import_price: currentCost,
              sell_price: currentSell,
            });
            // 2. Automatically prepare Style 2 ready for the second piece/photo
            addVariantRow({
              color_name: 'Style 2',
              photo_url: '',
              stock: 1,
              import_price: currentCost,
              sell_price: currentSell,
            });
          } else {
            // New product being configured with styles from scratch
            addVariantRow({
              color_name: 'Style 1',
              photo_url: '',
              stock: 1,
              import_price: currentCost,
              sell_price: currentSell,
            });
          }
        }
        recalculateVariantStock();
      } else {
        variantsSection.classList.add('hidden');
        prodStockInput.readOnly = false;
        prodStockInput.classList.remove('opacity-60', 'bg-white/5');
        stockVariantsHint.classList.add('hidden');
      }
    });
  }

  if (btnAddVariant) {
    btnAddVariant.addEventListener('click', () => {
      addVariantRow();
    });
  }

  // ─────────────────────────────────────────────────────────────
  // LIVE MARGIN PREVIEW
  // ─────────────────────────────────────────────────────────────
  function updateMarginPreview() {
    const cost = parseFloat(prodImportInput.value) || 0;
    const sell = parseFloat(prodSellInput.value) || 0;

    if (sell > 0) {
      const margin = (((sell - cost) / sell) * 100).toFixed(1);
      marginPreview.textContent = `${margin}% profit`;
      marginPreview.className = margin >= 0 ? 'font-bold text-emerald-400' : 'font-bold text-rose-400';
    } else {
      marginPreview.textContent = '--%';
      marginPreview.className = 'font-bold text-slate-400';
    }
  }

  prodImportInput.addEventListener('input', updateMarginPreview);
  prodSellInput.addEventListener('input', updateMarginPreview);

  // ─────────────────────────────────────────────────────────────
  // OPEN & CLOSE PRODUCT MODAL
  // ─────────────────────────────────────────────────────────────
  window.openProductModal = function () {
    productForm.reset();
    prodIdInput.value = '';
    prodStockInput.value = '1'; // Default stock: 1
    prodStockInput.readOnly = false;
    prodStockInput.classList.remove('opacity-60', 'bg-white/5');
    marginPreview.textContent = '--%';
    marginPreview.className = 'font-bold text-slate-400';

    if (prodHasVariantsCheckbox) prodHasVariantsCheckbox.checked = false;
    if (variantsSection) variantsSection.classList.add('hidden');
    if (variantsRowsContainer) variantsRowsContainer.innerHTML = '';
    if (stockVariantsHint) stockVariantsHint.classList.add('hidden');
    if (newCatBox) newCatBox.classList.add('hidden');
    if (prodPhotoError) prodPhotoError.classList.add('hidden');

    if (prodPhotoPreviewContainer) {
      prodPhotoPreviewContainer.classList.add('hidden');
      prodPhotoPreviewContainer.classList.remove('flex');
    }

    loadCategories();
    productModal.classList.remove('hidden');
  };

  window.closeProductModal = function () {
    productModal.classList.add('hidden');
  };

  window.editProduct = async function (sku) {
    const product = productsList.find((p) => p.id === sku);
    if (!product) return;

    prodIdInput.value = product.id;
    await loadCategories(product.category);
    prodCategoryInput.value = product.category;
    prodNameInput.value = product.name;
    prodVariantsInput.value = product.variants || '';
    prodImportInput.value = product.import_price;
    prodSellInput.value = product.sell_price;
    prodStockInput.value = product.stock;
    prodPhotoUrlInput.value = product.photo_url || '';
    prodFileInput.value = '';

    if (prodPhotoError) prodPhotoError.classList.add('hidden');
    if (newCatBox) newCatBox.classList.add('hidden');

    if (product.photo_url && prodPhotoPreview && prodPhotoPreviewContainer) {
      prodPhotoPreview.src = product.photo_url;
      if (prodPhotoPreviewText) prodPhotoPreviewText.textContent = product.photo_url;
      prodPhotoPreviewContainer.classList.remove('hidden');
      prodPhotoPreviewContainer.classList.add('flex');
    } else if (prodPhotoPreviewContainer) {
      prodPhotoPreviewContainer.classList.add('hidden');
      prodPhotoPreviewContainer.classList.remove('flex');
    }

    // Populate Variants if product has variants
    const hasVariants = product.has_variants === 1 || product.has_variants === true || (product.variant_list && product.variant_list.length > 0);
    if (hasVariants && prodHasVariantsCheckbox) {
      prodHasVariantsCheckbox.checked = true;
      variantsSection.classList.remove('hidden');
      prodStockInput.readOnly = true;
      prodStockInput.classList.add('opacity-60', 'bg-white/5');
      stockVariantsHint.classList.remove('hidden');
      variantsRowsContainer.innerHTML = '';

      if (Array.isArray(product.variant_list) && product.variant_list.length > 0) {
        product.variant_list.forEach((v) => addVariantRow(v));
      } else {
        addVariantRow();
      }
      recalculateVariantStock();
    } else if (prodHasVariantsCheckbox) {
      prodHasVariantsCheckbox.checked = false;
      variantsSection.classList.add('hidden');
      variantsRowsContainer.innerHTML = '';
      prodStockInput.readOnly = false;
      prodStockInput.classList.remove('opacity-60', 'bg-white/5');
      stockVariantsHint.classList.add('hidden');
    }

    updateMarginPreview();
    productModal.classList.remove('hidden');
  };

  if (prodFileInput) {
    prodFileInput.addEventListener('change', () => {
      if (prodFileInput.files && prodFileInput.files[0]) {
        const file = prodFileInput.files[0];
        const previewUrl = URL.createObjectURL(file);
        if (prodPhotoPreview) prodPhotoPreview.src = previewUrl;
        if (prodPhotoPreviewText) prodPhotoPreviewText.textContent = file.name;
        if (prodPhotoPreviewContainer) {
          prodPhotoPreviewContainer.classList.remove('hidden');
          prodPhotoPreviewContainer.classList.add('flex');
        }
        if (prodPhotoError) prodPhotoError.classList.add('hidden');
      }
    });
  }

  window.deleteProduct = function (sku) {
    showConfirmDialog(
      `Remove product ${sku}?`,
      'This will delete the product and its color variants from the catalog.',
      async () => {
        try {
          const res = await authFetch(`/api/admin/products/${sku}`, { method: 'DELETE' });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast(data.message, 'success');
            refreshData();
          } else {
            showToast(data.error || 'Failed to delete product', 'error');
          }
        } catch (err) {
          if (err.message !== 'Unauthorized') showToast(err.message, 'error');
        }
      }
    );
  };

  // ─────────────────────────────────────────────────────────────
  // SUBMIT PRODUCT FORM (Single-screen SPU + SKU Builder)
  // ─────────────────────────────────────────────────────────────
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const saveBtn = document.getElementById('save-product-btn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';

    try {
      const hasVariants = prodHasVariantsCheckbox && prodHasVariantsCheckbox.checked;
      const collectedVariants = [];

      if (hasVariants) {
        const rowEls = variantsRowsContainer.querySelectorAll('.variant-item-row');
        if (rowEls.length === 0) {
          showToast('Please add at least one style variation.', 'warning');
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save Product';
          return;
        }

        let missingColor = false;
        rowEls.forEach((row) => {
          const colorInput = row.querySelector('.variant-color-input');
          const costInput = row.querySelector('.variant-cost-input');
          const sellInput = row.querySelector('.variant-sell-input');
          const stockInput = row.querySelector('.variant-stock-input');
          const photoInput = row.querySelector('.variant-photo-url-input');
          const idInput = row.querySelector('.variant-id-input');

          const colorName = colorInput ? colorInput.value.trim() : '';
          if (!colorName) missingColor = true;

          collectedVariants.push({
            id: idInput && idInput.value ? idInput.value.trim() : undefined,
            color_name: colorName,
            import_price: costInput ? parseFloat(costInput.value) || 0 : 0,
            sell_price: sellInput ? parseFloat(sellInput.value) || 0 : 0,
            stock: stockInput ? parseInt(stockInput.value, 10) || 1 : 1,
            photo_url: photoInput ? photoInput.value.trim() : '',
          });
        });

        if (missingColor) {
          showToast('Please specify a style name for each variation.', 'warning');
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save Product';
          return;
        }
      }

      // Handle Cover Photo Upload if file selected
      let photoUrl = prodPhotoUrlInput.value.trim();
      if (prodFileInput.files && prodFileInput.files[0]) {
        const imgFormData = new FormData();
        imgFormData.append('image', prodFileInput.files[0]);
        const uploadRes = await authFetch('/api/admin/upload-image', {
          method: 'POST',
          body: imgFormData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success && uploadData.photo_url) {
          photoUrl = uploadData.photo_url;
        }
      }

      // If no cover photo provided, default to first variant photo
      if (!photoUrl && hasVariants && collectedVariants.length > 0 && collectedVariants[0].photo_url) {
        photoUrl = collectedVariants[0].photo_url;
      }

      // Validate that at least one photo exists
      if (!photoUrl && !prodIdInput.value) {
        if (prodPhotoError) prodPhotoError.classList.remove('hidden');
        showToast('A product photo is required.', 'error');
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Product';
        return;
      }

      const payload = {
        id: prodIdInput.value || undefined,
        category: prodCategoryInput.value,
        name: prodNameInput.value.trim(),
        variants: prodVariantsInput.value.trim(),
        import_price: parseFloat(prodImportInput.value) || 0,
        sell_price: parseFloat(prodSellInput.value) || 0,
        stock: parseInt(prodStockInput.value, 10) || 1,
        photo_url: photoUrl,
        has_variants: hasVariants,
        color_variants: collectedVariants,
      };

      const res = await authFetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Product ${data.id} saved successfully!`, 'success');
        closeProductModal();
        refreshData();
      } else {
        showToast(data.error || 'Failed to save product.', 'error');
      }
    } catch (err) {
      if (err.message !== 'Unauthorized') showToast(err.message, 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Product';
    }
  });

  // ─────────────────────────────────────────────────────────────
  // INVENTORY TAB RENDERING
  // ─────────────────────────────────────────────────────────────
  async function loadProducts(silent = false) {
    if (!adminToken) return;

    try {
      const res = await authFetch('/api/admin/products');
      const data = await res.json();
      productsList = Array.isArray(data) ? data : [];
      if (tabStockBadge) tabStockBadge.textContent = productsList.length;
      renderProducts();
      if (activeTab === 'quicksell') renderQsGrid();
      updateOverviewStats();
    } catch (err) {
      if (!silent && err.message !== 'Unauthorized') {
        showToast('Failed to load products: ' + err.message, 'error');
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // INVENTORY TAB: VISUAL-FIRST CATALOG, FILTERING & FAST RESTOCK
  // ─────────────────────────────────────────────────────────────

  // Live Inventory Search
  if (invSearchInput) {
    invSearchInput.addEventListener('input', (e) => {
      invSearchQuery = (e.target.value || '').trim().toLowerCase();
      if (invSearchClear) {
        if (invSearchQuery) invSearchClear.classList.remove('hidden');
        else invSearchClear.classList.add('hidden');
      }
      renderProducts();
    });
  }

  window.clearInvSearch = function () {
    if (invSearchInput) invSearchInput.value = '';
    invSearchQuery = '';
    if (invSearchClear) invSearchClear.classList.add('hidden');
    renderProducts();
  };

  // Category Filtering for Inventory
  function renderInvCategories() {
    if (!invCategoryChips) return;
    const cats = ['All', ...categoriesList.map((c) => c.name)];
    invCategoryChips.innerHTML = cats.map((cat) => {
      const isActive = cat === invCategory;
      return `
        <button type="button" onclick="window.setInvCategory('${escapeHtml(cat)}')"
          class="flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold transition ${
            isActive
              ? 'bg-[#c9a84c] text-black shadow-md'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
          }">
          ${escapeHtml(cat)}
        </button>
      `;
    }).join('');
  }

  window.setInvCategory = function (cat) {
    invCategory = cat;
    renderInvCategories();
    renderProducts();
  };

  // Toggle multi-style accordion breakdown
  window.toggleInvStyles = function (productId, event = null) {
    if (event) event.stopPropagation();
    if (expandedStylesSet.has(productId)) {
      expandedStylesSet.delete(productId);
    } else {
      expandedStylesSet.add(productId);
    }
    renderProducts();
  };

  // ─────────────────────────────────────────────────────────────
  // STAGED INVENTORY STOCK ADJUSTMENT (Option A: Review Before Save)
  // ─────────────────────────────────────────────────────────────

  function getInvChangeKey(productId, variantId = null) {
    return variantId ? `${productId}__${variantId}` : productId;
  }

  function updateInvStagedBar() {
    if (!invStagedBar || !invStagedCount) return;
    if (activeTab !== 'inventory' || invStagedChanges.size === 0) {
      invStagedBar.classList.add('hidden');
      return;
    }

    const count = invStagedChanges.size;
    invStagedCount.textContent = count;

    const items = Array.from(invStagedChanges.values());
    if (items.length === 1) {
      const it = items[0];
      const name = it.styleName ? `${it.productName} (${it.styleName})` : it.productName;
      invStagedPreview.textContent = `${name}: ${it.originalStock} → ${it.newStock} (${it.delta > 0 ? '+' : ''}${it.delta})`;
    } else {
      invStagedPreview.textContent = `${count} items modified · Tap Save to commit`;
    }

    invStagedBar.classList.remove('hidden');
  }

  // Stage a stock change (+1 or −1) locally without mutating the database
  window.stageInvStockChange = function (productId, variantId = null, delta = 1, event = null) {
    if (event) event.stopPropagation();

    const product = productsList.find((p) => p.id === productId);
    if (!product) return;

    let variant = null;
    if (variantId && product.variant_list) {
      variant = product.variant_list.find((v) => String(v.id) === String(variantId));
    }

    const key = getInvChangeKey(productId, variantId);
    const originalStock = variant ? Number(variant.stock) : Number(product.stock);

    const existing = invStagedChanges.get(key);
    const currentStagedStock = existing ? existing.newStock : originalStock;
    const targetStock = currentStagedStock + delta;

    if (targetStock < 0) {
      showToast('Stock cannot be negative.', 'warning');
      return;
    }

    if (targetStock === originalStock) {
      // Reverted back to ground truth
      invStagedChanges.delete(key);
    } else {
      invStagedChanges.set(key, {
        key,
        productId,
        variantId: variant ? variant.id : null,
        productName: product.name,
        styleName: variant ? variant.color_name : null,
        originalStock,
        newStock: targetStock,
        delta: targetStock - originalStock,
      });
    }

    updateInvStagedBar();
    renderProducts();
  };

  // Revert a single staged change back to original stock
  window.revertInvChange = function (productId, variantId = null, event = null) {
    if (event) event.stopPropagation();
    const key = getInvChangeKey(productId, variantId);
    invStagedChanges.delete(key);
    updateInvStagedBar();
    renderProducts();
  };

  // Reset all staged changes
  window.resetAllInvChanges = function () {
    invStagedChanges.clear();
    updateInvStagedBar();
    renderProducts();
    showToast('All staged stock changes reset.', 'info');
  };

  // Commit all staged inventory adjustments to the server
  window.commitAllInvChanges = async function () {
    if (invStagedChanges.size === 0) return;

    const changes = Array.from(invStagedChanges.values());
    if (invSaveBtn) {
      invSaveBtn.disabled = true;
      invSaveBtn.innerHTML = `<span>Saving...</span>`;
    }

    let successCount = 0;
    const failedList = [];

    for (const ch of changes) {
      const isRestock = ch.delta > 0;
      const absQty = Math.abs(ch.delta);
      const endpoint = isRestock
        ? `/api/admin/products/${ch.productId}/restock`
        : `/api/admin/products/${ch.productId}/deduct`;

      try {
        const res = await authFetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            variant_id: ch.variantId || undefined,
            qty: absQty,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          successCount++;
        } else {
          failedList.push(ch.productName);
        }
      } catch (err) {
        failedList.push(ch.productName);
      }
    }

    invStagedChanges.clear();
    updateInvStagedBar();
    if (invSaveBtn) {
      invSaveBtn.disabled = false;
      invSaveBtn.innerHTML = `<span>Save Changes ✓</span>`;
    }

    await loadProducts(true);

    if (failedList.length === 0) {
      showToast(`✨ Saved ${successCount} stock adjustment(s) successfully!`, 'success');
    } else {
      showToast(`Saved ${successCount} adjustments. Failed: ${failedList.join(', ')}`, 'warning');
    }
  };

  // Image Lightbox Zoom Modal
  window.openImageLightbox = function (imgUrl, title = '', sub = '') {
    if (!imageLightboxModal || !imgUrl) return;
    if (lightboxImg) lightboxImg.src = imgUrl;
    if (lightboxTitle) lightboxTitle.textContent = title;
    if (lightboxSub) lightboxSub.textContent = sub;
    imageLightboxModal.classList.remove('hidden');
  };

  window.closeImageLightbox = function () {
    if (imageLightboxModal) imageLightboxModal.classList.add('hidden');
  };

  function renderProducts() {
    if (!inventoryListEl) return;

    const filtered = productsList.filter((p) => {
      const matchesCat = invCategory === 'All' || p.category === invCategory;
      if (!matchesCat) return false;

      if (!invSearchQuery) return true;
      const q = invSearchQuery;
      const nameMatch = (p.name || '').toLowerCase().includes(q);
      const skuMatch = (p.id || '').toLowerCase().includes(q);
      const catMatch = (p.category || '').toLowerCase().includes(q);
      return nameMatch || skuMatch || catMatch;
    });

    if (invTotalCountEl) {
      invTotalCountEl.textContent = `${filtered.length} piece${filtered.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
      inventoryListEl.innerHTML = `
        <div class="text-center py-12 text-slate-400">
          <p class="text-3xl mb-2">💎</p>
          <p class="text-xs font-semibold">No jewelry found matching your filter.</p>
        </div>
      `;
      return;
    }

    inventoryListEl.innerHTML = filtered.map((product) => {
      const margin = product.margin_percent != null ? `${product.margin_percent}%` : '0%';
      const hasVars = product.has_variants === 1 || product.has_variants === true || (product.variant_list && product.variant_list.length > 0);
      const varCount = product.variant_list ? product.variant_list.length : 0;
      const isExpanded = expandedStylesSet.has(product.id);

      // Check if standalone product is staged
      const staged = invStagedChanges.get(getInvChangeKey(product.id));
      const displayStock = staged ? staged.newStock : product.stock;

      // Check if any variant is staged for parent calculation
      let parentDisplayStock = product.stock;
      let hasAnyStyleStaged = false;
      if (hasVars && product.variant_list) {
        parentDisplayStock = product.variant_list.reduce((sum, v) => {
          const st = invStagedChanges.get(getInvChangeKey(product.id, v.id));
          if (st) hasAnyStyleStaged = true;
          return sum + (st ? st.newStock : Number(v.stock));
        }, 0);
      }

      return `
        <div class="admin-card p-3 flex flex-col space-y-3 border ${
          staged || hasAnyStyleStaged ? 'border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/30' : 'border-white/10'
        } transition hover:border-white/20">
          <!-- Top Row: Large Image + Details & Actions -->
          <div class="flex items-start space-x-3.5 min-w-0">
            <!-- Large Image with Tap-To-Zoom -->
            <div class="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-900 border border-white/10 flex-shrink-0 cursor-pointer group"
              onclick="window.openImageLightbox('${product.photo_url || DEFAULT_IMAGE}', '${escapeHtml(product.name)}', '${product.id} · ${escapeHtml(product.category)}')">
              <img src="${product.photo_url || DEFAULT_IMAGE}" alt="" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition duration-200">
              <span class="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/75 text-[9px] text-slate-300 font-bold flex items-center space-x-0.5 pointer-events-none">
                <span>🔍</span>
              </span>
            </div>

            <!-- Details & Financials -->
            <div class="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
              <div>
                <div class="flex items-center space-x-1.5 flex-wrap">
                  <span class="font-mono text-[10px] font-bold text-[#c9a84c]">${product.id}</span>
                  <span class="text-[10px] text-slate-400 uppercase font-semibold">· ${escapeHtml(product.category)}</span>
                </div>
                <h4 class="text-xs font-bold text-white leading-tight mt-1 truncate" title="${escapeHtml(product.name)}">
                  ${escapeHtml(product.name)}
                </h4>
              </div>

              <!-- Price & Cost (clean, no alert badges) -->
              <div class="text-[11px] text-slate-300 mt-1">
                Sell: <strong class="text-white">${formatUSD(product.sell_price)}</strong>
                <span class="text-slate-500 mx-1">·</span>
                Cost: <span class="text-slate-400">${formatUSD(product.import_price)}</span>
                <span class="text-emerald-400 font-semibold text-[10px] ml-1">(+${margin})</span>
              </div>

              <!-- Actions row: Edit & Delete -->
              <div class="flex items-center space-x-1.5 mt-2">
                <button onclick="window.editProduct('${product.id}')"
                  class="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] text-slate-200 font-bold flex items-center space-x-1 transition active:scale-95">
                  <span>✏️ Edit</span>
                </button>
                <button onclick="window.deleteProduct('${product.id}')"
                  class="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-[11px] text-rose-300 font-bold flex items-center space-x-1 transition active:scale-95">
                  <span>🗑️ Delete</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Bottom Row: Stock Levels & Quick Stepper / Style Accordion -->
          ${hasVars ? `
            <div class="pt-2 border-t border-white/5 flex flex-col space-y-2">
              <div class="flex items-center justify-between text-xs">
                <div class="flex items-center space-x-1.5">
                  ${hasAnyStyleStaged ? `
                    <span class="text-amber-300 font-black text-xs bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/40">
                      Total: ${product.stock} → ${parentDisplayStock}
                    </span>
                  ` : `
                    <span class="text-slate-300 font-medium">
                      Total Stock: <strong class="text-white font-bold ml-1">${product.stock} units</strong>
                    </span>
                  `}
                </div>
                <button type="button" onclick="window.toggleInvStyles('${product.id}', event)"
                  class="px-2.5 py-1 rounded-lg ${
                    hasAnyStyleStaged
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : isExpanded
                      ? 'bg-[#c9a84c]/20 text-[#f3d489] border-[#c9a84c]/40'
                      : 'bg-white/10 text-slate-200 border-white/10'
                  } border text-[11px] font-bold flex items-center space-x-1 transition active:scale-95">
                  <span>✨ ${varCount} Styles</span>
                  <span class="text-[10px]">${isExpanded ? '▲ Hide' : '▼ View'}</span>
                </button>
              </div>

              <!-- Accordion Content -->
              ${isExpanded ? `
                <div class="mt-1 bg-black/40 border border-white/10 rounded-xl p-2.5 space-y-2.5">
                  ${(product.variant_list || []).map((v) => {
                    const vStaged = invStagedChanges.get(getInvChangeKey(product.id, v.id));
                    const vDisplayStock = vStaged ? vStaged.newStock : v.stock;

                    return `
                      <div class="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-b-0">
                        <div class="flex items-center space-x-2.5 min-w-0 flex-1">
                          <img src="${v.photo_url || product.photo_url || DEFAULT_IMAGE}"
                            onclick="window.openImageLightbox('${v.photo_url || product.photo_url || DEFAULT_IMAGE}', '${escapeHtml(product.name)} (${escapeHtml(v.color_name)})', '${formatUSD(v.sell_price)} · ${v.stock} in stock')"
                            class="w-12 h-12 rounded-xl object-cover bg-slate-900 border border-white/10 flex-shrink-0 cursor-pointer hover:scale-105 transition"
                            title="Tap to zoom">
                          <div class="min-w-0 pr-2">
                            <p class="font-bold text-white text-xs truncate leading-tight">${escapeHtml(v.color_name)}</p>
                            <div class="flex items-center space-x-1 mt-0.5">
                              <span class="text-[11px] text-[#c9a84c] font-extrabold">${formatUSD(v.sell_price)}</span>
                              ${vStaged ? `
                                <span class="text-amber-300 font-black text-[10px] bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-500/30">
                                  ${vStaged.originalStock} → ${vStaged.newStock} (${vStaged.delta > 0 ? '+' : ''}${vStaged.delta})
                                </span>
                                <button type="button" onclick="window.revertInvChange('${product.id}', '${v.id}', event)" class="text-slate-400 hover:text-rose-300 text-[10px] font-bold" title="Revert">✕</button>
                              ` : ''}
                            </div>
                          </div>
                        </div>

                        <!-- Stepper for Style (stages changes) -->
                        <div class="flex items-center space-x-1 bg-black/50 border ${vStaged ? 'border-amber-500/50 ring-1 ring-amber-500/40' : 'border-white/10'} rounded-xl p-0.5 flex-shrink-0">
                          <button type="button" onclick="window.stageInvStockChange('${product.id}', '${v.id}', -1, event)"
                            class="w-7 h-7 rounded-lg bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center text-sm font-black active:scale-90 transition"
                            title="Decrease count">
                            −
                          </button>
                          <span class="min-w-[24px] text-center font-extrabold ${vStaged ? 'text-amber-300' : 'text-[#f3d489]'} text-xs select-none">
                            ${vDisplayStock}
                          </span>
                          <button type="button" onclick="window.stageInvStockChange('${product.id}', '${v.id}', 1, event)"
                            class="w-7 h-7 rounded-lg bg-[#c9a84c] hover:bg-[#d8b556] text-black flex items-center justify-center text-sm font-black active:scale-90 transition shadow-sm"
                            title="Increase count">
                            +
                          </button>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              ` : ''}
            </div>
          ` : `
            <div class="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
              <div class="flex items-center space-x-1.5">
                ${staged ? `
                  <span class="text-amber-300 font-black text-xs bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/40">
                    ${staged.originalStock} → ${staged.newStock} (${staged.delta > 0 ? '+' : ''}${staged.delta})
                  </span>
                  <button type="button" onclick="window.revertInvChange('${product.id}', null, event)"
                    class="w-5 h-5 rounded-md bg-white/10 hover:bg-rose-900/60 hover:text-rose-200 text-slate-400 text-[10px] font-bold flex items-center justify-center transition"
                    title="Revert to ${staged.originalStock}">
                    ✕
                  </button>
                ` : `
                  <span class="text-slate-300 font-medium">
                    In Stock: <strong class="text-white font-bold ml-1">${product.stock} units</strong>
                  </span>
                `}
              </div>

              <!-- Stepper for Standalone Product (stages changes) -->
              <div class="flex items-center space-x-1 bg-black/40 border ${staged ? 'border-amber-500/50 ring-1 ring-amber-500/40' : 'border-white/10'} rounded-xl p-0.5">
                <button type="button" onclick="window.stageInvStockChange('${product.id}', null, -1, event)"
                  class="w-7 h-7 rounded-lg bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center text-sm font-black active:scale-90 transition"
                  title="Decrease count">
                  −
                </button>
                <span class="min-w-[28px] text-center font-extrabold ${staged ? 'text-amber-300' : 'text-[#f3d489]'} text-xs select-none">
                  ${displayStock}
                </span>
                <button type="button" onclick="window.stageInvStockChange('${product.id}', null, 1, event)"
                  class="w-7 h-7 rounded-lg bg-[#c9a84c] hover:bg-[#d8b556] text-black flex items-center justify-center text-sm font-black active:scale-90 transition shadow-sm"
                  title="Increase count">
                  +
                </button>
              </div>
            </div>
          `}
        </div>
      `;
    }).join('');
  }

  // ─────────────────────────────────────────────────────────────
  // QUICK SELL POS & MULTI-SELECT BASKET DEDUCTION
  // ─────────────────────────────────────────────────────────────

  // Search input live filtering
  if (qsSearchInput) {
    qsSearchInput.addEventListener('input', (e) => {
      qsSearchQuery = (e.target.value || '').trim().toLowerCase();
      if (qsSearchClear) {
        if (qsSearchQuery) qsSearchClear.classList.remove('hidden');
        else qsSearchClear.classList.add('hidden');
      }
      renderQsGrid();
    });
  }

  window.clearQsSearch = function () {
    if (qsSearchInput) qsSearchInput.value = '';
    qsSearchQuery = '';
    if (qsSearchClear) qsSearchClear.classList.add('hidden');
    renderQsGrid();
  };

  function renderQsCategories() {
    if (!qsCategoryChips) return;
    const cats = ['All', ...categoriesList.map((c) => c.name)];
    qsCategoryChips.innerHTML = cats.map((cat) => {
      const isActive = cat === qsCategory;
      return `
        <button type="button" onclick="window.setQsCategory('${escapeHtml(cat)}')"
          class="flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold transition ${
            isActive
              ? 'bg-[#c9a84c] text-black shadow-md'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
          }">
          ${escapeHtml(cat)}
        </button>
      `;
    }).join('');
  }

  window.setQsCategory = function (cat) {
    qsCategory = cat;
    renderQsCategories();
    renderQsGrid();
  };

  function updateQsDeductionBar() {
    if (!qsDeductionBar || !qsDeductionCount) return;
    const count = sessionDeductions.length;
    qsDeductionCount.textContent = count;
    if (count > 0) {
      qsDeductionBar.classList.remove('hidden');
    } else {
      qsDeductionBar.classList.add('hidden');
    }
  }

  // ─────────────────────────────────────────────────────────────
  // QUICK SELL POS CART (Persistent in LocalStorage)
  // ─────────────────────────────────────────────────────────────
  const POS_CART_STORAGE_KEY = 'luxe_pos_cart';
  const posCart = new Map();

  function loadPosCartFromStorage() {
    try {
      const raw = localStorage.getItem(POS_CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          posCart.clear();
          parsed.forEach(([key, item]) => {
            if (key && item && item.productId) {
              posCart.set(key, item);
            }
          });
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved pos cart:', e);
    }
  }

  function savePosCartToStorage() {
    try {
      if (posCart.size === 0) {
        localStorage.removeItem(POS_CART_STORAGE_KEY);
      } else {
        localStorage.setItem(POS_CART_STORAGE_KEY, JSON.stringify(Array.from(posCart.entries())));
      }
    } catch (e) {
      console.warn('Failed to save pos cart:', e);
    }
  }

  // Load existing cart from LocalStorage on initial load
  loadPosCartFromStorage();

  function getCartItemKey(productId, variantId = null) {
    return variantId ? `${productId}__${variantId}` : productId;
  }

  function updatePosCartBar() {
    if (!qsCartBar || !qsCartCount || !qsCartTotal) return;
    if (activeTab !== 'quicksell') {
      qsCartBar.classList.add('hidden');
      return;
    }

    let totalItems = 0;
    let totalDollars = 0;

    posCart.forEach((item) => {
      totalItems += item.qty;
      totalDollars += item.qty * item.unitPrice;
    });

    if (totalItems > 0) {
      qsCartCount.textContent = totalItems;
      qsCartTotal.textContent = `${formatUSD(totalDollars)} (${formatKHR(totalDollars)})`;
      qsCartBar.classList.remove('hidden');
    } else {
      qsCartBar.classList.add('hidden');
    }
  }

  window.openQsCartDrawer = function () {
    if (posCart.size === 0) {
      showToast('Your cart is empty. Tap products to add them!', 'info');
      return;
    }
    renderCartDrawerList();
    if (qsCartDrawer) qsCartDrawer.classList.remove('hidden');
  };

  window.closeQsCartDrawer = function () {
    if (qsCartDrawer) qsCartDrawer.classList.add('hidden');
  };

  window.clearQsCart = function () {
    posCart.clear();
    savePosCartToStorage();
    window.closeQsCartDrawer();
    updatePosCartBar();
    renderQsGrid();
    if (qsVariantDrawer && !qsVariantDrawer.classList.contains('hidden')) {
      const curProductId = qsVariantDrawer.dataset.productId;
      if (curProductId) {
        const prod = productsList.find((p) => p.id === curProductId);
        if (prod) renderVariantDrawerContent(prod);
      }
    }
    showToast('Cart cleared', 'info');
  };

  function renderCartDrawerList() {
    if (!qsCartItemList) return;

    let totalItems = 0;
    let totalDollars = 0;
    const items = Array.from(posCart.values());

    if (items.length === 0) {
      window.closeQsCartDrawer();
      updatePosCartBar();
      renderQsGrid();
      return;
    }

    qsCartItemList.innerHTML = items.map((item) => {
      totalItems += item.qty;
      totalDollars += item.qty * item.unitPrice;

      return `
        <div class="bg-white/5 border border-white/10 rounded-2xl p-2.5 flex items-center justify-between text-xs transition">
          <div class="flex items-center space-x-2.5 min-w-0 flex-1">
            <img src="${item.photoUrl}" class="w-12 h-12 rounded-xl object-cover bg-black/40 border border-white/10 flex-shrink-0">
            <div class="min-w-0 pr-2">
              <p class="font-bold text-white truncate text-xs leading-tight">${escapeHtml(item.name)}</p>
              <p class="text-[10px] text-slate-400 mt-0.5">${item.category} · ${formatUSD(item.unitPrice)} each</p>
              <p class="text-[11px] font-extrabold text-[#c9a84c] mt-0.5">${formatUSD(item.qty * item.unitPrice)}</p>
            </div>
          </div>

          <!-- Stepper & Remove button -->
          <div class="flex items-center space-x-1.5 flex-shrink-0">
            <div class="flex items-center bg-black/50 border border-white/10 rounded-xl p-0.5 space-x-1">
              <button type="button" onclick="window.modifyPosCartQty('${item.productId}', ${item.variantId ? `'${item.variantId}'` : 'null'}, -1, event)"
                class="w-7 h-7 rounded-lg bg-white/10 hover:bg-rose-950/60 hover:text-rose-300 text-white flex items-center justify-center text-sm font-black active:scale-90 transition">
                −
              </button>
              <span class="min-w-[24px] text-center font-extrabold text-white text-xs select-none">${item.qty}</span>
              <button type="button" onclick="window.modifyPosCartQty('${item.productId}', ${item.variantId ? `'${item.variantId}'` : 'null'}, 1, event)"
                class="w-7 h-7 rounded-lg bg-[#c9a84c] hover:bg-[#d8b556] text-black flex items-center justify-center text-sm font-black active:scale-90 transition">
                +
              </button>
            </div>
            <button type="button" onclick="window.modifyPosCartQty('${item.productId}', ${item.variantId ? `'${item.variantId}'` : 'null'}, -${item.qty}, event)"
              class="w-7 h-7 rounded-xl bg-white/5 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 flex items-center justify-center text-xs transition active:scale-90" title="Remove">
              ✕
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (qsCartDrawerBadge) {
      qsCartDrawerBadge.textContent = `${totalItems} item${totalItems === 1 ? '' : 's'}`;
    }
    if (qsCartTotalBadge) {
      qsCartTotalBadge.textContent = `${formatUSD(totalDollars)} (${formatKHR(totalDollars)})`;
    }
    if (qsCartConfirmBtn) {
      qsCartConfirmBtn.textContent = `✓ Confirm Sale (${totalItems} items · ${formatUSD(totalDollars)})`;
    }
  }

  // Toggle item in cart: 1st tap selects 1, 2nd tap auto-unselects (removes)
  window.togglePosCartItem = function (productId, variantId = null, event = null) {
    if (event) event.stopPropagation();

    const product = productsList.find((p) => p.id === productId);
    if (!product) return;

    let variant = null;
    if (variantId && product.variant_list) {
      variant = product.variant_list.find((v) => String(v.id) === String(variantId));
    }

    const key = getCartItemKey(productId, variantId);
    const existing = posCart.get(key);

    // If already in cart, tapping card/image toggles it off (auto-unselects)
    if (existing && existing.qty > 0) {
      posCart.delete(key);
      savePosCartToStorage();
      updatePosCartBar();
      renderQsGrid();

      if (qsVariantDrawer && !qsVariantDrawer.classList.contains('hidden') && qsVariantDrawer.dataset.productId === productId) {
        renderVariantDrawerContent(product);
      }
      if (qsCartDrawer && !qsCartDrawer.classList.contains('hidden')) {
        renderCartDrawerList();
      }
      return;
    }

    // Otherwise, select 1 unit
    const maxStock = variant ? Number(variant.stock) : Number(product.stock);
    if (maxStock <= 0) {
      showToast('This item is out of stock.', 'warning');
      return;
    }

    posCart.set(key, {
      key,
      productId,
      variantId: variant ? variant.id : null,
      name: variant ? `${product.name} (${variant.color_name})` : product.name,
      category: product.category,
      unitPrice: variant ? Number(variant.sell_price) : Number(product.sell_price),
      photoUrl: (variant && variant.photo_url) || product.photo_url || DEFAULT_IMAGE,
      maxStock,
      qty: 1,
    });

    savePosCartToStorage();
    updatePosCartBar();
    renderQsGrid();

    if (qsVariantDrawer && !qsVariantDrawer.classList.contains('hidden') && qsVariantDrawer.dataset.productId === productId) {
      renderVariantDrawerContent(product);
    }
    if (qsCartDrawer && !qsCartDrawer.classList.contains('hidden')) {
      renderCartDrawerList();
    }
  };

  // Stepper quantity modification: + and − buttons explicitly change count
  window.modifyPosCartQty = function (productId, variantId = null, delta = 1, event = null) {
    if (event) event.stopPropagation();

    const product = productsList.find((p) => p.id === productId);
    if (!product) return;

    let variant = null;
    if (variantId && product.variant_list) {
      variant = product.variant_list.find((v) => String(v.id) === String(variantId));
    }

    const key = getCartItemKey(productId, variantId);
    const maxStock = variant ? Number(variant.stock) : Number(product.stock);

    if (maxStock <= 0 && delta > 0) {
      showToast('This item is out of stock.', 'warning');
      return;
    }

    const existing = posCart.get(key);
    let newQty = (existing ? existing.qty : 0) + delta;

    if (newQty > maxStock) {
      newQty = maxStock;
      showToast(`Max in-stock reached (${maxStock}).`, 'warning');
    }

    if (newQty <= 0) {
      posCart.delete(key);
    } else {
      posCart.set(key, {
        key,
        productId,
        variantId: variant ? variant.id : null,
        name: variant ? `${product.name} (${variant.color_name})` : product.name,
        category: product.category,
        unitPrice: variant ? Number(variant.sell_price) : Number(product.sell_price),
        photoUrl: (variant && variant.photo_url) || product.photo_url || DEFAULT_IMAGE,
        maxStock,
        qty: newQty,
      });
    }

    savePosCartToStorage();
    updatePosCartBar();
    renderQsGrid();

    // If variant drawer is currently open, refresh it so badges update
    if (qsVariantDrawer && !qsVariantDrawer.classList.contains('hidden') && qsVariantDrawer.dataset.productId === productId) {
      renderVariantDrawerContent(product);
    }

    // If cart drawer is currently open, re-render its list
    if (qsCartDrawer && !qsCartDrawer.classList.contains('hidden')) {
      renderCartDrawerList();
    }
  };

  function renderQsGrid() {
    if (!qsGrid) return;

    const filtered = productsList.filter((p) => {
      if (p.stock <= 0) return false;
      const matchesCat = qsCategory === 'All' || p.category === qsCategory;
      if (!matchesCat) return false;

      if (!qsSearchQuery) return true;
      const q = qsSearchQuery;
      const nameMatch = (p.name || '').toLowerCase().includes(q);
      const skuMatch = (p.id || '').toLowerCase().includes(q);
      const catMatch = (p.category || '').toLowerCase().includes(q);
      return nameMatch || skuMatch || catMatch;
    });

    if (filtered.length === 0) {
      qsGrid.innerHTML = `
        <div class="col-span-3 text-center py-12 text-slate-400">
          <p class="text-3xl mb-2">💎</p>
          <p class="text-xs font-semibold">No in-stock jewelry found.</p>
        </div>
      `;
      return;
    }

    qsGrid.innerHTML = filtered.map((product) => {
      const hasVars = product.has_variants === 1 || product.has_variants === true || (product.variant_list && product.variant_list.length > 0);
      const varCount = product.variant_list ? product.variant_list.length : 0;
      const isLow = product.stock <= 2;

      // Count total units of this product (or its variants) currently in cart
      let cartQty = 0;
      if (hasVars) {
        if (product.variant_list) {
          product.variant_list.forEach((v) => {
            const item = posCart.get(getCartItemKey(product.id, v.id));
            if (item) cartQty += item.qty;
          });
        }
      } else {
        const item = posCart.get(getCartItemKey(product.id));
        if (item) cartQty = item.qty;
      }

      const isInCart = cartQty > 0;

      if (hasVars) {
        return `
          <div class="admin-card p-0 overflow-hidden flex flex-col cursor-pointer border transition-all duration-200 select-none ${
            isInCart
              ? 'border-[#c9a84c] ring-2 ring-[#c9a84c]/60 bg-[#c9a84c]/10 shadow-lg'
              : 'border-white/10 hover:border-[#c9a84c]/50 active:scale-98 shadow'
          }" onclick="window.qsOpenVariantDrawer('${product.id}')">
            <div class="relative w-full aspect-square bg-slate-900 overflow-hidden">
              <img src="${product.photo_url || DEFAULT_IMAGE}" alt="" loading="lazy" class="w-full h-full object-cover">
              
              <!-- Style Count Pill -->
              <span class="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-[#0e101a]/90 text-[#f3d489] border border-[#c9a84c]/40 backdrop-blur-sm">
                ✨ ${varCount}
              </span>

              <!-- In-Cart Badge -->
              ${isInCart ? `
                <span class="absolute top-1.5 left-1.5 min-w-[22px] h-5 px-1.5 rounded-full bg-[#c9a84c] text-black font-extrabold text-[10px] flex items-center justify-center shadow-lg border border-black/40">
                  🛒 ${cartQty}
                </span>
              ` : ''}
            </div>

            <div class="p-2 flex-1 flex flex-col justify-between">
              <div class="min-w-0">
                <p class="text-[9px] text-slate-400 uppercase font-semibold truncate leading-tight">${escapeHtml(product.category)}</p>
                <h4 class="text-[11px] font-bold text-white truncate leading-tight mt-0.5" title="${escapeHtml(product.name)}">${escapeHtml(product.name)}</h4>
              </div>

              <div class="mt-1 pt-1 border-t border-white/5">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-black text-[#c9a84c] tracking-tight">${formatUSD(product.sell_price)}</span>
                  <span class="text-[9px] text-slate-400 font-semibold">${product.stock} total</span>
                </div>
                <button type="button" onclick="window.qsOpenVariantDrawer('${product.id}')"
                  class="w-full h-7 mt-1.5 rounded-lg ${
                    isInCart 
                      ? 'bg-[#c9a84c]/20 text-[#f3d489] border-[#c9a84c]/50' 
                      : 'bg-white/10 text-slate-200 border-white/10'
                  } hover:bg-[#c9a84c] hover:text-black flex items-center justify-center text-xs font-bold space-x-1 border active:scale-95 transition-all shadow-sm">
                  <span>${isInCart ? `🛒 ${cartQty} in cart` : `Styles (${varCount})`}</span>
                  <span class="text-[10px]">➔</span>
                </button>
              </div>
            </div>
          </div>
        `;
      }

      // Standalone single product (no variants)
      return `
        <div class="admin-card p-0 overflow-hidden flex flex-col cursor-pointer border transition-all duration-200 select-none ${
          isInCart
            ? 'border-[#c9a84c] ring-2 ring-[#c9a84c]/60 bg-[#c9a84c]/10 shadow-lg'
            : 'border-white/10 hover:border-white/20 active:scale-98 shadow'
        }" onclick="window.togglePosCartItem('${product.id}')">
          <div class="relative w-full aspect-square bg-slate-900 overflow-hidden">
            <img src="${product.photo_url || DEFAULT_IMAGE}" alt="" loading="lazy" class="w-full h-full object-cover">
            
            <!-- Stock Badge -->
            <span class="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
              isLow ? 'bg-rose-950/90 text-rose-300 border border-rose-800/80' : 'bg-slate-950/80 text-slate-300 border border-white/15'
            }">
              ${product.stock} stk
            </span>

            <!-- In-Cart Badge -->
            ${isInCart ? `
              <span class="absolute top-1.5 left-1.5 min-w-[22px] h-5 px-1.5 rounded-full bg-[#c9a84c] text-black font-extrabold text-[10px] flex items-center justify-center shadow-lg border border-black/40">
                🛒 ${cartQty}
              </span>
            ` : ''}
          </div>

          <div class="p-2 flex-1 flex flex-col justify-between">
            <div class="min-w-0">
              <p class="text-[9px] text-slate-400 uppercase font-semibold truncate leading-tight">${escapeHtml(product.category)}</p>
              <h4 class="text-[11px] font-bold text-white truncate leading-tight mt-0.5" title="${escapeHtml(product.name)}">${escapeHtml(product.name)}</h4>
            </div>
            
            <div class="mt-1 pt-1 border-t border-white/5">
              <div class="flex items-center justify-between">
                <span class="text-xs font-black text-[#c9a84c] tracking-tight">${formatUSD(product.sell_price)}</span>
                <span class="text-[9px] text-slate-400 font-semibold">${product.stock} stk</span>
              </div>
              
              ${isInCart ? `
                <div class="flex items-center justify-between bg-black/60 border border-[#c9a84c]/50 rounded-xl p-0.5 mt-1.5" onclick="event.stopPropagation()">
                  <button type="button" onclick="window.modifyPosCartQty('${product.id}', null, -1, event)"
                    class="flex-1 h-7 rounded-lg bg-white/15 hover:bg-rose-600 text-white flex items-center justify-center text-sm font-black active:scale-90 transition"
                    title="Decrease quantity">
                    −
                  </button>
                  <span class="text-xs font-black text-[#f3d489] px-2 text-center select-none min-w-[24px]">
                    ${cartQty}
                  </span>
                  <button type="button" onclick="window.modifyPosCartQty('${product.id}', null, 1, event)"
                    class="flex-1 h-7 rounded-lg bg-[#c9a84c] hover:bg-[#d8b556] text-black flex items-center justify-center text-sm font-black active:scale-90 transition shadow-sm"
                    title="Increase quantity">
                    +
                  </button>
                </div>
              ` : `
                <button type="button" onclick="window.togglePosCartItem('${product.id}', null, event)"
                  class="w-full h-7 mt-1.5 rounded-lg bg-white/10 hover:bg-[#c9a84c] text-slate-200 hover:text-black flex items-center justify-center text-xs font-bold space-x-1 border border-white/10 active:scale-95 transition-all shadow-sm">
                  <span class="text-sm font-black leading-none">+</span>
                  <span>Select</span>
                </button>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Quick Sell Variant Drawer (Compact 3-Column Grid)
  function renderVariantDrawerContent(product) {
    if (!qsVariantList) return;
    const variants = Array.isArray(product.variant_list) ? product.variant_list : [];

    qsVariantList.innerHTML = variants.map((v) => {
      const isOut = v.stock <= 0;
      const key = getCartItemKey(product.id, v.id);
      const cartItem = posCart.get(key);
      const cartQty = cartItem ? cartItem.qty : 0;
      const isInCart = cartQty > 0;

      return `
        <div class="admin-card p-0 overflow-hidden flex flex-col border transition-all duration-200 select-none ${
          isOut
            ? 'opacity-40 cursor-not-allowed border-white/5'
            : isInCart
            ? 'cursor-pointer border-[#c9a84c] ring-2 ring-[#c9a84c]/60 bg-[#c9a84c]/10 shadow-lg'
            : 'cursor-pointer border-white/10 hover:border-[#c9a84c]/50 active:scale-98 shadow'
        }" ${isOut ? '' : `onclick="window.togglePosCartItem('${product.id}', '${v.id}')"`}>
          <div class="relative w-full aspect-square bg-slate-900 overflow-hidden">
            <img src="${v.photo_url || product.photo_url || DEFAULT_IMAGE}" class="w-full h-full object-cover">
            
            <!-- Stock Pill -->
            <span class="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
              v.stock <= 1 ? 'bg-rose-950/90 text-rose-300' : 'bg-slate-950/80 text-slate-300'
            }">
              ${v.stock} stk
            </span>

            <!-- In-Cart Badge -->
            ${isInCart ? `
              <span class="absolute top-1.5 left-1.5 min-w-[22px] h-5 px-1.5 rounded-full bg-[#c9a84c] text-black font-extrabold text-[10px] flex items-center justify-center shadow-lg border border-black/40">
                🛒 ${cartQty}
              </span>
            ` : ''}
          </div>

          <div class="p-2 flex-1 flex flex-col justify-between">
            <h5 class="text-[11px] font-bold text-white truncate leading-tight" title="${escapeHtml(v.color_name)}">${escapeHtml(v.color_name)}</h5>
            
            <div class="mt-1 pt-1 border-t border-white/5">
              <div class="flex items-center justify-between">
                <span class="text-xs font-black text-[#c9a84c] tracking-tight">${formatUSD(v.sell_price)}</span>
                <span class="text-[9px] text-slate-400 font-semibold">${v.stock} stk</span>
              </div>
              
              ${isOut ? `
                <span class="w-full h-7 mt-1.5 rounded-lg bg-white/5 text-slate-500 flex items-center justify-center text-[10px] font-bold border border-white/5">
                  Sold Out
                </span>
              ` : isInCart ? `
                <div class="flex items-center justify-between bg-black/60 border border-[#c9a84c]/50 rounded-xl p-0.5 mt-1.5" onclick="event.stopPropagation()">
                  <button type="button" onclick="window.modifyPosCartQty('${product.id}', '${v.id}', -1, event)"
                    class="flex-1 h-7 rounded-lg bg-white/15 hover:bg-rose-600 text-white flex items-center justify-center text-sm font-black active:scale-90 transition">
                    −
                  </button>
                  <span class="text-xs font-black text-[#f3d489] px-2 text-center select-none min-w-[24px]">
                    ${cartQty}
                  </span>
                  <button type="button" onclick="window.modifyPosCartQty('${product.id}', '${v.id}', 1, event)"
                    class="flex-1 h-7 rounded-lg bg-[#c9a84c] hover:bg-[#d8b556] text-black flex items-center justify-center text-sm font-black active:scale-90 transition shadow-sm">
                    +
                  </button>
                </div>
              ` : `
                <button type="button" onclick="window.togglePosCartItem('${product.id}', '${v.id}', event)"
                  class="w-full h-7 mt-1.5 rounded-lg bg-white/10 hover:bg-[#c9a84c] text-slate-200 hover:text-black flex items-center justify-center text-xs font-bold space-x-1 border border-white/10 active:scale-95 transition-all shadow-sm">
                  <span class="text-sm font-black leading-none">+</span>
                  <span>Select</span>
                </button>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  window.qsOpenVariantDrawer = function (productId) {
    const product = productsList.find((p) => p.id === productId);
    if (!product || !qsVariantDrawer) return;

    qsVariantDrawer.dataset.productId = productId;
    qsVariantDrawerTitle.textContent = product.name;
    qsVariantDrawerSub.textContent = `Total stock: ${product.stock} · Tap styles to add to cart`;

    renderVariantDrawerContent(product);
    qsVariantDrawer.classList.remove('hidden');
  };

  window.closeVariantDrawer = function () {
    if (qsVariantDrawer) qsVariantDrawer.classList.add('hidden');
  };

  // ─────────────────────────────────────────────────────────────
  // POS CHECKOUT & ATOMIC STOCK DEDUCTION
  // ─────────────────────────────────────────────────────────────
  window.executePosCheckout = async function () {
    if (posCart.size === 0) return;

    const items = Array.from(posCart.values());
    window.closeQsCartDrawer();

    const executedDeductions = [];
    let failedItem = null;

    // Atomically deduct each unit
    for (const item of items) {
      for (let i = 0; i < item.qty; i++) {
        try {
          const res = await authFetch(`/api/admin/products/${item.productId}/deduct`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ variant_id: item.variantId }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            executedDeductions.push({
              productId: item.productId,
              variantId: item.variantId,
              name: item.name,
              price: item.unitPrice,
            });
          } else {
            failedItem = item.name;
            break;
          }
        } catch (err) {
          failedItem = item.name;
          break;
        }
      }
      if (failedItem) break;
    }

    if (executedDeductions.length > 0) {
      const logEntry = {
        id: 'sale-' + Date.now(),
        isBatch: true,
        items: executedDeductions,
        name: executedDeductions.length === 1 
          ? executedDeductions[0].name 
          : `${executedDeductions.length} items (${executedDeductions[0].name}...)`,
        count: executedDeductions.length,
        totalPrice: executedDeductions.reduce((sum, d) => sum + d.price, 0),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      sessionDeductions.unshift(logEntry);
      updateQsDeductionBar();

      showToast(
        `✨ Sale recorded! Deducted ${executedDeductions.length} item(s).`,
        'success',
        () => undoDeduction(logEntry.id)
      );

      // Clear cart from memory and LocalStorage now that sale is complete
      posCart.clear();
      savePosCartToStorage();
      updatePosCartBar();
      loadProducts(true);
    }

    if (failedItem) {
      showToast(`Could not deduct remaining stock for ${failedItem}.`, 'error');
    }
  };

  async function undoDeduction(logId) {
    const idx = sessionDeductions.findIndex((d) => String(d.id) === String(logId));
    if (idx === -1) return;
    const entry = sessionDeductions[idx];

    let restoredCount = 0;
    if (entry.isBatch && Array.isArray(entry.items)) {
      for (const item of entry.items) {
        try {
          const res = await authFetch(`/api/admin/products/${item.productId}/restock`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ variant_id: item.variantId }),
          });
          if (res.ok) restoredCount++;
        } catch (e) {}
      }
    } else {
      try {
        const res = await authFetch(`/api/admin/products/${entry.productId}/restock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variant_id: entry.variantId }),
        });
        if (res.ok) restoredCount++;
      } catch (e) {}
    }

    sessionDeductions.splice(idx, 1);
    updateQsDeductionBar();
    renderDeductionLogList();
    showToast(`Restored ${restoredCount} item(s) back into inventory!`, 'info');
    loadProducts(true);
  }

  // Quick Sell Deduction Log Drawer
  window.openDeductionLog = function () {
    if (!qsLogDrawer) return;
    renderDeductionLogList();
    qsLogDrawer.classList.remove('hidden');
  };

  window.closeDeductionLog = function () {
    if (qsLogDrawer) qsLogDrawer.classList.add('hidden');
  };

  function renderDeductionLogList() {
    if (!qsLogList) return;
    if (sessionDeductions.length === 0) {
      qsLogList.innerHTML = `<p class="text-xs text-slate-400 text-center py-6">No deductions logged in this session.</p>`;
      return;
    }

    qsLogList.innerHTML = sessionDeductions.map((item) => `
      <div class="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between text-xs">
        <div>
          <p class="font-bold text-white">${escapeHtml(item.name)}</p>
          <p class="text-[10px] text-slate-400">${item.time} · ${formatUSD(item.totalPrice != null ? item.totalPrice : item.price)}</p>
        </div>
        <button type="button" onclick="window.undoDeductionItem('${item.id}')"
          class="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition">
          ↺ Undo & Restock
        </button>
      </div>
    `).join('');
  }

  window.undoDeductionItem = function (logId) {
    undoDeduction(logId);
  };

  // ─────────────────────────────────────────────────────────────
  // BACKDROP DISMISS FOR DRAWERS & DIALOGS (Click outside to close)
  // ─────────────────────────────────────────────────────────────
  function enableBackdropDismiss(overlayEl, dismissFn) {
    if (!overlayEl) return;
    let touchStartedOnBackdrop = false;

    overlayEl.addEventListener('touchstart', (e) => {
      touchStartedOnBackdrop = (e.target === overlayEl);
    }, { passive: true });

    overlayEl.addEventListener('mousedown', (e) => {
      touchStartedOnBackdrop = (e.target === overlayEl);
    });

    overlayEl.addEventListener('click', (e) => {
      if (e.target === overlayEl && touchStartedOnBackdrop) {
        dismissFn();
      }
      touchStartedOnBackdrop = false;
    });
  }

  // Quick Sell POS Cart Drawer
  enableBackdropDismiss(qsCartDrawer, () => window.closeQsCartDrawer());

  // Quick Sell Style Selection Drawer
  enableBackdropDismiss(qsVariantDrawer, () => window.closeVariantDrawer());

  // Quick Sell Deduction Log Drawer
  enableBackdropDismiss(qsLogDrawer, () => window.closeDeductionLog());

  // Confirm Dialog (Delete / Actions)
  enableBackdropDismiss(confirmDialog, () => {
    confirmDialog.classList.add('hidden');
    currentConfirmAction = null;
  });

  // Product Add / Edit Modal (Smart Safe Backdrop Close: warns if form has unsaved edits)
  enableBackdropDismiss(productModal, () => {
    const isDirty = (prodNameInput && prodNameInput.value.trim().length > 0) ||
                    (prodSellInput && prodSellInput.value.trim().length > 0) ||
                    (prodPhotoUrlInput && prodPhotoUrlInput.value.trim().length > 0) ||
                    (variantsRowsContainer && variantsRowsContainer.children.length > 0);
    if (isDirty) {
      if (confirm('Discard unsaved product changes?')) {
        window.closeProductModal();
      }
    } else {
      window.closeProductModal();
    }
  });

  // Image Lightbox Modal
  enableBackdropDismiss(imageLightboxModal, () => window.closeImageLightbox());

  // Keyboard Accessibility: Escape key closes active overlay
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (imageLightboxModal && !imageLightboxModal.classList.contains('hidden')) {
        window.closeImageLightbox();
      } else if (qsCartDrawer && !qsCartDrawer.classList.contains('hidden')) {
        window.closeQsCartDrawer();
      } else if (qsVariantDrawer && !qsVariantDrawer.classList.contains('hidden')) {
        window.closeVariantDrawer();
      } else if (qsLogDrawer && !qsLogDrawer.classList.contains('hidden')) {
        window.closeDeductionLog();
      } else if (confirmDialog && !confirmDialog.classList.contains('hidden')) {
        confirmDialog.classList.add('hidden');
        currentConfirmAction = null;
      }
    }
  });

  // ─────────────────────────────────────────────────────────────
  // ORDERS MANAGEMENT
  // ─────────────────────────────────────────────────────────────
  async function loadOrders(silent = false) {
    if (!adminToken) return;

    try {
      const res = await authFetch('/api/admin/orders');
      const data = await res.json();
      ordersList = Array.isArray(data) ? data : [];
      isInitialOrdersLoaded = true;
      updateOrderCounts();
      renderOrders();
      updateOverviewStats();
    } catch (err) {
      if (!silent && err.message !== 'Unauthorized') {
        showToast('Failed to load orders: ' + err.message, 'error');
      }
      if (!isInitialOrdersLoaded) {
        ordersEmptyEl.classList.add('hidden');
        ordersListEl.innerHTML = `
          <div class="text-center py-10 px-4 bg-rose-500/10 rounded-2xl border border-rose-500/20">
            <span class="text-3xl block mb-2">⚠️</span>
            <h4 class="text-sm font-bold text-rose-300">Connection Error</h4>
            <p class="text-xs text-rose-400/80 mt-1 mb-3">Failed to load orders (${escapeHtml(err.message)}). Retrying automatically...</p>
            <button onclick="window.refreshData()" class="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition">
              🔄 Retry Now
            </button>
          </div>
        `;
      }
    }
  }

  function updateOrderCounts() {
    const total = ordersList.length;
    const actionNeeded = ordersList.filter((o) => ['PENDING', 'CONFIRMED'].includes(o.status)).length;
    const shipped = ordersList.filter((o) => o.status === 'SHIPPED').length;
    const archive = ordersList.filter((o) => ['CANCELLED', 'RETURNED', 'COMPLETED'].includes(o.status)).length;

    if (countActionOrdersEl) countActionOrdersEl.textContent = actionNeeded;
    if (countShippedOrdersEl) countShippedOrdersEl.textContent = shipped;
    if (countArchiveOrdersEl) countArchiveOrdersEl.textContent = archive;
    if (countAllOrdersEl) countAllOrdersEl.textContent = total;
    if (tabPendingBadge) tabPendingBadge.textContent = actionNeeded;
  }

  function renderOrders() {
    if (!ordersListEl) return;
    const filtered = ordersList.filter((order) => {
      if (currentOrderFilter === 'ACTION_NEEDED') return ['PENDING', 'CONFIRMED'].includes(order.status);
      if (currentOrderFilter === 'SHIPPED') return order.status === 'SHIPPED';
      if (currentOrderFilter === 'ARCHIVE') return ['CANCELLED', 'RETURNED', 'COMPLETED'].includes(order.status);
      return true;
    });

    if (filtered.length === 0) {
      ordersListEl.innerHTML = '';
      ordersEmptyEl.classList.remove('hidden');
      return;
    }

    ordersEmptyEl.classList.add('hidden');
    ordersListEl.innerHTML = filtered.map((order) => {
      const createdDate = new Date(order.created_at).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const rawMethod = (order.delivery_type || order.payment_method || 'COD').toUpperCase();
      let deliveryBadge = `<span class="badge-delivery badge-delivery-cod">🛵 COD</span>`;
      if (rawMethod === 'KHQR') {
        deliveryBadge = `<span class="badge-delivery badge-delivery-khqr">💳 KHQR</span>`;
      } else if (rawMethod === 'VET') {
        deliveryBadge = `<span class="badge-delivery badge-delivery-vet">📦 VET</span>`;
      }

      const itemsList = order.items && order.items.length
        ? order.items.map((i) => {
            const unitPrice = Number(i.unit_price != null ? i.unit_price : (i.price_at_order != null ? i.price_at_order : 0));
            const lineTotal = unitPrice * (i.quantity || 1);
            const itemName = i.name || i.product_name || i.product_id || 'Jewelry Piece';
            const itemStyle = i.variant_name || i.variants || (i.variant_id ? `Style #${i.variant_id}` : '');
            const itemPhoto = i.photo_url || DEFAULT_IMAGE;

            return `
              <div class="flex items-center justify-between text-xs py-2 border-b border-white/5 last:border-0 gap-2.5">
                <div class="flex items-center space-x-2.5 min-w-0">
                  <div class="w-10 h-10 rounded-lg overflow-hidden bg-slate-900 border border-white/10 flex-shrink-0 cursor-pointer"
                    onclick="window.openImageLightbox('${itemPhoto}', '${escapeHtml(itemName)}', '${itemStyle ? escapeHtml(itemStyle) : escapeHtml(i.product_id)}')">
                    <img src="${itemPhoto}" alt="" class="w-full h-full object-cover" onerror="this.src='${DEFAULT_IMAGE}'">
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center space-x-1.5 flex-wrap">
                      <span class="font-bold text-[#c9a84c] text-xs">${i.quantity}x</span>
                      <span class="text-white font-semibold truncate leading-tight">${escapeHtml(itemName)}</span>
                    </div>
                    <div class="flex items-center space-x-2 mt-0.5 flex-wrap">
                      ${itemStyle ? `
                        <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#c9a84c]/20 text-[#f3d489] border border-[#c9a84c]/30">
                          ✨ ${escapeHtml(itemStyle)}
                        </span>
                      ` : ''}
                      <span class="text-[9px] font-mono text-slate-400">#${escapeHtml(i.variant_id || i.product_id)}</span>
                    </div>
                  </div>
                </div>
                <div class="text-right flex-shrink-0">
                  <span class="font-bold text-white text-xs block">${formatUSD(lineTotal)}</span>
                  ${i.quantity > 1 ? `<span class="text-[10px] text-slate-400 block">${formatUSD(unitPrice)} ea</span>` : ''}
                </div>
              </div>
            `;
          }).join('')
        : `<p class="text-xs text-slate-500 italic">No item details available</p>`;

      const itemsCollapsible = `
        <details class="group bg-white/5 rounded-xl border border-white/5 overflow-hidden mb-3">
          <summary class="flex items-center justify-between px-3 py-2 cursor-pointer text-xs font-semibold text-slate-300 group-open:border-b group-open:border-white/10 transition">
            <span class="flex items-center space-x-1.5">
              <span>🛍️ Order Items (${order.items ? order.items.length : 0})</span>
            </span>
            <span class="text-[10px] text-slate-400 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div class="p-3 bg-black/20 space-y-1.5">
            ${itemsList}
          </div>
        </details>
      `;

      let deliverySwitcher = '';
      if (!['COMPLETED', 'CANCELLED', 'RETURNED'].includes(order.status)) {
        deliverySwitcher = `
          <div class="flex items-center space-x-1 pt-1.5 text-[10px]">
            <span class="text-slate-400 mr-1 font-semibold">Change to:</span>
            <button type="button" onclick="window.changeOrderDeliveryType('${order.id}', 'COD')"
              class="px-2 py-0.5 rounded-md font-bold transition ${rawMethod === 'COD' ? 'bg-amber-500/30 text-amber-300 border border-amber-400' : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'}">
              🛵 COD
            </button>
            <button type="button" onclick="window.changeOrderDeliveryType('${order.id}', 'KHQR')"
              class="px-2 py-0.5 rounded-md font-bold transition ${rawMethod === 'KHQR' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400' : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'}">
              💳 KHQR
            </button>
            <button type="button" onclick="window.changeOrderDeliveryType('${order.id}', 'VET')"
              class="px-2 py-0.5 rounded-md font-bold transition ${rawMethod === 'VET' ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-400' : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'}">
              📦 VET
            </button>
          </div>
        `;
      }

      let actionButtons = '';
      if (order.status === 'PENDING') {
        actionButtons = `
          <div class="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10">
            <button onclick="window.confirmOrderAction('${order.id}')"
              class="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-md transition">
              <span>${t('confirmAndPack')}</span>
            </button>
            <button onclick="window.cancelOrderAction('${order.id}')"
              class="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-rose-950/80 hover:text-rose-200 text-slate-300 font-bold text-xs flex items-center justify-center space-x-1 transition">
              <span>${t('cancelOrder')}</span>
            </button>
          </div>
        `;
      } else if (order.status === 'CONFIRMED') {
        actionButtons = `
          <div class="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10">
            <button onclick="window.shipOrderAction('${order.id}')"
              class="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-md transition">
              <span>${t('markShipped')}</span>
            </button>
            <button onclick="window.cancelOrderAction('${order.id}')"
              class="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-rose-950/80 hover:text-rose-200 text-slate-300 font-bold text-xs flex items-center justify-center space-x-1 transition">
              <span>${t('cancelRefund')}</span>
            </button>
          </div>
        `;
      } else if (order.status === 'SHIPPED') {
        actionButtons = `
          <div class="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10">
            <button onclick="window.completeOrderAction('${order.id}')"
              class="col-span-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-md transition">
              <span>🎉 ${t('markDelivered')}</span>
            </button>
            <button onclick="window.returnOrderAction('${order.id}')"
              class="col-span-1 py-2.5 px-2 rounded-xl bg-white/5 hover:bg-rose-950/80 hover:text-rose-200 border border-white/10 text-slate-400 font-semibold text-[11px] flex items-center justify-center space-x-1 transition">
              <span>📦 ${t('markReturnedSecondary')}</span>
            </button>
          </div>
        `;
      } else if (order.status === 'COMPLETED') {
        actionButtons = `
          <div class="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-xs">
            <span class="text-[11px] text-emerald-400 font-semibold">✅ ${t('completedState')}</span>
            <span class="text-[10px] text-slate-500">${t('archivedState')}</span>
          </div>
        `;
      } else {
        actionButtons = `
          <div class="mt-2 pt-2 border-t border-white/5 text-right">
            <span class="text-[11px] text-slate-500 font-medium">${t('archivedState')}</span>
          </div>
        `;
      }

      const filledName = order.customer_name || 'Guest Customer';
      const fbName = order.facebook_name;

      let nameBadgeHtml = '';
      if (fbName && fbName.trim().toLowerCase() !== filledName.trim().toLowerCase()) {
        nameBadgeHtml = `
          <div class="flex items-center flex-wrap gap-1.5 min-w-0">
            <span class="font-bold text-white truncate">${escapeHtml(filledName)}</span>
            <span class="inline-flex items-center space-x-1 text-[10px] text-blue-300 font-medium px-1.5 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 flex-shrink-0" title="Facebook Messenger Profile: ${escapeHtml(fbName)}">
              <span>💬</span>
              <span>FB: ${escapeHtml(fbName)}</span>
            </span>
          </div>
        `;
      } else if (fbName) {
        nameBadgeHtml = `
          <div class="flex items-center flex-wrap gap-1.5 min-w-0">
            <span class="font-bold text-white truncate">${escapeHtml(filledName)}</span>
            <span class="inline-flex items-center space-x-0.5 text-[9px] text-emerald-400 font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0" title="Verified via Facebook Messenger">
              <span>✓</span>
              <span>FB Verified</span>
            </span>
          </div>
        `;
      } else {
        nameBadgeHtml = `<span class="font-bold text-white truncate">${escapeHtml(filledName)}</span>`;
      }

      return `
        <div class="admin-card p-4">
          <div class="flex items-center justify-between mb-2.5">
            <div class="flex items-center space-x-2">
              <span class="text-xs font-mono font-extrabold text-[#f3d489]">${order.id}</span>
              ${deliveryBadge}
              <span class="text-[10px] text-slate-400">· ${createdDate}</span>
            </div>
            <span class="badge-status status-${order.status}">
              ${order.status}
            </span>
          </div>

          <div class="bg-black/25 rounded-xl p-2.5 border border-white/5 mb-3 text-xs space-y-1">
            <div class="flex items-center justify-between gap-2">
              ${nameBadgeHtml}
              ${
                order.phone
                  ? `<a href="tel:${escapeHtml(order.phone)}" class="text-[#c9a84c] hover:underline font-semibold text-[11px] flex items-center space-x-1 flex-shrink-0">
                      <span>📞</span><span>${escapeHtml(order.phone)}</span>
                    </a>`
                  : ''
              }
            </div>
            <div class="text-[11px] text-slate-300 leading-snug">
              📍 ${escapeHtml(order.address || 'No address specified')}
            </div>
            ${
              order.note
                ? `<div class="text-[10px] text-amber-300 italic pt-0.5">
                    📝 Note: "${escapeHtml(order.note)}"
                  </div>`
                : ''
            }
            ${deliverySwitcher}
          </div>

          ${itemsCollapsible}

          <div class="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
            <span class="text-slate-400 font-medium">${t('orderTotal')}</span>
            <div class="text-right">
              <span class="text-sm font-extrabold text-white">${formatUSD(order.total_amount)}</span>
              <span class="text-[11px] font-semibold text-[#e5c36a] ml-1">(${formatKHR(order.total_amount)})</span>
            </div>
          </div>

          ${actionButtons}
        </div>
      `;
    }).join('');
  }

  // Order Lifecycle Actions
  const pendingOrderActions = new Set();

  window.confirmOrderAction = async function (orderId) {
    const actionKey = `confirm_${orderId}`;
    if (pendingOrderActions.has(actionKey)) return;
    if (!confirm(`Confirm order ${orderId} and decrement stock atomically?`)) return;

    pendingOrderActions.add(actionKey);
    try {
      const res = await authFetch(`/api/admin/orders/${orderId}/confirm`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message, 'success');
        refreshData();
      } else {
        showToast(data.error || 'Failed to confirm order.', 'error');
      }
    } catch (err) {
      if (err.message !== 'Unauthorized') showToast(err.message, 'error');
    } finally {
      pendingOrderActions.delete(actionKey);
    }
  };

  window.cancelOrderAction = async function (orderId) {
    const actionKey = `cancel_${orderId}`;
    if (pendingOrderActions.has(actionKey)) return;
    if (!confirm(`Cancel order ${orderId}? If already confirmed, stock will be restored automatically.`)) return;

    pendingOrderActions.add(actionKey);
    try {
      const res = await authFetch(`/api/admin/orders/${orderId}/cancel`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message, 'info');
        refreshData();
      } else {
        showToast(data.error || 'Failed to cancel order.', 'error');
      }
    } catch (err) {
      if (err.message !== 'Unauthorized') showToast(err.message, 'error');
    } finally {
      pendingOrderActions.delete(actionKey);
    }
  };

  window.shipOrderAction = async function (orderId) {
    const actionKey = `ship_${orderId}`;
    if (pendingOrderActions.has(actionKey)) return;
    if (!confirm(`Mark order ${orderId} as SHIPPED? An automated notification will be sent to the customer via Messenger.`)) return;

    pendingOrderActions.add(actionKey);
    try {
      const res = await authFetch(`/api/admin/orders/${orderId}/ship`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message, 'success');
        refreshData();
      } else {
        showToast(data.error || 'Failed to ship order.', 'error');
      }
    } catch (err) {
      if (err.message !== 'Unauthorized') showToast(err.message, 'error');
    } finally {
      pendingOrderActions.delete(actionKey);
    }
  };

  window.returnOrderAction = async function (orderId) {
    const actionKey = `return_${orderId}`;
    if (pendingOrderActions.has(actionKey)) return;
    if (!confirm(`Mark order ${orderId} as RETURNED? This will restore the jewelry items back into inventory.`)) return;

    pendingOrderActions.add(actionKey);
    try {
      const res = await authFetch(`/api/admin/orders/${orderId}/return`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message, 'success');
        refreshData();
      } else {
        showToast(data.error || 'Failed to return order.', 'error');
      }
    } catch (err) {
      if (err.message !== 'Unauthorized') showToast(err.message, 'error');
    } finally {
      pendingOrderActions.delete(actionKey);
    }
  };

  window.completeOrderAction = async function (orderId) {
    const actionKey = `complete_${orderId}`;
    if (pendingOrderActions.has(actionKey)) return;
    if (!confirm(`Mark order ${orderId} as Delivered / Completed?`)) return;

    pendingOrderActions.add(actionKey);
    try {
      const res = await authFetch(`/api/admin/orders/${orderId}/complete`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message, 'success');
        refreshData();
      } else {
        showToast(data.error || 'Failed to complete order.', 'error');
      }
    } catch (err) {
      if (err.message !== 'Unauthorized') showToast(err.message, 'error');
    } finally {
      pendingOrderActions.delete(actionKey);
    }
  };

  window.changeOrderDeliveryType = async function (orderId, deliveryType) {
    try {
      const res = await authFetch(`/api/admin/orders/${orderId}/delivery-type`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delivery_type: deliveryType }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Order ${orderId} delivery set to ${deliveryType}`, 'success');
        refreshData();
      } else {
        showToast(data.error || 'Failed to update delivery type.', 'error');
      }
    } catch (err) {
      if (err.message !== 'Unauthorized') showToast(err.message, 'error');
    }
  };

  // ─────────────────────────────────────────────────────────────
  // OVERVIEW STATS
  // ─────────────────────────────────────────────────────────────
  function updateOverviewStats() {
    if (!statRevenueUsd) return;
    let revenueUSD = 0;
    ordersList.forEach((o) => {
      if (['CONFIRMED', 'SHIPPED', 'COMPLETED'].includes(o.status)) {
        revenueUSD += Number(o.total_amount || 0);
      }
    });

    statRevenueUsd.textContent = formatUSD(revenueUSD);
    statRevenueKhr.textContent = formatKHR(revenueUSD);
    statPendingCount.textContent = ordersList.filter((o) => o.status === 'PENDING').length;
    statTotalOrders.textContent = ordersList.length;
    statTotalSkus.textContent = productsList.length;

    const lowStockCount = productsList.filter((p) => p.stock <= 3).length;
    statLowStock.textContent = t('lowStock', { n: lowStockCount });
  }

  // ─────────────────────────────────────────────────────────────
  // REFRESH PIPELINE & BOOTSTRAP
  // ─────────────────────────────────────────────────────────────
  function refreshData(silent = false) {
    loadCategories();
    loadOrders(silent);
    loadProducts(silent);
  }
  window.refreshData = refreshData;

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial Boot
  applyLanguage();
  if (!adminToken) {
    showLoginModal();
  } else {
    refreshData();
  }

  setInterval(() => {
    if (adminToken) {
      loadOrders(true);
    }
  }, 6000);
})();
