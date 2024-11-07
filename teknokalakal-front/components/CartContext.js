import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const CartContext = createContext({});

export function CartContextProvider({ children }) {
    const ls = typeof window !== "undefined" ? window.localStorage : null;

    const [cartProducts, setCartProducts] = useState([]); 

    // Load cart from local storage when component mounts
    useEffect(() => {
        const savedCart = ls?.getItem('cart');
        if (savedCart) {
            setCartProducts(JSON.parse(savedCart)); // Parse the saved cart data from string to array of objects if it exists in local storage 
        }
    }, []);

    // Save cart to local storage whenever it changes
    useEffect(() => {
        if (cartProducts.length > 0) {
            ls.setItem('cart', JSON.stringify(cartProducts));
        } else {
            ls.removeItem('cart'); // Clear local storage when cart is empty
        }
    }, [cartProducts]);

    // Add product by ID and manage quantity + stock
    function addProduct(productId) {
        setCartProducts((prev) => [...prev, productId]); // Just store IDs
      }

    // Remove one quantity or remove product if quantity is 1
    function removeProduct(productId) {
        setCartProducts((prev) => {
          const index = prev.indexOf(productId);
          if (index > -1) {
            const newCart = [...prev];
            newCart.splice(index, 1); // Remove one instance
            return newCart;
          }
          return prev;
        });
      } 

    // Clear the entire cart
    function clearCart() {
        setCartProducts([]);
    }

    return (
        <CartContext.Provider value={{ cartProducts, addProduct, removeProduct, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}
