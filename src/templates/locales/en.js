module.exports = {
  shopGuide: `👋 សួស្តី! សូមស្វាគមន៍មកកាន់ Luxe Jewelry ✨

🛍️ របៀបបញ្ជាទិញ & ប្រើប្រាស់ហាង៖
១. ចុចប៊ូតុង "✨ ចូលមើលហាង" ខាងក្រោម ដើម្បីបើកទំព័រទំនិញ
២. ជ្រើសរើសគ្រឿងអលង្ការដែលពេញចិត្ត រួចចុច "Add to Cart"
៣. បំពេញព័ត៌មានដឹកជញ្ជូន និងស្កេនទូទាត់តាម KHQR ពេលទូទាត់ប្រាក់


──────────────────
🛍️ How to Order:
1. Tap "Open Shop" below to browse our collection.
2. Select your favorite jewelry and tap "Add to Cart".
3. Enter your delivery info and pay via KHQR at checkout.`,

  welcomeGreeting: `👋 សួស្តី! សូមស្វាគមន៍មកកាន់ Luxe Jewelry ✨
តើពួកយើងអាចជួយអ្វីបានដែរ? បើលោកអ្នកចង់មើលទំនិញ ឬបញ្ជាទិញ សូមចុចប៊ូតុងខាងក្រោមនេះ👇

👋 Hello! Welcome to Luxe Jewelry ✨
How can we help you today? To browse our collection or order, tap the button below👇`,

  openShopButtonText: '✨ ចូលមើលហាង (Open Shop)',
  openShopPromptText: '👇 ចុចទីនេះដើម្បីចូលមើលហាង / Tap to open store:',

  orderReceipt: (order) => {
    const method = (order.payment_method || 'COD').toUpperCase();
    let payText = '🛵 Cash on Delivery (Grab Express)';
    let noticeText = 'Our shop owner will verify and prepare your order for Grab delivery shortly!';

    if (method === 'KHQR') {
      payText = '📲 Bakong KHQR (Prepaid Scan)';
      noticeText = 'Our shop owner will verify your payment and prepare your order shortly!';
    } else if (method === 'VET') {
      payText = '📦 Provincial Delivery (Virak Buntham / J&T)';
      noticeText = 'Our shop owner will prepare your parcel for courier shipment shortly!';
    } else if (method === 'OTHER') {
      payText = '💬 Other / Discuss in chat';
      noticeText = 'Our shop owner will chat with you shortly to agree on payment details!';
    }

    return (
      `🛍️ Order Received (Pending Confirmation)!\n\n` +
      `Order ID: ${order.id}\n` +
      `Total: $${Number(order.total_amount).toFixed(2)}\n` +
      `Delivery & Payment: ${payText}\n` +
      `Customer: ${order.customer_name || 'Customer'}\n` +
      `Phone: ${order.phone || 'N/A'}\n` +
      `Address: ${order.address || 'N/A'}\n\n` +
      noticeText
    );
  },

  shippingNotification: (orderId) =>
    `📦 Your order #${orderId} has been shipped! Thank you for shopping with us.`
};
