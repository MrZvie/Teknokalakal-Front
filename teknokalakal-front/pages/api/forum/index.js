import { mongooseConnect } from "@/lib/mongoose";
import { Forum } from "@/models/Forum";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
    await mongooseConnect();

    if (req.method === "GET") {
        try {
            const posts = await Forum.find().populate("userId", "name email");
            res.status(200).json({ success: true, posts });
        } catch (error) {
            res.status(500).json({ success: false, error: "Failed to fetch posts" });
        }
    } else if (req.method === "POST") {
        const session = await getServerSession(req, res, authOptions);

        if (!session?.user?.id) {
            return res.status(401).json({ success: false, error: "Unauthorized" });
        }

        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }

        try {
            const newPost = await Forum.create({
                title,
                content,
                userId: session.user.id,
                upvotes: 0,
                downvotes: 0,
            });
            const populatedPost = await Forum.findById(newPost._id).populate(
              "userId",
              "name email"
            );

            res.status(201).json({ success: true, post: populatedPost });
        } catch (error) {
            res.status(500).json({ success: false, error: "Failed to create post" });
        }
    } else if (req.method === "PUT") {
        const session = await getServerSession(req, res, authOptions);
        const { postId, type } = req.body;
    
        if (!postId || !type) {
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }
    
        if (!session?.user?.id) {
            return res.status(401).json({ success: false, error: "Unauthorized" });
        }
    
        try {
            const post = await Forum.findById(postId);
    
            if (!post) {
                return res.status(404).json({ success: false, error: "Post not found" });
            }
    
            const userId = session.user.id;
            const existingVote = post.votes.find((vote) => vote.userId.toString() === userId);
    
            // Remove existing vote if it exists
            if (existingVote) {
                if (existingVote.type === "upvote") {
                    post.upvotes -= 1;
                } else if (existingVote.type === "downvote") {
                    post.downvotes -= 1;
                }
                post.votes = post.votes.filter((vote) => vote.userId.toString() !== userId);
            }
    
            // Add new vote
            if (type === "upvote") {
                post.upvotes += 1;
                post.votes.push({ userId, type });
            } else if (type === "downvote") {
                post.downvotes += 1;
                post.votes.push({ userId, type });
            }
    
            await post.save();
    
            res.status(200).json({ success: true, post });
        } catch (error) {
            console.error("Error updating votes:", error);
            res.status(500).json({ success: false, error: "Failed to update post" });
        }
    }  else if (req.method === "DELETE") {
        const session = await getServerSession(req, res, authOptions);
        const { postId } = req.body;
    
        if (!session?.user?.id) {
            return res.status(401).json({ success: false, error: "Unauthorized" });
        }
    
        if (!postId) {
            return res.status(400).json({ success: false, error: "Missing post ID" });
        }
    
        try {
            const post = await Forum.findById(postId);
    
            if (!post) {
                return res.status(404).json({ success: false, error: "Post not found" });
            }
    
            if (post.userId.toString() !== session.user.id) {
                return res.status(403).json({ success: false, error: "Forbidden: You can only delete your own posts" });
            }
    
            await Forum.findByIdAndDelete(postId);
    
            res.status(200).json({ success: true, message: "Post deleted successfully" });
        } catch (error) {
            console.error("Error deleting post:", error);
            res.status(500).json({ success: false, error: "Failed to delete post" });
        }
    }  
}
