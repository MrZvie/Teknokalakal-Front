import EyeIcon from "@/components/icons/EyeIcons";
import EyeSlashIcon from "@/components/icons/EyeSlashIcon";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import swal from "sweetalert2";

export default function LoginPage() {
  const { status } = useSession(); 
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const toggleForm = () => {
    setIsSignUp((prev) => !prev);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      username: "",
      email: "",
      password: "",
    });
  };

  const handleSignIn = async (email, password) => {
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      swal.fire("Login failed", result.error, "error");
    } else if (result?.ok && result?.status === 200) {
      // Session should auto-redirect from useEffect
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, username, email, password } = formData;

    if (isSignUp) {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        swal.fire("Success", data.message, "success");
        setIsSignUp(false);
        resetForm();
      } else {
        swal.fire("Sign-up failed", data.message || "Something went wrong", "error");
      }
    } else {
      await handleSignIn(email, password);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return (
    <div className="bg-aqua-forest-600 w-screen h-screen flex items-center">
      <div className="bg-white p-8 rounded-md shadow-lg max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold text-aqua-forest-600">
          {isSignUp ? "Sign Up" : "Sign In"}
        </h1>
        <p className="text-gray-600">
          {isSignUp ? "Create an account to continue." : "Sign in to your account."}
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="username"
                placeholder="Username"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </>
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="w-full p-2 border border-gray-300 rounded-md pr-10"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
            </button>
          </div>
          <button
            type="submit"
            className="w-full p-2 bg-aqua-forest-600 text-white rounded-md hover:bg-aqua-forest-700"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-sm">
          {isSignUp ? "Already have an account?" : "Don’t have an account yet?"}{" "}
          <span
            className="text-aqua-forest-600 cursor-pointer font-semibold"
            onClick={toggleForm}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}
