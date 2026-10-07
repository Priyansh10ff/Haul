# haul: Technical Reference

How the system is built: architecture, stack, folder structure, data model, the order and payment flow, the REST API, security, configuration and known limitations. For the product side see [PRODUCT.md](./PRODUCT.md); for requirements see [PRD.md](./PRD.md).

---

## 1. Architecture

```
                 ┌───────────────────────────────┐
                 │      Browser (React SPA)      │
                 │   Vercel: static build + CDN  │
                 └───────┬──────────────┬────────┘
     HTTPS + cookie      │              │  Razorpay Checkout (iframe)
     (withCredentials)   │              ▼
                         │      ┌──────────────────┐
                         │      │  Razorpay        │
                         ▼      └────────▲─────────┘
                 ┌───────────────────────┴───────┐
                 │   Node.js API (Render)        │   Orders API (create order)
                 │   Express 5                   │───────────────────────────►
                 │   routes → controllers        │
                 └───────────────┬───────────────┘
                                 │ Mongoose
                                 ▼
                        ┌──────────────────┐
                        │  MongoDB Atlas   │
                        └──────────────────┘
```

- A single Express process serves the whole REST API. There are no background jobs or sockets.
- The browser never talks to MongoDB, and it never decides a price. The API rebuilds every order from the database.
- Razorpay is used in two places: the API creates a Razorpay order (server to server, with the secret key), and the browser opens Razorpay Checkout with the public key ID. The payment result comes back to the browser, which forwards it to the API for signature verification.

## 2. Stack

### Frontend (`frontend/`)

| Concern | Library |
|---|---|
| UI | React 19 |
| Build / dev server | Vite 8 (`@vitejs/plugin-react`) |
| Styling | Tailwind CSS 4 via `@tailwindcss/vite`; design tokens (colours, font) in `src/index.css` `@theme` |
| Type | Instrument Sans (Google Fonts, loaded in `index.html`) |
| Routing | React Router 7 (`react-router-dom`) |
| HTTP | Axios, one configured instance with `withCredentials: true` |
| State | React Context (`AuthContext`, `CartContext`), local state elsewhere |
| Payments | Razorpay Checkout script, loaded on demand at checkout |
| Linting | ESLint 10 with `react-hooks` and `react-refresh` |

### Backend (`backend/`)

| Concern | Library |
|---|---|
| Runtime | Node.js 20+ (ES modules) |
| HTTP framework | Express 5 |
| Database | MongoDB with Mongoose 9 |
| Auth | `jsonwebtoken`, `bcrypt`, `cookie-parser` |
| Payments | `razorpay` SDK (orders) + Node `crypto` (signature check) |
| Config | `dotenv` |
| CORS | `cors` |
| Dev | `nodemon` |

## 3. Repository structure

```
ShopKart/
├── README.md
├── docs/
│   ├── PRODUCT.md                Product overview
│   ├── PRD.md                    Requirements and scope
│   ├── TECHNICAL.md              This file
│   └── DEPLOYMENT.md             Deploy guide
│
├── backend/
│   ├── index.js                  Express app, CORS, routes, /health, DB connect → listen
│   ├── package.json              dev / start scripts
│   ├── .env.example
│   ├── config/
│   │   └── razorpay.js           Lazily created Razorpay client
│   ├── middlewares/
│   │   └── auth.middleware.js    isAuthenticated: verifies the JWT cookie, loads the customer
│   ├── models/
│   │   ├── customer.model.js     Customer with embedded wishlist and cart
│   │   ├── product.model.js
│   │   └── order.model.js
│   ├── routes/
│   │   ├── customer.routes.js    /customers
│   │   ├── cart.routes.js        /customers/cart
│   │   ├── product.routes.js     /products
│   │   └── order.routes.js       /orders
│   ├── controllers/
│   │   ├── customer.controller.js  Register, login, logout, me, password, wishlist
│   │   ├── cart.controller.js      Add, get, update quantity, remove
│   │   ├── product.controller.js   Create, list (search + category), get one
│   │   └── order.controller.js     Create payment order, verify, mark failed, list, get one
│   └── utils/
│       └── generateToken.js      Signs a 7-day JWT
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── vercel.json               SPA rewrite + cache and security headers
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx               Providers + routes (protected / public)
        ├── index.css             Tailwind import, @theme tokens (ink, paper, sage…), page fade
        ├── lib/format.js         Price formatting, stock text, product tile tones, categories
        ├── assets/hero.jpg       Hero / auth background photo
        ├── services/api.js       Axios instance (VITE_API_URL, credentials)
        ├── context/
        │   ├── AuthContext.jsx   Current customer, loaded from GET /customers/me
        │   └── CartContext.jsx   Cart state and actions, re-created per customer
        ├── components/
        │   ├── Layout.jsx        Page shell: Navbar + content + Footer
        │   ├── Navbar.jsx        Links, saved, bag count, logout, mobile link bar
        │   ├── Footer.jsx, Wordmark.jsx, Icons.jsx
        │   ├── AuthLayout.jsx    Shared login/signup shell (photo panel + form)
        │   ├── ProductCard.jsx   Card with save, stock and add-to-bag
        │   ├── ProductImage.jsx  Photo on a tinted tile, initial as fallback
        │   ├── SearchBar.jsx, CategoryFilter.jsx (pills)
        │   ├── ProtectedRoute.jsx, PublicRoute.jsx, FullPageLoader.jsx
        │   └── PageTransition.jsx
        └── pages/
            ├── Login.jsx, SignUp.jsx
            ├── Home.jsx
            ├── Products.jsx, ProductDetails.jsx
            ├── Wishlist.jsx
            ├── Cart.jsx, Checkout.jsx
            └── Orders.jsx, OrderDetails.jsx   (OrderDetails also serves /order-success/:id)
```

### Frontend routes

| Path | Page | Access |
|---|---|---|
| `/login`, `/signup` | Auth forms | Logged out only |
| `/home` | Hero, categories, "Almost gone" (low stock), "Just in" | Logged in |
| `/products` | Catalogue (`?category=` supported) | Logged in |
| `/products/:id` | Product details | Logged in |
| `/wishlist` | Wishlist | Logged in |
| `/cart` | Cart | Logged in |
| `/checkout` | Address + payment | Logged in |
| `/orders`, `/orders/:id` | Order history and details | Logged in |
| `/order-success/:id` | Confirmation after payment | Logged in |
| `/`, anything else | Redirects to `/home` | |

## 4. Data model

### Customer
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| email | String | required, unique, lowercased and trimmed |
| password | String | bcrypt hash; never returned by the API |
| phone | String | required |
| wishlist | [ObjectId → Product] | |
| cart | [{ product: ObjectId → Product, quantity: Number ≥ 1 }] | each item has its own `_id` |
| createdAt | Date | |

### Product
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| description | String | required |
| price | Number | required, ≥ 0.01, in rupees |
| category | String | required; the UI offers Electronics, Fashion, Books, Home |
| image | String | required, image URL |
| stock | Number | required, ≥ 0 |
| createdAt | Date | |

### Order
| Field | Type | Notes |
|---|---|---|
| user | ObjectId → Customer | owner; every query is scoped by it |
| items | [{ product, name, price, quantity, image }] | snapshot taken at checkout, so later price edits don't change past orders |
| shippingAddress | { fullName, phone, addressLine1, city, state, pincode } | validated server-side |
| totalAmount | Number | sum of `price × quantity`, calculated on the server |
| paymentStatus | `PENDING` \| `PAID` \| `FAILED` | |
| status | `PENDING_PAYMENT` \| `PLACED` \| `CONFIRMED` \| `SHIPPED` \| `DELIVERED` | the last three are reserved for a future admin flow |
| razorpayOrderId | String | set when the Razorpay order is created; the trusted value for verification |
| razorpayPaymentId | String | set on verification |
| createdAt / updatedAt | Date | |

## 5. Checkout and payment flow

```
 Browser                          API                                 Razorpay
    │ POST /orders/create-payment-order {shippingAddress}               │
    ├────────────────────────────►│ validate address                    │
    │                             │ load cart + products from DB        │
    │                             │ check stock, compute total          │
    │                             │ create Order (PENDING)              │
    │                             │ orders.create(amount in paise) ────►│
    │                             │◄──────────────── razorpay order id ─┤
    │◄── { shopKartOrderId, razorpayOrderId, amount, key } ─────────────┤
    │ open Razorpay Checkout ───────────────────────────────────────────►│
    │◄──────────── { razorpay_payment_id, razorpay_signature } ─────────┤
    │ POST /orders/verify-payment                                       │
    ├────────────────────────────►│ HMAC-SHA256(orderId|paymentId)      │
    │                             │ timing-safe compare with signature  │
    │                             │ atomic PENDING/FAILED → PAID        │
    │                             │ decrement stock (guarded)           │
    │                             │ clear cart                          │
    │◄──────────────── { order } ─┤                                     │
    │ → /order-success/:id                                              │
```

### State machine

```
              create-payment-order
   ───────────────────────────────►  PENDING / PENDING_PAYMENT
                                       │            │
              payment.failed (browser) │            │ verify-payment (valid signature)
                                       ▼            ▼
                                    FAILED ──────► PAID / PLACED
                                (retry in the same
                                 Razorpay window)
```

If Razorpay rejects the order creation, the pending order is deleted and the API answers `502`. The cart is untouched.

### Guarantees

- **Server-side totals.** `create-payment-order` reads only `shippingAddress` from the body. Items, prices and the total come from the database.
- **Trusted order ID.** The signature is computed against the `razorpayOrderId` stored on the order, not the ID the browser sends, and compared with `crypto.timingSafeEqual`.
- **Exactly-once fulfilment.** The switch to PAID is a single `findOneAndUpdate({ _id, paymentStatus: { $ne: "PAID" } })`. Only the request that wins it reduces stock and clears the cart; a duplicate gets the already-paid order back.
- **Stock never negative.** Each item is decremented with `updateOne({ _id, stock: { $gte: qty } }, { $inc: { stock: -qty } })`. If two shoppers paid for the last unit, the losing update is skipped and a `Stock conflict` line is logged for manual refund or restock.
- **Owner scoping.** Order reads and updates always include `user: req.customer._id`, so another customer's order looks like a missing one (404).

## 6. REST API

Base URL is the API origin (no `/api` prefix). JSON in and out. Authenticated routes need the `token` cookie, which the browser sends automatically because Axios uses `withCredentials`. Errors return `{ success: false, message }` with an appropriate status code.

### Customers: `/customers`
| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/register` | | `{ name, email, password, phone }` | `201 { newCustomer }` + cookie. `409` if the email exists |
| POST | `/login` | | `{ email, password }` | `200 { emailExists }` (the customer) + cookie. `401` on bad credentials |
| GET | `/me` | ✓ | | `{ customer }` (no password) |
| POST | `/logout` | | | Clears the cookie |
| PATCH | `/change-password` | ✓ | `{ oldPassword, newPassword }` | `401` if the old password is wrong |
| POST | `/wishlist/:productId` | ✓ | | Toggles: adds if absent, removes if present |
| GET | `/wishlist` | ✓ | | `{ wishlist: Product[] }` |

### Cart: `/customers/cart`
All cart responses return the updated, populated cart: `{ cart: [{ _id, product: Product, quantity }] }`.

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| GET | `/` | ✓ | | Removes items whose product was deleted |
| POST | `/:productId` | ✓ | | Adds 1. `400` if out of stock or at the stock limit |
| PATCH | `/:productId` | ✓ | `{ quantity }` | Integer ≥ 1 and ≤ stock |
| DELETE | `/:productId` | ✓ | | Removes the item |

An invalid `productId` returns `400`.

### Products: `/products`
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/` | | `?search=&category=` → `{ count, products }`. Search is a case-insensitive name match with regex characters escaped |
| GET | `/:id` | | `{ product }`. `400` for an invalid ID, `404` if missing |
| POST | `/` | ⚠ none | `{ name, description, price, category, image, stock }` → `201 { product }`. See [known limitations](#12-known-limitations) |

#### Adding products

There is no admin UI yet. Add products with any HTTP client:

```bash
curl -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -d '{"name":"Atomic Habits","description":"Paperback","price":399,"category":"Books","image":"https://example.com/book.jpg","stock":25}'
```

### Orders: `/orders`
| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/create-payment-order` | ✓ | `{ shippingAddress }` | `201 { shopKartOrderId, razorpayOrderId, amount, currency, key }`. `400` for an empty cart, invalid address or stock problem. `503` when Razorpay keys are not set. `502` if Razorpay rejects the request |
| POST | `/verify-payment` | ✓ | `{ shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }` | `200 { order }`. `400` for an invalid signature |
| POST | `/payment-failed` | ✓ | `{ shopKartOrderId }` | Marks a PENDING order FAILED; never downgrades a PAID one |
| GET | `/` | ✓ | | `{ orders }`, paid orders only, newest first |
| GET | `/:id` | ✓ | | `{ order }`. `404` if missing or not yours |

### Health
| Method | Path | Response |
|---|---|---|
| GET | `/health` | `200 { status: "ok", db: "connected" }` or `503` when the database is down |
| GET | `/` | Welcome message |

## 7. Frontend state

- **AuthContext** calls `GET /customers/me` once on load. A `401` simply means "logged out". Login and signup store the returned customer; logout sets it to `null`.
- **CartContext** is mounted inside `AuthProvider` and keyed by the customer ID (`App.jsx`). Logging in, logging out or switching accounts remounts it, so the cart is always fetched for the current customer and never shows someone else's items. It filters out items whose product is `null`.
- **Keeping the bag in sync:** every cart action (add, change quantity, remove) replaces the context with the cart the API returns, so the navbar count, Shop cards, product page and bag page all read the same state. `syncCart()` re-reads the bag quietly (no loading state); the product page calls it when it opens, and the context calls it whenever the browser tab regains focus, so changes made in another tab show up too.
- **Product page quantity:** before the item is in the bag, the stepper chooses how many to add (1 to stock) and the button adds them. Once it is in the bag, the stepper *is* the bag quantity: + and − call the cart API straight away, − at 1 becomes a remove button, and the main button becomes "View bag". A hint shows how many more can be added before stock runs out.
- **Wishlist** state is local to each page (Products, ProductDetails, Wishlist) and refreshed from the API when the page mounts.
- **Products** debounces search by 300 ms and ignores responses from older searches. The category lives in the URL query string.

## 8. Auth and security

- Passwords hashed with bcrypt (cost 10). The auth middleware loads the customer with `.select("-password")`, so the hash never leaves the server.
- JWT signed with `JWT_SECRET`, 7-day expiry, stored in an `HttpOnly` cookie named `token`. JavaScript can't read it, which limits the damage from XSS.
- Cookie attributes depend on `NODE_ENV`:

  | | Development | Production |
  |---|---|---|
  | `HttpOnly` | ✓ | ✓ |
  | `Secure` | | ✓ |
  | `SameSite` | `Lax` | `None` (frontend and API are on different domains) |
  | `Max-Age` | 7 days | 7 days |

- If the token is valid but the customer no longer exists, the middleware returns `401`.
- Emails are trimmed and lowercased on signup and login. Lookups use a case-insensitive collation so older mixed-case accounts still match.
- CORS only allows origins in `CLIENT_URL` (comma-separated), with credentials.
- `express.json({ limit: "100kb" })`.
- Search input is regex-escaped before it reaches MongoDB, which prevents errors and ReDoS.
- Malformed ObjectIds on cart, wishlist, product and order routes return `400`/`404` instead of crashing.
- Every cart, wishlist and order operation is scoped to `req.customer._id`.
- Razorpay secret is only used server-side; the browser only gets the key ID.
- `.env` files are git-ignored in both apps; `.env.example` lists every key.

## 9. Environment variables

### `backend/.env`
| Key | Example | Purpose |
|---|---|---|
| `NODE_ENV` | `development` / `production` | Controls cookie `Secure` and `SameSite` |
| `PORT` | `8001` | API port (Render sets this for you) |
| `MONGO_URL` | `mongodb+srv://…/shopkart` | MongoDB connection string |
| `JWT_SECRET` | 64+ random hex chars | Signs login tokens. Changing it logs everyone out |
| `CLIENT_URL` | `http://localhost:5173` | Allowed frontend origin(s), comma-separated. Defaults to `http://localhost:5173` |
| `RAZORPAY_KEY_ID` | `rzp_test_…` | Optional. Public key, also sent to the browser. Without both keys checkout returns 503 and everything else works |
| `RAZORPAY_KEY_SECRET` | | Optional. Secret key, used for creating orders and verifying signatures |

### `frontend/.env`
| Key | Example | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8001` | API base URL. Baked into the build, so set it in Vercel before building |

## 10. Local development

```bash
# API
cd backend
cp .env.example .env
npm install
npm run dev          # http://localhost:8001

# Web app (second terminal)
cd frontend
cp .env.example .env
npm install
npm run dev          # http://localhost:5173
```

Note: `backend/index.js` calls `dns.setServers(["8.8.8.8", "1.1.1.1"])`. This works around networks whose DNS can't resolve Atlas `mongodb+srv` SRV records. Remove it if your network resolves them fine or blocks public DNS.

## 11. Quality checks

| Check | Command | State |
|---|---|---|
| Lint | `cd frontend && npm run lint` | Passes with no errors |
| Build | `cd frontend && npm run build` | Passes (~105 kB JS gzipped) |
| API smoke test | Manual / script | Covered: signup, login, `/me` without password, CORS, search escaping, cart limits and pruning, signature rejection, concurrent verification (stock reduced once), logout, deleted-user 401 |

There is no automated test suite in the repo yet. Adding `node:test` + `supertest` against `mongodb-memory-server` is planned (see PRD v1.1).

## 12. Known limitations

| Limitation | Effect | Planned fix |
|---|---|---|
| `POST /products` has no auth | Anyone who knows the API URL can add products | Admin role + middleware (PRD FR12) |
| No Razorpay webhook | If the shopper pays and closes the tab before verification, the order stays PENDING and the cart isn't cleared; reconcile in the Razorpay dashboard | `payment.captured` webhook (FR13) |
| Stock is reserved only at payment | Two shoppers can pay for the last unit; the second is logged as a stock conflict | Short-lived stock reservation at checkout |
| No rate limiting or `helmet` | Login can be brute-forced; default security headers missing on the API | `express-rate-limit` + `helmet` |
| Cross-site cookie | On `*.vercel.app` + `*.onrender.com`, browsers that block third-party cookies (Safari, some private modes) won't keep the session | Put both on one site with custom domains (see DEPLOYMENT.md) |
| Change password has no UI | Only available through the API | Profile page (FR15) |
| No pagination | `GET /products` returns every product | `page`/`limit` params (FR16) |
| Categories are fixed in the UI | Products in other categories only show under "All" | Fetch categories from the API |
