import Center from "@/components/Center";
import Layout from "@/components/Layout";
import ProductBox from "@/components/ProductBox";
import { mongooseConnect } from "@/lib/mongoose";
import { Category } from "@/models/Category";
import { Product } from "@/models/Products";
import { useState } from "react";

export default function ProductsPage({products, categories}) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedSubcategory(""); // Reset subcategory when main category changes
  };

  const handleSubcategoryChange = (e) => {
    setSelectedSubcategory(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedSubcategory
      ? product.category === selectedSubcategory
      : selectedCategory
      ? product.parentCategory === selectedCategory
      : true;
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      <Center>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 md:mt-2 mt-0">
          <h1 className="text-lg md:text-2xl font-semibold text-gray-800 text-center sm:text-left">
            All Products
          </h1>
          <div className="relative w-full mx-auto sm:w-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search products..."
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-400"
            />
            <svg
              className="absolute right-2 top-2 w-6 h-6 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <div className="flex flex-row gap-2 w-full">
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Categories</option>
                {categories
                  .filter((category) => !category.parent)
                  .map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>
            {selectedCategory && (
              <div className="w-full sm:w-auto">
                <label className="block text-sm font-medium text-gray-700">
                  Subcategory
                </label>
                <select
                  value={selectedSubcategory}
                  onChange={handleSubcategoryChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Subcategories</option>
                  {categories
                    .filter((category) => category.parent === selectedCategory)
                    .map((subcategory) => (
                      <option key={subcategory._id} value={subcategory._id}>
                        {subcategory.name}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-2">
          {filteredProducts.length > 0 &&
            filteredProducts.map((product) => (
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
    const categories = await Category.find().lean();
    return {
        props: {
            products: JSON.parse(JSON.stringify(products)),
            categories: JSON.parse(JSON.stringify(categories)),
        },
    };
}