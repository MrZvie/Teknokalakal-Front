import { mongooseConnect } from "@/lib/mongoose";
import { Cart } from "@/models/Cart";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import mongoose from "mongoose";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  await mongooseConnect();

  if (!session) {
    return res.status(401).json({ error: "You must be logged in to access this resource." });
  }

  if (req.method === "PUT") {
    const { productId, quantity } = req.body;

    // Validate that quantity is a positive number
    if (quantity <= 0) {
      return res.status(400).json({ error: "Quantity must be a positive number" });
    }

    try {
      // Convert productId to ObjectId
      const productObjectId = new mongoose.Types.ObjectId(productId);

      // Find the cart for the logged-in user
      const cart = await Cart.findOne({ userId: session.user.id });

      if (cart) {
        // Find the product in the cart
        const itemIndex = cart.items.findIndex(
          item => item.productId.toString() === productObjectId.toString()
        );

        if (itemIndex > -1) {
          // Update the quantity of the product in the cart
          cart.items[itemIndex].quantity = quantity;
        } else {
          // If the product doesn't exist, return an error
          return res.status(404).json({ message: "Product not found in cart" });
        }

        // Update the cart and save
        cart.updatedAt = Date.now();
        await cart.save();

        return res.status(200).json({ message: "Cart updated", cart });
      }

      return res.status(404).json({ message: "Cart not found" });
    } catch (error) {
      console.error("Error updating cart:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}
