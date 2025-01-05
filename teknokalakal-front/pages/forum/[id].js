import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";
import LoadingIndicator from "@/components/LoadingIndicator";
import { toast } from "react-toastify"; 
import Swal from "sweetalert2";


export default function PostPage() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const { data: session } = useSession();

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      const { data } = await axios.get(`/api/forum/${id}`);
      setPost(data.post);
      setComments(data.post.commentThread || []);
    } catch (err) {
      console.error("Failed to fetch post:", err);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) {
      // Show toast notification for empty comment
      toast.error("Please enter a comment before submitting!");
      return;
    }
    try {
      const { data } = await axios.post(`/api/forum/${id}/comments`, { content: comment });
      setComments([...comments, { ...data.comment }]);
      setComment("");
      fetchPost(); // Refresh post data
    } catch (err) {
      console.error("Failed to add comment:", err);
      toast.error("Failed to add comment. Please try again!");  // Error toast
    }
  };

  if (!post)
    return (
      <Layout>
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-aqua-forest-300 z-50">
          <LoadingIndicator />
        </div>
      </Layout>
    );

    // Function to handle comment deletion
    const handleDeleteComment = async (commentId) => {
        const result = await Swal.fire({
          title: "Are you sure?",
          text: "This comment will be deleted.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "Cancel",
          confirmButtonColor: "#e3342f",
          cancelButtonColor: "#6c757d",
        });
      
        if (result.isConfirmed) {
          try {
            await axios.delete(`/api/forum/${id}/comments`, { data: { commentId } });
            toast.success("Comment deleted successfully");
            fetchPost(); // Refresh the post data
          } catch (err) {
            console.error("Failed to delete comment:", err);
            toast.error("Failed to delete comment. Please try again!");
          }
        }
      };
      

  return (
    <Layout>
      <div className="p-6 bg-white border rounded-lg shadow-md max-w-4xl mx-auto">
        {/* Post Details */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {post.title}
          </h1>
          <p className="text-gray-700 leading-relaxed">{post.content}</p>
          <p className="text-gray-500 text-sm mt-4">
            Posted by{" "}
            <span className="font-semibold text-blue-500">
              {post.userId?.name || "Anonymous"}
            </span>{" "}
            • {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Comments Section */}
        <div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            Comments
          </h3>
          <div className="space-y-4 max-h-80 overflow-y-auto pb-4 sm:max-h-96 md:max-h-128">
            {comments.length > 0 ? (
              comments.map((c, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 bg-gray-100 rounded-lg border-l-4 border-blue-500 relative"
                >
                  <p className="text-gray-700">{c.reply}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    By{" "}
                    <span className="font-semibold text-blue-400">
                      {c.userId?.name || "Anonymous"}
                    </span>{" "}
                    • {new Date(c.createdAt).toLocaleString()}
                  </p>

                  {/* Delete Button (Visible for the comment owner) */}
                  {session?.user?.id === c.userId?._id && (
                    <button
                      onClick={() => handleDeleteComment(c._id)} // Pass the comment ID
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </div>

        {/* Add Comment */}
        {session ? (
          <div className="mt-6">
            <h4 className="text-xl font-semibold text-gray-700 mb-2">
              Leave a Comment
            </h4>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your comment here..."
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              required
            ></textarea>
            <button
              onClick={handleAddComment}
              className="mt-3 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition w-full sm:w-auto"
            >
              Add Comment
            </button>
          </div>
        ) : (
          <p className="text-gray-500 mt-4">
            <span className="font-semibold text-blue-500">Log in</span> to add a
            comment.
          </p>
        )}
      </div>
    </Layout>
  );
}
