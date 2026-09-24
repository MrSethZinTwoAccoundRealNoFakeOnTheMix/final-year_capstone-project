/**
 * Messenger templates and carousel card builders
 */

const QUICK_REPLIES = [
  {
    content_type: 'text',
    title: '✨ ចូលហាង / Open Shop',
    payload: 'OPEN_SHOP',
    image_url: 'https://img.icons8.com/color/48/diamond--v1.png',
  },
];

/**
 * Resolves a safe, fully-qualified public image URL for Facebook Messenger.
 * Rejects relative paths and localhost (Meta Graph API requires a valid public URL).
 */
function formatImageUrl(photoUrl, baseUrl) {
  const defaultImage = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&q=80';
  if (!photoUrl || typeof photoUrl !== 'string') return defaultImage;
  const trimmed = photoUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(trimmed)) {
      return defaultImage;
    }
    return trimmed;
  }
  if (baseUrl && /^https?:\/\//i.test(baseUrl)) {
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(baseUrl)) {
      return defaultImage;
    }
    const cleanBase = baseUrl.replace(/\/+$/, '');
    const cleanPath = trimmed.replace(/^\/+/, '');
    return `${cleanBase}/${cleanPath}`;
  }
  return defaultImage;
}

/**
 * Build a Generic Template element for an item in a carousel
 * @param {Object} item
 * @param {string} shopUrl
 * @param {string} [baseUrl]
 */
function buildItemElement(item, shopUrl, baseUrl) {
  const unitPrice = Number(item.unit_price || 0).toFixed(2);
  const qty = item.quantity || 1;

  const element = {
    title: item.name || 'Jewelry Item',
    subtitle: `Qty: ${qty} × $${unitPrice}`,
    image_url: formatImageUrl(item.photo_url, baseUrl),
  };

  if (shopUrl) {
    element.buttons = [
      {
        type: 'web_url',
        url: shopUrl,
        title: 'View Store',
      },
    ];
  }

  return element;
}

/**
 * Build a Button Template message object
 * @param {string} text - Prompt text
 * @param {string} url - Target URL
 * @param {string} [title] - Button title
 */
function buildButtonTemplate(text, url, title = '✨ ចូលមើលហាង (Open Shop)') {
  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text,
        buttons: [
          {
            type: 'web_url',
            url,
            title,
            webview_height_ratio: 'tall',
            messenger_extensions: true,
          },
        ],
      },
    },
    quick_replies: QUICK_REPLIES,
  };
}

module.exports = {
  QUICK_REPLIES,
  buildItemElement,
  buildButtonTemplate,
};
