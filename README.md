# ShopKart

A full-stack e-commerce store: browse products, save a wishlist, manage a cart and pay with Razorpay. Built with the MERN stack.

**Stack:** React 19 · Vite · Tailwind CSS 4 · Express 5 · MongoDB (Mongoose 9) · Razorpay

---

## Features

- **Accounts:** sign up, log in and log out. Sessions are stored in an HTTP-only JWT cookie, and every page except login and signup is protected.
- **Catalogue:** product grid with search, category filters (linkable as `/products?category=Books`), live stock and product detail pages.
- **Wishlist:** add or remove items from any product card or detail page.
- **Cart:** saved on the server, so it follows you across devices. Quantities are capped at the available stock, and items whose product was deleted are removed automatically.
- **Checkout:** collects a shipping address, then pays through Razorpay Checkout. The server recalculates the total from the database and verifies the payment signature (HMAC-SHA256). Stock is reduced once the payment is confirmed.
- **Orders:** order history and order details, plus a confirmation screen after payment.
- **Responsive UI:** one navbar across every page and a mobile-friendly layout.

## Quick start

**Requirements:** Node.js 20 or newer, a MongoDB database (Atlas free tier works) and Razorpay test keys.

```bash
# 1. API (http://localhost:8001)
cd backend
cp .env.example .env        # fill in MONGO_URL, JWT_SECRET, RAZORPAY_*
npm install
npm run dev

# 2. Web app (http://localhost:5173), in a second terminal
cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:8001
npm install
npm run dev
```

A new database has no products. Add some with the API (see [docs/TECHNICAL.md](docs/TECHNICAL.md#adding-products)):

```bash
curl -X POST http://localhost:8001/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Wireless Headphones","description":"Over-ear, 30h battery","price":2499,"category":"Electronics","image":"https://example.com/headphones.jpg","stock":10}'
```

To test payments, use Razorpay's [test cards or UPI IDs](https://razorpay.com/docs/payments/payments/test-card-details/) while your keys start with `rzp_test_`.

## Environment variables

| App | Key | Purpose |
|---|---|---|
| backend | `NODE_ENV` | `production` turns on cross-site cookies (`SameSite=None; Secure`) |
| backend | `PORT` | API port, default `8001` |
| backend | `MONGO_URL` | MongoDB connection string |
| backend | `JWT_SECRET` | Secret used to sign login tokens |
| backend | `CLIENT_URL` | Allowed frontend origin(s) for CORS, comma-separated |
| backend | `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay API keys |
| frontend | `VITE_API_URL` | Base URL of the API |

Full descriptions are in [docs/TECHNICAL.md](docs/TECHNICAL.md#9-environment-variables).

## Scripts

| Location | Command | Does |
|---|---|---|
| backend | `npm run dev` | Starts the API with nodemon |
| backend | `npm start` | Starts the API in production |
| frontend | `npm run dev` | Vite dev server |
| frontend | `npm run build` | Production build to `dist/` |
| frontend | `npm run preview` | Serves the build locally |
| frontend | `npm run lint` | ESLint |

## Project structure

```text
ShopKart/
├── backend/        Express API: routes → controllers → Mongoose models
├── frontend/       React SPA: pages, components, context (auth, cart)
└── docs/           Product, PRD, technical and deployment docs
```

## Documentation

| Doc | What's in it |
|---|---|
| [PRODUCT.md](docs/PRODUCT.md) | What ShopKart is, who it is for, how it works |
| [PRD.md](docs/PRD.md) | Requirements, user stories, acceptance criteria, scope |
| [TECHNICAL.md](docs/TECHNICAL.md) | Architecture, data model, API reference, security, known limitations |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Step-by-step deploy to MongoDB Atlas, Render and Vercel |

## Author

**Priyansh**: [GitHub](https://github.com/Priyansh10ff) · [LinkedIn](https://www.linkedin.com/in/priyansh-dugar-709333363/)
