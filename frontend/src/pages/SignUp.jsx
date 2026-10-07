import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axiosInstance from "../services/api";
import { useAuth } from "../context/AuthContext";
import AuthLayout, { inputClass, buttonClass } from "../components/AuthLayout";

const FIELDS = [
  { name: "name", type: "text", placeholder: "Full Name", autoComplete: "name" },
  { name: "email", type: "email", placeholder: "Email", autoComplete: "email" },
  { name: "phone", type: "tel", placeholder: "Mobile Number", autoComplete: "tel" },
  {
    name: "password",
    type: "password",
    placeholder: "Password (min 6 characters)",
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
    <AuthLayout title="Create account 👋" subtitle="Please enter your details.">
      <form onSubmit={handleSubmit} noValidate>
        {err && (
          <p
            role="alert"
            className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-center text-sm text-red-600"
          >
            {err}
          </p>
        )}

        <div className="space-y-3">
          {FIELDS.map(({ name, type, placeholder, autoComplete }) => (
            <div key={name}>
              <label htmlFor={name} className="sr-only">
                {placeholder}
              </label>
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
        </div>

        <button type="submit" disabled={loader} className={buttonClass}>
          {loader ? "Creating account..." : "Sign Up"}
        </button>

        <p className="mt-5 text-center text-sm text-[#aaaaaa]">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-[#333333] hover:text-[#ff6b35]">
            Log In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default SignUp;
