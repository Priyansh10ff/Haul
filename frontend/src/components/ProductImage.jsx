import { useState } from "react";
import { toneFor } from "../lib/format";

// Product photo on a soft tinted backdrop. If the image URL fails, the
// backdrop stays and shows the product's initial instead of a broken icon.
const ProductImage = ({ product, className = "", imgClassName = "" }) => {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundColor: toneFor(product?._id) }}
    >
      {!failed && product?.image ? (
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover ${imgClassName}`}
        />
      ) : (
        // SVG text scales with the box, so the initial fits thumbnails and heroes alike.
        <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="34"
            fontWeight="600"
            fill="#0f3b37"
            fillOpacity="0.28"
          >
            {product?.name?.charAt(0)}
          </text>
        </svg>
      )}
    </div>
  );
};

export default ProductImage;
