import { mongooseConnect } from "@/lib/mongoose";
import { FeaturedProduct } from "@/models/FeaturedProducts";
import { Product } from "@/models/Products";

export default async function handler(req, res) {
  await mongooseConnect();

  if (req.method === "GET") {
    try {
      const featuredProductDoc = await FeaturedProduct.findOne();
      const featuredProductId = featuredProductDoc?.featuredProductId;

      // Fetch the actual featured product details using its ID
      const featuredProduct = featuredProductId
        ? await Product.findById(featuredProductId)
        : null;

      return res.status(200).json(featuredProduct);
    } catch (error) {
      console.error("Error fetching featured product:", error);
      return res.status(500).json({ error: "Failed to fetch featured product" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
