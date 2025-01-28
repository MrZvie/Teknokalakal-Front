import { useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

export default function CreatePostForum({ onClose, onPostCreated }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { data: session } = useSession(); // Fetch user session

    const handleCreatePost = async () => {
        setError(null); // Reset error state
        if (!title.trim() || !content.trim()) {
            toast.warning("Both title and content are required.");
            return;
        }

        if (!session?.user?.id) {
            toast.warning("You need to be logged in to create a post.");
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.post("/api/forum", {
                title: title.trim(),
                content: content.trim(),
                userId: session.user.id, // Pass userId from session
            });
            onPostCreated(data.post, data.post.userId.name); // Notify parent about the new post
            onClose(); // Close modal
            toast.success("Post created successfully!");
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Failed to create post.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] md:w-1/3">
                <h2 className="text-2xl font-bold mb-4">Create Post</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border rounded-lg p-2 mb-4"
                />
                <textarea
                    placeholder="Content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full border rounded-lg p-2 mb-4"
                    rows="4"
                />
                <div className="flex justify-end">
                    <button
                        className={`px-4 py-2 text-white rounded-lg mr-2 ${loading ? "bg-gray-400 cursor-not-allowed" : "hover:bg-gray-400 bg-gray-500"}`}
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        className={`px-4 py-2 text-white rounded-lg ${loading ? "bg-blue-400 cursor-not-allowed" : "hover:bg-blue-400 bg-blue-500"}`}
                        onClick={handleCreatePost}
                        disabled={loading}
                    >
                        {loading ? "Posting..." : "Post"}
                    </button>
                </div>
            </div>
        </div>
    );
}
