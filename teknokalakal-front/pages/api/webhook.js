import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";
import { Product } from "@/models/Products";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await mongooseConnect();

      const { data } = req.body;
      console.log("Received data:", data);
      const event = data.attributes;
      const orderId = event.data?.attributes?.metadata?.orderId;
      const failedCode = event.data?.attributes?.failed_code;
      const failedMessage = event.data?.attributes?.failed_message || 'No reason provided';

      if (orderId) {
        switch(event.type) {
          case 'payment.paid':
            const order = await Order.findByIdAndUpdate(orderId, { 
              status: 'paid',
              statusDescription: 'Payment successfully processed'
            });

            if (order) {
              // Increment soldCount for each product in the order
              for (const item of order.line_items) {
                if (item.productId) {
                  await Product.findByIdAndUpdate(item.productId, {
                    $inc: { sold: item.quantity }
                  });
                }
              }
            }
            break;
          
          case 'payment.failed':
            let status = 'failed';
            let statusDescription = failedMessage;

            // Customize status and description based on failed_code
            if (failedCode === 'insufficient_funds') {
              status = 'insufficient_funds';
              statusDescription = 'Transaction failed due to insufficient funds';
            } else if (failedCode === 'card_declined') {
              status = 'failed';
              statusDescription = 'Card was declined by the issuing bank';
            } else if (failedCode === 'expired_card') {
              status = 'failed';
              statusDescription = 'Card has expired';
            }
            // Add more cases as needed

            await Order.findByIdAndUpdate(orderId, { 
              status,
              statusDescription
            });
            break;

          case 'payment.cancelled':
            await Order.findByIdAndUpdate(orderId, { 
              status: 'cancelled',
              statusDescription: 'Payment was cancelled by the customer or system'
            });
            break;

          case 'payment.refunded':
            await Order.findByIdAndUpdate(orderId, { 
              status: 'refunded',
              statusDescription: `Refund processed: ${failedMessage}`
            });
            break;
            
          case 'checkout.cancelled':
            await Order.findByIdAndUpdate(orderId, { 
              status: 'checkout_cancelled',
              statusDescription: 'Checkout was cancelled before completion'
            });
            break;
            
          case 'checkout.expired':
            await Order.findByIdAndUpdate(orderId, { 
              status: 'checkout_expired',
              statusDescription: 'Checkout session expired'
            });
            break;
        }
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: "Webhook handling failed" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
