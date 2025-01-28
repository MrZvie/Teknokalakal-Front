import Layout from "@/components/Layout";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LoadingIndicator from "@/components/LoadingIndicator";
import Center from "@/components/Center";
import EditIcon from "@/components/icons/EditIcon";
import LogOutIcon from "@/components/icons/LogOutIcon";
import axios from "axios";
import Modal from "@/components/Modal";
import XIcon from "@/components/icons/XIcon";
import swal from "sweetalert2";
import Link from "next/link";

export default function AccountPage() {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [application, setApplication] = useState(null);
  const [address, setAddress] = useState({
    streetAddress: session?.user?.address?.streetAddress || "",
    barangay: session?.user?.address?.barangay || "",
    municipality: session?.user?.address?.municipality || "",
    province: session?.user?.address?.province || "",
    postalCode: session?.user?.address?.postalCode || "",
  });

  // Fetch orders for the logged-in user
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const fetchOrders = async () => {
        try {
          const response = await axios.get(
            `/api/orders?userId=${session.user.id}`
          );
          setOrders(response.data);
        } catch (error) {
          console.error("Error fetching orders:", error);
        } finally {
          setLoadingOrders(false);
        }
      };

      fetchOrders();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session?.user?.address) {
      setAddress(session.user.address);
    }
  }, [session]);

  // Fetch vendor application status
  const fetchVendorData = async () => {
    if (!session?.user?.id) {
      return;
    }

    try {
      const applicationRes = await axios.get(`/api/vendor?vendorId=${session.user.id}`);
      if (applicationRes.data.length > 0) {
        setApplication(applicationRes.data[0]); // Assuming one application per user
      } else {
        setApplication(null); // No application yet
      }
    } catch (error) {
      swal.fire("Error!","Failed to fetch vendor data.",'error');
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchVendorData();
    }
  }, [session]);

  if (status === "loading" || loadingOrders) {
    return (
      <Layout className="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-aqua-forest-300 z-50">
        <LoadingIndicator />
      </Layout>
    );
  }

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const username = e.target.username.value;

    const updatedAddress = {
      streetAddress: address.streetAddress,
      barangay: address.barangay,
      municipality: address.municipality,
      province: address.province,
      postalCode: address.postalCode,
    };

    try {
      const res = await fetch("/api/auth/updateProfile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          name,
          username,
          address: updatedAddress,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error:", errorData);
        swal.fire("Error saving profile: " + (errorData.message || "Unknown error."),'error');
      } else {
        const { updatedUser } = await res.json();
        await updateSession({
          user: updatedUser,
        });
        swal.fire("Success!!","Profile updated successfully!",'success');
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      swal.fire("Error saving profile.",'error');
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  if (!session) {
    return null;
  }

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  const { user } = session;

  return (
    <Layout>
      <Center>
        <div className="grid grid-rows-1 md:grid-cols-3 gap-4 mt-3">
          {/* Left Column: Order Card */}
          <div className=" md:col-span-2 md:order-1 order-2 max-w-4xl mx-auto overflow-hidden">
            <div className="flex justify-between w-full mb-2 items-center gap-3">
              <h1 className="text-2xl flex-start font-bold text-gray-800 mb-0">
                Your Orders
              </h1>
              <Link
                href={
                  application && application.status === "approved"
                    ? "/vendor"
                    : "/vendor"
                }
                className="bg-aqua-forest-600 text-white py-2 px-3 hover:bg-aqua-forest-500 rounded-lg"
              >
                {application && application.status === "approved"
                  ? "My Shop"
                  : "Become a seller?"}
              </Link>
            </div>
            {orders.length > 0 ? (
              <div className="overflow-auto max-h-[425px] border-gray-800 border md:max-h-[450px]">
                {/* Table Layout (for large screens) */}
                <div className="hidden sm:block">
                  <div className="overflow-auto max-h-[450px]">
                    <table className="min-w-full bg-white shadow-md rounded-lg">
                      <thead className="sticky top-0 bg-gray-100">
                        <tr className="text-left bg-gray-100">
                          <th className="py-3 px-4 text-sm font-semibold text-gray-700">
                            Order #
                          </th>
                          <th className="py-3 px-4 text-sm font-semibold text-gray-700">
                            Payment Status
                          </th>
                          <th className="py-3 px-4 text-sm font-semibold text-gray-700">
                            Shipping Status
                          </th>
                          <th className="py-3 px-4 text-sm font-semibold text-gray-700">
                            Items
                          </th>
                          <th className="py-3 px-4 text-sm font-semibold text-gray-700">
                            Date
                          </th>
                          <th className="py-3 px-4 text-sm font-semibold text-gray-700">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                          {orders.map((order) => {
                            return (
                              <tr
                                key={order._id}
                                className="border-b border-gray-200"
                              >
                                <td className="py-3 px-4 text-sm text-gray-800">
                                  {order.reference_number}
                                </td>
                                <td className="py-3 px-4 text-sm">
                                  <span
                                    className={`${
                                      order.status === "paid"
                                        ? "text-green-500"
                                        : order.status === "pending"
                                        ? "text-yellow-500"
                                        : "text-red-500"
                                    }`}
                                  >
                                    {order.status}
                                  </span>
                                </td>
                                <td>
                                <span
                                    className={`${
                                      order.shipping_statuss === "delivered"
                                        ? "text-green-500"
                                        : order.shipping_statuss === "pending"
                                        ? "text-yellow-500"
                                        : order.shipping_statuss === "awaiting_courier"
                                        ? "text-purple-400"
                                        : order.shipping_statuss === "shipped"
                                        ? "text-blue-500"
                                        : "text-red-500"
                                    }`}
                                  >
                                    {order.shipping_statuss}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                  {order.line_items.length}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                  {formatDate(order.createdAt)}
                                </td>
                                <td className="py-3 px-4 text-sm">
                                  <button
                                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition duration-300 text-[12px]"
                                    onClick={() => handleViewDetails(order)}
                                  >
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                  
                    </table>
                    {/* <div className="overflow-y-auto h-[400px]">
                      <table className="min-w-full bg-white">
                        <tbody>
                          {orders.map((order) => {
                            return (
                              <tr
                                key={order._id}
                                className="border-b border-gray-200"
                              >
                                <td className="py-3 px-4 text-sm text-gray-800">
                                  {order.reference_number}
                                </td>
                                <td className="py-3 px-4 text-sm">
                                  <span
                                    className={`${
                                      order.status === "paid"
                                        ? "text-green-500"
                                        : order.status === "pending"
                                        ? "text-yellow-500"
                                        : "text-red-500"
                                    }`}
                                  >
                                    {order.status}
                                  </span>
                                </td>
                                <td>
                                <span
                                    className={`${
                                      order.shipping_statuss === "delivered"
                                        ? "text-green-500"
                                        : order.shipping_statuss === "pending"
                                        ? "text-yellow-500"
                                        : order.shipping_statuss === "awaiting_courier"
                                        ? "text-purple-400"
                                        : order.shipping_statuss === "shipped"
                                        ? "text-blue-500"
                                        : "text-red-500"
                                    }`}
                                  >
                                    {order.shipping_statuss}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                  {order.line_items.length}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                  {formatDate(order.createdAt)}
                                </td>
                                <td className="py-3 px-4 text-sm">
                                  <button
                                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition duration-300 text-[12px]"
                                    onClick={() => handleViewDetails(order)}
                                  >
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div> */}
                  </div>
                </div>

                {/* Card Layout (for small screens) */}
                <div className="sm:hidden">
                  {orders.map((order) => {
                    return (
                      <div
                        key={order._id}
                        className="border border-gray-200 rounded-lg p-4 mb-4 bg-white shadow-sm"
                      >
                        <p className="font-semibold text-gray-800">
                          Order #: {order.reference_number}
                        </p>
                        <p className="text-gray-600">
                          Status:
                          <span
                            className={`${
                              order.status === "paid"
                                ? "text-green-500"
                                : order.status === "pending"
                                ? "text-yellow-500"
                                : "text-red-500"
                            }`}
                          >
                            {order.status}
                          </span>
                        </p>
                        <p className="text-gray-600">
                          Items: {order.line_items.length}
                        </p>
                        <p className="text-gray-600">
                          Date: {formatDate(order.createdAt)}
                        </p>

                        <div className="mt-2">
                          <button
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 text-sm"
                            onClick={() => handleViewDetails(order)}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No orders found.</p>
            )}
          </div>

          {/* Modal for Order Details */}
          {isModalOpen && selectedOrder && (
            <Modal onClose={handleCloseModal}>
              <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg relative">
                {/* Close button */}
                <button
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
                  aria-label="Close Modal"
                >
                  <XIcon />
                </button>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Order Details
                </h2>

                <p className="text-gray-700">
                  <strong>Reference Number:</strong>{" "}
                  {selectedOrder.reference_number}
                </p>
                <p className="text-gray-700">
                  <strong>Date:</strong> {formatDate(selectedOrder.createdAt)}
                </p>
                <p className="text-gray-700">
                  <strong>Status:</strong> {selectedOrder.status}
                </p>
                <p className="text-gray-700">
                  <strong>Total:</strong> ₱
                  {(
                    selectedOrder.line_items.reduce(
                      (total, item) => total + item.amount * item.quantity,
                      0
                    ) / 100
                  ).toFixed(2)}
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-2">Order Items</h3>

                {/* Scrollable Order Items Table */}
                <div className="border space-y-2 border-gray-300 rounded-lg overflow-x-auto">
                  <div className="border-b-2 border-gray-400">
                    <table className="min-w-full table-auto divide-y divide-gray-200">
                      <thead>
                        <tr classNmae=" border-b-3 border-gray-200">
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                            Name
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                            Quantity
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                            Price
                          </th>
                        </tr>
                      </thead>
                    </table>
                  </div>
                  <div className="max-h-[80px] overflow-y-auto">
                    <table className="min-w-full table-auto divide-y divide-gray-200">
                      <tbody>
                        {selectedOrder.line_items.map((item, index) => (
                          <tr key={index} className="border-b">
                            <td className="px-4 py-2 text-sm text-gray-800">
                              {item.name}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-800">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-800">
                              ₱{(item.amount / 100).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </Modal>
          )}

          {/* Right Column: Account Information */}
          <div className="md:col-span-1 md:order-2 order-1 max-w-xl mx-auto space-y-2">
            {!isEditing ? (
              <div className="space-y-4 bg-white py-2 px-6 rounded-lg shadow-lg max-w-xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800">
                  Account Information
                </h1>
                <div className="flex items-center space-x-4">
                  {user.name ? (
                    <img
                      src="https://cdn-icons-gif.flaticon.com/8819/8819071.gif"
                      alt="Profile Picture"
                      className="w-24 h-24 rounded-full object-cover border border-gray-300"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                      <span className="text-sm md:text-base">No Image</span>
                    </div>
                  )}
                  <div>
                    <p className=" text-lg font-medium text-gray-800">
                      {user.name}
                    </p>
                    <p className="text-gray-600">@{user.username}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm md:text-base text-gray-700">
                    {user.email}
                  </p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-600">
                    Address
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-lg text-gray-700">
                      {user.address.streetAddress}
                    </p>
                    <p className="text-lg text-gray-700">
                      {user.address.barangay}
                    </p>
                    <p className="text-lg text-gray-700">
                      {user.address.municipality}
                    </p>
                    <p className="text-lg text-gray-700">
                      {user.address.province}
                    </p>
                    <p className="text-lg text-gray-700">
                      {user.address.postalCode}
                    </p>
                  </div>
                </div>
                <div className="flex md:flex-col justify-center items-center text-xs md:text-base gap-2 ">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 text-white w-28 md:w-full py-2 px-2 sm:px-3 md:px-6 rounded-lg hover:bg-blue-700 transition duration-300 flex justify-center items-center gap-2 md:gap-4"
                  >
                    <EditIcon />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white w-28 md:w-full py-2 px-2 sm:px-3 md:px-6 rounded-lg hover:bg-red-700 transition duration-300 flex justify-center items-center gap-2 md:gap-4"
                  >
                    <LogOutIcon />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <form
                className="space-y-4 bg-white py-2 px-6 rounded-lg shadow-lg max-w-xl mx-auto"
                onSubmit={handleSaveChanges}
              >
                <h1 className="text-2xl font-bold text-gray-800">
                  Account Information
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={user.name}
                      className="w-full p-3 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      defaultValue={user.username}
                      className="w-full p-3 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                </div>

                {/* Address fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={address.streetAddress}
                      onChange={(e) =>
                        setAddress({
                          ...address,
                          streetAddress: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Barangay
                    </label>
                    <input
                      type="text"
                      value={address.barangay}
                      onChange={(e) =>
                        setAddress({ ...address, barangay: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Municipality
                    </label>
                    <input
                      type="text"
                      value={address.municipality}
                      onChange={(e) =>
                        setAddress({ ...address, municipality: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Province
                    </label>
                    <input
                      type="text"
                      value={address.province}
                      onChange={(e) =>
                        setAddress({ ...address, province: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={address.postalCode}
                      onChange={(e) =>
                        setAddress({ ...address, postalCode: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex text-[14px] justify-between space-x-4">
                  <button
                    type="submit"
                    className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300 w-auto sm:w-full"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition duration-300 w-auto sm:w-full"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </Center>
    </Layout>
  );
}
