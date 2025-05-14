import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";

export default async function handler(req, res) {
  await mongooseConnect();

  const { id } = req.query;

  if (req.method === 'POST') {
    const { action } = req.body; // 'approve' or 'reject'

    try {
      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      if (action === 'approve') {
        order.status = 'refunded';
        order.refundStatus = 'approved';
      } else if (action === 'reject') {
        order.refundStatus = 'rejected';
      } else {
        return res.status(400).json({ error: 'Invalid action' });
      }

      await order.save();

      res.status(200).json({ message: `Refund request ${action}ed successfully` });
    } catch (error) {
      console.error(`Error ${action}ing refund request:`, error);
      res.status(500).json({ error: `Failed to ${action} refund request` });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}