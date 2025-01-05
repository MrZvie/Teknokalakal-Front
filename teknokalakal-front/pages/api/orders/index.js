import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  await mongooseConnect();

  if (req.method === 'GET') {
    try {
      // Pass both req and res to `getServerSession`
      const session = await getServerSession(req, res, authOptions);

      if (!session) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
      }

      const userId = session.user.id; // Logged-in user's ID
      const { reference_number } = req.query; // Optional query parameter

      if (reference_number) {
        // Fetch specific order by reference_number
        const order = await Order.findOne({ userId, reference_number });
        if (!order) {
          return res.status(404).json({ error: "Order not found." });
        }
        return res.json(order); // Return the specific order
      }

      // Fetch all orders for the logged-in user
      const orders = await Order.find({ userId }).sort({ createdAt: -1 });
      if (!orders.length) {
        return res.status(404).json({ error: "No orders found for this user." });
      }

      res.json(orders); // Return the orders
    } catch (error) {
      console.error("Database connection error:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
