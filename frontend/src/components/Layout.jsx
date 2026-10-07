import Navbar from "./Navbar";
import Footer from "./Footer";

// Page shell shared by every signed-in screen.
const Layout = ({ children, footer = true }) => (
  <div className="min-h-screen bg-paper text-body">
    <div className="mx-auto max-w-[1360px] px-4 pb-12 sm:px-8">
      <Navbar />
      <main>{children}</main>
      {footer && <Footer />}
    </div>
  </div>
);

export default Layout;
