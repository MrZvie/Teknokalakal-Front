import { useRouter } from "next/router";
import Head from "next/head";
import Header from "@/components/Header";
import { CartContext } from "@/components/CartContext";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import Center from "@/components/Center";

export default function SuccessPage() {
  const router = useRouter();
  const { clearCart } = useContext(CartContext);
  const { reference } = router.query;
  const [orderDetails, setOrderDetails] = useState(null);
  useEffect(() => {
    // Only fetch once when reference is available
    if (reference && !orderDetails) {
      axios.get('/api/orders').then(response => {
        const order = response.data.find(o => o.reference_number === reference);
        setOrderDetails(order);
      });
      clearCart();
    }
  }, [reference]);
  return (
    <>
      <Head>
        <title>Payment Successful | Teknokalakal</title>
        <meta name="description" content="Your payment has been processed successfully" />
      </Head>
      <Header />
      <Center className="min-h-[87vh] bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full animate-fade-in">
          <div className="text-center">
            <div className="mb-6 animate-bounce">
              <svg className="w-20 h-20 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4 animate-fade-in-up">Payment Successful!</h1>
            
            {orderDetails && (
              <div className="mb-6 text-left bg-gray-50 p-4 rounded-lg">
                <h2 className="font-semibold text-lg mb-2">Order Details</h2>
                <p className="text-gray-600">Order Status: <span className="font-medium text-green-600 capitalize">{orderDetails.status}</span></p>
                <p className="text-gray-600">Reference Number: <span className="font-mono">{reference}</span></p>
                <p className="text-gray-600">Customer: {orderDetails.name}</p>
                <p className="text-gray-600">Email: {orderDetails.email}</p>
                <p className="text-gray-600 font-semibold mt-2">Total Amount: ₱{(orderDetails.line_items.reduce((total, item) => total + item.quantity * item.amount, 0)/100).toFixed(2)}</p>
              </div>
            )}

            <p className="text-gray-600 mb-8">Thank you for your purchase! We'll send you a confirmation email shortly with your order details.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => router.push("/")}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                Return to Home
              </button>
              <button 
                onClick={() => router.push("/orders")}
                className="bg-white border-2 border-green-500 text-green-500 hover:bg-green-50 font-semibold py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                View Orders
              </button>
            </div>
          </div>
        </div>
      </Center>
    </>
  );
}