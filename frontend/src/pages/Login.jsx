import { useState } from "react";
import axiosInstance from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout, { inputClass, labelClass, buttonClass } from "../components/AuthLayout";

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
    <AuthLayout
      mode="login"
      title="Welcome back"
      subtitle="Log in to see your bag and orders."
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {err && (
          <p role="alert" className="rounded-2xl bg-paper px-4 py-3 text-sm text-warn">
            {err}
          </p>
        )}

        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>Password</label>
          <input
            id="password"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={form.password}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <button type="submit" disabled={loader} className={buttonClass}>
          {loader ? "Logging in…" : "Log in"}
        </button>

        <p className="text-center text-sm text-muted">
          New to haul?{" "}
          <Link to="/signup" className="font-semibold text-ink underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
