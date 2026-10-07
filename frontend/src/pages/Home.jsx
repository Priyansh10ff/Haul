import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../services/api";
import Layout from "../components/Layout";
import ProductCard from "../components/ProductCard";
import ProductImage from "../components/ProductImage";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "../components/Icons";
import { useAuth } from "../context/AuthContext";
import { CATEGORIES, formatPrice, LOW_STOCK } from "../lib/format";
import heroImage from "../assets/hero.jpg";

const SLIDES = [
  {
    title: "Fewer, better things.",
    body: "Headphones, books, tees and mugs, chosen to last. Live stock on every listing.",
    cta: "Start shopping",
    to: "/products",
  },
  {
    title: "Saved for later?",
    body: "Your saved items and bag follow you to every device you sign in on.",
    cta: "See saved items",
    to: "/wishlist",
  },
];

const Home = () => {
  const { customer } = useAuth();
  const [slide, setSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState(null);

  useEffect(() => {
    let ignore = false;

    Promise.all([
      axiosInstance.get("/products"),
      axiosInstance.get("/customers/wishlist").catch(() => ({ data: { wishlist: [] } })),
    ])
      .then(([productRes, wishlistRes]) => {
        if (ignore) return;
        setProducts(productRes.data.products || []);
        setWishlist(wishlistRes.data.wishlist || []);
      })
      .catch((error) => console.log(error));

    return () => {
      ignore = true;
    };
  }, []);

  const current = SLIDES[slide];
  const firstName = customer?.name?.split(" ")[0];
  const lowStock = products
    .filter((p) => p.stock > 0 && p.stock <= LOW_STOCK)
    .slice(0, 3);
  const latest = [...products].reverse().slice(0, 4);

  const updateWishlist = (product) => (isWishlisted) => {
    setWishlist((list) =>
      isWishlisted
        ? [...(list || []), product]
        : (list || []).filter((item) => item._id !== product._id)
    );
  };

  return (
    <Layout>
      {/* Hero */}
      <section
        className="relative flex min-h-[560px] flex-col justify-between overflow-hidden rounded-[28px] bg-ink bg-cover bg-center p-7 text-white sm:min-h-[600px] sm:p-12 lg:px-14"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="flex items-start justify-between gap-6">
          <div className="max-w-[640px]">
            {firstName && (
              <p className="mb-5 text-[15px] text-white/80">Welcome back, {firstName}</p>
            )}
            <h1 key={slide} className="page-in text-[52px] font-semibold leading-[0.95] tracking-[-0.045em] sm:text-[80px] lg:text-[104px]">
              {current.title}
            </h1>
            <p className="mt-6 flex max-w-[440px] gap-3 text-base leading-relaxed text-white/85">
              <ArrowDownRight size={16} className="mt-1 shrink-0" />
              {current.body}
            </p>
          </div>

          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              onClick={() => setSlide((slide + SLIDES.length - 1) % SLIDES.length)}
              aria-label="Previous slide"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/30"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setSlide((slide + 1) % SLIDES.length)}
              aria-label="Next slide"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink transition hover:bg-paper"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex items-center gap-2">
            <Link
              to={current.to}
              className="flex min-h-[52px] items-center rounded-full bg-paper px-7 text-base font-semibold text-ink transition hover:bg-white"
            >
              {current.cta}
            </Link>
            <Link
              to={current.to}
              aria-label={current.cta}
              className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-paper text-ink transition hover:bg-white"
            >
              <ArrowUpRight size={18} />
            </Link>
          </div>

          <div className="flex items-center gap-1.5">
            {SLIDES.map((s, i) => (
              <button
                key={s.title}
                type="button"
                onClick={() => setSlide(i)}
                aria-label={`Show slide ${i + 1}`}
                aria-current={i === slide}
                className="flex h-11 items-center"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all ${
                    i === slide ? "w-7 bg-white" : "w-1.5 bg-white/45"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="px-2 pb-12 pt-20 text-center sm:pt-24">
        <h2 className="text-[36px] font-medium leading-[1.05] tracking-[-0.035em] text-ink sm:text-[52px]">
          Things you’ll actually <em className="font-medium">use.</em>
        </h2>
        <p className="mx-auto mt-4 max-w-[560px] text-[17px] leading-relaxed text-muted">
          A short catalogue across electronics, fashion, books and home. Every
          listing shows live stock, so what you see is what ships.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((name) => (
            <Link
              key={name}
              to={`/products?category=${encodeURIComponent(name)}`}
              className="min-h-11 rounded-full border border-line bg-white px-5 py-2.5 text-[15px] text-body transition-colors hover:border-ink"
            >
              {name}
            </Link>
          ))}
        </div>
      </section>

      {/* Bento */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-5 rounded-[28px] bg-white p-6 sm:p-8">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-[30px] font-medium italic tracking-[-0.03em] text-ink sm:text-[34px]">
              Almost gone
            </h3>
            <span className="text-sm text-muted">{LOW_STOCK} or fewer left</span>
          </div>

          {lowStock.length === 0 ? (
            <p className="rounded-[20px] bg-paper p-6 text-[15px] text-muted">
              Everything is well stocked right now.
            </p>
          ) : (
            lowStock.map((product) => (
              <Link
                key={product._id}
                to={`/products/${product._id}`}
                className="grid grid-cols-[88px_1fr_auto] items-center gap-4 rounded-[20px] bg-paper p-3 transition-colors hover:bg-mist"
              >
                <ProductImage product={product} className="h-[88px] w-[88px] rounded-[14px]" />
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="truncate text-lg font-semibold text-ink">{product.name}</span>
                  <span className="text-sm text-warn">Only {product.stock} left</span>
                </span>
                <span className="pr-2 text-[17px] font-semibold text-ink">
                  {formatPrice(product.price)}
                </span>
              </Link>
            ))
          )}
        </div>

        <div className="relative flex min-h-[340px] flex-col justify-between gap-8 overflow-hidden rounded-[28px] bg-ink p-6 text-paper sm:p-8">
          <div className="relative">
            <h3 className="max-w-[380px] text-[30px] font-medium italic leading-[1.1] tracking-[-0.03em] sm:text-[34px]">
              Free shipping. Every order, every pincode.
            </h3>
            <p className="mt-3 max-w-[360px] text-base leading-relaxed text-sage-soft">
              Pay with UPI, card or netbanking through Razorpay. Your order is
              confirmed the moment the payment clears.
            </p>
          </div>
          <div className="relative flex flex-wrap gap-2">
            {["UPI", "Cards", "Netbanking", "Wallets"].map((label) => (
              <span key={label} className="rounded-full border border-teal-line px-4 py-2.5 text-sm">
                {label}
              </span>
            ))}
          </div>
          <span aria-hidden="true" className="absolute -bottom-10 -right-10 hidden h-60 w-60 rounded-full border border-teal-line sm:block" />
          <span aria-hidden="true" className="absolute bottom-5 right-5 hidden h-[120px] w-[120px] rounded-full bg-sage sm:block" />
        </div>
      </section>

      {/* Latest */}
      {latest.length > 0 && (
        <section className="pt-20 sm:pt-24">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-[36px] font-medium leading-none tracking-[-0.035em] text-ink sm:text-[44px]">
              Just in
            </h2>
            <Link to="/products" className="text-[15px] text-ink hover:text-ink-2">
              View all products →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {latest.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                wishlist={wishlist}
                onWishlistChange={updateWishlist(product)}
              />
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Home;
