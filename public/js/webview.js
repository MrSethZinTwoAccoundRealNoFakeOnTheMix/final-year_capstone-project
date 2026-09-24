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
  let cart = [];

  const CART_STORAGE_KEY = `luxe_cart_${psid || 'guest'}`;

  // DOM Elements
  const langFlag = document.getElementById('lang-flag');
  const langLabel = document.getElementById('lang-label');
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

    // Category Pills
    const catMap = {
      ALL: t('catAll'),
      Ring: t('catRing'),
      Necklace: t('catNecklace'),
      Bracelet: t('catBracelet'),
      Earring: t('catEarring'),
    };

    categoryPills.forEach((pill) => {
      const cat = pill.dataset.category;
      if (catMap[cat]) pill.textContent = catMap[cat];
    });

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

  // Catalog Loading & Rendering
  async function loadCatalog() {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to load products');
      productsList = await res.json();
      renderProducts();
    } catch (err) {
      productGrid.innerHTML = `
        <div class="col-span-2 text-center py-12 text-slate-400">
          <p class="text-sm">${t('noProducts')}</p>
          <button onclick="loadCatalog()" class="mt-3 text-xs text-[#c9a84c] underline">Tap to retry</button>
        </div>
      `;
    }
  }

  function renderProducts() {
    const filtered = currentCategory === 'ALL'
      ? productsList
      : productsList.filter((p) => p.category === currentCategory);

    catalogCountLabel.textContent = t('piecesCount', { n: filtered.length, s: filtered.length === 1 ? '' : 's' });

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
              <span>${isSoldOut ? t('soldOut') : t('addToBag')}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Category Filtering
  categoryPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      categoryPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.dataset.category || 'ALL';
      renderProducts();
    });
  });

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

    if (product.stock <= 0) {
      showToast(t('soldOut'), 'warning');
      return;
    }

    const existingIndex = cart.findIndex((it) => it.productId === productId);
    const currentQtyInCart = existingIndex >= 0 ? cart[existingIndex].quantity : 0;

    if (currentQtyInCart + 1 > product.stock) {
      showToast(t('stockLimit', { n: product.stock }), 'warning');
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
    showToast(t('addedToBag', { name: product.name }), 'success');
  };

  window.updateItemQuantity = function (productId, delta) {
    const index = cart.findIndex((it) => it.productId === productId);
    if (index === -1) return;

    const item = cart[index];
    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      cart.splice(index, 1);
      showToast(t('removedItem', { name: item.name }), 'info');
    } else {
      const product = productsList.find((p) => p.id === productId);
      const availableStock = product ? product.stock : item.stock;

      if (newQty > availableStock) {
        showToast(t('stockLimit', { n: availableStock }), 'warning');
        return;
      }
      item.quantity = newQty;
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
            <h5 class="text-xs font-bold text-white truncate leading-snug block">${escapeHtml(item.name)}</h5>
            <div class="text-[11px] text-[#e5c36a] font-semibold mt-0.5 truncate block">
              ${formatUSD(item.price)} <span class="text-[10px] text-slate-400 font-normal">(${formatKHR(item.price)})</span>
            </div>
            ${item.variants ? `<p class="text-[10px] text-slate-400 truncate italic leading-tight block">✨ ${escapeHtml(item.variants)}</p>` : ''}
          </div>

          <!-- Qty stepper — permanently anchored to the right -->
          <div class="cart-item-controls flex-shrink-0 ml-auto flex items-center gap-0.5 bg-black/40 rounded-lg p-1 border border-white/10">
            <button type="button" onclick="window.updateItemQuantity('${item.productId}', -1)"
              class="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-slate-300 hover:text-white bg-white/5 active:scale-95">
              −
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

  // Modals
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
