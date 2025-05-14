import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import LoadingIndicator from '@/components/LoadingIndicator';
import Featured from '@/components/Featured';
import NewProducts from '@/components/NewProducts';
import { Product } from '@/models/Products';
import { mongooseConnect } from '@/lib/mongoose';

export default function HomePage({ newProducts }) {
  const [featuredProduct, setFeaturedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProduct = async () => {
      try {
        const response = await fetch("/api/featured-product");
        const data = await response.json();
        setFeaturedProduct(data);
      } catch (error) {
        console.error("Error fetching featured product:", error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch featured product on component mount
    fetchFeaturedProduct();

    // Polling every 60 seconds
    const interval = setInterval(fetchFeaturedProduct, 60000);

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-aqua-forest-300 z-50">
          <LoadingIndicator />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {featuredProduct ? (
        <Featured product={featuredProduct} />
      ) : (
        <></>
      )}
      <NewProducts products={newProducts} />
    </Layout>
  );
}

export async function getServerSideProps() {
  await mongooseConnect();
  // Fetch new products from the database
  const newProducts = await Product.find().sort({ createdAt: -1 }).limit(16).lean();
  return {
    props: {
      newProducts: JSON.parse(JSON.stringify(newProducts)),
    },
  };
}
