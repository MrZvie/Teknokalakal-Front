import { createContext, useState, useEffect } from "react";
import axios from "axios";
import swal from "sweetalert2";

export const CartContext = createContext({});

export function CartContextProvider({ children }) {
  const [cartProducts, setCartProducts] = useState([]);

  // Function to fetch the cart from the server
  async function fetchCart() {
    try {
      const response = await axios.get("/api/cart", { withCredentials: true });
      // Ensure the response data is correctly used
      setCartProducts(response.data.cart || []); 
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  }

  useEffect(() => {
    fetchCart(); // Fetch cart on initial load
  }, []);

  // Add product to the cart
  async function addProduct(productId, quantity = 1) {
    try {
      console.log("Adding product:", productId);
      // Send request to add the product
      await axios.post("/api/cart/add", { productId, quantity }, { withCredentials: true });
      // Re-fetch the cart after adding a product
      await fetchCart();
      // Show success notification
      swal.fire("Success!", "Product added to cart.", "success");
    } catch (error) {
      console.error("Error adding product to cart:", error);
      // Show error notification
      swal.fire("Error!", "There was an issue adding the product to the cart.", "error");
    }
  }

  async function removeProduct(productId) {
    try {
      // Send request to remove the product
      await axios.post("/api/cart/remove", { productId }, { withCredentials: true });
      // Re-fetch the cart after removing a product
      fetchCart();
      toast.error("Product removed from cart!");
    } catch (error) {
      console.error("Error removing product from cart:", error);
    }
  }

// Update product quantity (only used in the cart page)
async function UpdateQuantity(productId, quantity) {
  try {
    if (quantity <= 0) {
      await removeProduct(productId);
      return;
    }

    const response = await axios.put(
      "/api/cart/updateQuantity",
      { productId, quantity },
      { withCredentials: true }
    );

    await fetchCart();
    return response.data;
  } catch (error) {
    console.error("Error updating product quantity:", error);
  }
}

  // Clear the cart
  async function clearCart() {
    try {
      // Send request to clear the cart
      await axios.post("/api/cart/clear", {}, { withCredentials: true });
       // Re-fetch the cart after clearing
    setCartProducts([]); // Immediately update state to reflect cart deletion
    toast.info("Cart cleared!");
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  }

  return (
    <CartContext.Provider value={{ cartProducts, addProduct, removeProduct, UpdateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}
