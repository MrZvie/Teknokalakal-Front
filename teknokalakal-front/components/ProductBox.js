import { useContext } from "react";
import CartIcon from "./icons/CartIcon";
import Link from "next/link";
import { CartContext } from "./CartContext";

export default function ProductBox({_id, title, description, price, images}) {
    // for the currency sign of philippine peso
    const formattedPrice = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price);

    // so when the customer click the image or the tile they will e redirected to the id of the product
    const url = '/products/'+_id;
    // this is the context that will add the product to the cart
    const {addProduct} = useContext(CartContext);

    return (
      <div className="border border-gray-200 rounded-lg shadow-sm p-2 flex flex-col h-[260px] sm:h-[320px] bg-aqua-forest-600 hover:shadow-lg hover:-translate-y-1 transition duration-300">
      {/* Image Container */}
      <div className="rounded-lg overflow-hidden relative group">
        {images?.length > 0 ? (
          <Link href={url}>
            <img
              className="w-full h-[120px] sm:h-[160px] object-cover transform transition duration-300 group-hover:scale-110"
              src={images[0].link}
              alt={title}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
          </Link>
        ) : (
          <div className="h-[120px] sm:h-[160px] bg-gray-100 flex items-center justify-center text-gray-500">
            No Image Available
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-grow justify-between p-2">
        {/* Title */}
        <Link href={url}>
          <h2 className="text-sm sm:text-base font-semibold text-center text-white line-clamp-2 hover:text-gray-300 transition">
            {title}
          </h2>
        </Link>

        {/* Description */}
        {description && (
          <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 mt-1">
            {description}
          </p>
        )}

        {/* Price and Button */}
        <div className="flex items-center justify-between mt-2">
          <div className="text-sm sm:text-base font-semibold text-white">
            {formattedPrice}
          </div>
          <button
            onClick={() => addProduct(_id)}
            className="bg-green-600 text-white flex items-center gap-1 rounded-lg px-2 py-1 sm:px-3 sm:py-2 hover:bg-green-700 hover:scale-105 transition-transform"
          >
            <CartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium">Add</span>
          </button>
        </div>
      </div>
    </div>
    );
}