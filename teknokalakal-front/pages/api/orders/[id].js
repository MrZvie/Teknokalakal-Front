import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";
import { Product } from "@/models/Products";
// this one is for the id of one order like if post is retreiving an id of order from the databse this file ang gagana
export default async function handler(req, res) {
  await mongooseConnect();

  const { id } = req.query; // Retrieve the order ID from the route

  if (req.method === 'PUT') {
    try {

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const previousStatus = order.status;
      const newStatus = req.body.status;

      const updatedOrder = await Order.findByIdAndUpdate(
        id,
        { status: req.body.status, statusDescription: req.body.statusDescription, shipping_statuss: req.body.shipping_statuss },
        { new: true }
      );

      if (previousStatus === 'paid' && newStatus !== 'paid') {
        // Decrement sold count for each product in the order
        for (const item of order.line_items) {
          if (item.productId) {
            await Product.findByIdAndUpdate(item.productId, {
              $inc: { sold: -item.quantity }
            });
          }
        }
      } else if (previousStatus !== 'paid' && newStatus === 'paid') {
        // Increment sold count for each product in the order
        for (const item of order.line_items) {
          if (item.productId) {
            await Product.findByIdAndUpdate(item.productId, {
              $inc: { sold: item.quantity }
            });
          }
        }
      }

      res.json(updatedOrder);
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ error: 'Failed to update order' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
