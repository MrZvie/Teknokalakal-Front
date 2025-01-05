import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { Cart } from "@/models/Cart";
import { mongooseConnect } from "@/lib/mongoose";

export default async function handler(req, res) {
  await mongooseConnect();
  const session = await getServerSession(req, res, authOptions);

  if (!session) return res.status(401).json({ message: "Not authenticated" });

  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    // Delete the cart document for the logged-in user
    await Cart.deleteOne({ userId: session.user.id });
    return res.status(200).json({ message: "Cart has been deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
