import React from 'react';

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  const totalAmount = order.line_items.reduce((sum, item) => sum + item.amount * item.quantity, 0);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-w-2xl relative">
        <h2 className="text-2xl font-semibold mb-4">Order Details</h2>
        <div className="mb-4">
          <p className="mb-2"><strong>Customer:</strong> {order.name}</p>
          <p className="mb-2"><strong>Email:</strong> {order.email}</p>
          <p className="mb-2"><strong>Phone(+63):</strong> {order.phone}</p>
          <p className="mb-2"><strong>Reference#:</strong> {order.reference_number}</p>
          <p className="mb-2"><strong>Total:</strong> {new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
          }).format(totalAmount / 100)}</p>
          <p className="mb-2"><strong>Payment Status:</strong> {order.status}</p>
          <p className="mb-2"><strong>Shipping Status:</strong> {order.shipping_statuss}</p>
          <p className="mb-2"><strong>Address:</strong> {order.address.streetAddress}, {order.address.barangay}, {order.address.municipality}, {order.address.province}, {order.address.postalCode}</p>
          <p className="mb-2"><strong>Items:</strong></p>
          <ul className="list-disc list-inside mb-4">
            {order.line_items.map((item, index) => (
              <li key={index}>
                {item.name} - {item.quantity} x {new Intl.NumberFormat("en-PH", {
                  style: "currency",
                  currency: "PHP",
                }).format(item.amount / 100)} {item.currency}
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={onClose}
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default OrderDetailsModal;