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
 * Build a Generic Template element for an item in a carousel
 * @param {Object} item
 * @param {string} shopUrl
 */
function buildItemElement(item, shopUrl) {
  const defaultImage = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&q=80';
  const unitPrice = Number(item.unit_price || 0).toFixed(2);
  const qty = item.quantity || 1;

  const element = {
    title: item.name || 'Jewelry Item',
    subtitle: `Qty: ${qty} × $${unitPrice}`,
    image_url: item.photo_url || defaultImage,
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
