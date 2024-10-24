const { createContext, useState, useEffect } = require("react");

export const CartContext = createContext({});

export function CartContextProvider({ children }) {

    // this function will add the product id to the cartProducts array
    function addProduct(productId) {
        setCartProducts(prev => [...prev, productId]);
    }
    // this function will remove the product id from the cartProducts array
    function removeProduct(productId){
      setCartProducts(prev => {
            const pos = prev.indexOf(productId);
            if (pos !== -1) {
                return prev.filter((_value, index) => index !== pos);
            }
            return prev;
        });
    }

    // this is the local storage that will be used to store the cartProducts array 
    const ls = typeof window !== "undefined" ? window.localStorage : null;

    // The cartProducts is the array of the product id
    const [cartProducts,setCartProducts] = useState([]);
    // this is the useEffect that will save the cartProducts to the local storage
    useEffect(() =>{
        if(cartProducts?.length > 0) {
            ls?.setItem('cart',JSON.stringify(cartProducts));
        }
    }, [cartProducts]);
    // this is the useEffect that will get the cartProducts from the local storage
    useEffect(() => {
        if (ls && ls.getItem('cart')) {
            setCartProducts(JSON.parse(ls.getItem('cart')));
        }
    }, []);
  return (
    <CartContext.Provider value={{cartProducts,setCartProducts,addProduct,removeProduct}}>
      {children}
    </CartContext.Provider>
  );
}