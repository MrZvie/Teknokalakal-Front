import { mongooseConnect } from "@/lib/mongoose";
import { Forum } from "@/models/Forum";
import { authOptions } from "../../auth/[...nextauth]";
import { getServerSession } from "next-auth";

export default async function handler(req, res) {
  await mongooseConnect();

  const { id } = req.query;
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  if (req.method === "POST") {
    // Add Comment
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, error: "Content is required" });
    }

    try {
      const post = await Forum.findById(id);
      if (!post) {
        return res.status(404).json({ success: false, error: "Post not found" });
      }

      const newComment = {
        reply: content,
        userId: session.user.id,
        createdAt: new Date(),
      };

      post.commentThread.push(newComment);
      await post.save();

      return res.status(201).json({ success: true, comment: newComment });
    } catch (err) {
      return res.status(500).json({ success: false, error: "Failed to add comment" });
    }
  }

  if (req.method === "DELETE") {
    const { commentId } = req.body;
  
    try {
      const post = await Forum.findById(id);
      if (!post) {
        return res.status(404).json({ success: false, error: "Post not found" });
      }
  
      // Find the index of the comment to delete
      const commentIndex = post.commentThread.findIndex(
        (c) => c._id.toString() === commentId
      );
  
      if (commentIndex === -1) {
        return res.status(404).json({ success: false, error: "Comment not found" });
      }
  
      // Check if the current user owns the comment
      if (post.commentThread[commentIndex].userId.toString() !== session.user.id) {
        return res.status(403).json({ success: false, error: "Unauthorized" });
      }
  
      // Remove the comment from the array
      post.commentThread.splice(commentIndex, 1);
  
      // Save the updated post
      await post.save();
  
      return res
        .status(200)
        .json({ success: true, message: "Comment deleted successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "Failed to delete comment" });
    }
  }
  
  return res.status(405).json({ success: false, error: "Method not allowed" });
}
