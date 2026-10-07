import { useState } from "react";
import axiosInstance from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout, { inputClass, buttonClass } from "../components/AuthLayout";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loader, setLoader] = useState(false);

  const navigate = useNavigate();
  const { setCustomer } = useAuth();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loader) return;

    setErr("");
    setLoader(true);
    try {
      const response = await axiosInstance.post("/customers/login", form);

      setCustomer(response.data.emailExists);
      navigate("/home");
    } catch (error) {
      // error.response is missing when the server can't be reached.
      setErr(
        error.response?.data?.message ||
          "Unable to reach the server. Please try again.",
      );
    } finally {
      setLoader(false);
    }
  };

  return (
    <AuthLayout title="Welcome back 👋" subtitle="Please enter your details.">
      <form onSubmit={handleSubmit} noValidate>
        {err && (
          <p
            role="alert"
            className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-center text-sm text-red-600"
          >
            {err}
          </p>
        )}

        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="Email"
          name="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          className={`${inputClass} mb-3`}
        />

        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          name="password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          className={inputClass}
        />

        <button type="submit" disabled={loader} className={buttonClass}>
          {loader ? "Logging in..." : "Log In"}
        </button>

        <p className="mt-5 text-center text-sm text-[#aaaaaa]">
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-[#333333] hover:text-[#ff6b35]">
            Sign Up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
