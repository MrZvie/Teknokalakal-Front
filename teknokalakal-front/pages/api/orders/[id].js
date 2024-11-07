import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";
// this one is for the id of one order like if post is retreiving an id of order from the databse this file ang gagana
export default async function handler(req, res) {
  await mongooseConnect();

  const { id } = req.query; // Retrieve the order ID from the route

  if (req.method === 'PUT') {
    try {
      const updatedOrder = await Order.findByIdAndUpdate(
        id,
        { status: req.body.status, statusDescription: req.body.statusDescription },
        { new: true }
      );

      if (!updatedOrder) {
        return res.status(404).json({ error: 'Order not found' });
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
