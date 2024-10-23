import CartIcon from "./icons/CartIcon";

export default function ProductBox({_id, title, description, price, images}) {
    // for the currency sign of philippine peso
    const formattedPrice = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price);

    return (
      <div className="border-2 h-[220px] p-2 border-gray-500">
        <div className="bg-white p-5 max-w-full h-[120px] rounded-lg max-h-full flex justify-center items-center">
          {images.length > 0 ? (
            <img
              className="w-36 h-[100px] rounded-md object-cover"
              src={images[0].link}
              alt={images}
            />
          ) : (
            <div>No image available</div>
          )}
        </div>
        <div className="mt-1">
          <h2 className="text-[13px] text-center font-normal m-1">
            {title}
            </h2>
          <div className="flex items-center justify-center gap-5">
            <div className="text-[18px] font-bold">
                {formattedPrice}
            </div>
            <button style={{padding: "5px"}} className="border-2 border-aqua-forest-500 rounded-lg transition-all group hover:bg-aqua-forest-300 hover:scale-105">
              <CartIcon className="text-aqua-forest-500 w-[25px] h-[25px] group-hover:text-white" />
            </button>          </div>
        </div>
      </div>
    );
}