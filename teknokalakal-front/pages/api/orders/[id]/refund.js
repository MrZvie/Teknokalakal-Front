import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";

export default async function handler(req, res) {
  await mongooseConnect();

  const { id } = req.query;

  if (req.method === 'POST') {
    try {
      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      if (order.status !== 'paid') {
        return res.status(400).json({ error: 'Only paid orders can be refunded' });
      }

      order.refundRequested = true;
      order.refundStatus = 'pending';
      await order.save();

      res.status(200).json({ message: 'Refund request submitted successfully' });
    } catch (error) {
      console.error('Error requesting refund:', error);
      res.status(500).json({ error: 'Failed to request refund' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}