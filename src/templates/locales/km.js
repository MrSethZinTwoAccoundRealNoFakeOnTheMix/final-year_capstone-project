/**
 * Khmer Language Templates for Messenger Bot
 */

module.exports = {
  shopGuide: `👋 សួស្តី! សូមស្វាគមន៍មកកាន់ Luxe Jewelry ✨

🛍️ របៀបបញ្ជាទិញ & ប្រើប្រាស់ហាង៖
១. ចុចប៊ូតុង "✨ ចូលមើលហាង" ខាងក្រោម ដើម្បីបើកទំព័រទំនិញ
២. ជ្រើសរើសគ្រឿងអលង្ការដែលពេញចិត្ត រួចចុច "Add to Cart"
៣. បំពេញព័ត៌មានដឹកជញ្ជូន និងស្កេនទូទាត់តាម KHQR ពេលទូទាត់ប្រាក់`,

  welcomeGreeting: `👋 សួស្តី! សូមស្វាគមន៍មកកាន់ Luxe Jewelry ✨
តើពួកយើងអាចជួយអ្វីបានដែរ? បើលោកអ្នកចង់មើលទំនិញ ឬបញ្ជាទិញ សូមចុចប៊ូតុងខាងក្រោមនេះ👇`,

  openShopButtonText: '✨ ចូលមើលហាង (Open Shop)',
  openShopPromptText: '👇 ចុចទីនេះដើម្បីចូលមើលហាង៖',

  orderReceipt: (order) => {
    const method = (order.payment_method || 'COD').toUpperCase();
    let payText = '🛵 ទូទាត់ពេលទំនិញដល់ (Grab COD)';
    let noticeText = 'ម្ចាស់ហាងនឹងពិនិត្យការបញ្ជាទិញ និងរៀបចំឥវ៉ាន់ផ្ញើតាម Grab ក្នុងពេលឆាប់ៗនេះ!';

    if (method === 'KHQR') {
      payText = '📲 Bakong KHQR (ស្កេនទូទាត់)';
      noticeText = 'ម្ចាស់ហាងនឹងពិនិត្យការទូទាត់ប្រាក់ និងរៀបចំឥវ៉ាន់ជូនលោកអ្នកក្នុងពេលឆាប់ៗនេះ!';
    } else if (method === 'VET') {
      payText = '📦 ផ្ញើតាមខេត្ត (វីរៈ ប៊ុនថាំ / J&T)';
      noticeText = 'ម្ចាស់ហាងនឹងរៀបចំបញ្ញើឥវ៉ាន់ជូនលោកអ្នកតាមក្រុមហ៊ុនបញ្ញើក្នុងពេលឆាប់ៗនេះ!';
    } else if (method === 'OTHER') {
      payText = '💬 វិធីសាស្ត្រផ្សេងទៀត (ពិភាក្សាក្នុងប្រអប់សារ)';
      noticeText = 'ម្ចាស់ហាងនឹងទាក់ទងមកលោកអ្នកផ្ទាល់តាម Messenger ក្នុងពេលឆាប់ៗនេះដើម្បីពិភាក្សាលើការទូទាត់ប្រាក់!';
    }

    return (
      `🛍️ ការបញ្ជាទិញបានជោគជ័យ (រង់ចាំការបញ្ជាក់)!\n\n` +
      `លេខកូដបញ្ជាទិញ: ${order.id}\n` +
      `តម្លៃសរុប: $${Number(order.total_amount).toFixed(2)}\n` +
      `ការដឹកជញ្ជូន & ទូទាត់: ${payText}\n` +
      `អតិថិជន: ${order.customer_name || 'អតិថិជន'}\n` +
      `លេខទូរស័ព្ទ: ${order.phone || 'N/A'}\n` +
      `អាសយដ្ឋានដឹកជញ្ជូន: ${order.address || 'N/A'}\n\n` +
      noticeText
    );
  },

  shippingNotification: (orderId) =>
    `📦 ការបញ្ជាទិញលេខ #${orderId} របស់លោកអ្នកត្រូវបានប្រគល់ជូនអ្នកដឹកជញ្ជូនហើយ! សូមអរគុណសម្រាប់ការគាំទ្រ Luxe Jewelry។`
};
