import { mongooseConnect } from "@/lib/mongoose";
import { Vendor } from "@/models/Vendor";
import { v2 as cloudinary } from 'cloudinary';
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {

  cloudinary.config({
    timeout: 60000,
  });

  async function deleteImages(certifications) {
    console.log("Deleting certifications:", certifications);
    await Promise.all(certifications.map((certificate) => {
      console.log(`Deleting image with public_id: ${certificate.public_id}`);
      return cloudinary.uploader.destroy(certificate.public_id);
    }));
  }

  await mongooseConnect();
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (req.method === "GET") {
    try {
      const { vendorId } = req.query;

      if (!vendorId) {
        return res.status(400).json({ message: "Vendor ID is required." });
      }

      // Fetch applications for the vendor
      const application = await Vendor.find({ vendorId }).sort({ registrationDate: -1 });

      if (application.length === 0) {
        // No applications found, but we send a user-friendly message
        return res.status(200).json({ message: "Do you want to become a seller? You can submit an application if you want to." });
      }

      res.status(200).json(application); // Found applications
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendor applications." });
    }
  } else if (req.method === "POST") {
    try {
      const { vendorId, name, description, address, phone, email, certifications } = req.body;

      const vendor = new Vendor({
        vendorId,
        businessInfo: { name, description, address, phone, email },
        certifications,
        status: "pending",
        registrationDate: new Date(),
        lastUpdated: new Date(),
      });

      await vendor.save();
      res.status(201).json({ success: true, vendor });
    } catch (error) {
      console.error("Error saving vendor:", error);
      res.status(500).json({ success: false, message: "Error saving vendor" });
    }
  } else if (req.method === "DELETE") {
    const { id } = req.query;
    const vendorId = session.user.id;

    try {

      // Find the application that matches both vendorId and applicationId
      const vendorApplication = await Vendor.findOne({ _id: id, vendorId });

      if (!vendorApplication) {
        return res.status(404).json({ message: "Application not found or you are not authorized to delete it." });
      }

      // If there are images to delete, remove them from Cloudinary first
      if (vendorApplication.certifications?.length > 0) {
        try {
          await deleteImages(vendorApplication.certifications);
        } catch (error) {
          console.error("Error deleting images from Cloudinary:", error);
          // Optionally, handle the error here (retry or log) but still proceed with product deletion
          return res.status(500).json({ message: "Failed to delete images from Cloudinary" });
        }
      }

      // Delete the application
      const deletedApplication = await Vendor.findByIdAndDelete(id);

      if (!deletedApplication) {
        return res.status(404).json({ message: "Failed to delete application." });
      }

      res.status(200).json({ success: true, message: "Application and images deleted successfully." });
    } catch (error) {
      console.error("Error deleting vendor application:", error);
      res.status(500).json({ success: false, message: "Failed to delete application." });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}