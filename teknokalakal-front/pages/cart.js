import { CartContext } from "@/components/CartContext";
import Center from "@/components/Center";
import CartIcon from "@/components/icons/CartIcon";
import axios from "axios";
import { useRouter } from "next/router";
import { useCallback, useContext, useEffect, useState } from "react";
import LoadingIndicator from "@/components/LoadingIndicator";
import Layout from "@/components/Layout";

export default function CartPage() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [barangay, setBarangay] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

    // this is the context that will be used to access the cartProducts
    const { cartProducts, addProduct, removeProduct } = useContext(CartContext);
    

    // this is the state that will store the products
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);


    // Fetch products when cartProducts change
    const fetchProducts = useCallback(async () => {
      if (cartProducts.length === 0) {
        setProducts([]);
        return;
      }
      setIsLoading(true);
      try {
        const response = await axios.post("/api/cart", { ids: cartProducts });
        setProducts(prevProducts => {
          const newProducts = response.data.filter(newProduct => 
            !prevProducts.some(prevProduct => prevProduct._id === newProduct._id)
          );
          return [...prevProducts, ...newProducts];
        });
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    }, [cartProducts]);
  
    // Fetch products only when cartProducts change (initial load or when products are added/removed)
    useEffect(() => {
      if (products.length === 0) {
        fetchProducts();
      }
    }, [fetchProducts, products.length]);

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
        cartProducts,
        name,
        email,
        phone,
        province,
        municipality,
        barangay,
        postalCode,
        streetAddress,
        referenceNumber: referenceNumber(),
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
  function moreProducts(id, e) {
    e.preventDefault();
    addProduct(id);
  }
  //  this is the function that will remove the product from the cart
  function lessProducts(id, e) {
    e.preventDefault();
    const quantity = cartProducts.filter((productId) => productId === id).length;
  
    if (quantity >= 1) {
      removeProduct(id);
      if (quantity === 1) {
        setProducts(prevProducts => prevProducts.filter(product => product._id !== id));
      }
    }
  }

  // Calculate total price
  function Total() {
    return products.reduce((total, product) => {
      const quantity = cartProducts.filter((id) => id === product._id).length;
      return total + product.price * quantity;
    }, 0);
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
        <div className="grid grid-cols-[1.2fr,.8fr] gap-[40px] mt-7">
          <div className="bg-white shadow-lg rounded-lg py-4 px-6">
            <h2 className="text-2xl font-semibold my-3 text-gray-800">Shopping Cart</h2>
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
                  <table className="w-full">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left p-4 text-gray-600">Products</th>
                        <th className="text-center p-4 text-gray-600">Quantity</th>
                        <th className="text-right p-4 text-gray-600">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => {
                        const quantity = cartProducts.filter(id => id === product._id).length;
                        if (quantity === 0) return null;
                        return (
                          <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 border-b border-gray-100 flex items-center gap-4">
                              {product.images?.length ? (
                                <img
                                  src={product.images[0].link}
                                  alt={product.title}
                                  className="w-[60px] h-[60px] object-cover rounded-lg shadow-sm"
                                />
                              ) : (
                                <div className="w-[60px] h-[60px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                  No image
                                </div>
                              )}
                              <span className="font-medium text-gray-800">{product.title}</span>
                            </td>
                            <td className="text-center p-4 border-b border-gray-100">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={e => lessProducts(product._id, e)}
                                  className="w-8 h-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full"
                                >
                                  -
                                </button>
                                <span className="mx-2 font-medium">{quantity}</span>
                                <button
                                  onClick={e => moreProducts(product._id, e)}
                                  className="w-8 h-8 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-full"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="text-right p-4 border-b border-gray-100 font-medium">
                              {new Intl.NumberFormat("en-PH", {
                                style: "currency",
                                currency: "PHP",
                              }).format(product.price)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="border-t-2 border-gray-200">
                  <div className="flex justify-end font-semibold text-lg p-4">
                    <span className="mr-4">Total:</span>
                    <span className="text-blue-600">
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
                      onChange={ev => setEmail(ev.target.value)}
                      className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
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
