import axios from 'axios';
import { useState } from 'react';
import swal from "sweetalert2";

const OrderManagement = ({ orders, fetchOrders }) => {
  const [filter, setFilter] = useState('');
  // const [selectedOrder, setSelectedOrder] = useState(null);

  const handleShippingStatusChange = async (orderId, shipping_statuss) => {
    try {
      await axios.put(`/api/orders/${orderId}`, { shipping_statuss });
      fetchOrders(); // Refresh orders after update
    } catch (error) {
      console.error('Error updating shipping status:', error);
    }
  };

  const handlePaymentStatusChange = async (orderId, status) => {
    try {
      await axios.put(`/api/orders/${orderId}`, { status });
      fetchOrders(); // Refresh orders after update
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const handleRefundAction = async (orderId, action) => {
    try {
      const response = await axios.post(`/api/orders/${orderId}/approve-reject-refund`, { action });
      swal.fire("",response.data.message,"success"); // Use the message from the response
      fetchOrders(); // Refresh the vendor data to get the updated orders
    } catch (error) {
      console.error(`Error ${action}ing refund request:`, error);
      swal.fire(`Failed to ${action} refund request.`);
    }
  };

  const filteredOrders = filter ? orders.filter(order => order.status === filter || order.shipping_statuss === filter) : orders;

  const calculateTotalAmount = (order) => {
    return order.line_items.reduce((sum, item) => sum + item.amount * item.quantity, 0);
  };

  const showOrderDetails = (order) => {
    swal.fire({
      title: `<h2 class="text-sm md:text-lg font-semibold text-gray-800">Order Details</h2>`,
      html: `
        <div class="text-left p-3 max-w-full">
          <div class="mb-3">
            <p class="text-xs md:text-sm text-gray-700"><strong>Customer Name:</strong> ${order.name}</p>
            <p class="text-xs md:text-sm text-gray-600"><strong>Email:</strong> ${order.email}</p>
            <p class="text-xs md:text-sm text-gray-600"><strong>Phone:</strong> ${order.phone}</p>
            <p class="text-xs md:text-sm text-gray-600"><strong>Address:</strong> ${order.address.streetAddress}, 
              ${order.address.barangay}, ${order.address.municipality}, 
              ${order.address.province}, ${order.address.postalCode}
            </p>
          </div>
          <div class="bg-gray-100 p-2 rounded-lg">
            <p class="text-xs md:text-sm font-medium"><strong>Payment Status:</strong> <span class="text-blue-600">${order.status}</span></p>
            <p class="text-xs md:text-sm font-medium"><strong>Shipping Status:</strong> <span class="text-green-600">${order.shipping_statuss}</span></p>
          </div>
          <div class="mt-3">
            <h3 class="text-xs md:text-sm font-semibold text-gray-700">Items:</h3>
            <div class="overflow-x-auto max-h-[85px]">
              <table class="w-full mt-2 border-collapse text-xs md:text-sm">
                <thead>
                  <tr class="border-b">
                    <th class="text-left text-gray-700 p-1">Product</th>
                    <th class="text-left text-gray-700 p-1">Qty</th>
                    <th class="text-left text-gray-700 p-1">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.line_items.map((item) => `
                    <tr class="border-b">
                      <td class="py-1 px-1">${item.name}</td>
                      <td class="py-1 px-1">${item.quantity}</td>
                      <td class="py-1 px-1">${new Intl.NumberFormat("en-PH", {
                          style: "currency",
                          currency: "PHP",
                        }).format(item.amount / 100)}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
          ${order.refundRequested && order.refundStatus === 'pending' ? `
            <div class="mt-3 flex flex-wrap justify-center gap-2 md:gap-3">
              <button id="approveRefund" class="text-xs md:text-sm bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition w-full md:w-auto">
                Approve Refund
              </button>
              <button id="rejectRefund" class="text-xs md:text-sm bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition w-full md:w-auto">
                Reject Refund
              </button>
            </div>
          ` : ''}
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      customClass: {
        popup: 'rounded-lg shadow-lg max-w-xs md:max-w-md w-full',
      },
      didOpen: () => {
        if (order.refundRequested && order.refundStatus === 'pending') {
          document.getElementById('approveRefund').addEventListener('click', () => handleRefundAction(order._id, 'approve'));
          document.getElementById('rejectRefund').addEventListener('click', () => handleRefundAction(order._id, 'reject'));
        }
      },
    });
  };

  return (
    <div className="mt-6 md:col-span-5">
      <h3 className="text-xl font-semibold mb-4">Order Management</h3>
      <div className="mb-4">
        <label htmlFor="filter" className="mr-2">Filter by Status:</label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full rounded-lg bg-white">
          <thead>
            <tr>
              <th className="py-2 px-3 text-xs md:text-base border-b">Customer Name</th>
              <th className="py-2 px-3 text-xs md:text-base border-b">Total</th>
              <th className="py-2 px-3 text-xs md:text-base border-b">Payment Status</th>
              <th className="py-2 px-3 text-xs md:text-base border-b">Shipping Status</th>
              <th className="py-2 px-3 text-xs md:text-base border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order._id}>
                <td className="py-2 px-3 text-xs md:text-base border-b text-center">{order.name}</td>
                <td className="py-2 px-3 text-xs md:text-base border-b text-center">{new Intl.NumberFormat("en-PH", {
                  style: "currency",
                  currency: "PHP",
                }).format(calculateTotalAmount(order) / 100)}</td>
                <td className="py-2 px-3 text-xs md:text-base border-b text-center">
                  <select
                    value={order.status}
                    onChange={(e) => handlePaymentStatusChange(order._id, e.target.value)}
                    className="p-2 border border-gray-300 rounded-md"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="py-2 px-3 text-xs md:text-base border-b text-center">
                  <select
                    value={order.shipping_statuss}
                    onChange={(e) => handleShippingStatusChange(order._id, e.target.value)}
                    className="p-2 border border-gray-300 rounded-md"
                  >
                    <option value="pending">Pending</option>
                    <option value="awaiting_courier">Awaiting Courier</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="py-2 px-3 flex gap-2 text-xs md:text-base border-b">
                  <button
                    onClick={() => showOrderDetails(order)}
                    className="bg-blue-500 text-white text-xs md:text-sm px-2 md:px-4 py-1 md:py-2 rounded-lg hover:bg-blue-600"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;