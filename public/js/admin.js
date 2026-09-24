/**
 * Luxe Jewelry - Admin Dashboard Logic (Mobile-First + Bilingual EN/KM)
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
      tabOverview: '📊 Overview',
      filterAll: 'All Orders',
      filterPending: 'Pending Verification',
      filterConfirmed: 'Ready to Ship',
      filterShipped: 'In Transit',
      filterArchive: 'Completed/Cancelled',
      noOrdersFound: 'No orders found',
      noOrdersSub: 'There are currently no orders in this status category.',
      confirmAndPack: '✓ Confirm & Pack',
      cancelOrder: '✕ Cancel',
      markShipped: '🚚 Mark Shipped',
      cancelRefund: '✕ Cancel (Refund)',
      markReturned: '📦 Mark as Returned (Boom Failure)',
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
      tabOverview: '📊 ទិដ្ឋភាពទូទៅ',
      filterAll: 'ការកុម្ម៉ង់ទាំងអស់',
      filterPending: 'រង់ចាំការផ្ទៀងផ្ទាត់',
      filterConfirmed: 'ត្រៀមដឹកជញ្ជូន',
      filterShipped: 'កំពុងដឹកជញ្ជូន',
      filterArchive: 'បានបញ្ចប់/បោះបង់',
      noOrdersFound: 'មិនមានការបញ្ជាទិញទេ',
      noOrdersSub: 'បច្ចុប្បន្នមិនទាន់មានការបញ្ជាទិញក្នុងផ្នែកនេះនៅឡើយទេ។',
      confirmAndPack: '✓ បញ្ជាក់ & វេចខ្ចប់',
      cancelOrder: '✕ បោះបង់',
      markShipped: '🚚 ដឹកជញ្ជូន',
      cancelRefund: '✕ បោះបង់ (សងប្រាក់)',
      markReturned: '📦 បញ្ជូនចូលស្តុកវិញ (ដឹកមិនបាន)',
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
  let currentOrderFilter = 'ALL';
  let activeTab = 'orders';

  // DOM Elements
  const adminLangFlag = document.getElementById('admin-lang-flag');
  const adminLangLabel = document.getElementById('admin-lang-label');
  const labelLive = document.getElementById('label-live');
  const linkStorefront = document.getElementById('link-storefront');
  const btnSignout = document.getElementById('btn-signout');

  const tabButtons = document.querySelectorAll('.nav-tab');
  const tabContentOrders = document.getElementById('tab-content-orders');
  const tabContentInventory = document.getElementById('tab-content-inventory');
  const tabContentOverview = document.getElementById('tab-content-overview');
  const tabPendingBadge = document.getElementById('tab-pending-badge');
  const tabStockBadge = document.getElementById('tab-stock-badge');

  const ordersListEl = document.getElementById('orders-list');
  const ordersEmptyEl = document.getElementById('orders-empty');
  const orderFilterPills = document.querySelectorAll('[data-order-filter]');
  const countAllOrdersEl = document.getElementById('count-all-orders');
  const countPendingOrdersEl = document.getElementById('count-pending-orders');
  const countConfirmedOrdersEl = document.getElementById('count-confirmed-orders');
  const countShippedOrdersEl = document.getElementById('count-shipped-orders');

  const inventoryListEl = document.getElementById('inventory-list');
  const productModal = document.getElementById('product-modal');
  const productForm = document.getElementById('product-form');
  const prodIdInput = document.getElementById('prod-id');
  const prodCategoryInput = document.getElementById('prod-category');
  const prodNameInput = document.getElementById('prod-name');
  const prodVariantsInput = document.getElementById('prod-variants');
  const prodImportInput = document.getElementById('prod-import');
  const prodSellInput = document.getElementById('prod-sell');
  const prodStockInput = document.getElementById('prod-stock');
  const prodFileInput = document.getElementById('prod-file');
  const prodPhotoUrlInput = document.getElementById('prod-photo-url');
  const marginPreview = document.getElementById('margin-preview');

  const statRevenueUsd = document.getElementById('stat-revenue-usd');
  const statRevenueKhr = document.getElementById('stat-revenue-khr');
  const statPendingCount = document.getElementById('stat-pending-count');
  const statTotalOrders = document.getElementById('stat-total-orders');
  const statTotalSkus = document.getElementById('stat-total-skus');
  const statLowStock = document.getElementById('stat-low-stock');

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
        <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
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
      if (tab === 'orders') {
        btn.querySelector('span:first-child').textContent = t('tabOrders');
      } else if (tab === 'inventory') {
        btn.querySelector('span:first-child').textContent = t('tabInventory');
      } else if (tab === 'overview') {
        btn.querySelector('span:first-child').textContent = t('tabOverview');
      }
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

  // Orders Management
  async function loadOrders(silent = false) {
    if (!adminToken) return;

    try {
      const res = await authFetch('/api/admin/orders');
      ordersList = await res.json();
      updateOrderCounts();
      renderOrders();
      updateOverviewStats();
    } catch (err) {
      if (!silent && err.message !== 'Unauthorized') {
        showToast('Failed to load orders', 'error');
      }
    }
  }

  function updateOrderCounts() {
    const total = ordersList.length;
    const pending = ordersList.filter((o) => o.status === 'PENDING').length;
    const confirmed = ordersList.filter((o) => o.status === 'CONFIRMED').length;
    const shipped = ordersList.filter((o) => o.status === 'SHIPPED').length;

    countAllOrdersEl.textContent = total;
    countPendingOrdersEl.textContent = pending;
    countConfirmedOrdersEl.textContent = confirmed;
    countShippedOrdersEl.textContent = shipped;
    tabPendingBadge.textContent = pending;
  }

  function renderOrders() {
    let filtered = ordersList;

    if (currentOrderFilter === 'PENDING') {
      filtered = ordersList.filter((o) => o.status === 'PENDING');
    } else if (currentOrderFilter === 'CONFIRMED') {
      filtered = ordersList.filter((o) => o.status === 'CONFIRMED');
    } else if (currentOrderFilter === 'SHIPPED') {
      filtered = ordersList.filter((o) => o.status === 'SHIPPED');
    } else if (currentOrderFilter === 'ARCHIVE') {
      filtered = ordersList.filter((o) => ['CANCELLED', 'RETURNED'].includes(o.status));
    }

    if (filtered.length === 0) {
      ordersListEl.innerHTML = '';
      ordersEmptyEl.classList.remove('hidden');
      return;
    }

    ordersEmptyEl.classList.add('hidden');

    ordersListEl.innerHTML = filtered.map((order) => {
      const createdDate = new Date(order.created_at || Date.now()).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const itemsHtml = (order.items || []).map((it) => `
        <div class="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0">
          <div class="flex items-center space-x-2 min-w-0">
            <img src="${it.photo_url || DEFAULT_IMAGE}" alt="" class="w-8 h-8 rounded-lg object-cover bg-slate-900 border border-white/10 flex-shrink-0">
            <div class="truncate">
              <span class="font-bold text-white">${escapeHtml(it.name)}</span>
              <span class="text-slate-400 text-[10px] block">SKU: ${it.product_id} · Qty: ${it.quantity}</span>
            </div>
          </div>
          <div class="text-right flex-shrink-0 ml-2">
            <span class="font-semibold text-slate-200">${formatUSD(it.unit_price * it.quantity)}</span>
          </div>
        </div>
      `).join('');

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
          <div class="mt-3 pt-3 border-t border-white/10">
            <button onclick="window.returnOrderAction('${order.id}')"
              class="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-md transition">
              <span>${t('markReturned')}</span>
            </button>
          </div>
        `;
      } else {
        actionButtons = `
          <div class="mt-2 pt-2 border-t border-white/5 text-right">
            <span class="text-[11px] text-slate-500 font-medium">${t('archivedState')}</span>
          </div>
        `;
      }

      return `
        <div class="admin-card p-4">
          <div class="flex items-center justify-between mb-2.5">
            <div class="flex items-center space-x-2">
              <span class="text-xs font-mono font-extrabold text-[#f3d489]">${order.id}</span>
              <span class="text-[10px] text-slate-400">· ${createdDate}</span>
            </div>
            <span class="badge-status status-${order.status}">
              ${order.status}
            </span>
          </div>

          <div class="bg-black/25 rounded-xl p-2.5 border border-white/5 mb-3 text-xs space-y-1">
            <div class="flex items-center justify-between">
              <span class="font-bold text-white">${escapeHtml(order.customer_name || 'Guest Customer')}</span>
              ${
                order.phone
                  ? `<a href="tel:${escapeHtml(order.phone)}" class="text-[#c9a84c] hover:underline font-semibold text-[11px] flex items-center space-x-1">
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
          </div>

          <div class="space-y-1 mb-2">
            ${itemsHtml}
          </div>

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
  window.confirmOrderAction = async function (orderId) {
    if (!confirm(`Confirm order ${orderId} and decrement stock atomically?`)) return;

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
    }
  };

  window.cancelOrderAction = async function (orderId) {
    if (!confirm(`Cancel order ${orderId}? If already confirmed, stock will be restored automatically.`)) return;

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
    }
  };

  window.shipOrderAction = async function (orderId) {
    if (!confirm(`Mark order ${orderId} as SHIPPED? An automated notification will be sent to the customer via Messenger.`)) return;

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
    }
  };

  window.returnOrderAction = async function (orderId) {
    if (!confirm(`Mark order ${orderId} as RETURNED? This will restore the jewelry items back into inventory.`)) return;

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
    }
  };

  // Inventory Management
  async function loadProducts(silent = false) {
    if (!adminToken) return;

    try {
      const res = await authFetch('/api/admin/products');
      productsList = await res.json();
      tabStockBadge.textContent = productsList.length;
      renderProducts();
      updateOverviewStats();
    } catch (err) {
      if (!silent && err.message !== 'Unauthorized') {
        showToast('Failed to load products', 'error');
      }
    }
  }

  function renderProducts() {
    if (productsList.length === 0) {
      inventoryListEl.innerHTML = `
        <div class="text-center py-12 text-slate-400">
          <p class="text-xs">No jewelry pieces in catalog.</p>
        </div>
      `;
      return;
    }

    inventoryListEl.innerHTML = productsList.map((product) => {
      const isLowStock = product.stock <= 3;
      const margin = product.margin_percent != null ? `${product.margin_percent}%` : '0%';

      return `
        <div class="admin-card p-3 flex items-center justify-between">
          <div class="flex items-center space-x-3 min-w-0">
            <img src="${product.photo_url || DEFAULT_IMAGE}" alt=""
              class="w-12 h-12 rounded-xl object-cover bg-slate-900 border border-white/10 flex-shrink-0">
            <div class="min-w-0">
              <div class="flex items-center space-x-1.5">
                <span class="font-mono text-[10px] font-bold text-[#c9a84c]">${product.id}</span>
                <span class="text-[10px] text-slate-400 uppercase">· ${product.category}</span>
              </div>
              <h4 class="text-xs font-bold text-white truncate leading-tight">${escapeHtml(product.name)}</h4>
              <div class="text-[11px] text-slate-300 mt-0.5">
                Sell: <strong class="text-white">${formatUSD(product.sell_price)}</strong>
                <span class="text-slate-500">|</span>
                Cost: <span class="text-slate-400">${formatUSD(product.import_price)}</span>
                <span class="text-emerald-400 font-semibold text-[10px] ml-1">(+${margin})</span>
              </div>
            </div>
          </div>

          <div class="text-right flex flex-col items-end space-y-1.5 ml-2">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isLowStock
                ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80'
                : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
            }">
              ${t('inStock', { n: product.stock })}
            </span>
            <div class="flex items-center space-x-1">
              <button onclick="window.editProduct('${product.id}')"
                class="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-[10px] text-slate-300 font-bold transition">
                ${t('edit')}
              </button>
              <button onclick="window.deleteProduct('${product.id}')"
                class="px-2 py-1 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-[10px] text-rose-300 font-bold transition">
                ${t('del')}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Live Margin Preview
  function updateMarginPreview() {
    const cost = parseFloat(prodImportInput.value) || 0;
    const sell = parseFloat(prodSellInput.value) || 0;

    if (sell > 0) {
      const margin = (((sell - cost) / sell) * 100).toFixed(1);
      marginPreview.textContent = `${margin}% profit`;
      marginPreview.className = margin >= 0 ? 'font-bold text-emerald-400' : 'font-bold text-rose-400';
    } else {
      marginPreview.textContent = '0%';
      marginPreview.className = 'font-bold text-slate-400';
    }
  }

  prodImportInput.addEventListener('input', updateMarginPreview);
  prodSellInput.addEventListener('input', updateMarginPreview);

  // Open & Close Product Modal
  window.openProductModal = function () {
    productForm.reset();
    prodIdInput.value = '';
    marginPreview.textContent = '0%';
    productModal.classList.remove('hidden');
  };

  window.closeProductModal = function () {
    productModal.classList.add('hidden');
  };

  window.editProduct = function (sku) {
    const product = productsList.find((p) => p.id === sku);
    if (!product) return;

    prodIdInput.value = product.id;
    prodCategoryInput.value = product.category;
    prodNameInput.value = product.name;
    prodVariantsInput.value = product.variants || '';
    prodImportInput.value = product.import_price;
    prodSellInput.value = product.sell_price;
    prodStockInput.value = product.stock;
    prodPhotoUrlInput.value = product.photo_url || '';
    updateMarginPreview();

    productModal.classList.remove('hidden');
  };

  window.deleteProduct = async function (sku) {
    if (!confirm(`Are you sure you want to remove product ${sku} from inventory?`)) return;

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
  };

  // Submit Product Form
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const saveBtn = document.getElementById('save-product-btn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';

    try {
      let res;
      if (prodFileInput.files && prodFileInput.files[0]) {
        const formData = new FormData();
        if (prodIdInput.value) formData.append('id', prodIdInput.value);
        formData.append('category', prodCategoryInput.value);
        formData.append('name', prodNameInput.value);
        formData.append('variants', prodVariantsInput.value);
        formData.append('import_price', prodImportInput.value);
        formData.append('sell_price', prodSellInput.value);
        formData.append('stock', prodStockInput.value);
        formData.append('photo', prodFileInput.files[0]);

        res = await authFetch('/api/admin/products', {
          method: 'POST',
          body: formData,
        });
      } else {
        const payload = {
          id: prodIdInput.value || undefined,
          category: prodCategoryInput.value,
          name: prodNameInput.value,
          variants: prodVariantsInput.value,
          import_price: prodImportInput.value,
          sell_price: prodSellInput.value,
          stock: prodStockInput.value,
          photo_url: prodPhotoUrlInput.value.trim(),
        };

        res = await authFetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

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

  // Overview Tab Stats
  function updateOverviewStats() {
    let revenueUSD = 0;
    ordersList.forEach((o) => {
      if (['CONFIRMED', 'SHIPPED'].includes(o.status)) {
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

  // Refresh Pipeline
  function refreshData(silent = false) {
    loadOrders(silent);
    loadProducts(silent);
  }

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
