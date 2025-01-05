import { mongooseConnect } from "@/lib/mongoose";
import { User } from "@/models/User";

export default async function handler(req, res) {
  const { method } = req;

  await mongooseConnect();

  if (method === "PUT") {
    const { userId, name, username, address } = req.body;

    if (!userId || !name || !username || !address) {
      return res.status(400).json({ message: "Name, username, userId, and address are required" });
    }

    try {
    
      const updatedUser = await User.findByIdAndUpdate(
        userId, 
        { name, username, address },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({ updatedUser });
    } catch (error) {
      console.error("Error updating profile:", error);
      return res.status(500).json({ message: "Error updating profile" });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
