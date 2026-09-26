/**
 * Luxe Jewelry - Customer Webview Logic (Mobile-First + Bilingual EN/KM)
 */

(function () {
  'use strict';

  // Constants & Config
  const EXCHANGE_RATE_KHR = 4100;
  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&q=80';

  // Language & Translations
  let currentLang = localStorage.getItem('luxe_lang') || 'en';

  const translations = {
    en: {
      langLabel: 'KM',
      langFlag: '🇰🇭',
      boutiqueSub: 'Phnom Penh Boutique',
      connecting: 'Connecting…',
      connected: 'Connected',
      guestMode: 'Guest Mode',
      connectedBanner: 'Connected: {id} · Order receipts delivered to Messenger',
      guestBanner: 'Guest Browsing (Link required to order)',
      invalidBanner: 'Invalid or expired Messenger link',
      connErrorBanner: 'Connection error',
      promoTag: 'Authentic Collection',
      promoTitle: 'Fine Cambodian Craftsmanship',
      promoSub: 'Direct checkout via KHQR & verified Messenger delivery.',
      catAll: 'All Pieces',
      catRing: '💍 Rings',
      catNecklace: '📿 Necklaces',
      catBracelet: '✨ Bracelets',
      catEarring: '💎 Earrings',
      rateDisplay: '1 USD = ៛4,100',
      piecesCount: '{n} piece{s} available',
      inStock: 'In Stock',
      onlyLeft: 'Only {n} left',
      soldOut: 'Sold Out',
      addToBag: '+ Add to Bag',
      bagLabel: 'Bag:',
      viewCart: 'View Cart',
      bagTitle: 'Your Shopping Bag',
      bagSub: 'Review items & complete delivery details',
      selectedPieces: 'Selected Pieces',
      clearAll: 'Clear all',
      emptyBag: 'Your bag is empty',
      emptyBagSub: 'Add fine jewelry pieces from the catalog to order.',
      subtotal: 'Subtotal',
      delivery: 'Delivery (Phnom Penh & Provinces)',
      freeDelivery: 'Free / Standard',
      totalAmount: 'Total Amount',
      authAlertTitle: 'Messenger Verified Link Required',
      authAlertText: 'To protect your order and receive instant receipts, please open this shop link directly from your chat with our Facebook Page.',
      deliveryInfo: 'Delivery Information',
      requiredNote: '* required for shipping',
      fullName: 'Your Full Name *',
      namePlaceholder: 'e.g. Sreysros Keo',
      phone: 'Phone Number (Cell / Telegram) *',
      phonePlaceholder: 'e.g. 012 345 678',
      address: 'Delivery Address *',
      addressPlaceholder: 'House #, Street, Sangkat/Khan or Province...',
      notes: 'Order Notes (Optional)',
      notesPlaceholder: 'Ring size (e.g. Size 7), gift wrapping, etc.',
      scanToPay: 'Scan to Pay',
      merchant: 'Merchant:',
      totalDue: 'Total Due:',
      khqrNote: '💡 Pay via any Bakong-enabled app (ABA, Wing, ACLEDA). The shop owner manually confirms receipt before shipping!',
      keepShopping: 'Keep Shopping',
      confirmOrder: 'Confirm Order ✨',
      submitting: 'Submitting Order…',
      orderReceivedTag: 'Order Received',
      thankYou: 'Thank You!',
      thankYouSub: 'Your jewelry order has been submitted successfully.',
      orderRef: 'Order Reference:',
      orderTotal: 'Total Amount:',
      orderStatus: 'Status:',
      pendingVerification: 'PENDING VERIFICATION',
      messengerNote: 'A receipt carousel has been sent to your Messenger chat! Our shop owner will verify payment and update shipping.',
      continueShopping: 'Continue Shopping ✨',
      clearBagConfirm: 'Clear all items from your shopping bag?',
      bagCleared: 'Shopping bag cleared',
      addedToBag: 'Added "{name}" to bag!',
      removedItem: 'Removed "{name}"',
      stockLimit: 'Stock limit reached ({n} max).',
      fillRequired: 'Please fill in your Name, Phone, and Delivery Address.',
      noProducts: 'No jewelry found',
      noProductsSub: 'There are no items currently available in this category.',
      paymentMethodTitle: 'Delivery & Payment Method',
      payOptCodTitle: 'Cash on Delivery (Grab)',
      payOptCodSub: 'Phnom Penh only',
      payOptKhqrTitle: 'Bakong KHQR',
      payOptKhqrSub: 'Scan to Pay via Bakong / ABA',
      payOptVetTitle: 'VET / J&T Express',
      payOptVetSub: 'Delivery across all 25 provinces',
      codPayHeading: 'Cash on Delivery (Grab Express)',
      codPayDesc: '🛵 Cash on Delivery (Grab Express): For Phnom Penh only.',
      vetPayHeading: 'Provincial Delivery (Virak Buntham / J&T)',
      vetPayDesc: '📦 Provincial Delivery (Virak Buntham / J&T): Delivery across all 25 provinces.',
      addressBranchHint: '💡 Branch / Campus or Home',
      addressPlaceholderVet: 'e.g. Province & Courier Branch / Campus (e.g. VET Siem Reap Branch) or Home Address...',
      addressPlaceholderDefault: 'House #, Street, Sangkat/Khan or Province...',
    },
    km: {
      langLabel: 'EN',
      langFlag: '🇬🇧',
      boutiqueSub: 'ហាងគ្រឿងអលង្ការ រាជធានីភ្នំពេញ',
      connecting: 'កំពុងតភ្ជាប់…',
      connected: 'បានភ្ជាប់',
      guestMode: 'ទស្សនាជាភ្ញៀវ',
      connectedBanner: 'បានភ្ជាប់: {id} · បង្កាន់ដៃបញ្ជាទិញផ្ញើចូល Messenger',
      guestBanner: 'ទស្សនាជាភ្ញៀវ (តម្រូវឱ្យបើកតាមតំណភ្ជាប់ដើម្បីកុម្ម៉ង់)',
      invalidBanner: 'តំណភ្ជាប់ Messenger មិនត្រឹមត្រូវ ឬផុតកំណត់',
      connErrorBanner: 'បញ្ហាក្នុងការតភ្ជាប់',
      promoTag: 'បណ្តុំគ្រឿងអលង្ការសុទ្ធ',
      promoTitle: 'សិប្បកម្មគ្រឿងអលង្ការខ្មែរប្រណិត',
      promoSub: 'ទូទាត់ផ្ទាល់តាម KHQR & ដឹកជញ្ជូនរហ័សប្រកបដោយទំនុកចិត្ត។',
      catAll: 'គ្រឿងអលង្ការទាំងអស់',
      catRing: '💍 ចិញ្ចៀន',
      catNecklace: '📿 ខ្សែក',
      catBracelet: '✨ ខ្សែដៃ',
      catEarring: '💎 ក្រវិល',
      rateDisplay: '១ ដុល្លារ = ៛៤,១០០',
      piecesCount: 'មាន {n} មុខសម្រាប់ជ្រើសរើស',
      inStock: 'មានក្នុងស្តុក',
      onlyLeft: 'នៅសល់តែ {n}',
      soldOut: 'អស់ពីស្តុក',
      addToBag: '+ ដាក់ចូលកន្ត្រក',
      bagLabel: 'កន្ត្រក:',
      viewCart: 'មើលកន្ត្រក',
      bagTitle: 'កន្ត្រកទិញទំនិញរបស់អ្នក',
      bagSub: 'ពិនិត្យទំនិញ & បំពេញព័ត៌មានដឹកជញ្ជូន',
      selectedPieces: 'ទំនិញដែលបានជ្រើសរើស',
      clearAll: 'សម្អាតទាំងអស់',
      emptyBag: 'កន្ត្រករបស់អ្នកទទេ',
      emptyBagSub: 'សូមជ្រើសរើសគ្រឿងអលង្ការពីបញ្ជីទំនិញដើម្បីបញ្ជាទិញ។',
      subtotal: 'តម្លៃទំនិញ',
      delivery: 'សេវាដឹកជញ្ជូន (ភ្នំពេញ & ខេត្ត)',
      freeDelivery: 'ឥតគិតថ្លៃ / ស្តង់ដារ',
      totalAmount: 'ចំនួនទឹកប្រាក់សរុប',
      authAlertTitle: 'តម្រូវឱ្យមានតំណភ្ជាប់ Messenger',
      authAlertText: 'ដើម្បីការពារការបញ្ជាទិញ និងទទួលបានបង្កាន់ដៃភ្លាមៗ សូមបើកហាងនេះចេញពីប្រអប់សារ Messenger នៃទំព័រ Facebook របស់យើង។',
      deliveryInfo: 'ព័ត៌មានដឹកជញ្ជូន',
      requiredNote: '* តម្រូវឱ្យបំពេញសម្រាប់ដឹកជញ្ជូន',
      fullName: 'ឈ្មោះពេញរបស់អ្នក *',
      namePlaceholder: 'ឧទាហរណ៍៖ កែវ ស្រីស្រស់',
      phone: 'លេខទូរស័ព្ទ (Cell / Telegram) *',
      phonePlaceholder: 'ឧទាហរណ៍៖ 012 345 678',
      address: 'អាសយដ្ឋានដឹកជញ្ជូន *',
      addressPlaceholder: 'ផ្ទះលេខ, ផ្លូវ, សង្កាត់/ខណ្ឌ ឬខេត្ត...',
      notes: 'សម្គាល់បន្ថែម (ស្រេចចិត្ត)',
      notesPlaceholder: 'ទំហំចិញ្ចៀន (ឧ. លេខ ៧), ខ្ចប់ជាកាដូ...',
      scanToPay: 'ស្កេនដើម្បីទូទាត់',
      merchant: 'ឈ្មោះគណនី:',
      totalDue: 'ត្រូវទូទាត់:',
      khqrNote: '💡 ទូទាត់តាមកម្មវិធី Bakong ណាមួយ (ABA, Wing, ACLEDA)។ ម្ចាស់ហាងនឹងពិនិត្យផ្ទៀងផ្ទាត់ការទូទាត់មុននឹងដឹកជញ្ជូន!',
      keepShopping: 'បន្តមើលទំនិញ',
      confirmOrder: 'បញ្ជាក់ការបញ្ជាទិញ ✨',
      submitting: 'កំពុងបញ្ជូនការបញ្ជាទិញ…',
      orderReceivedTag: 'បានទទួលការបញ្ជាទិញ',
      thankYou: 'សូមអរគុណ!',
      thankYouSub: 'ការបញ្ជាទិញគ្រឿងអលង្ការរបស់អ្នកបានជោគជ័យ។',
      orderRef: 'លេខកូដបញ្ជាទិញ:',
      orderTotal: 'ចំនួនទឹកប្រាក់សរុប:',
      orderStatus: 'ស្ថានភាព:',
      pendingVerification: 'រង់ចាំការផ្ទៀងផ្ទាត់ការទូទាត់',
      messengerNote: 'បង្កាន់ដៃបញ្ជាទិញត្រូវបានផ្ញើចូលក្នុង Messenger របស់អ្នកហើយ! ម្ចាស់ហាងនឹងពិនិត្យការទូទាត់ និងចាត់ចែងដឹកជញ្ជូន។',
      continueShopping: 'បន្តទិញទំនិញ ✨',
      clearBagConfirm: 'តើអ្នកពិតជាចង់លុបទំនិញទាំងអស់ចេញពីកន្ត្រកមែនទេ?',
      bagCleared: 'បានសម្អាតកន្ត្រកទំនិញរួចរាល់',
      addedToBag: 'បានដាក់ "{name}" ចូលកន្ត្រក!',
      removedItem: 'បានដក "{name}" ចេញ',
      stockLimit: 'ចំនួនដល់កម្រិតស្តុកហើយ (អតិបរមា {n})។',
      fillRequired: 'សូមបំពេញ ឈ្មោះ លេខទូរស័ព្ទ និងអាសយដ្ឋានដឹកជញ្ជូន។',
      noProducts: 'រកមិនឃើញគ្រឿងអលង្ការទេ',
      noProductsSub: 'មិនទាន់មានទំនិញក្នុងប្រភេទនេះនៅឡើយទេ។',
      paymentMethodTitle: 'វិធីសាស្ត្រដឹកជញ្ជូន & ទូទាត់',
      payOptCodTitle: 'ទូទាត់ពេលទំនិញដល់ (Grab COD)',
      payOptCodSub: 'សម្រាប់តែរាជធានីភ្នំពេញ',
      payOptKhqrTitle: 'បាគង KHQR',
      payOptKhqrSub: 'ស្កេនទូទាត់តាម ABA / បាគង',
      payOptVetTitle: 'វីរៈ ប៊ុនថាំ / J&T Express',
      payOptVetSub: 'ដឹកជញ្ជូនទូទាំង ២៥ ខេត្ត-ក្រុង',
      codPayHeading: 'ទូទាត់ពេលទំនិញដល់ (Grab Express)',
      codPayDesc: '🛵 Cash on Delivery (Grab Express): សម្រាប់តែរាជធានីភ្នំពេញប៉ុណ្ណោះ។',
      vetPayHeading: 'ផ្ញើតាមខេត្ត (វីរៈ ប៊ុនថាំ / J&T)',
      vetPayDesc: '📦 Provincial Delivery (Virak Buntham / J&T): សេវាផ្ញើទំនិញទូទាំង ២៥ ខេត្ត-ក្រុង។',
      addressBranchHint: '💡 ឈ្មោះសាខា ឬអាសយដ្ឋានផ្ទះ',
      addressPlaceholderVet: 'ឧ. ខេត្ត និងសាខាបញ្ញើ (ឧ. វីរៈ ប៊ុនថាំ សាខាសៀមរាប) ឬអាសយដ្ឋានផ្ទះ...',
      addressPlaceholderDefault: 'ផ្ទះលេខ, ផ្លូវ, សង្កាត់/ខណ្ឌ ឬខេត្ត...',
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
  const params = new URLSearchParams(window.location.search);
  const psid = params.get('psid');
  const sig = params.get('sig');

  let isVerified = false;
  let selectedPaymentMethod = 'COD';

  window.selectPaymentMethod = function (method) {
    const valid = ['COD', 'KHQR', 'VET'];
    selectedPaymentMethod = valid.includes(method) ? method : 'COD';

    const btnCod = document.getElementById('pay-opt-cod');
    const btnKhqr = document.getElementById('pay-opt-khqr');
    const btnVet = document.getElementById('pay-opt-vet');

    const boxCod = document.getElementById('payment-cod-box');
    const boxKhqr = document.getElementById('payment-khqr-box');
    const boxVet = document.getElementById('payment-vet-box');

    const addressBranchHint = document.getElementById('address-branch-hint');
    const addressInput = document.getElementById('cust-address');

    const setRadio = (btn, active, activeColor) => {
      if (!btn) return;
      const indicator = btn.querySelector('.radio-indicator');
      const dot = btn.querySelector('.radio-dot');
      if (active) {
        if (indicator) {
          indicator.className = `radio-indicator w-4 h-4 rounded-full border-2 border-${activeColor} flex items-center justify-center flex-shrink-0`;
        }
        if (dot) {
          dot.className = `radio-dot w-2 h-2 rounded-full bg-${activeColor}`;
          dot.classList.remove('hidden');
        }
      } else {
        if (indicator) {
          indicator.className = 'radio-indicator w-4 h-4 rounded-full border-2 border-slate-500 flex items-center justify-center flex-shrink-0';
        }
        if (dot) {
          dot.className = 'radio-dot hidden w-2 h-2 rounded-full';
        }
      }
    };

    if (selectedPaymentMethod === 'COD') {
      if (btnCod) btnCod.className = 'payment-method-pill active w-full flex items-center justify-between p-3 rounded-xl border border-amber-400 bg-amber-500/15 text-white transition text-left shadow-sm';
      if (btnKhqr) btnKhqr.className = 'payment-method-pill w-full flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white transition text-left';
      if (btnVet) btnVet.className = 'payment-method-pill w-full flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white transition text-left';

      setRadio(btnCod, true, 'amber-400');
      setRadio(btnKhqr, false);
      setRadio(btnVet, false);

      if (boxCod) boxCod.classList.remove('hidden');
      if (boxKhqr) boxKhqr.classList.add('hidden');
      if (boxVet) boxVet.classList.add('hidden');

      if (addressBranchHint) addressBranchHint.classList.add('hidden');
      if (addressInput) addressInput.placeholder = t('addressPlaceholderDefault');
    } else if (selectedPaymentMethod === 'KHQR') {
      if (btnCod) btnCod.className = 'payment-method-pill w-full flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white transition text-left';
      if (btnKhqr) btnKhqr.className = 'payment-method-pill active w-full flex items-center justify-between p-3 rounded-xl border border-[#c9a84c] bg-[#c9a84c]/20 text-white transition text-left shadow-sm';
      if (btnVet) btnVet.className = 'payment-method-pill w-full flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white transition text-left';

      setRadio(btnCod, false);
      setRadio(btnKhqr, true, '[#c9a84c]');
      setRadio(btnVet, false);

      if (boxCod) boxCod.classList.add('hidden');
      if (boxKhqr) boxKhqr.classList.remove('hidden');
      if (boxVet) boxVet.classList.add('hidden');

      if (addressBranchHint) addressBranchHint.classList.add('hidden');
      if (addressInput) addressInput.placeholder = t('addressPlaceholderDefault');
    } else if (selectedPaymentMethod === 'VET') {
      if (btnCod) btnCod.className = 'payment-method-pill w-full flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white transition text-left';
      if (btnKhqr) btnKhqr.className = 'payment-method-pill w-full flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white transition text-left';
      if (btnVet) btnVet.className = 'payment-method-pill active w-full flex items-center justify-between p-3 rounded-xl border border-indigo-400 bg-indigo-500/20 text-white transition text-left shadow-sm';

      setRadio(btnCod, false);
      setRadio(btnKhqr, false);
      setRadio(btnVet, true, 'indigo-400');

      if (boxCod) boxCod.classList.add('hidden');
      if (boxKhqr) boxKhqr.classList.add('hidden');
      if (boxVet) boxVet.classList.remove('hidden');

      if (addressBranchHint) addressBranchHint.classList.remove('hidden');
      if (addressInput) addressInput.placeholder = t('addressPlaceholderVet');
    }
  };
  let productsList = [];
  let currentCategory = 'ALL';
  let searchQuery = '';
  let categoriesList = [];
  let cart = [];
  // ── Style Modal State (multi-select redesign) ──
  let styleModalState = {
    product: null,
    selectedVariants: new Map(), // variantId → { variant, qty }
    focusedVariantIndex: 0,      // index in variant_list for swipe gallery
    swipeStartX: 0,
    swipeCurrentX: 0,
    isSwiping: false,
  };

  const CART_STORAGE_KEY = `luxe_cart_${psid || 'guest'}`;

  // DOM Elements
  const langFlag = document.getElementById('lang-flag');
  const langLabel = document.getElementById('lang-label');
  const headerConnBadge = document.getElementById('header-conn-badge');
  const authBanner = document.getElementById('auth-banner');
  const authBannerIcon = document.getElementById('auth-banner-icon');
  const authBannerText = document.getElementById('auth-banner-text');

  const customerSearchInput = document.getElementById('customer-search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const categoryPillsContainer = document.getElementById('category-pills');

  const catalogHeaderBar = document.getElementById('catalog-header-bar');
  const catalogCountLabel = document.getElementById('catalog-count-label');
  const catalogSections = document.getElementById('catalog-sections');
  const productGrid = document.getElementById('product-grid');
  const emptyState = document.getElementById('empty-state');
  const emptyStateTitle = document.getElementById('empty-state-title');
  const emptyStateDesc = document.getElementById('empty-state-desc');

  const bottomBar = document.getElementById('bottom-bar');
  const barCartCount = document.getElementById('bar-cart-count');
  const barCartUsd = document.getElementById('bar-cart-usd');
  const barCartKhr = document.getElementById('bar-cart-khr');

  // Style Selection Modal (outer container only; content built dynamically by buildStyleModalDOM)
  const styleModal = document.getElementById('style-modal');


  // Cart & Checkout Elements
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

  // Language Toggle Handler
  window.toggleLanguage = function () {
    currentLang = currentLang === 'en' ? 'km' : 'en';
    localStorage.setItem('luxe_lang', currentLang);
    applyLanguage();
    showToast(currentLang === 'km' ? 'បានប្តូរទៅជា ភាសាខ្មែរ 🇰🇭' : 'Switched to English 🇬🇧', 'info');
  };

  function applyLanguage() {
    langFlag.textContent = t('langFlag');
    langLabel.textContent = t('langLabel');

    // Refresh Category Pills
    renderCategoryPills();

    // Form placeholders & labels
    const nameInput = document.getElementById('cust-name');
    const phoneInput = document.getElementById('cust-phone');
    const addressInput = document.getElementById('cust-address');
    const noteInput = document.getElementById('cust-note');

    if (nameInput) nameInput.placeholder = t('namePlaceholder');
    if (phoneInput) phoneInput.placeholder = t('phonePlaceholder');
    if (addressInput) addressInput.placeholder = t('addressPlaceholder');
    if (noteInput) noteInput.placeholder = t('notesPlaceholder');

    // Payment labels
    const payTitle = document.getElementById('payment-method-title');
    const payCodTitle = document.getElementById('pay-opt-cod-title');
    const payCodSub = document.getElementById('pay-opt-cod-sub');
    const payKhqrTitle = document.getElementById('pay-opt-khqr-title');
    const payKhqrSub = document.getElementById('pay-opt-khqr-sub');
    const payVetTitle = document.getElementById('pay-opt-vet-title');
    const payVetSub = document.getElementById('pay-opt-vet-sub');
    const codHeading = document.getElementById('cod-pay-heading');
    const codDesc = document.getElementById('cod-pay-desc');
    const vetHeading = document.getElementById('vet-pay-heading');
    const vetDesc = document.getElementById('vet-pay-desc');
    const branchHint = document.getElementById('address-branch-hint');

    if (payTitle) payTitle.textContent = t('paymentMethodTitle');
    if (payCodTitle) payCodTitle.textContent = t('payOptCodTitle');
    if (payCodSub) payCodSub.textContent = t('payOptCodSub');
    if (payKhqrTitle) payKhqrTitle.textContent = t('payOptKhqrTitle');
    if (payKhqrSub) payKhqrSub.textContent = t('payOptKhqrSub');
    if (payVetTitle) payVetTitle.textContent = t('payOptVetTitle');
    if (payVetSub) payVetSub.textContent = t('payOptVetSub');
    if (codHeading) codHeading.textContent = t('codPayHeading');
    if (codDesc) codDesc.textContent = t('codPayDesc');
    if (vetHeading) vetHeading.textContent = t('vetPayHeading');
    if (vetDesc) vetDesc.textContent = t('vetPayDesc');
    if (branchHint) branchHint.textContent = t('addressBranchHint');

    // Refresh selection visual state and placeholders
    window.selectPaymentMethod(selectedPaymentMethod);

    // Buttons
    submitOrderText.textContent = t('confirmOrder');
    const barCheckoutBtn = document.getElementById('bar-checkout-btn');
    if (barCheckoutBtn) {
      barCheckoutBtn.innerHTML = `<span>${t('viewCart')}</span><span class="text-sm">🛍️</span>`;
    }

    // Refresh UI elements
    renderAuthStatus(isVerified);
    renderProducts();
    updateCartUI();
  }

  // Identity Verification
  async function verifyIdentity() {
    if (!psid || !sig) {
      isVerified = false;
      renderAuthStatus(false);
      return;
    }

    try {
      const res = await fetch(`/api/identity?psid=${encodeURIComponent(psid)}&sig=${encodeURIComponent(sig)}`);
      const data = await res.json();

      if (data.verified) {
        isVerified = true;
        renderAuthStatus(true);
      } else {
        isVerified = false;
        renderAuthStatus(false, t('invalidBanner'));
      }
    } catch (err) {
      isVerified = false;
      renderAuthStatus(false, t('connErrorBanner'));
    }
  }

  function renderAuthStatus(verified, customMsg) {
    if (verified) {
      const displayId = psid && psid.length > 10 ? `${psid.slice(0, 6)}…${psid.slice(-4)}` : (psid || '');
      headerConnBadge.className = 'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60';
      headerConnBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span> ${t('connected')}`;

      authBanner.className = 'max-w-md mx-auto px-4 py-2 text-xs flex items-center justify-between border-b transition-colors bg-emerald-950/40 text-emerald-300 border-emerald-800/40';
      authBannerIcon.textContent = '✅';
      authBannerText.innerHTML = `<strong>${t('connectedBanner', { id: displayId })}</strong>`;

      checkoutAuthAlert.classList.add('hidden');
      submitOrderBtn.disabled = false;
    } else {
      headerConnBadge.className = 'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-700/60';
      headerConnBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></span> ${t('guestMode')}`;

      authBanner.className = 'max-w-md mx-auto px-4 py-2 text-xs flex items-center justify-between border-b transition-colors bg-amber-950/30 text-amber-300/90 border-amber-800/30';
      authBannerIcon.textContent = '📱';
      authBannerText.innerHTML = `<strong>${customMsg || t('guestBanner')}</strong>`;

      checkoutAuthAlert.classList.remove('hidden');
      submitOrderBtn.disabled = true;
    }
  }

  // ─── Categories & Catalog Loading ──────────────────────────────────────────

  async function loadCategories() {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          categoriesList = data.map((c) => c.name);
        }
      }
    } catch (e) {}

    // Fallback: extract from productsList if empty
    if (categoriesList.length === 0 && productsList.length > 0) {
      const cats = new Set(productsList.map((p) => p.category).filter(Boolean));
      categoriesList = Array.from(cats);
    }

    renderCategoryPills();
  }

  function renderCategoryPills() {
    if (!categoryPillsContainer) return;

    const catMap = {
      ALL: t('catAll') || 'All Pieces',
      Ring: '💍 ' + (t('catRing') || 'Rings'),
      Necklace: '📿 ' + (t('catNecklace') || 'Necklaces'),
      Bracelet: '✨ ' + (t('catBracelet') || 'Bracelets'),
      Earring: '💎 ' + (t('catEarring') || 'Earrings'),
    };

    const displayCategories = ['ALL', ...categoriesList];

    categoryPillsContainer.innerHTML = displayCategories.map((cat) => {
      const isActive = cat === currentCategory;
      const label = catMap[cat] || `✦ ${escapeHtml(cat)}`;
      return `
        <button class="category-pill ${isActive ? 'active' : ''} flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold"
          data-category="${escapeHtml(cat)}"
          onclick="window.selectCategory('${escapeHtml(cat)}')">
          ${label}
        </button>
      `;
    }).join('');
  }

  window.selectCategory = function (cat) {
    currentCategory = cat;
    renderCategoryPills();
    renderProducts();
  };

  // ─── Search Handlers ────────────────────────────────────────────────────────

  let searchDebounceTimer = null;
  if (customerSearchInput) {
    customerSearchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        searchQuery = (e.target.value || '').trim().toLowerCase();
        if (searchClearBtn) {
          if (searchQuery.length > 0) searchClearBtn.classList.remove('hidden');
          else searchClearBtn.classList.add('hidden');
        }
        renderProducts();
      }, 150);
    });
  }

  window.clearCustomerSearch = function () {
    if (customerSearchInput) customerSearchInput.value = '';
    searchQuery = '';
    if (searchClearBtn) searchClearBtn.classList.add('hidden');
    renderProducts();
  };

  window.resetCatalogView = function () {
    window.clearCustomerSearch();
    window.selectCategory('ALL');
  };

  // ─── Catalog Loading & Rendering ───────────────────────────────────────────

  async function loadCatalog() {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to load products');
      productsList = await res.json();
      await loadCategories();
      renderProducts();
    } catch (err) {
      if (productGrid) {
        productGrid.innerHTML = `
          <div class="col-span-2 text-center py-12 text-slate-400">
            <p class="text-sm">${t('noProducts')}</p>
            <button onclick="loadCatalog()" class="mt-3 text-xs text-[#c9a84c] underline">Tap to retry</button>
          </div>
        `;
      }
    }
  }

  function renderProductCard(product) {
    const isSoldOut = product.stock <= 0;
    const isLowStock = product.stock > 0 && product.stock <= 3;
    const hasVariants = Array.isArray(product.variant_list) && product.variant_list.length > 0;

    let displayPhoto = product.photo_url || DEFAULT_IMAGE;
    let priceUsdText = '';
    let priceKhrText = '';

    if (hasVariants) {
      const prices = product.variant_list.map((v) => Number(v.sell_price));
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const defaultVariant = product.variant_list.find((v) => v.stock > 0) || product.variant_list[0];
      if (defaultVariant && defaultVariant.photo_url) {
        displayPhoto = defaultVariant.photo_url;
      }

      if (minPrice !== maxPrice) {
        priceUsdText = `${formatUSD(minPrice)} – ${formatUSD(maxPrice)}`;
        priceKhrText = `${formatKHR(minPrice)} – ${formatKHR(maxPrice)}`;
      } else {
        priceUsdText = formatUSD(minPrice);
        priceKhrText = formatKHR(minPrice);
      }
    } else {
      priceUsdText = formatUSD(product.sell_price);
      priceKhrText = formatKHR(product.sell_price);
    }

    return `
      <div class="product-card rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer group"
        id="card-${product.id}"
        onclick="window.openStyleModal('${product.id}')">
        <div>
          <!-- Image Container -->
          <div class="relative w-full aspect-square bg-slate-900 overflow-hidden">
            <img id="card-img-${product.id}" src="${displayPhoto}" alt="${escapeHtml(product.name)}" loading="lazy"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onerror="this.onerror=null;this.src='${DEFAULT_IMAGE}'">
            
            <!-- Stock Badge -->
            <div class="absolute top-2 left-2" id="card-stock-${product.id}">
              ${
                isSoldOut
                  ? `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-950/90 text-rose-300 border border-rose-800/80 backdrop-blur-sm">${t('soldOut')}</span>`
                  : isLowStock
                  ? `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950/90 text-amber-300 border border-amber-800/80 backdrop-blur-sm">${t('onlyLeft', { n: product.stock })}</span>`
                  : `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 backdrop-blur-sm">${t('inStock')}</span>`
              }
            </div>

            <!-- SKU pill -->
            <div class="absolute top-2 right-2">
              <span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/60 text-slate-300 backdrop-blur-sm">
                ${product.id}
              </span>
            </div>

            <!-- Styles Pill on photo if multi-variant -->
            ${hasVariants ? `
              <div class="absolute bottom-2 right-2">
                <span class="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-black/75 text-[#f3d489] border border-[#c9a84c]/30 backdrop-blur-sm">
                  ✨ ${product.variant_list.length} Styles
                </span>
              </div>
            ` : ''}
          </div>

          <!-- Details -->
          <div class="p-2 pb-0.5">
            <span class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">
              ${product.category || 'Jewelry'}
            </span>
            <h3 class="text-xs font-bold text-white leading-snug line-clamp-1 mb-1">
              ${escapeHtml(product.name)}
            </h3>

            <!-- Dual Currency Pricing -->
            <div class="mt-1.5">
              <div class="text-sm font-extrabold text-white leading-tight" id="card-price-usd-${product.id}">
                ${priceUsdText}
              </div>
            </div>
          </div>
        </div>

        <!-- Add Button -->
        <div class="p-2 pt-1">
          <button type="button"
            ${isSoldOut ? 'disabled' : ''}
            onclick="event.stopPropagation(); window.openStyleModal('${product.id}')"
            class="${isSoldOut ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'btn-gold'} w-full py-1.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1">
            <span>${isSoldOut ? t('soldOut') : (hasVariants ? '✨ Select Style' : t('addToBag'))}</span>
          </button>
        </div>
      </div>
    `;
  }

  function renderProducts() {
    let filtered = productsList;

    // 1. Filter by category if not ALL
    if (currentCategory !== 'ALL') {
      filtered = filtered.filter((p) => p.category === currentCategory);
    }

    // 2. Filter by search query if active
    if (searchQuery) {
      filtered = filtered.filter((p) => {
        const matchName = (p.name || '').toLowerCase().includes(searchQuery);
        const matchSku = (p.id || '').toLowerCase().includes(searchQuery);
        const matchCat = (p.category || '').toLowerCase().includes(searchQuery);
        const matchVariant = Array.isArray(p.variant_list) && p.variant_list.some((v) =>
          (v.color_name || '').toLowerCase().includes(searchQuery)
        );
        return matchName || matchSku || matchCat || matchVariant;
      });
    }

    // Update count label
    catalogCountLabel.textContent = t('piecesCount', { n: filtered.length, s: filtered.length === 1 ? '' : 's' });

    // Empty state check
    if (filtered.length === 0) {
      productGrid.innerHTML = '';
      productGrid.classList.remove('hidden');
      if (catalogSections) catalogSections.classList.add('hidden');
      emptyState.classList.remove('hidden');
      if (searchQuery) {
        if (emptyStateTitle) emptyStateTitle.textContent = 'No matching jewelry';
        if (emptyStateDesc) emptyStateDesc.textContent = `No items found matching "${searchQuery}".`;
      } else {
        if (emptyStateTitle) emptyStateTitle.textContent = t('noProducts');
        if (emptyStateDesc) emptyStateDesc.textContent = 'There are no items currently available in this category.';
      }
      return;
    }

    emptyState.classList.add('hidden');

    // 3. Curated Section Stack View (Active when currentCategory === 'ALL' and NO search query)
    if (currentCategory === 'ALL' && !searchQuery) {
      productGrid.classList.add('hidden');
      if (catalogSections) {
        catalogSections.classList.remove('hidden');
        renderCuratedSections(filtered);
      }
    } else {
      // 4. Standard 2-Column Grid (when specific category selected or searching)
      if (catalogSections) catalogSections.classList.add('hidden');
      productGrid.classList.remove('hidden');
      productGrid.innerHTML = filtered.map((p) => renderProductCard(p)).join('');
    }
  }

  function renderCuratedSections(allProducts) {
    if (!catalogSections) return;

    // Group products by category
    const catMap = new Map();
    for (const p of allProducts) {
      const cat = p.category || 'Jewelry';
      if (!catMap.has(cat)) catMap.set(cat, []);
      catMap.get(cat).push(p);
    }

    const catIconMap = {
      Ring: '💍',
      Necklace: '📿',
      Bracelet: '✨',
      Earring: '💎',
    };

    let html = '';
    for (const [catName, items] of catMap.entries()) {
      if (items.length === 0) continue;
      const icon = catIconMap[catName] || '✦';
      const previewItems = items.slice(0, 4); // Featured 4 items per section

      html += `
        <section class="category-curated-block">
          <div class="section-header">
            <div class="flex items-center space-x-2">
              <span class="text-base">${icon}</span>
              <h3 class="text-sm font-bold text-white tracking-wide">
                ${escapeHtml(catName)}
                <span class="text-[11px] font-normal text-slate-400 ml-1">(${items.length})</span>
              </h3>
            </div>
            <button type="button" onclick="window.selectCategory('${escapeHtml(catName)}')"
              class="section-explore-link">
              <span>Explore All</span>
              <span class="text-xs">→</span>
            </button>
          </div>
          <div class="grid grid-cols-3 gap-2">
            ${previewItems.map((p) => renderProductCard(p)).join('')}
          </div>
        </section>
      `;
    }

    catalogSections.innerHTML = html;
  }

  // ─── Style Selection Modal Logic (Swipeable Gallery + Multi-Select) ─────────

  window.openStyleModal = function (productId, defaultVariantId) {
    const product = productsList.find((p) => p.id === productId);
    if (!product) return;

    const hasVariants = Array.isArray(product.variant_list) && product.variant_list.length > 0;

    // Reset state for this product
    styleModalState = {
      product,
      selectedVariants: new Map(),
      focusedVariantIndex: 0,
      currentTrackPos: 1,
      isAnimating: false,
      swipeStartX: 0,
      swipeStartY: 0,
      swipeCurrentX: 0,
      isSwiping: false,
      isScrollLocked: false,
    };

    // Find default focused index
    if (hasVariants) {
      let defaultIdx = 0;
      if (defaultVariantId) {
        const idx = product.variant_list.findIndex((v) => v.id === defaultVariantId);
        if (idx >= 0) defaultIdx = idx;
      } else {
        const firstAvail = product.variant_list.findIndex((v) => v.stock > 0);
        if (firstAvail >= 0) defaultIdx = firstAvail;
      }
      styleModalState.focusedVariantIndex = defaultIdx;
      styleModalState.currentTrackPos = product.variant_list.length > 1 ? defaultIdx + 1 : 0;
    }

    buildStyleModalDOM();
    if (styleModal) styleModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    pushModalState('style-modal');
  };

  window.closeStyleModal = function (syncHistory = true) {
    if (styleModal) styleModal.classList.add('hidden');
    document.body.style.overflow = '';
    if (syncHistory) {
      closeModalState('style-modal');
    }
  };

  // ── Gallery Infinite Carousel Helpers ─────────────────────────────────────
  function updateGalleryDetails(focusedIdx) {
    const { product } = styleModalState;
    if (!product) return;
    const hasVariants = Array.isArray(product.variant_list) && product.variant_list.length > 0;
    if (!hasVariants) return;

    const v = product.variant_list[focusedIdx];
    if (!v) return;

    // 1. Stock badge
    const badge = document.getElementById('sm-stock-badge');
    if (badge) {
      if (v.stock <= 0) {
        badge.innerHTML = `<span class="sm-badge sm-badge-red">${t('soldOut')}</span>`;
      } else if (v.stock <= 3) {
        badge.innerHTML = `<span class="sm-badge sm-badge-amber">${t('onlyLeft', { n: v.stock })}</span>`;
      } else {
        badge.innerHTML = `<span class="sm-badge sm-badge-green">${t('inStock')}</span>`;
      }
    }

    // 2. SKU
    const skuEl = document.getElementById('sm-sku');
    if (skuEl) skuEl.textContent = v.id;

    // 3. Dots
    const dots = document.querySelectorAll('.sm-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('sm-dot-active', i === focusedIdx);
    });

    // 4. Prices
    const priceUsd = document.getElementById('sm-price-usd');
    const priceKhr = document.getElementById('sm-price-khr');
    if (priceUsd) priceUsd.textContent = formatUSD(v.sell_price);
    if (priceKhr) priceKhr.textContent = formatKHR(v.sell_price);

    // 5. Name
    const nameLabel = document.getElementById('sm-focused-name');
    if (nameLabel) nameLabel.innerHTML = `<span>✨</span> <span>${escapeHtml(v.color_name)}</span>`;

    // 6. Highlight focused tile ring & auto-scroll into view in horizontal reel
    product.variant_list.forEach((variant, i) => {
      const tile = document.getElementById(`sm-tile-${variant.id}`);
      if (tile) {
        tile.classList.toggle('sm-tile-focused', i === focusedIdx);
        if (i === focusedIdx) {
          tile.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }
    });
  }

  function galleryGoTo(targetIdx) {
    const { product } = styleModalState;
    if (!product || !Array.isArray(product.variant_list)) return;
    const N = product.variant_list.length;
    if (N < 2) return;
    const track = document.getElementById('sm-gallery-track');
    if (!track) return;

    styleModalState.isAnimating = true;
    setTimeout(() => { styleModalState.isAnimating = false; }, 350);

    styleModalState.focusedVariantIndex = targetIdx;
    styleModalState.currentTrackPos = targetIdx + 1;
    track.style.transition = 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)';
    track.style.transform = `translateX(-${(targetIdx + 1) * 100}%)`;
    updateGalleryDetails(targetIdx);
  }

  window.galleryGoTo = galleryGoTo;

  window.smGalleryNext = function (e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const { product, isAnimating } = styleModalState;
    if (!product || !Array.isArray(product.variant_list)) return;
    const N = product.variant_list.length;
    if (N < 2 || isAnimating) return;

    const track = document.getElementById('sm-gallery-track');
    if (!track) return;

    styleModalState.isAnimating = true;
    setTimeout(() => { styleModalState.isAnimating = false; }, 350);

    styleModalState.currentTrackPos += 1;
    const nextPos = styleModalState.currentTrackPos;

    track.style.transition = 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)';
    track.style.transform = `translateX(-${nextPos * 100}%)`;

    // Seamless loop logical index: if beyond real slides, it's slide 0
    const logicalIdx = nextPos > N ? 0 : nextPos - 1;
    styleModalState.focusedVariantIndex = logicalIdx;
    updateGalleryDetails(logicalIdx);
  };

  window.smGalleryPrev = function (e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const { product, isAnimating } = styleModalState;
    if (!product || !Array.isArray(product.variant_list)) return;
    const N = product.variant_list.length;
    if (N < 2 || isAnimating) return;

    const track = document.getElementById('sm-gallery-track');
    if (!track) return;

    styleModalState.isAnimating = true;
    setTimeout(() => { styleModalState.isAnimating = false; }, 350);

    styleModalState.currentTrackPos -= 1;
    const prevPos = styleModalState.currentTrackPos;

    track.style.transition = 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)';
    track.style.transform = `translateX(-${prevPos * 100}%)`;

    // Seamless loop logical index: if before real slides, it's slide N-1
    const logicalIdx = prevPos < 1 ? N - 1 : prevPos - 1;
    styleModalState.focusedVariantIndex = logicalIdx;
    updateGalleryDetails(logicalIdx);
  };

  // ── Build the full modal DOM (called once per open) ─────────────────────
  function buildStyleModalDOM() {
    const { product, focusedVariantIndex } = styleModalState;
    if (!product) return;
    const hasVariants = Array.isArray(product.variant_list) && product.variant_list.length > 0;
    const variants = hasVariants ? product.variant_list : [];
    const N = variants.length;

    // ── Gallery images with infinite clones when N > 1 ──
    let gallerySlides = '';
    let initialTransform = 'translateX(0)';

    if (hasVariants) {
      if (N > 1) {
        const lastV = variants[N - 1];
        const firstV = variants[0];
        const cloneLast = `<div class="sm-slide" data-clone="last"><img src="${lastV.photo_url || product.photo_url || DEFAULT_IMAGE}" alt="${escapeHtml(lastV.color_name)}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='${DEFAULT_IMAGE}'"></div>`;
        const cloneFirst = `<div class="sm-slide" data-clone="first"><img src="${firstV.photo_url || product.photo_url || DEFAULT_IMAGE}" alt="${escapeHtml(firstV.color_name)}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='${DEFAULT_IMAGE}'"></div>`;
        const realSlides = variants.map((v, i) => {
          const photo = v.photo_url || product.photo_url || DEFAULT_IMAGE;
          return `<div class="sm-slide" data-index="${i}"><img src="${photo}" alt="${escapeHtml(v.color_name)}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='${DEFAULT_IMAGE}'"></div>`;
        }).join('');
        gallerySlides = cloneLast + realSlides + cloneFirst;
        styleModalState.currentTrackPos = focusedVariantIndex + 1;
        initialTransform = `translateX(-${(focusedVariantIndex + 1) * 100}%)`;
      } else {
        const v = variants[0];
        gallerySlides = `<div class="sm-slide" data-index="0"><img src="${v.photo_url || product.photo_url || DEFAULT_IMAGE}" alt="${escapeHtml(v.color_name)}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='${DEFAULT_IMAGE}'"></div>`;
        styleModalState.currentTrackPos = 0;
        initialTransform = 'translateX(0)';
      }
    } else {
      gallerySlides = `<div class="sm-slide" data-index="0"><img src="${product.photo_url || DEFAULT_IMAGE}" alt="${escapeHtml(product.name)}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='${DEFAULT_IMAGE}'"></div>`;
      styleModalState.currentTrackPos = 0;
      initialTransform = 'translateX(0)';
    }

    const initialV = hasVariants ? variants[focusedVariantIndex] : null;
    const initStock = initialV ? initialV.stock : product.stock;
    const initPrice = initialV ? Number(initialV.sell_price) : Number(product.sell_price);

    const stockBadgeHtml = initStock <= 0
      ? `<span class="sm-badge sm-badge-red">${t('soldOut')}</span>`
      : initStock <= 3
      ? `<span class="sm-badge sm-badge-amber">${t('onlyLeft', { n: initStock })}</span>`
      : `<span class="sm-badge sm-badge-green">${t('inStock')}</span>`;

    // ── Pagination dots (visual indicator only, non-clickable) ──
    const dotsHtml = hasVariants && N > 1
      ? `<div class="sm-dots">${variants.map((_, i) => `<span class="sm-dot ${i === focusedVariantIndex ? 'sm-dot-active' : ''}"></span>`).join('')}</div>`
      : '';

    // ── Nav arrows (modern luxury glass buttons with SVG chevrons) ──
    const arrowsHtml = hasVariants && N > 1 ? `
      <button type="button" class="sm-arrow sm-arrow-left" onclick="window.smGalleryPrev(event)" aria-label="Previous style">
        <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button type="button" class="sm-arrow sm-arrow-right" onclick="window.smGalleryNext(event)" aria-label="Next style">
        <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    ` : '';

    // ── Style tiles (multi-select) ──
    const tilesHtml = hasVariants
      ? `<div id="sm-tiles" class="sm-tiles-grid">${variants.map((v) => renderStyleTileHTML(v)).join('')}</div>`
      : '';

    // ── Global quantity stepper (only for single-variant/no-variant products) ──
    const qtyStepperHtml = !hasVariants ? `
      <div class="sm-qty-row">
        <span class="text-xs font-semibold text-slate-300">Quantity</span>
        <div class="flex items-center space-x-3">
          <button type="button" onclick="window.smChangeQty(-1)" class="sm-qty-btn">−</button>
          <span id="sm-qty" class="text-xs font-extrabold text-white w-5 text-center">1</span>
          <button type="button" onclick="window.smChangeQty(1)" class="sm-qty-btn">+</button>
        </div>
      </div>
    ` : '';

    // ── Assemble into the modal scrollable content ──
    const scrollEl = document.querySelector('#style-modal .modal-sheet > div.overflow-y-auto');
    if (!scrollEl) return;

    scrollEl.innerHTML = `
      <!-- Swipeable Gallery -->
      <div class="sm-gallery" id="sm-gallery"
        data-product-id="${product.id}"
        ontouchstart="window.smTouchStart(event)"
        ontouchmove="window.smTouchMove(event)"
        ontouchend="window.smTouchEnd(event)">

        <div class="sm-gallery-track" id="sm-gallery-track"
          style="transform: ${initialTransform}; transition: none;">
          ${gallerySlides}
        </div>

        <!-- Stock + SKU overlay -->
        <div id="sm-stock-badge" class="absolute top-2.5 left-2.5">${stockBadgeHtml}</div>
        <div class="absolute top-2.5 right-2.5">
          <span id="sm-sku" class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/70 text-slate-300 backdrop-blur-sm">${initialV ? initialV.id : product.id}</span>
        </div>

        ${arrowsHtml}
        ${dotsHtml}
      </div>

      <!-- Product Info (Split Two-Column Luxury Layout) -->
      <div class="flex items-start justify-between gap-3 pt-0.5">
        <div class="min-w-0 flex-1">
          <h2 id="style-modal-title" class="text-sm font-extrabold text-white leading-snug truncate">${escapeHtml(product.name)}</h2>
          ${hasVariants ? `<p id="sm-focused-name" class="text-xs text-[#f3d489] font-semibold mt-0.5 flex items-center space-x-1 truncate"><span>✨</span> <span>${escapeHtml(initialV ? initialV.color_name : '')}</span></p>` : ''}
        </div>
        <div class="text-right flex-shrink-0">
          <div id="sm-price-usd" class="text-base font-extrabold text-white leading-none">${formatUSD(initPrice)}</div>
          <div id="sm-price-khr" class="text-[11px] font-semibold text-[#e5c36a] mt-0.5">${formatKHR(initPrice)}</div>
        </div>
      </div>

      ${hasVariants ? `
        <!-- Multi-select style tiles -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Select Styles:</label>
            <span id="sm-selection-count" class="text-[10px] text-[#f3d489] font-semibold"></span>
          </div>
          ${tilesHtml}
          <p class="text-[10px] text-slate-500 mt-1.5 text-center">Swipe to explore styles · Tap to select</p>
        </div>
      ` : ''}

      ${qtyStepperHtml}
    `;

    // Seamless loop transitionend listener
    const track = document.getElementById('sm-gallery-track');
    if (track && hasVariants && N > 1) {
      track.addEventListener('transitionend', (e) => {
        if (e.target !== track || e.propertyName !== 'transform') return;
        const { product, currentTrackPos } = styleModalState;
        if (!product || !Array.isArray(product.variant_list)) return;
        const total = product.variant_list.length;
        if (total < 2) return;

        if (currentTrackPos >= total + 1) {
          // Wrapped past the end to cloned first slide -> silently jump to real first slide
          track.style.transition = 'none';
          styleModalState.currentTrackPos = 1;
          track.style.transform = 'translateX(-100%)';
          void track.offsetHeight;
        } else if (currentTrackPos <= 0) {
          // Wrapped before the start to cloned last slide -> silently jump to real last slide
          track.style.transition = 'none';
          styleModalState.currentTrackPos = total;
          track.style.transform = `translateX(-${total * 100}%)`;
          void track.offsetHeight;
        }
        styleModalState.isAnimating = false;
      });
    }

    renderStyleTiles();
    renderModalAddBtn();
  }

  function renderStyleTileHTML(v) {
    const isOut = v.stock <= 0;
    return `
      <div class="sm-style-tile ${isOut ? 'sm-tile-sold' : ''}" id="sm-tile-${v.id}"
        onclick="window.smToggleTile('${v.id}')">
        <div class="sm-tile-img-wrap">
          <img src="${v.photo_url || DEFAULT_IMAGE}" alt="${escapeHtml(v.color_name)}" loading="lazy"
            class="w-full h-full object-cover"
            onerror="this.onerror=null;this.src='${DEFAULT_IMAGE}'">
          <div class="sm-tile-check" id="sm-check-${v.id}">✓</div>
          ${isOut ? '<div class="sm-tile-sold-label">Sold Out</div>' : ''}
        </div>
        <div class="sm-tile-info">
          <span class="sm-tile-name">${escapeHtml(v.color_name)}</span>
          <span class="sm-tile-price">${formatUSD(v.sell_price)}</span>
        </div>
        <!-- Per-tile qty stepper (shown when selected) -->
        <div class="sm-tile-qty" id="sm-tile-qty-${v.id}">
          <button class="sm-tile-qty-btn" onclick="event.stopPropagation(); window.smTileQty('${v.id}', -1)">−</button>
          <span id="sm-tile-qty-val-${v.id}" class="sm-tile-qty-val">1</span>
          <button class="sm-tile-qty-btn" onclick="event.stopPropagation(); window.smTileQty('${v.id}', 1)">+</button>
        </div>
      </div>
    `;
  }

  function renderStyleTiles() {
    const { product, selectedVariants } = styleModalState;
    if (!product || !product.variant_list) return;
    product.variant_list.forEach((v) => {
      const tile = document.getElementById(`sm-tile-${v.id}`);
      if (!tile) return;
      const isSel = selectedVariants.has(v.id);
      tile.classList.toggle('sm-tile-selected', isSel);
      const checkEl = document.getElementById(`sm-check-${v.id}`);
      if (checkEl) checkEl.classList.toggle('sm-check-visible', isSel);
      const qtyEl = document.getElementById(`sm-tile-qty-${v.id}`);
      if (qtyEl) qtyEl.classList.toggle('sm-tile-qty-visible', isSel);
      if (isSel) {
        const qtyVal = document.getElementById(`sm-tile-qty-val-${v.id}`);
        if (qtyVal) qtyVal.textContent = selectedVariants.get(v.id).qty;
      }
    });
    // Highlight focused variant's tile with a subtle ring
    const focusedV = product.variant_list[styleModalState.focusedVariantIndex];
    product.variant_list.forEach((v, i) => {
      const tile = document.getElementById(`sm-tile-${v.id}`);
      if (!tile) return;
      tile.classList.toggle('sm-tile-focused', i === styleModalState.focusedVariantIndex);
    });
  }

  function renderModalAddBtn() {
    const { product, selectedVariants } = styleModalState;
    if (!product) return;
    const hasVariants = Array.isArray(product.variant_list) && product.variant_list.length > 0;
    const btn = document.getElementById('style-modal-add-btn');
    if (!btn) return;

    if (hasVariants) {
      if (selectedVariants.size === 0) {
        btn.disabled = false;
        btn.className = 'btn-gold-outline w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2';
        btn.innerHTML = '<span>Select a style above to add to bag</span>';
      } else {
        const totalQty = [...selectedVariants.values()].reduce((s, e) => s + e.qty, 0);
        const totalPrice = [...selectedVariants.values()].reduce((s, e) => s + e.qty * Number(e.variant.sell_price), 0);
        btn.disabled = false;
        btn.className = 'btn-gold w-full py-3 rounded-xl text-xs font-bold shadow-lg flex items-center justify-center space-x-2';
        const itemWord = totalQty === 1 ? 'item' : 'items';
        btn.innerHTML = `<span>Add ${totalQty} ${itemWord} to Bag • ${formatUSD(totalPrice)}</span><span class="text-sm">🛍️</span>`;
      }
    } else {
      // No-variant product: use sm-qty
      const qty = parseInt(document.getElementById('sm-qty')?.textContent || '1', 10) || 1;
      const price = Number(product.sell_price);
      if (product.stock <= 0) {
        btn.disabled = true;
        btn.className = 'w-full py-3 rounded-xl text-xs font-bold bg-slate-800 text-slate-500 cursor-not-allowed';
        btn.innerHTML = `<span>${t('soldOut')}</span>`;
      } else {
        btn.disabled = false;
        btn.className = 'btn-gold w-full py-3 rounded-xl text-xs font-bold shadow-lg flex items-center justify-center space-x-2';
        btn.innerHTML = `<span>${t('addToBag')} • ${formatUSD(price * qty)}</span><span class="text-sm">🛍️</span>`;
      }
    }

    // Update selection count label
    const countEl = document.getElementById('sm-selection-count');
    if (countEl) {
      if (selectedVariants.size === 0) {
        countEl.textContent = 'None selected';
      } else {
        countEl.textContent = `${selectedVariants.size} style${selectedVariants.size > 1 ? 's' : ''} selected`;
      }
    }
  }

  // ── Tile toggle (select/deselect) ─────────────────────────────────────────
  window.smToggleTile = function (variantId) {
    const { product, selectedVariants } = styleModalState;
    if (!product || !product.variant_list) return;
    const v = product.variant_list.find((x) => x.id === variantId);
    if (!v) return;
    if (v.stock <= 0) {
      showToast(t('soldOut'), 'warning');
      return;
    }

    // Also focus on this tile's image in the gallery
    const idx = product.variant_list.indexOf(v);
    if (idx >= 0) galleryGoTo(idx);

    if (selectedVariants.has(variantId)) {
      selectedVariants.delete(variantId);
    } else {
      selectedVariants.set(variantId, { variant: v, qty: 1 });
    }
    renderStyleTiles();
    renderModalAddBtn();
  };

  // ── Per-tile qty stepper ───────────────────────────────────────────────────
  window.smTileQty = function (variantId, delta) {
    const { selectedVariants } = styleModalState;
    if (!selectedVariants.has(variantId)) return;
    const entry = selectedVariants.get(variantId);
    const maxStock = entry.variant.stock;
    const next = entry.qty + delta;
    if (next < 1) {
      // Deselect if qty goes to 0
      selectedVariants.delete(variantId);
    } else if (next > maxStock) {
      showToast(t('stockLimit', { n: maxStock }), 'warning');
      return;
    } else {
      entry.qty = next;
    }
    renderStyleTiles();
    renderModalAddBtn();
  };

  // ── Single product qty stepper ─────────────────────────────────────────────
  window.smChangeQty = function (delta) {
    const { product } = styleModalState;
    if (!product) return;
    const qtyEl = document.getElementById('sm-qty');
    if (!qtyEl) return;
    const curr = parseInt(qtyEl.textContent, 10) || 1;
    const next = curr + delta;
    if (next < 1) return;
    if (next > product.stock) {
      showToast(t('stockLimit', { n: product.stock }), 'warning');
      return;
    }
    qtyEl.textContent = next;
    renderModalAddBtn();
  };

  // ── Touch swipe handlers (with seamless looping) ──────────────────────────
  window.smTouchStart = function (e) {
    if (!e.touches || e.touches.length === 0) return;
    styleModalState.swipeStartX = e.touches[0].clientX;
    styleModalState.swipeStartY = e.touches[0].clientY;
    styleModalState.swipeCurrentX = e.touches[0].clientX;
    styleModalState.isSwiping = true;
    styleModalState.isScrollLocked = false;
    const track = document.getElementById('sm-gallery-track');
    if (track) track.style.transition = 'none';
  };

  window.smTouchMove = function (e) {
    if (!styleModalState.isSwiping || !e.touches || e.touches.length === 0) return;
    styleModalState.swipeCurrentX = e.touches[0].clientX;
    const dx = styleModalState.swipeCurrentX - styleModalState.swipeStartX;
    const dy = e.touches[0].clientY - styleModalState.swipeStartY;

    if (!styleModalState.isScrollLocked) {
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6) {
        styleModalState.isScrollLocked = true;
      }
    }

    if (styleModalState.isScrollLocked) {
      if (e.cancelable) e.preventDefault();
      const { product, currentTrackPos } = styleModalState;
      if (!product || !Array.isArray(product.variant_list) || product.variant_list.length < 2) return;
      const gallery = document.getElementById('sm-gallery');
      const galleryW = gallery ? gallery.offsetWidth : 340;
      const baseOffset = (currentTrackPos || 1) * galleryW;
      const track = document.getElementById('sm-gallery-track');
      if (track) {
        track.style.transform = `translateX(${-baseOffset + dx}px)`;
      }
    }
  };

  window.smTouchEnd = function (e) {
    if (!styleModalState.isSwiping) return;
    styleModalState.isSwiping = false;
    const dx = styleModalState.swipeCurrentX - styleModalState.swipeStartX;
    const threshold = 35;
    const { product, currentTrackPos } = styleModalState;
    if (!product || !Array.isArray(product.variant_list) || product.variant_list.length < 2) return;

    if (dx < -threshold) {
      // Swiped right-to-left -> Next slide
      window.smGalleryNext();
    } else if (dx > threshold) {
      // Swiped left-to-right -> Prev slide
      window.smGalleryPrev();
    } else {
      // Snap back to current slide
      const track = document.getElementById('sm-gallery-track');
      if (track) {
        track.style.transition = 'transform 0.24s cubic-bezier(0.16, 1, 0.3, 1)';
        track.style.transform = `translateX(-${(currentTrackPos || 1) * 100}%)`;
      }
    }
  };

  window.confirmAddStyleToCart = function () {
    const { product, selectedVariants } = styleModalState;
    if (!product) return;

    const hasVariants = Array.isArray(product.variant_list) && product.variant_list.length > 0;

    if (hasVariants) {
      // Multi-select path
      if (selectedVariants.size === 0) {
        showToast('Please select at least one style.', 'warning');
        return;
      }

      let addedNames = [];
      let blocked = false;

      for (const [variantId, { variant, qty }] of selectedVariants.entries()) {
        const availableStock = variant.stock;
        const itemKey = `${product.id}_${variantId}`;
        const existingIndex = cart.findIndex((it) => it.itemKey === itemKey);
        const currentQtyInCart = existingIndex >= 0 ? cart[existingIndex].quantity : 0;

        if (currentQtyInCart + qty > availableStock) {
          showToast(t('stockLimit', { n: availableStock }), 'warning');
          blocked = true;
          break;
        }

        const unitPrice = Number(variant.sell_price);
        const photoUrl = variant.photo_url || product.photo_url || DEFAULT_IMAGE;
        const displayName = `${product.name} (${variant.color_name})`;

        if (existingIndex >= 0) {
          cart[existingIndex].quantity += qty;
        } else {
          cart.push({
            itemKey,
            productId: product.id,
            variantId,
            variantName: variant.color_name,
            name: displayName,
            baseName: product.name,
            price: unitPrice,
            photo_url: photoUrl,
            stock: availableStock,
            quantity: qty,
          });
        }
        addedNames.push(variant.color_name);
      }

      if (!blocked) {
        saveCartToStorage();
        updateCartUI();
        window.closeStyleModal();
        const summary = addedNames.length === 1
          ? t('addedToBag', { name: `${product.name} (${addedNames[0]})` })
          : `Added ${addedNames.length} styles of ${product.name} to bag!`;
        showToast(summary, 'success');
      }
    } else {
      // Single / no-variant path
      if (product.stock <= 0) {
        showToast(t('soldOut'), 'warning');
        return;
      }
      const qtyEl = document.getElementById('sm-qty');
      const qty = parseInt(qtyEl?.textContent || '1', 10) || 1;
      const itemKey = product.id;
      const existingIndex = cart.findIndex((it) => it.itemKey === itemKey);
      const currentQtyInCart = existingIndex >= 0 ? cart[existingIndex].quantity : 0;

      if (currentQtyInCart + qty > product.stock) {
        showToast(t('stockLimit', { n: product.stock }), 'warning');
        return;
      }

      if (existingIndex >= 0) {
        cart[existingIndex].quantity += qty;
      } else {
        cart.push({
          itemKey,
          productId: product.id,
          variantId: null,
          variantName: null,
          name: product.name,
          baseName: product.name,
          price: Number(product.sell_price),
          photo_url: product.photo_url || DEFAULT_IMAGE,
          stock: product.stock,
          quantity: qty,
        });
      }
      saveCartToStorage();
      updateCartUI();
      window.closeStyleModal();
      showToast(t('addedToBag', { name: product.name }), 'success');
    }
  };

  // Cart Management
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

    if (Array.isArray(product.variant_list) && product.variant_list.length > 0) {
      window.openStyleModal(productId);
      return;
    }

    if (product.stock <= 0) {
      showToast(t('soldOut'), 'warning');
      return;
    }

    const itemKey = product.id;
    const existingIndex = cart.findIndex((it) => it.itemKey === itemKey);
    const currentQtyInCart = existingIndex >= 0 ? cart[existingIndex].quantity : 0;

    if (currentQtyInCart + 1 > product.stock) {
      showToast(t('stockLimit', { n: product.stock }), 'warning');
      return;
    }

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        itemKey,
        productId: product.id,
        variantId: null,
        variantName: null,
        name: product.name,
        baseName: product.name,
        price: Number(product.sell_price),
        photo_url: product.photo_url || DEFAULT_IMAGE,
        variants: product.variants || '',
        stock: product.stock,
        quantity: 1,
      });
    }

    saveCartToStorage();
    updateCartUI();
    showToast(t('addedToBag', { name: product.name }), 'success');
  };

  window.updateItemQuantity = function (itemKey, delta) {
    const index = cart.findIndex((it) => it.itemKey === itemKey || it.productId === itemKey);
    if (index === -1) return;

    const item = cart[index];
    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      cart.splice(index, 1);
      showToast(t('removedItem', { name: item.name }), 'info');
    } else {
      const product = productsList.find((p) => p.id === item.productId);
      let availableStock = item.stock;
      if (product) {
        if (item.variantId && Array.isArray(product.variant_list)) {
          const v = product.variant_list.find((x) => x.id === item.variantId);
          if (v) availableStock = v.stock;
        } else {
          availableStock = product.stock;
        }
      }

      if (newQty > availableStock) {
        showToast(t('stockLimit', { n: availableStock }), 'warning');
        return;
      }
      item.quantity = newQty;
      item.stock = availableStock;
    }

    saveCartToStorage();
    updateCartUI();
  };

  window.clearCart = function () {
    if (cart.length === 0) return;
    if (confirm(t('clearBagConfirm'))) {
      cart = [];
      saveCartToStorage();
      updateCartUI();
      showToast(t('bagCleared'), 'info');
    }
  };

  function updateCartUI() {
    const totalCount = cart.reduce((sum, it) => sum + it.quantity, 0);
    const totalUSD = cart.reduce((sum, it) => sum + it.price * it.quantity, 0);

    barCartCount.textContent = totalCount;
    barCartUsd.textContent = formatUSD(totalUSD);
    barCartKhr.textContent = formatKHR(totalUSD);

    sheetItemsCount.textContent = totalCount;
    summarySubtotalUsd.textContent = formatUSD(totalUSD);
    summaryTotalUsd.textContent = formatUSD(totalUSD);
    summaryTotalKhr.textContent = formatKHR(totalUSD);
    khqrDueUsd.textContent = formatUSD(totalUSD);
    khqrDueKhr.textContent = formatKHR(totalUSD);

    if (cart.length === 0) {
      sheetCartItems.innerHTML = '';
      sheetCartEmpty.classList.remove('hidden');
    } else {
      sheetCartEmpty.classList.add('hidden');
      sheetCartItems.innerHTML = cart.map((item) => `
        <div class="cart-item-card flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5 w-full min-w-0 box-border overflow-hidden">
          <!-- Thumbnail -->
          <img src="${item.photo_url}" alt="${escapeHtml(item.name)}"
            class="cart-item-thumb w-12 h-12 rounded-lg object-cover bg-slate-900 border border-white/10 flex-shrink-0"
            onerror="this.onerror=null;this.src='${DEFAULT_IMAGE}'">

          <!-- Item info — strictly bounded -->
          <div class="cart-item-details min-w-0 flex-1 overflow-hidden">
            <h5 class="text-xs font-bold text-white truncate leading-snug block">${escapeHtml(item.baseName || item.name)}</h5>
            ${item.variantName ? `<span class="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#c9a84c]/20 text-[#f3d489] border border-[#c9a84c]/30 mt-0.5">✦ ${escapeHtml(item.variantName)}</span>` : ''}
            <div class="text-[11px] text-[#e5c36a] font-semibold mt-0.5 truncate block">
              ${formatUSD(item.price)} <span class="text-[10px] text-slate-400 font-normal">(${formatKHR(item.price)})</span>
            </div>
          </div>

          <!-- Qty stepper — permanently anchored to the right -->
          <div class="cart-item-controls flex-shrink-0 ml-auto flex items-center gap-0.5 bg-black/40 rounded-lg p-1 border border-white/10">
            <button type="button" onclick="window.updateItemQuantity('${item.itemKey || item.productId}', -1)"
              class="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-slate-300 hover:text-white bg-white/5 active:scale-95">
              −
            </button>
            <span class="w-6 text-center text-xs font-bold text-white">${item.quantity}</span>
            <button type="button" onclick="window.updateItemQuantity('${item.itemKey || item.productId}', 1)"
              class="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-slate-300 hover:text-white bg-white/5 active:scale-95">
              +
            </button>
          </div>
        </div>
      `).join('');
    }
  }

  // ─── Modal History Management (Android Hardware/Gesture Back Button) ───────
  let activeModalHistory = null;

  function pushModalState(modalName) {
    if (activeModalHistory === modalName) return;
    activeModalHistory = modalName;
    try {
      history.pushState({ luxeModal: modalName }, '');
    } catch (e) {}
  }

  function closeModalState(modalName) {
    if (activeModalHistory === modalName) {
      activeModalHistory = null;
      try {
        if (history.state && history.state.luxeModal === modalName) {
          history.back();
        }
      } catch (e) {}
    }
  }

  window.addEventListener('popstate', () => {
    // Intercept Android back button or back swipe gesture: close active modal instead of leaving page
    if (styleModal && !styleModal.classList.contains('hidden')) {
      activeModalHistory = null;
      window.closeStyleModal(false);
    } else if (cartModal && !cartModal.classList.contains('hidden')) {
      activeModalHistory = null;
      window.closeCartSheet(false);
    } else if (successModal && !successModal.classList.contains('hidden')) {
      activeModalHistory = null;
      window.closeSuccessModal(false);
    }
  });

  // Modals
  window.openCartSheet = function () {
    cartModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    pushModalState('cart-modal');
  };

  window.closeCartSheet = function (syncHistory = true) {
    cartModal.classList.add('hidden');
    document.body.style.overflow = '';
    if (syncHistory) {
      closeModalState('cart-modal');
    }
  };

  window.closeSuccessModal = function (syncHistory = true) {
    successModal.classList.add('hidden');
    document.body.style.overflow = '';
    if (syncHistory) {
      closeModalState('success-modal');
    }
  };

  if (styleModal) {
    styleModal.addEventListener('click', (e) => {
      if (e.target === styleModal) window.closeStyleModal();
    });
  }

  cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) window.closeCartSheet();
  });

  successModal.addEventListener('click', (e) => {
    if (e.target === successModal) window.closeSuccessModal();
  });

  // Order Submission
  window.submitCustomerOrder = async function () {
    if (cart.length === 0) {
      showToast(t('emptyBag'), 'warning');
      return;
    }

    if (!isVerified) {
      showToast(t('authAlertTitle'), 'error');
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
      showToast(t('fillRequired'), 'warning');
      if (!customerName) nameInput.focus();
      else if (!phone) phoneInput.focus();
      else addressInput.focus();
      return;
    }

    submitOrderBtn.disabled = true;
    submitOrderSpinner.classList.remove('hidden');
    submitOrderText.textContent = t('submitting');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          psid,
          sig,
          payment_method: selectedPaymentMethod,
          items: cart.map((it) => ({
            productId: it.productId,
            variantId: it.variantId || null,
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

      const totalUSD = data.total;
      successOrderId.textContent = data.orderId;
      successOrderTotal.textContent = `${formatUSD(totalUSD)} / ${formatKHR(totalUSD)}`;

      cart = [];
      saveCartToStorage();
      updateCartUI();

      window.closeCartSheet();
      successModal.classList.remove('hidden');
      loadCatalog();
    } catch (err) {
      showToast(err.message || 'Error submitting order.', 'error');
    } finally {
      submitOrderBtn.disabled = !isVerified;
      submitOrderSpinner.classList.add('hidden');
      submitOrderText.textContent = t('confirmOrder');
    }
  };

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
  verifyIdentity();
  loadCatalog();
  loadCartFromStorage();
})();
