import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Products";

export default async function handle(req, res) {
    await mongooseConnect();
    const { ids } = req.body;
    console.log("Received IDs:", ids);

  // Logic to fetch products based on the received ids
  try {
    const products = await Product.find({ _id: { $in: ids } });
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
}