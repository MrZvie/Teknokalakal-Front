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
      <div className="border-2 h-[220px] bg-gray-400 rounded-md p-2 border-gray-500">
        <div className="bg-white p-5 max-w-full h-[120px] rounded-lg max-h-full flex justify-center items-center">
          {images.length > 0 ? (
            <Link href={url}>
              <img
                className="w-36 h-[100px] rounded-md object-cover"
                src={images[0].link}
                alt={images}
              />
            </Link>
          ) : (
            <div>No image available</div>
          )}
        </div>
        <div className="mt-1">
          <Link href={url}>
            <h2 className="text-[16px] text-center font-medium m-1">{title}</h2>
          </Link>
          <div className="flex items-center justify-center gap-5">
            <div className="text-[18px] font-medium ">{formattedPrice}</div>
            <button
              onClick={() => addProduct(_id)}
              style={{ padding: "5px" }}
              className="border-2 border-aqua-forest-600 rounded-lg transition-all group hover:bg-aqua-forest-300 hover:scale-105"
            >
              <CartIcon className="text-aqua-forest-600 w-[25px] h-[25px] group-hover:text-white" />
            </button>
          </div>
        </div>
      </div>
    );
}