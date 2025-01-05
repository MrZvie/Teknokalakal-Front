import Center from "@/components/Center";
import Layout from "@/components/Layout";
import ProductBox from "@/components/ProductBox";
import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Products";

export default function ProductsPage({products}) {
    return (
      <Layout>
        <Center>
        <h1 className="text-2xl font-semibold my-4 text-gray-800 text-center">
          All Products
        </h1>
        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 p-2">
          {products?.length > 0 &&
            products.map((product) => (
              <ProductBox key={product._id} {...product} />
            ))}
        </div>
        </Center>
      </Layout>
    );
}

export async function getServerSideProps() {
    await mongooseConnect();
    const products = await Product.find({}, null, { sort: { _id: -1 } }); // Sort by descending order of _id (latest first) 
    return {
        props: {
            products: JSON.parse(JSON.stringify(products)), 
        },
    };
}