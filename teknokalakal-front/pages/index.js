import { useEffect, useState } from "react";
import Featured from "@/components/Featured";
import Layout from "@/components/Layout";
import NewProducts from "@/components/NewProducts";
import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Products";
import LoadingIndicator from "@/components/LoadingIndicator";

export default function HomePage({ newProducts }) {
  const [featuredProduct, setFeaturedProduct] = useState(null);

  useEffect(() => {
    const fetchFeaturedProduct = async () => {
      const response = await fetch("/api/featured-product");
      const data = await response.json();
      setFeaturedProduct(data);
    };

    // Fetch featured product on component mount
    fetchFeaturedProduct();

    // Polling every 10 seconds
    const interval = setInterval(fetchFeaturedProduct, 60000); // 60 seconds to fetch again the featured products in the database

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, []);

  if (!featuredProduct)
    return (
      <Layout>
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-aqua-forest-300 z-50">
          <LoadingIndicator />
        </div>
      </Layout>
    );

  return (
    <Layout>
      <Featured product={featuredProduct} />
      <NewProducts products={newProducts} />
    </Layout>
  );
}

export async function getServerSideProps() {
  await mongooseConnect();

  // Fetch the 10 most recent products from the database
  const newProducts = await Product.find({}, null, { sort: { _id: -1 } }).limit(10);

  return {
    props: {
      newProducts: JSON.parse(JSON.stringify(newProducts)),
    },
  };
}
