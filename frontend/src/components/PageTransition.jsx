import { useLocation } from "react-router-dom";

// Re-keying on the path restarts the CSS fade-in for every page change.
const PageTransition = ({ children }) => {
  const location = useLocation();

  return (
    <div key={location.pathname} className="page-in">
      {children}
    </div>
  );
};

export default PageTransition;
