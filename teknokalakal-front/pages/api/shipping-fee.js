import { ShippingFee } from "@/models/ShippingFee";
import { mongooseConnect } from "@/lib/mongoose";

export default async function handler(req, res) {
  await mongooseConnect();

  if (req.method === "GET") {
    try {
      const shippingFeeData = await ShippingFee.findOne();
      if (!shippingFeeData) {
        return res.status(404).json({ message: "Shipping fee not set" });
      }
      res.status(200).json({ shippingFee: shippingFeeData.shippingFee });
    } catch (error) {
      res.status(500).json({ message: "Error fetching shipping fee" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
