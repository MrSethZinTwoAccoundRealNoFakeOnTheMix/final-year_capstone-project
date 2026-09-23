module.exports = {
  shopGuide: `👋 សួស្តី! សូមស្វាគមន៍មកកាន់ Luxe Jewelry ✨

🛍️ របៀបបញ្ជាទិញ & ប្រើប្រាស់ហាង៖
១. ចុចប៊ូតុង "✨ ចូលមើលហាង" ខាងក្រោម ដើម្បីបើកទំព័រទំនិញ
២. ជ្រើសរើសគ្រឿងអលង្ការដែលពេញចិត្ត រួចចុច "Add to Cart"
៣. បំពេញព័ត៌មានដឹកជញ្ជូន និងស្កេនទូទាត់តាម KHQR ពេលទូទាត់ប្រាក់

💡 មិនបាច់បង្កើតគណនី (No Login)៖ បង្កាន់ដៃបញ្ជាទិញនឹងត្រូវផ្ញើចូលក្នុង Messenger នេះដោយស្វ័យប្រវត្តិ!

──────────────────
🛍️ How to Order:
1. Tap "Open Shop" below to browse our collection.
2. Select your favorite jewelry and tap "Add to Cart".
3. Enter your delivery info and pay via KHQR at checkout.

💡 No account/login needed! Your order receipt will be sent directly to this chat.`,

  welcomeGreeting: `👋 សួស្តី! សូមស្វាគមន៍មកកាន់ Luxe Jewelry ✨
តើពួកយើងអាចជួយអ្វីបានដែរ? បើលោកអ្នកចង់មើលទំនិញ ឬបញ្ជាទិញ សូមចុចប៊ូតុងខាងក្រោមនេះ👇

👋 Hello! Welcome to Luxe Jewelry ✨
How can we help you today? To browse our collection or order, tap the button below👇`,

  openShopButtonText: '✨ ចូលមើលហាង (Open Shop)',
  openShopPromptText: '👇 ចុចទីនេះដើម្បីចូលមើលហាង / Tap to open store:',

  orderReceipt: (order) => {
    const isOther = (order.payment_method || '').toUpperCase() === 'OTHER';
    const payText = isOther ? '💬 Other / Discuss in chat' : '📲 Bakong KHQR (Scan to Pay)';
    return (
      `🛍️ Order Received (Pending Confirmation)!\n\n` +
      `Order ID: ${order.id}\n` +
      `Total: $${Number(order.total_amount).toFixed(2)}\n` +
      `Payment: ${payText}\n` +
      `Customer: ${order.customer_name || 'Customer'}\n` +
      `Phone: ${order.phone || 'N/A'}\n` +
      `Address: ${order.address || 'N/A'}\n\n` +
      (isOther
        ? `💬 Our shop owner will chat with you shortly to agree on payment details!`
        : `Our shop owner will verify your payment and prepare your order shortly!`)
    );
  },

  shippingNotification: (orderId) =>
    `📦 Your order #${orderId} has been shipped! Thank you for shopping with us.`
};
