import { CartContext } from "@/components/CartContext";
import Center from "@/components/Center";
import CartIcon from "@/components/icons/CartIcon";
import axios from "axios";
import { useRouter } from "next/router";
import { useCallback, useContext, useEffect, useState } from "react";
import LoadingIndicator from "@/components/LoadingIndicator";
import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";
import swal from "sweetalert2";

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [barangay, setBarangay] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingFee, setShippingFee] = useState(0);

    // this is the context that will be used to access the cartProducts
    const { cartProducts, removeProduct, UpdateQuantity, clearCart } = useContext(CartContext);
    
    const [isLoading, setIsLoading] = useState(false);

  // Pre-fill form with session data
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      setPhone(session.user.phone || "");
      setProvince(session.user.address?.province || "");
      setMunicipality(session.user.address?.municipality || "");
      setBarangay(session.user.address?.barangay || "");
      setPostalCode(session.user.address?.postalCode || "");
      setStreetAddress(session.user.address?.streetAddress || "");
    }
  }, [session]);

  // Fetch shipping fee from the database when the component mounts
  useEffect(() => {
    const fetchShippingFee = async () => {
      try {
        const response = await axios.get("/api/shipping-fee");
        setShippingFee(response.data.shippingFee); 
        console.log("Shipping fee:", response.data.shippingFee);
      } catch (error) {
        console.error("Error fetching shipping fee:", error);
      }
    };
    fetchShippingFee();
  }, []);

  // Handle form submission and initiate payment process via PayMongo API 
  async function handleCheckout(ev) {
    ev.preventDefault();
  
    // Validate phone number and postal code
    if (!/^\d+$/.test(phone)) {
      alert("Phone number should only contain numbers.");
      return;
    }
    if (!/^\d+$/.test(postalCode)) {
      alert("Postal code should only contain numbers.");
      return;
    }
    // To make sure that the reference number is unique, we will use a random string generator and sa huli we will add zvie in it
    const referenceNumber = () => {
      const randomString = Math.random().toString(36).substring(2, 10); // Random 8-character string
      return `${randomString}-zvie`;
    };
    setIsProcessing(true);
    try {
      const response = await axios.post("/api/checkout", {
        name,
        email,
        phone,
        province,
        municipality,
        barangay,
        postalCode,
        streetAddress,
        referenceNumber: referenceNumber(),
        shippingFee,
      });
      const { checkoutUrl } = response.data;
      if (checkoutUrl) {
        console.log("Redirecting to checkout session:", checkoutUrl);
        // Redirect to PayMongo hosted checkout session
        window.location.href = checkoutUrl;
      } else {
        alert("Failed to create checkout session.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error.response?.data?.error || "Failed to initiate checkout.");
    } finally {
      setIsProcessing(false);
    }
  }
  

// this is the function that will add the product to the cart
const moreProducts = async (productId, quantity) => {
  try {
    const updatedQuantity = quantity + 1;
    await UpdateQuantity(productId, updatedQuantity); // Update in context or database
  } catch (error) {
    console.error("Error adding product:", error);
  }
};

// this is the function that will remove the product from the cart
const lessProducts = async (productId, quantity) => {
  try {
    const updatedQuantity = quantity - 1;
    if (updatedQuantity > 0) {
      await UpdateQuantity(productId, updatedQuantity); // Update in context or database
    } else {
      await removeProduct(productId);
    }
  } catch (error) {
    console.error("Error removing product:", error);
  }
};

// Clear the entire cart and delete it also in the database for the logged-in user
const clearProducts = async () => {
  try {
    await clearCart();
    swal.fire('','Products in the cart has been cleared','success');
  } catch (error) {
    console.error("Error clearing cart:", error);
  }
};

  // Calculate total price
  function Total() {
    const productTotal = cartProducts.reduce((total, product) => {
      return total + product.productId.price * product.quantity;
    }, 0);
  
    return productTotal + shippingFee;
  }
  

  const handlePhoneChange = (ev) => {
    const value = ev.target.value.replace(/\D/g, '');
    setPhone(value);
  };

  const handlePostalCodeChange = (ev) => {
    const value = ev.target.value.replace(/\D/g, '');
    setPostalCode(value);
  };

  return (
    <Layout>
      <Center>
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr,.8fr] gap-[40px] mt-7">
          <div className="bg-white shadow-lg rounded-lg py-4 px-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-semibold my-3 text-gray-800">Shopping Cart</h2>
              <button onClick={clearProducts} className="md:w-32 w-20 h-10 flex items-center justify-center rounded-md text-sm font-medium text-white bg-red-500 hover:bg-red-600 border border-transparent hover:border-red-700 transition duration-200 ease-in-out">Clear Cart</button>
            </div>
            {isLoading ? (
              <LoadingIndicator />
            ) : !cartProducts.length ? (
              <div className="text-center py-8 text-gray-500">
                <CartIcon className="w-16 h-16 mx-auto text-gray-400" />
                <h3 className="text-xl font-medium mb-2">Your cart is empty</h3>
                <p className="text-gray-400">Looks like you haven't added any items yet</p>
              </div>
            ) : (
              <>
                <div className="max-h-[340px] overflow-y-auto">
                  <table className="w-full text-sm sm:text-base">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left p-2 sm:p-4 text-gray-600">Products</th>
                        <th className="text-center p-2 sm:p-4 text-gray-600">Quantity</th>
                        <th className="text-right p-2 sm:p-4 text-gray-600">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartProducts.map(product => {
                        const { productId, quantity } = product;

                        return (
                          <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-2 sm:p-4 border-b border-gray-100 flex md:flex-row flex-col justify-start text-center items-center gap-2 md:gap-4">
                              {productId.images?.length ? (
                                <img
                                  src={productId.images[0].link}
                                  alt={productId.title}
                                  className="w-[40px] h-[40px] sm:w-[60px] sm:h-[60px] object-cover rounded-lg shadow-sm "
                                />
                              ) : (
                                <div className="w-[40px] h-[40px] sm:w-[60px] sm:h-[60px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                  No image
                                </div>
                              )}
                              <span className="font-medium text-gray-800 ">{productId.title}</span>
                            </td>
                            <td className="text-center p-2 sm:p-4 border-b border-gray-100">
                              <div className="flex md:flex-row flex-col-reverse items-center justify-center gap-2">
                                <button
                                  onClick={() => lessProducts (product.productId._id, quantity)}
                                  className="w-6 h-6 sm:w-8 sm:h-8  flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full"
                                >
                                  -
                                </button>
                                <span className="mx-2 font-medium">{quantity}</span>
                                <button
                                  onClick={() => moreProducts (product.productId._id, quantity)}
                                  className="w-6 h-6 sm:w-8 sm:h-8  flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-full"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="text-right p-2 sm:p-4 border-b border-gray-100 font-medium">
                              {new Intl.NumberFormat("en-PH", {
                                style: "currency",
                                currency: "PHP",
                              }).format(productId.price)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="border-t-2 border-gray-200">
                  <div className="flex justify-end font-semibold text-lg p-4">
                    <span className="mr-4 text-sm sm:text-base">Shipping Fee:</span>
                    <span className="text-blue-600 text-sm sm:text-base">
                      {new Intl.NumberFormat("en-PH", {
                        style: "currency",
                        currency: "PHP",
                      }).format(shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-end font-semibold text-lg p-4">
                    <span className="mr-4 text-sm sm:text-base">Total:</span>
                    <span className="text-blue-600 text-sm sm:text-base">
                      {new Intl.NumberFormat("en-PH", {
                        style: "currency",
                        currency: "PHP",
                      }).format(Total())}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {!!cartProducts.length && (
            <div className="bg-white shadow-lg rounded-lg py-4 px-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Order Information</h2>
              <form onSubmit={handleCheckout} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <input
                      name="name"
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={ev => setName(ev.target.value)}
                      className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      disabled
                      onChange={ev => setEmail(ev.target.value)}
                      className="border border-gray-300 disabled:cursor-not-allowed disabled:opacity-50 rounded-md p-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input
                      name="phone"
                      type="tel"
                      placeholder="Phone Number"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      name="province"
                      type="text"
                      placeholder="Province"
                      value={province}
                      onChange={ev => setProvince(ev.target.value)}
                      className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      name="municipality"
                      type="text"
                      placeholder="Municipality"
                      value={municipality}
                      onChange={ev => setMunicipality(ev.target.value)}
                      className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      name="barangay"
                      type="text"
                      placeholder="Barangay"
                      value={barangay}
                      onChange={ev => setBarangay(ev.target.value)}
                      className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      name="postalCode"
                      type="text"
                      placeholder="Postal Code"
                      value={postalCode}
                      onChange={handlePostalCodeChange}
                      className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input
                      name="streetAddress"
                      type="text"
                      placeholder="Complete Street Address"
                      value={streetAddress}
                      onChange={ev => setStreetAddress(ev.target.value)}
                      className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md mt-6 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                  disabled={isProcessing || !name || !email || !phone || !province || !municipality || !barangay || !postalCode || !streetAddress}
                >
                  {isProcessing ? "Processing..." : "Continue to Payment"}
                </button>
              </form>
            </div>
          )}
        </div>
      </Center>
    </Layout>
  );
}
