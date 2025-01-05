import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Products";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { v2 as cloudinary } from 'cloudinary';

export default async function handle(req, res) {
  const { method } = req;

  cloudinary.config({
    timeout: 60000,
  });

  async function deleteImages(images) {
    console.log("Deleting images:", images);
    await Promise.all(images.map((image) => {
      console.log(`Deleting image with public_id: ${image.public_id}`);
      return cloudinary.uploader.destroy(image.public_id);
    }));
  }

  await mongooseConnect();

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // Filter products created by the logged-in user and with status 'approved'
    const vendorId = session.user.id;

  if (method === "GET") {

    // Query the products filtered by the user ID and status 'approved'
    if (req.query?.id) {
      res.json(await Product.findOne({ _id: req.query.id }));
    } else {
      const products = await Product.find({ vendorId }).sort({ createdAt: -1 });
      return res.status(200).json(products);
    }
  }

  if (method === "POST") {
    const { title, description, price, stock, images, category, parentCategory, properties, imagesToDelete } = req.body;
    const productDoc = await Product.create({
      title,
      description,
      price,
      stock,
      images,
      category: category || null,
      parentCategory: parentCategory || null,
      properties,
      vendorId: session.user.id, // Save the logged-in user's ID as creator
    });
    if (imagesToDelete?.length > 0) {
      await deleteImages(imagesToDelete);
    }
    res.json(productDoc);
  }

  if (method === "PUT") {
    const { title, description, price, stock, images, category, parentCategory, properties, _id, imagesToDelete } = req.body;
    
    const product = await Product.findById(_id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (imagesToDelete?.length > 0) {
      await deleteImages(imagesToDelete);
    }

    // Filter the images to be updated
    const updatedImages = product.images.filter((image) => {
      // If imagesToDelete contains full image objects, we compare public_id
      return !imagesToDelete.some((img) => img.public_id === image.public_id);
    });
  
    // Find new images that are not already in updatedImages by public_id
    const newImages = images.filter((image) => {
      return !updatedImages.some((img) => img.public_id === image.public_id);
    });
  
    // Merge the updated and new images into one array
    updatedImages.push(...newImages);

    await Product.updateOne(
      { _id },
      {
        title,
        description,
        price,
        stock,
        images: updatedImages,
        category: category || null,
        parentCategory: parentCategory || null,
        properties,
      }
    );
    res.json(true);
  }

  if (method === "DELETE") {
    const { id } = req.query;
  
    try {
      // Ensure the product belongs to the vendor before deleting
      const product = await Product.findOne({ _id: id, vendorId }); // Validate ownership using 'createdBy'
      if (!product) {
        return res.status(404).json({ message: "Product not found or unauthorized" });
      }
  
      // Delete images from Cloudinary first
      if (product.images?.length > 0) {
        try {
          await deleteImages(product.images);
        } catch (error) {
          console.error("Error deleting images from Cloudinary:", error);
          // Optionally, handle the error here (retry or log) but still proceed with product deletion
          return res.status(500).json({ message: "Failed to delete images from Cloudinary" });
        }
      }
  
      // Delete the product from the database
      await Product.findByIdAndDelete(id);
  
      return res.status(200).json({ message: "Product and images deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      return res.status(500).json({ message: "Failed to delete product" });
    }
  }
  

  res.setHeader("Allow", ["GET", "DELETE"]);
  res.status(405).end(`Method ${req.method} not allowed`);

}
