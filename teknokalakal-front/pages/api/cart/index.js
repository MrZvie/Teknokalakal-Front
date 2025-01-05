import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { Cart } from "@/models/Cart";
import { Products } from "@/models/Products";
import { mongooseConnect } from "@/lib/mongoose";

export default async function handler(req, res) {
  await mongooseConnect();
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    // Find the cart and populate product details
    const cart = await Cart.findOne({ userId: session.user.id }).populate("items.productId");

    if (!cart) {
      return res.json({ cart: [] }); // Return empty cart if no cart found
    }

    res.json({ cart: cart.items });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Error fetching cart", error: error.message });
  }
}
