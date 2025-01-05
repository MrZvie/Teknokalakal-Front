import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { Cart } from "@/models/Cart";
import { mongooseConnect } from "@/lib/mongoose";

export default async function handler(req, res) {
  await mongooseConnect();
  const session = await getServerSession(req, res, authOptions);

  if (!session) return res.status(401).json({ message: "Not authenticated" });

  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { productId } = req.body;

  if (!productId) return res.status(400).json({ message: "Product ID is required" });

  try {
    const cart = await Cart.findOne({ userId: session.user.id });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Remove the product from the cart
    cart.items = cart.items.filter((p) => p.productId.toString() !== productId);

    // If the cart is now empty, delete the cart document
    if (cart.items.length === 0) {
      await Cart.deleteOne({ userId: session.user.id });
      return res.status(200).json({ message: "Cart is empty and has been removed" });
    }

    // Save the updated cart
    await cart.save();

    return res.status(200).json({ message: "Product removed from cart", cart: cart.items });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
