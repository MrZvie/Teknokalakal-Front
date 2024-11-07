import Center from "@/components/Center";
import Layout from "@/components/Layout";
import ProductBox from "@/components/ProductBox";
import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Products";

export default function ProductsPage({products}) {
    return (
      <Layout>
        <Center>
          <h1 className="text-2xl font-semibold my-3 text-gray-800">
            All products
          </h1>
          <div className="grid grid-cols-4 gap-7 pt-[10px]">
            {/* Render the products */}
              {products?.length > 0 && products.map((product) => (
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