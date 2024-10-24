import { CartContext } from "@/components/CartContext";
import Center from "@/components/Center";
import Header from "@/components/Header";
import CartIcon from "@/components/icons/CartIcon";
import axios from "axios";
import { useContext, useEffect, useState } from "react";

export default function CartPage() {
    // this is the context that will be used to access the cartProducts
  const { cartProducts, addProduct, removeProduct } = useContext(CartContext);
//   this is the state that will store the products
  const [products, setProducts] = useState([]);
 //   this is the useEffect that will get the products from the server and set the products state 
  useEffect(() => {
    if (cartProducts?.length > 0) {
      axios.post("/api/cart", { ids: cartProducts }).then((response) => {
        setProducts(response.data);
      });
    } else {
      setProducts([]);
    }
  }, [cartProducts]);
//    this is the function that will add the product to the cart
  function moreProducts(id) {
    addProduct(id);
  }
//   this is the function that will remove the product from the cart
  function lessProducts(id) {
    removeProduct(id);
  }
//   this is the function that will calculate the total price of the products
  let total = 0;
  for (const productId of cartProducts) {
    const price = products.find((p) => p._id === productId)?.price || 0;
    total += price;
  }

  return (
    <>
      <Header />
      <Center>
        <div className="grid grid-cols-[1.2fr,.8fr] gap-[40px] mt-7">
          {/* Cart Items Section */}
          <div className="bg-white shadow-lg rounded-lg py-4 px-6">
            <h2 className="text-2xl font-semibold my-3 text-gray-800">
              Shopping Cart
            </h2>
            {!cartProducts?.length && (
              <div className="text-center py-8 text-gray-500">
                <div className="mb-4">
                  <CartIcon className="w-16 h-16 mx-auto text-gray-400" />
                </div>
                <h3 className="text-xl font-medium mb-2">Your cart is empty</h3>
                <p className="text-gray-400">Looks like you haven't added any items to your cart yet</p>
              </div>
            )}
            {products?.length > 0 && (
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
                      {products.map((product) => (
                        <tr
                          key={product._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-4 border-b border-gray-100 flex items-center gap-4">
                            {product.images.length > 0 ? (
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
                            <span className="font-medium text-gray-800">
                              {product.title}
                            </span>
                          </td>
                          <td className="text-center p-4 border-b border-gray-100">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => lessProducts(product._id)}
                                className="w-8 h-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                              >
                                -
                              </button>
                              <span className="mx-2 font-medium">
                                {cartProducts.filter((id) => id === product._id).length}
                              </span>
                              <button
                                onClick={() => moreProducts(product._id)}
                                className="w-8 h-8 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
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
                      ))}
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
                      }).format(total)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
          {/* Order Information Section */}
          {!!cartProducts?.length && (
            <div className="bg-white max-h-[460px] shadow-lg rounded-lg py-4 px-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Order Information
              </h2>
              <form className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      placeholder="Full Name"
                      className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Province"
                      className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Municipality"
                      className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Barangay"
                      className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Postal Code"
                      className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      placeholder="Complete Street Address"
                      className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md w-full transition-colors mt-6 text-sm">
                  Continue to Payment
                </button>
              </form>
            </div>
          )}
        </div>
      </Center>
    </>
  );
}