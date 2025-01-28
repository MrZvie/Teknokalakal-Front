import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "@/components/Layout";
import { CldUploadWidget } from "next-cloudinary";
import { useSession } from "next-auth/react";
import Link from "next/link";
import OrderManagement from "@/components/OrderManagement";
import Center from "@/components/Center";
import LoadingIndicator from "@/components/LoadingIndicator";

const VendorPage = () => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: {
      streetAddress: "",
      barangay: "",
      municipality: "",
      province: "",
      postalCode: "",
    },
    phone: "",
    email: session?.user?.email || "",
    certifications: [],
  });

  const [uploadedImages, setUploadedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [application, setApplication] = useState(null);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalSold, setTotalSold] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch vendor application and products
  const fetchVendorData = async () => {
    if (!session?.user?.id) {
      setError("You need to be logged in to view your applications.");
      return;
    }
  
    try {
      const applicationRes = await axios.get(`/api/vendor?vendorId=${session.user.id}`);
  
      // Check if the response has the 'message' key for no application
      if (applicationRes.data.message) {
        setError(applicationRes.data.message);  // Handle the no application case
        setApplication(null);  // No application found
      } else {
        setApplication(applicationRes.data[0]); // Application found
      }

      const { data } = await axios.get('/api/vendor-orders');
        setOrders(data.orders);

      const paidOrders = data.orders.filter(order => order.status === 'paid');
      const totalSold = paidOrders.reduce((sum, order) => {
        return sum + order.line_items.reduce((orderSum, item) => {
          // Exclude shipping fee from the sold count
          if (item.productId) {
            return orderSum + item.quantity;
          }
          return orderSum;
        }, 0);
      }, 0);
  
      const totalEarnings = paidOrders.reduce((sum, order) => {
        const orderTotal = order.line_items.reduce((orderSum, item) => orderSum + (item.amount * item.quantity), 0);
        return sum + orderTotal;
      }, 0) / 100; // Convert from cents to currency
  
      setTotalSold(totalSold);
      setTotalEarnings(totalEarnings);

    } catch (error) {
      console.error("Error fetching vendor data:", error);
      setError("Failed to fetch vendor data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchVendorData();
  }, [session]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (info) => {
    const newImage = { link: info.secure_url, public_id: info.public_id }; // Extract the image URL
    setUploadedImages((prev) => [...prev, newImage]);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  if (!session?.user?.id) {
    alert("You need to be logged in to submit an application.");
    return;
  }

  try {
    const data = {
      vendorId: session.user.id,
      ...formData,
      certifications: uploadedImages.map((image) => ({ public_id: image.public_id, link: image.link })),
    };

    if (application && application.status === "rejected") {
      // If the application was rejected, update it
      await axios.put(`/api/vendor/${application._id}`, data); // Update existing application
      alert("Application updated successfully!");
    } else {
      // If no application exists or status is not rejected, create a new application
      await axios.post("/api/vendor", data);
      alert("Application submitted successfully!");
    }

    // Reset the form and images
    setFormData({
      name: "",
      description: "",
      address: {
        streetAddress: "",
        barangay: "",
        municipality: "",
        province: "",
        postalCode: "",
      },
      phone: "",
      email: "",
      certifications: [],
    });
    setUploadedImages([]); // Clear uploaded images
    fetchVendorData(); // Refresh the vendor data to get the updated application

  } catch (err) {
    console.error(err);
    alert("Error submitting application");
  } finally {
    setIsSubmitting(false);
  }
};

const handleDeleteApplication = async () => {
  try {

    // Call the API with both vendorId and applicationId
    await axios.delete(`/api/vendor?id=${application._id}`);

    setApplication(null);
    alert("Application deleted successfully!");
  } catch (err) {
    console.error("Error in handleDeleteApplication:", err);
    alert("Failed to delete application.");
  }
};

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  if (loading){
    return (
      <Layout>
        <LoadingIndicator />
      </Layout>
    )
  }

  return (
    <Layout>
      <Center>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-6">
          {/* Left Content */}
          <div className="md:col-span-2 max-h-[450px] bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Vendor Application Status
            </h2>
            {application ? (
              <>
                {application.status === "approved" && (
                  <div>
                    <p className="text-green-600 mb-4">
                      Congratulations! Your application has been approved.
                    </p>
                    <Link
                      href="/vendor/products"
                      className="bg-aqua-forest-400 text-white p-2 hover:bg-aqua-forest-500 rounded-lg"
                    >
                      Go to Product Creation
                    </Link>
                  </div>
                )}
                {application.status === "pending" && (
                  <p className="text-gray-600">
                    Your application is currently under review. Please check back later for updates.
                  </p>
                )}
                {application.status === "rejected" && (
                  <div>
                    <p className="text-red-600 mb-4">
                      Unfortunately, your application was rejected. Delete your application and try again. Make sure certification is real or else it will be rejected again.
                    </p>
                    <div className="border p-4 rounded-lg bg-gray-50">
                      <h3 className="font-semibold">Application Details</h3>
                      <p><strong>Name:</strong> {application.businessInfo.name}</p>
                      <p><strong>Description:</strong> {application.businessInfo.description}</p>
                      <p><strong>Email:</strong> {application.businessInfo.email}</p>
                      <button
                        onClick={handleDeleteApplication}
                        className="bg-red-500 text-white mt-4 p-2 rounded-lg hover:bg-red-600"
                      >
                        Delete Application
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-600">
                {error || "You have not submitted an application yet. Please fill out the form to get started."}
              </p>
            )}
          </div>

          {/* Right Form */}
          {!application ? (
            <div className="md:col-span-3 bg-white shadow-md rounded-lg p-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                Application Form
              </h1>
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="space-y-4">
                  {/* Form fields for business details */}
                  <div className="flex gap-2 flex-col md:flex-row">
                    <div className="w-full">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Business Name:
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="w-full">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Email:
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Phone:
                    </label>
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Description:
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="streetAddress"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Street Address:
                      </label>
                      <input
                        type="text"
                        name="streetAddress"
                        id="streetAddress"
                        value={formData.address.streetAddress}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            address: {
                              ...prev.address,
                              streetAddress: e.target.value,
                            },
                          }))
                        }
                        required
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="barangay"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Barangay:
                      </label>
                      <input
                        type="text"
                        name="barangay"
                        id="barangay"
                        value={formData.address.barangay}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            address: {
                              ...prev.address,
                              barangay: e.target.value,
                            },
                          }))
                        }
                        required
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="municipality"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Municipality:
                      </label>
                      <input
                        type="text"
                        name="municipality"
                        id="municipality"
                        value={formData.address.municipality}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            address: {
                              ...prev.address,
                              municipality: e.target.value,
                            },
                          }))
                        }
                        required
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="province"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Province:
                      </label>
                      <input
                        type="text"
                        name="province"
                        id="province"
                        value={formData.address.province}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            address: {
                              ...prev.address,
                              province: e.target.value,
                            },
                          }))
                        }
                        required
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="postalCode"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Postal Code:
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        id="postalCode"
                        value={formData.address.postalCode}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            address: {
                              ...prev.address,
                              postalCode: e.target.value,
                            },
                          }))
                        }
                        required
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="certifications"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Upload 6 Certifications:
                    </label>
                    <CldUploadWidget
                      signatureEndpoint="/api/sign-cloudinary-params"
                      options={{
                        sources: ["local", "google_drive"],
                        maxFiles: 6,
                        folder: "certifications",
                      }}
                      onError={(error) => {
                        if (error && error.message) {
                          if (error.message.includes("maxFiles")) {
                            alert("You can only upload up to 6 files.");
                          } else {
                            alert(
                              "An error occurred while uploading the image. Please try again."
                            );
                          }
                        } else {
                          alert("Unknown error. Please try again.");
                        }
                      }}
                      onSuccess={(result) => handleImageUpload(result.info)}
                    >
                      {({ open }) => (
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedImages([]);
                            open();
                          }}
                          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md"
                        >
                          Upload Certifications
                        </button>
                      )}
                    </CldUploadWidget>
                    <div className="mt-4">
                      <h3 className="font-medium text-sm mb-2"></h3>
                    <h3 className="font-medium text-sm mb-2">
                      Uploaded Images:
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {uploadedImages.map((image, index) => (
                        <div
                          key={index}
                          className="flex justify-center items-center"
                        >
                          <img
                            src={image.link}
                            alt={`Uploaded Image ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-md shadow-md"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-center">
                <button
                  type="submit"
                  className="w-full bg-green-500 text-white p-2 rounded-lg font-medium focus:outline-none"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        ) : application.status === "approved" ? (
          <>
            <div className="md:col-span-3 bg-white shadow-md text-sm md:text-lg rounded-lg p-6">
              <h2 className="font-semibold text-gray-800 mb-4">
                Your Statistics
              </h2>
              <div className="border p-6 rounded-lg bg-white shadow-md">
                <h3 className="font-semibold mb-4">Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
                    <p className="font-medium">Total Products Sold:</p>
                    <p className="font-semibold">{totalSold || 0}</p>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
                    <p className="font-medium">Total Orders:</p>
                    <p className="font-semibold">{orders.filter(order => order.status === 'paid').length || 0}</p>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
                    <p className="font-medium">Total Earnings:</p>
                    <p className="font-semibold">{formatCurrency(totalEarnings)}</p>
                  </div>
                </div>
              </div>
            </div>
              <OrderManagement orders={orders} fetchOrders={fetchVendorData} />
          </>
 
        ) : null}
      </div>
        
      </Center>
    </Layout>
  );
};

export default VendorPage;
