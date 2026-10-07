import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axiosInstance from "../services/api";
import { useAuth } from "../context/AuthContext";
import AuthLayout, { inputClass, labelClass, buttonClass } from "../components/AuthLayout";

const FIELDS = [
  { name: "name", type: "text", label: "Full name", placeholder: "Priya Sharma", autoComplete: "name" },
  { name: "email", type: "email", label: "Email", placeholder: "you@example.com", autoComplete: "email" },
  { name: "phone", type: "tel", label: "Mobile number", placeholder: "98765 43210", autoComplete: "tel" },
  {
    name: "password",
    type: "password",
    label: "Password",
    placeholder: "At least 6 characters",
    autoComplete: "new-password",
  },
];

const SignUp = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
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
      const response = await axiosInstance.post("/customers/register", form);
      setCustomer(response.data.newCustomer);
      navigate("/home");
    } catch (error) {
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
      mode="signup"
      title="Create your account"
      subtitle="Name, email, mobile and a password. That’s it."
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {err && (
          <p role="alert" className="rounded-2xl bg-paper px-4 py-3 text-sm text-warn">
            {err}
          </p>
        )}

        {FIELDS.map(({ name, type, label, placeholder, autoComplete }) => (
          <div key={name}>
            <label htmlFor={name} className={labelClass}>{label}</label>
            <input
              id={name}
              type={type}
              name={name}
              placeholder={placeholder}
              autoComplete={autoComplete}
              value={form[name]}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        ))}

        <button type="submit" disabled={loader} className={buttonClass}>
          {loader ? "Creating account…" : "Create account"}
        </button>

        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-ink underline underline-offset-4">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default SignUp;
