import Featured from "@/components/Featured";
import Header from "@/components/Header";
import NewProducts from "@/components/NewProducts";
import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Products";

export default function HomePage({ featuredProduct, newProducts }) {
  return (
    <div>
      <Header />
      <Featured product = {featuredProduct} />
      <NewProducts products = {newProducts} />
    </div>
  );
}

export async function getServerSideProps() {
  // this is where you can set kung anong ffeatured products mo dito papasok yung id niya
  const featuredProductId = '66fecf446c322048ef192e09';
  await mongooseConnect();
  const featuredProduct = await Product.findById(featuredProductId);
  const newProducts = await Product.find({}, null, { sort: { _id: -1 } }).limit(10);
  return {
    props: {
      featuredProduct: JSON.parse(JSON.stringify(featuredProduct)),
      newProducts: JSON.parse(JSON.stringify(newProducts)),
    },
  };
}