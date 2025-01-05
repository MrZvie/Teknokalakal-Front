import { useState, useEffect } from "react";
import axios from "axios";
import CreatePostForum from "@/components/CreatePostForum";
import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Center from "@/components/Center";
import LikeIcon from "@/components/icons/LikeIcon";
import UnlikeIcon from "@/components/icons/UnlikeIcon";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function ForumPage() {
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { data: session } = useSession();
  const currentUser = session?.user;

  const fetchPosts = async () => {
    try {
      const { data } = await axios.get("/api/forum");
      setPosts(data.posts);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  const handleVote = async (postId, type) => {
    try {
      const { data } = await axios.put("/api/forum", { postId, type });
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === data.post._id
            ? {
                ...post,
                upvotes: data.post.upvotes,
                downvotes: data.post.downvotes,
                votes: data.post.votes,
              }
            : post
        )
      );
    } catch (err) {
      toast.error("Error updating votes:", err);
    }
  };

  const handleDelete = async (postId) => {
    try {
      const { data } = await axios.delete("/api/forum", { data: { postId } });
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
      toast.success(data.message);
    } catch (err) {
      toast.error("Error deleting post:", err.response?.data?.error || err.message);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const isPopular = (post) => post.upvotes - post.downvotes >= 2;

  return (
    <Layout>
      <Center>
        {/* Header */}
        <div className="flex justify-between items-center my-6 px-4 sm:px-8">
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-800">
            Forum
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 text-sm sm:text-base"
          >
            + Create Post
          </button>
        </div>

        {/* Posts */}
        <div className="space-y-6 sm:space-y-8">
          {posts.map((post) => (
            <div
              key={post._id}
              className="p-6 bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition duration-300"
            >
              {/* Post Title */}
              <div className="flex justify-between items-center mb-3 flex-wrap">
                <div className="flex-grow">
                  <Link href={`/forum/${post._id}`}>
                    <h2 className="text-xl sm:text-2xl font-semibold text-blue-600 hover:underline cursor-pointer">
                      {post.title.substring(0, 60)}
                      {post.title.length > 60 && "..."}
                    </h2>
                  </Link>
                </div>
                <div className="flex-shrink-0">
                  {isPopular(post) && (
                    <span className="text-sm font-semibold text-green-600">
                      {" "}
                      ⭐ Popular{" "}
                    </span>
                  )}
                </div>
              </div>

              {/* Post Content */}
              <p className="text-gray-700 mb-4 text-sm sm:text-base">
                {post.content}
              </p>

              {/* Post Meta */}
              <p className="text-gray-500 text-sm sm:text-base">
                By{" "}
                <span className="font-semibold text-blue-500">
                  {post.userId?.name || "Anonymous"}
                </span>{" "}
                • {new Date(post.createdAt).toLocaleString()}
              </p>

              {/* Comments Count */}
              <p className="text-gray-500 text-sm sm:text-base mt-2">
                {post.commentThread?.length || 0} Comments
              </p>

              {/* Vote and Delete Buttons */}
              <div className="flex justify-start items-center mt-4 gap-3">
                {/* Upvote Button */}
                <button
                  onClick={() => handleVote(post._id, "upvote")}
                  className={`flex justify-center items-center px-2 py-2 gap-2 rounded-md transition duration-200 ${
                    post.votes.some(
                      (vote) =>
                        vote.userId === currentUser?.id &&
                        vote.type === "upvote"
                    )
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-green-500 hover:text-white"
                  }`}
                >
                  <LikeIcon />
                  <span>({post.upvotes})</span>
                </button>

                {/* Downvote Button */}
                <button
                  onClick={() => handleVote(post._id, "downvote")}
                  className={`flex items-center px-2 py-2 gap-2 rounded-md transition duration-200 ${
                    post.votes.some(
                      (vote) =>
                        vote.userId === currentUser?.id &&
                        vote.type === "downvote"
                    )
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-red-500 hover:text-white"
                  }`}
                >
                  <UnlikeIcon />
                  <span>({post.downvotes})</span>
                </button>

                {/* Delete Button */}
                {currentUser?.id === post.userId?._id && (
                  <button
                    onClick={() => {
                      Swal.fire({
                        title: "Do you want to delete the Post?",
                        text: "You won't be able to undo this action!",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#d33",
                        cancelButtonColor: "#3085d6",
                        confirmButtonText: "Yes, delete it!",
                        cancelButtonText: "Cancel",
                      }).then((result) => {
                        if (result.isConfirmed) {
                          handleDelete(post._id);
                        }
                      });
                    }}
                    className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition duration-200"
                  >
                    Delete Post
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Create Post Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <CreatePostForum
              onClose={() => setShowModal(false)}
              onPostCreated={handlePostCreated}
            />
          </div>
        )}
      </Center>
    </Layout>
  );
}
