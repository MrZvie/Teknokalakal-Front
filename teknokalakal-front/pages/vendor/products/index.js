import Center from "@/components/Center";
import Layout from "@/components/Layout";
import LoadingIndicator from "@/components/LoadingIndicator";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { withSwal } from "react-sweetalert2";

function VendorProductsPage({ swal }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/vendors-products")
      .then((response) => {
        setProducts(response.data);
        setFilteredProducts(response.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const deleteProduct = (product) => {
    swal
      .fire({
        icon: "warning",
        title: "Are you sure?",
        text: `Do you want to delete "${product.title}"?`,
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Yes, delete!",
        confirmButtonColor: "#DB4444",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          setDeleting(true);
          try {
            await axios.delete(`/api/vendors-products?id=${product._id}`);
            setProducts(products.filter((p) => p._id !== product._id));
            setFilteredProducts(filteredProducts.filter((p) => p._id !== product._id));
            swal.fire("Deleted!", `${product.title} has been deleted.`, "success");
          } catch (error) {
            swal.fire("Error!", "There was an issue deleting the product.", "error");
          } finally {
            setDeleting(false);
          }
        }
      });
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterProducts(query);
  };

  const filterProducts = (query) => {
    let filtered = [...products];
    if (query) {
      filtered = filtered.filter((product) =>
        product.title.toLowerCase().includes(query.toLowerCase())
      );
    }
    setFilteredProducts(filtered);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(price);
  };

  return (
    <Layout>
      <Center>
        <div className="flex flex-col gap-6 mt-2">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">My Products</h1>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <Link
                href={deleting || loading ? "#" : "/vendor"}
                onClick={(e) => {
                  if (deleting || loading) {
                    e.preventDefault();
                  }
                }}
                className={`bg-blue-500 hover:bg-blue-600 sm:text-sm md:text-xl text-[12px] sm:px-2 text-white py-2 px-4 rounded-md shadow-md font-medium ${
                  deleting || loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                View Statistics
              </Link>
              <Link
                href={deleting || loading ? "#" : "/vendor/products/new"}
                onClick={(e) => {
                  if (deleting || loading) {
                    e.preventDefault();
                  }
                }}
                className={`bg-blue-500 hover:bg-blue-600 sm:text-sm md:text-xl text-[12px] sm:px-2 text-white py-2 px-4 rounded-md shadow-md font-medium ${
                  deleting || loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Add New Product
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search products..."
              className="flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-400"
            />
          </div>
          {loading || deleting ? (
            <div className="flex justify-center items-center">
              <LoadingIndicator />
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 hover:shadow-xl transition flex flex-col justify-between"
                  >
                    <div className="mb-4 flex-grow">
                      <h2 className="text-lg font-semibold text-gray-800 truncate">{product.title}</h2>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {product.description}
                      </p>
                      <p className="text-gray-800 font-medium">Price: {formatPrice(product.price)}</p>
                      <p className="text-gray-500 text-sm">Stock: {product.stock}</p>
                    </div>
                    <div className="flex justify-end gap-2 items-center">
                      <Link href={"/vendor/products/edit/" + product._id}>
                        <button className="bg-green-500 hover:bg-green-600 text-white py-1 px-4 rounded-md font-medium">
                          Edit
                        </button>
                      </Link>
                      <button
                        onClick={() => deleteProduct(product)}
                        className="bg-red-500 hover:bg-red-600 text-white py-1 px-4 rounded-md font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center col-span-full">
                  No products found.
                </p>
              )}
            </div>
          )}
        </div>
      </Center>
    </Layout>
  );
}

export default withSwal(({ swal }, _ref) => <VendorProductsPage swal={swal} />);
