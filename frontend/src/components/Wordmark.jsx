import { Link } from "react-router-dom";

const Wordmark = ({ className = "text-[32px]", tone = "text-ink", to = "/home" }) => (
  <Link
    to={to}
    aria-label="haul home"
    className={`font-bold leading-none tracking-[-0.05em] ${tone} ${className}`}
  >
    haul<span className="text-sage">.</span>
  </Link>
);

export default Wordmark;
