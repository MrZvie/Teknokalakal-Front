import { CartContext } from "@/components/CartContext";
import Center from "@/components/Center";
import CartIcon from "@/components/icons/CartIcon";
import Layout from "@/components/Layout";
import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Products";
import { useContext, useState } from "react";

export default function ProductPage({ product }) {
  const formattedPrice = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(product.price);

  const { addProduct } = useContext(CartContext);

  const [activeImage, setActiveImage] = useState(product.images[0].link);

  return (
    <Layout>
      <Center>
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr,.8fr] gap-8 mt-10">
          {/* Product Images Section */}
          <div className="bg-white shadow-lg rounded-lg py-4 px-6">
            <div className="max-w-full h-[280px] mx-auto relative mb-3">
              <img
                className="w-full h-full rounded-lg object-cover shadow-lg"
                src={activeImage}
                alt={product.title}
              />
            </div>
            <div className="grid grid-cols-4 gap-4 md:grid-cols-4 sm:grid-cols-2 xs:grid-cols-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(image.link)}
                  className={`w-full h-20 rounded-lg border shadow-sm transition duration-200 ${
                    image.link === activeImage
                      ? "border-blue-500 ring-2 ring-blue-400"
                      : "border-gray-300"
                  }`}
                >
                  <img
                    className="w-full h-full object-cover rounded-lg"
                    src={image.link}
                    alt=""
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details Section */}
          <div className="bg-white shadow-lg rounded-lg py-6 px-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.title}</h1>
            <p className="text-green-700 font-semibold text-2xl mb-2">{formattedPrice}</p>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">{product.description}</p>

            {/* Add to Cart Button */}
            <button
              onClick={() => addProduct(product._id)}
              className="border-2 border-green-600 rounded-lg transition-all group hover:bg-green-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              <CartIcon className="text-green-600 w-[25px] h-[25px] group-hover:text-white" />
              <span className="text-green-600 font-semibold group-hover:text-white">
                Add to Cart
              </span>
            </button>
          </div>
        </div>
      </Center>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.query;
  await mongooseConnect();
  const product = await Product.findById(id);
  return {
    props: {
      product: JSON.parse(JSON.stringify(product)),
    },
  };
}
