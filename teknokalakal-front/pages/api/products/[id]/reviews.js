import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Products";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res) {
  const { method } = req;

  await mongooseConnect();

  const session = await getServerSession(req, res, authOptions);

  if (method === 'POST') {
    if (!session) {
      return res.status(401).json({ message: "You must be logged in to submit a review" });
    }

    const { id } = req.query;
    const { rating, comment } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = {
      userId: session.user.id,
      rating,
      comment,
    };

    product.reviews.push(review);
    await product.save();

    res.status(201).json(review);
  } else  if (method === "DELETE") {
    if (!session) {
      return res.status(401).json({ message: "You must be logged in to delete a review" });
    }

    const { id: productId } = req.query; // Product ID from the URL
    const reviewId = req.query.reviewId; // Review ID from the query string

    if (!productId || !reviewId) {
      return res.status(400).json({ message: "Missing product ID or review ID" });
    }

    try {
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const reviewIndex = product.reviews.findIndex(
        (review) =>
          review._id.toString() === reviewId &&
          review.userId.toString() === session.user.id
      );

      if (reviewIndex === -1) {
        return res.status(403).json({ message: "You are not authorized to delete this review" });
      }

      // Remove the review
      product.reviews.splice(reviewIndex, 1);
      await product.save();

      return res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
      console.error("Error deleting review:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}