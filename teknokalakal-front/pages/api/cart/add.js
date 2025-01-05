import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { Cart } from "@/models/Cart";
import { mongooseConnect } from "@/lib/mongoose";

export default async function handler(req, res) {
  await mongooseConnect();
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "You must be logged in to access this resource." });
  }

  const userId = session.user.id; // Get user ID from session

  try {
    const { productId, quantity = 1 } = req.body; // Default quantity to 1 if not provided

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
    if (itemIndex > -1) {
      // Update quantity if item exists
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    res.status(200).json({ cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
