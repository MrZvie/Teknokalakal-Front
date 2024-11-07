import { useRouter } from "next/router";
import Head from "next/head";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import axios from "axios";
import Center from "@/components/Center";
import LoadingIndicator from "@/components/LoadingIndicator";

export default function CancelPage() {
  const router = useRouter();
  const { reference } = router.query;
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (reference) {
      axios.get('/api/orders')
        .then(response => {
          const order = response.data.find(o => o.reference_number === reference);
          if (order) {
            axios.put(`/api/orders/${order._id}`, {
              status: 'checkout_cancelled',
              statusDescription: 'Customer cancelled the checkout session'
            })
            .then(() => {
              setOrderDetails({ ...order, status: 'checkout_cancelled' });
            })
            .catch(error => {
              setError('Error cancelling order: ' + error.message);
            });
          } else {
            setError('Order not found');
          }
        })
        .catch(error => {
          setError('Error fetching orders: ' + error.message);
        });
    }
  }, [reference]);

  return (
    <>
      <Head>
        <title>Order Cancelled | Teknokalakal</title>
      </Head>
      <Header />
      <Center className="min-h-[87vh] bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Checkout Session Cancelled</h1>
            {error ? (
              <div className="mb-6 text-left bg-gray-50 p-4 rounded-lg">
                <p>{error}</p>
              </div>
            ) : orderDetails ? (
              <div className="mb-6 text-left bg-gray-50 p-4 rounded-lg">
                <p>Reference Number: {reference}</p>
                <p>Status: <span className="font-bold text-red-600">{orderDetails.status}</span></p>
                <p>Reason: You cancelled the checkout session</p>
              </div>
            ) : (
              <LoadingIndicator />
            )}
            <p>Please restart your purchase.</p>
            <button
              onClick={() => router.push("/cart")}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              Start New Order
            </button>
          </div>
        </div>
      </Center>
    </>
  );
}