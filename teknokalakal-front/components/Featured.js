import Link from "next/link";
import { useContext } from "react";
import { CartContext } from "./CartContext";
import Center from "./Center";
import CartIcon from "./icons/CartIcon";

export default function Featured({ product }) {
  const { addProduct } = useContext(CartContext);

  function addFeaturedToCart() {
    addProduct(product._id);
  }

  return (
    <Center>
      <div className="bg-aqua-forest-600 rounded-lg text-white md:mt-4 mt-2 mx-auto p-4 sm:p-6 shadow-lg max-w-[100%]">
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-4 sm:gap-6 items-center">
          {/* Mobile Image */}
          <div className="md:hidden flex justify-center mb-3">
            <img
              src={product.images?.[0]?.link || "/default-image.jpg"}
              alt={product.title}
              className="w-full max-w-auto sm:max-w-[440px] h-auto sm:h-[240px] object-fill rounded-md shadow-md"
            />
          </div>

          {/* Content Section */}
          <div className="flex flex-col gap-2 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
              {product.title}
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              {product.description}
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-center sm:justify-start gap-2 mt-3">
              <Link
                href={`/products/${product._id}`}
                className="bg-white text-aqua-forest-700 font-medium py-2 px-4 rounded-md flex items-center justify-center gap-1 hover:bg-aqua-forest-700 hover:text-white transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                View Product
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </Link>
              <button
                onClick={addFeaturedToCart}
                className="bg-aqua-forest-500 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center gap-1 hover:bg-aqua-forest-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                Add to Cart
                <CartIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Desktop Image */}
          <div className="hidden md:flex justify-center">
            <img
              src={product.images?.[0]?.link || "/default-image.jpg"}
              alt={product.title}
              className="w-full max-w-[440px] h-auto sm:h-[240px] object-fill rounded-md shadow-md"
            />
          </div>
        </div>
      </div>
    </Center>
  );
}