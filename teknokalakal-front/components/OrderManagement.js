import axios from 'axios';
import { useState } from 'react';
import OrderDetailsModal from './OrderDetailsModal';

const OrderManagement = ({ orders, fetchOrders }) => {
  const [filter, setFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  const filteredOrders = filter ? orders.filter(order => order.status === filter || order.shipping_statuss === filter) : orders;

  const calculateTotalAmount = (order) => {
    return order.line_items.reduce((sum, item) => sum + item.amount * item.quantity, 0);
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
                <td className="py-2 px-3 text-xs md:text-base border-b text-center">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default OrderManagement;