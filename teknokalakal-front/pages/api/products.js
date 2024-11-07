import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Products";

export default async function handler(req, res) {
  const { method, query } = req;

  await mongooseConnect();

  // Handle GET requests to fetch product(s)
  if (method === 'GET') {
    try {
      if (query.id) {
        // Fetch a single product by ID
        const product = await Product.findById(query.id);
        if (!product) {
          return res.status(404).json({ success: false, message: "Product not found" });
        }
        return res.status(200).json({ success: true, data: product });
      } else {
        // Fetch all products if no ID is provided
        const products = await Product.find();
        return res.status(200).json({ success: true, data: products });
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  } 
  
  // Handle unsupported methods
  res.setHeader("Allow", ["GET"]);
  return res.status(405).json({ success: false, message: `Method ${method} not allowed` });
}
