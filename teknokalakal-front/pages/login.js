import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between login and sign-up modes
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

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

    if (result.error) {
      alert("Login failed: " + result.error);
    } else {
      // Redirect to home or dashboard
      window.location.href = "/";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, username, email, password } = formData;

    if (isSignUp) {
      // If it's a sign-up, send the data to the signup API
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, username }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setIsSignUp(false); // Switch to login form after successful sign-up
        resetForm(); // Reset the form fields after sign-up
      } else {
        alert(data.message || "Sign-up failed!");
      }
    } else {
      // If it's a login, call handleSignIn
      handleSignIn(email, password);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="bg-aqua-forest-600 w-screen h-screen flex items-center">
      <div className="bg-white p-8 rounded-md shadow-lg max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold text-aqua-forest-600">
          {isSignUp ? "Sign Up" : "Sign In"}
        </h1>
        <p className="text-gray-600">
          {isSignUp
            ? "Create an account to continue."
            : "Sign in to your account."}
        </p>

        {/* Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.name}
                  onChange={handleInputChange}
                  required={isSignUp}
                />
              </div>
              <div>
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </>
          )}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full p-2 bg-aqua-forest-600 text-white rounded-md hover:bg-aqua-forest-700"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        {/* Toggle Link */}
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
