import { useContext } from "react";
import CartIcon from "./icons/CartIcon";
import Link from "next/link";
import { CartContext } from "./CartContext";

export default function ProductBox({ _id, title, description, price, images }) {
  // for the currency sign of philippine peso
  const formattedPrice = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price);

  // so when the customer click the image or the tile they will be redirected to the id of the product
  const url = '/products/' + _id;
  // this is the context that will add the product to the cart
  const { addProduct } = useContext(CartContext);

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm p-2 flex flex-col h-full bg-white hover:shadow-lg hover:-translate-y-1 transition duration-300">
      {/* Image Container */}
      <div className="rounded-lg overflow-hidden relative group">
        {images?.length > 0 ? (
          <Link href={url}>
            <img
              className="w-full h-32 sm:h-36 md:h-56 object-cover transform transition duration-300 group-hover:scale-110"
              src={images[0].link}
              alt={title}
            />
          </Link>
        ) : (
          <div className="w-full h-40 sm:h-48 md:h-56 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
      </div>
      {/* Product Info */}
      <div className="flex flex-col justify-between flex-grow mt-2">
        <div>
          <Link href={url}>
            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 hover:text-blue-600 transition duration-300">
              {title}
            </h2>
          </Link>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 line-clamp-2">
            {description}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm sm:text-base md:text-lg font-bold text-green-600">
            {formattedPrice}
          </span>
          <button
            onClick={() => addProduct(_id)}
            className="bg-green-600 text-white p-1 sm:p-2 rounded-md hover:bg-green-700 transition duration-300"
          >
            <CartIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}