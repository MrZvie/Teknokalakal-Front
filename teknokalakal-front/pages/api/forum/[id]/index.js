import { mongooseConnect } from "@/lib/mongoose";
import { Forum } from "@/models/Forum";

export default async function handler(req, res) {
  await mongooseConnect();

  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const post = await Forum.findById(id)
        .populate("userId", "name email")
        .populate("commentThread.userId", "name"); // Correct field: commentThread

      if (!post) {
        return res.status(404).json({ success: false, error: "Post not found" });
      }

      res.status(200).json({ success: true, post });
    } catch (err) {
      res.status(500).json({ success: false, error: "Failed to fetch post" });
    }
  }
}
