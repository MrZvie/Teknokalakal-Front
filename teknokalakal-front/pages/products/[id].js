import { useState, useContext, useEffect } from "react";
import Layout from "@/components/Layout";
import { CartContext } from "@/components/CartContext";
import axios from "axios";
import { useSession } from "next-auth/react";
import XIcon from "@/components/icons/XIcon";
import { withSwal } from "react-sweetalert2";
import { useRouter } from "next/router";
import LoadingIndicator from "@/components/LoadingIndicator";
import CartIcon from "@/components/icons/CartIcon";

const ProductPage = ({ swal }) =>  {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addProduct } = useContext(CartContext);
  const { data: session } = useSession();

  const [activeImage, setActiveImage] = useState("");
  const [review, setReview] = useState({ rating: 0, comment: "" });

  // Fetch product details function
  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/products?id=${id}`);
      setProduct(response.data.data);
      setActiveImage(response.data.data.images[0]?.link || "/default-image.jpg");
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`/api/products/${product._id}/reviews`, review);
      setReview({ rating: 0, comment: "" });
      await fetchProduct(); // Refetch product details to include the new review
    } catch (error) {
      swal.fire("Error submitting review:", error.message || "Unknown error");
    }
  };

  const handleReviewDelete = async (reviewId) => {
    swal
      .fire({
        icon: "warning",
        title: "Are you sure?",
        text: "Do you want to delete this review?",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Yes, delete!",
        confirmButtonColor: "#DB4444",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await axios.delete(`/api/products/${product._id}/reviews`, {
              params: { reviewId },
            });
            await fetchProduct(); // Refetch product details to remove the deleted review
            swal.fire("Deleted!", "The review has been deleted.", "success");
          } catch (error) {
            swal.fire("Error!", "There was an issue deleting the review.", "error");
          } 
        }
      });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-5 h-5 ${
          index < rating ? "text-yellow-500" : "text-gray-300"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.39 2.46a1 1 0 00-.364 1.118l1.287 3.97c.3.921-.755 1.688-1.54 1.118l-3.39-2.46a1 1 0 00-1.175 0l-3.39 2.46c-.784.57-1.838-.197-1.54-1.118l1.287-3.97a1 1 0 00-.364-1.118L2.34 9.397c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.97z" />
      </svg>
    ));
  };

  const formattedPrice = product ? new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(product.price) : "N/A";
  // console.log("Products", product);
  return (
    <Layout>
      {loading ? (
        <LoadingIndicator />
      ) : (
        product && (
          <div className="container mx-auto p-6">
            {/* Product and Image Section */}
            <div className="grid grid-cols-1 md:grid-cols-[.6fr,1.4fr] gap-6">
              {/* Image Section */}
              <div className="flex flex-col items-center">
                <div className="w-full h-[290px] bg-gray-200 rounded-lg overflow-hidden mb-4">
                  <img
                    className="w-full h-full object-fill"
                    src={activeImage}
                    alt={product.title}
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
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
              <div className="bg-white shadow-lg rounded-lg py-6 px-4 md:px-8">
                <div class="flex justify-between">
                  <h1 className="text-sm md:text-3xl font-bold text-gray-800 mb-4">
                    {product.title}
                  </h1>
                  <button
                    onClick={() => addProduct(product._id)}
                    className="bg-green-500 text-sm md:text-xl text-white px-4 py-2 rounded-lg mx-auto md:mx-0 flex items-center justify-center md:justify-start gap-1 hover:bg-green-600"
                  >
                    <CartIcon /> Add to Cart
                  </button>
                </div>
                <p className="text-green-700 font-semibold text-base md:text-2xl mb-2">
                  {formattedPrice}
                </p>
                <p className="text-gray-600 text-sm md:text-lg leading-relaxed mb-6">
                  {product.description}
                </p>
                <div className="grid grid-cols-2 gap-2 text-center mb-2">
                  <p className="text-gray-500 text-xs md:text-lg mb-4">
                    Stock: {product.stock}
                  </p>
                  <p className="text-gray-500 text-xs md:text-lg mb-4">
                    Sold: {product.sold}
                  </p>
                  <p className="text-gray-500 text-xs md:text-lg mb-4">
                    Category: {product.category?.name || "No category"}
                  </p>
                  <p className="text-gray-500 text-xs md:text-lg mb-4">
                    Main Category:{" "}
                    {product.parentCategory?.name || "No category"}
                  </p>
                </div>

                <div className="mb-4">
                  {product.videoLink ? (
                    <iframe
                      width="100%"
                      height="300"
                      src={
                        product.videoLink
                          .replace("youtu.be/", "www.youtube.com/embed/")
                          .replace(/(\?.*)$/, "") // Remove query parameters
                      }
                      title="Product Video"
                      style={{ border: 0 }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <p className="text-gray-500">No video available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white shadow-lg rounded-lg py-6 px-8 mt-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Reviews</h2>
              {loading ? (
                <>
                  <LoadingIndicator />
                </>
              ) : (
                <div className="snap-y max-h-[220px] overflow-y-auto">
                  {product.reviews.length > 0 ? (
                    product.reviews
                      .sort((a, b) => {
                        if (a.userId?._id === session?.user?.id) return -1; // Move logged-in user's review to the top
                        if (b.userId?._id === session?.user?.id) return 1;
                        return 0; // Keep other reviews in the original order
                      })
                      .map((review) => (
                        <div
                          key={review._id}
                          className="mb-4 flex justify-between items-center"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-800">
                                {review.userId?.name || "Anonymous"}
                              </h3>
                              {review.userId?._id === session?.user?.id && (
                                <button
                                  onClick={() => handleReviewDelete(review._id)}
                                  className="text-red-500 border-2 rounded-lg p-1 hover:bg-red-500 hover:text-white"
                                >
                                  <XIcon className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                            <div className="flex items-center mb-2">
                              {renderStars(review.rating)}
                              <span className="ml-2 text-gray-800 font-semibold">
                                {review.rating} Stars
                              </span>
                            </div>
                            <p className="text-gray-600">{review.comment}</p>
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className="text-gray-600">No reviews yet.</p>
                  )}
                </div>
              )}

              {session && (
                <form onSubmit={handleReviewSubmit} className="mt-6">
                  <div className="mb-4">
                    <label className="block text-gray-700">Rating</label>
                    <select
                      value={review.rating}
                      onChange={(e) =>
                        setReview({ ...review, rating: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      required
                      disabled={loading}
                    >
                      <option value="">Select rating</option>
                      <option value="1">1 - Poor</option>
                      <option value="2">2 - Fair</option>
                      <option value="3">3 - Good</option>
                      <option value="4">4 - Very Good</option>
                      <option value="5">5 - Excellent</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700">Comment</label>
                    <textarea
                      value={review.comment}
                      onChange={(e) =>
                        setReview({ ...review, comment: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      required
                      disabled={loading}
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )
      )}
    </Layout>
  );
};

export default withSwal(ProductPage);