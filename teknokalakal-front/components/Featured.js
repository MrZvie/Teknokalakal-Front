import Link from "next/link";
import Center from "./Center";
import CartIcon from "./icons/CartIcon";
import { useContext } from "react";
import { CartContext } from "./CartContext";

export default function Featured({ product }) {
  const { addProduct } = useContext(CartContext);

  function addFeaturedToCart() {
    addProduct(product._id);
  }

  return (
    <div className="bg-aqua-forest-600 rounded-md text-white mt-7 w-[800px] mx-auto py-5 px-5">
      <Center style={{ padding: "0px" }}>
        <div className="grid grid-cols-[1.2fr_0.8fr] gap-3 py-0 place-items-center">
          <div className="flex flex-col justify-center gap-2">
            <h1 className="font-normal text-6xl">{product.title}</h1>
            <p className="text-gray-300 text-sm">{product.description}</p>
            <div className="flex gap-2">
              <Link
                href={"/products/" + product._id}
                className="btn-primary group"
              >
                View Products
                <svg
                  xmlns="(link unavailable)"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-7 transition-transform group-hover:translate-x-1"
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
                className="bg-aqua-forest-500 py-2 px-5 flex items-center hover:bg-aqua-forest-700 justify-center gap-2 rounded-md group"
              >
                Add to Cart
                <CartIcon className="size-7 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center h-[200px] relative">
            <img
              className=" max-w-full max-h-full object-cover rounded-md"
              src={product.images?.[0]?.link || "/default-image.jpg"}
              alt={product.title}
            />
          </div>
        </div>
      </Center>
    </div>
  );
}