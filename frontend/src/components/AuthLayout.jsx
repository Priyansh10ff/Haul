import { Link } from "react-router-dom";
import heroImage from "../assets/hero.jpg";

// Shared shell for Login and SignUp: photo panel + form card.
// On small screens the photo panel shrinks to a header strip.
const AuthLayout = ({ mode, title, subtitle, children }) => {
  const tab = (to, label, active) => (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-11 items-center justify-center rounded-full text-[15px] font-semibold text-ink transition ${
        active ? "bg-white shadow-[0_1px_3px_rgba(15,59,55,0.12)]" : "hover:bg-white/60"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="flex min-h-screen flex-col gap-3 bg-paper p-3 text-body sm:gap-4 sm:p-4 lg:flex-row">
      <div
        className="flex min-h-[220px] flex-col justify-between rounded-[28px] bg-ink bg-cover bg-center p-7 text-white sm:p-10 lg:min-h-0 lg:flex-1"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <span className="text-[32px] font-bold leading-none tracking-[-0.05em]">
          haul<span className="text-sage">.</span>
        </span>
        <div>
          <p className="max-w-[460px] text-[30px] font-medium italic leading-[1.05] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]">
            Your bag and saved items, on every device.
          </p>
          <div className="mt-6 hidden flex-wrap gap-2 sm:flex">
            {["Free shipping", "Live stock", "Razorpay checkout"].map((label) => (
              <span key={label} className="rounded-full bg-white/15 px-4 py-2.5 text-sm backdrop-blur">
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center rounded-[28px] bg-white px-6 py-12 sm:px-8">
        <div className="w-full max-w-[400px]">
          <div className="grid grid-cols-2 rounded-full bg-paper p-1">
            {tab("/login", "Log in", mode === "login")}
            {tab("/signup", "Sign up", mode === "signup")}
          </div>

          <div className="pb-6 pt-8">
            <h1 className="text-[40px] font-semibold leading-none tracking-[-0.045em] text-ink sm:text-[44px]">
              {title}
            </h1>
            <p className="mt-2.5 text-base text-muted">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

export const inputClass =
  "min-h-[52px] w-full rounded-full border border-line bg-paper px-5 text-base text-body outline-none transition placeholder:text-faint focus:border-ink focus:bg-white";

export const labelClass = "mb-2 block text-sm font-medium text-ink";

export const buttonClass =
  "mt-6 min-h-14 w-full rounded-full bg-ink text-base font-semibold text-white transition hover:bg-ink-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60";

export default AuthLayout;
