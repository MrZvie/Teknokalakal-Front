import { mongooseConnect } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { Order } from "@/models/Order";
import { Product } from "@/models/Products";

export default async function handler(req, res) {
  await mongooseConnect();

  if (req.method === 'GET') {
    try {
      const session = await getServerSession(req, res, authOptions);

      if (!session) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
      }

      const vendorId = session.user.id; // Logged-in vendor's ID
      const { status } = req.query; // Get the status filter from query parameters

      // Fetch products sold by the vendor
      const products = await Product.find({ vendorId }).select('_id title sold');
      const productIds = products.map(product => product._id);

      // Build the query to fetch orders
      const query = { 'line_items.productId': { $in: productIds } };
      if (status) {
        query.status = status;
      }

      // Fetch orders containing the vendor's products
      const orders = await Order.find(query).sort({ createdAt: -1 });

      // Calculate the total sold count for each product
      const soldCounts = {};
      orders.forEach(order => {
        order.line_items.forEach(item => {
          if (soldCounts[item.productId]) {
            soldCounts[item.productId] += item.quantity;
          } else {
            soldCounts[item.productId] = item.quantity;
          }
        });
      });

      // Add the sold count to each product
      const productsWithSoldCount = products.map(product => ({
        ...product.toObject(),
        sold: soldCounts[product._id] || 0
      }));

      res.json({ orders, products: productsWithSoldCount }); // Return the orders and products with sold count
    } catch (error) {
      console.error("Database connection error:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}