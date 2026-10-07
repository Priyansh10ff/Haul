# haul: Product Requirements Document

| | |
|---|---|
| **Product** | haul web store |
| **Owner** | Priyansh |
| **Status** | v1.0 shipped, v1.1 planned |
| **Last updated** | October 2026 |

Related: [PRODUCT.md](./PRODUCT.md) (overview) · [TECHNICAL.md](./TECHNICAL.md) (implementation)

---

## 1. Problem

Small sellers and student teams who want to sell online have two poor options: list on a marketplace (commission, no brand, competitors one click away) or assemble a store from plugins they don't control. Shoppers, meanwhile, abandon stores whose checkout is slow, whose totals change at the last step, or whose payments fail without explanation.

haul is a self-hosted store with a short, trustworthy path from product to paid order, built on free hosting tiers and the payment gateway Indian shoppers already use.

## 2. Goals

| # | Goal | How we know |
|---|---|---|
| G1 | A shopper can go from landing to paid order in under 2 minutes | Timed walkthrough on mobile |
| G2 | No order is ever marked paid without a verified payment | Signature check on every paid order; no unverified PAID orders in the database |
| G3 | Stock never goes below zero and is never sold twice by a double submit | Atomic stock updates; idempotent payment verification |
| G4 | A shopper's cart survives logout, refresh and device changes | Cart stored server-side and reloaded on login |
| G5 | The store can run at zero hosting cost to start | Runs on Vercel Hobby, Render free and Atlas M0 |

## 3. Non-goals

- Running a multi-vendor marketplace
- Selling outside India or in currencies other than INR
- Handling logistics (shipping labels, courier tracking)
- Native mobile apps (the responsive web app is the mobile experience)

## 4. Users

| Persona | Description | Main needs |
|---|---|---|
| **Riya, mobile shopper** | 21, buys on her phone, pays with UPI | Fast browsing, clear stock and price, one-tap UPI payment |
| **Arjun, desktop shopper** | 28, compares products, saves items for later | Search, wishlist, cart that remembers him |
| **Store owner** | Runs a small catalogue | Accurate stock, trustworthy payments, a list of paid orders |

## 5. User stories and acceptance criteria

### Accounts

**A1. As a new shopper, I can create an account so my cart and orders are saved.**
- Name, email, mobile number and password are required; the password is at least 6 characters.
- Email is stored lowercased and trimmed; registering `A@x.com` when `a@x.com` exists returns "Email already exists".
- On success I am logged in and taken to Home.

**A2. As a returning shopper, I can log in.**
- Login is case-insensitive on email.
- A wrong email or password shows one generic message ("Invalid email or password").
- If the server is unreachable, I see a clear error instead of a broken page.
- Pressing Enter submits the form.

**A3. As a shopper, I can log out from any page.**
- The session cookie is cleared, my cart view is emptied and I land on the login page.

**A4. As a logged-out visitor, I am redirected to login** when opening any store page, and a logged-in shopper visiting login or signup is sent to Home.

### Catalogue

**C1. I can browse all products** with image, name, category, price (₹, Indian number format) and stock ("N units left" or "Out of stock").

**C2. I can search products by name.**
- Case-insensitive, partial match.
- Special characters are treated literally (searching `(` does not error).
- Results update as I type, after a short pause.

**C3. I can filter by category** (Electronics, Fashion, Books, Home), and the filter is part of the URL so it can be shared.

**C4. I can open a product page** with full description, price, stock, wishlist and add-to-cart buttons, and a link back to the catalogue.

### Wishlist

**W1. I can add or remove a product from my wishlist** from a product card or the product page, and the heart icon reflects the current state.

**W2. I can see all wishlisted products** on the Wishlist page, with an empty state that links back to Products.

### Cart

**K1. I can add a product to my cart.**
- Out-of-stock products cannot be added.
- I cannot add more units than are in stock; the button shows "Max Stock" when I reach the limit.

**K2. I can change quantities and remove items.** Quantity is at least 1 and at most the current stock, on both the bag page and the product page.

**K2a. The product page reflects my bag.** If the product is already in my bag (added from any page or tab), the product page shows that quantity, lets me raise it up to the stock or lower it, and offers "View bag". If it isn't, I choose how many to add (up to the stock) before adding.

**K3. The cart count in the navbar is always accurate**, including right after logging in, without a page refresh.

**K4. If a product is deleted from the store, it disappears from my cart** instead of breaking the cart page.

### Checkout and payment

**P1. I can enter a shipping address.** Full name, 10-digit Indian mobile number (starting 6 to 9), address, city, state and 6-digit pincode are required and validated on both client and server.

**P2. I pay the amount the server calculates.**
- The server rebuilds the order from my cart and the live catalogue; prices or totals sent by the browser are ignored.
- If any item is out of stock or no longer exists, checkout stops with a message and no payment is started.

**P3. My order is placed only after the payment is verified.**
- The server checks Razorpay's HMAC-SHA256 signature against the order ID it stored, not one sent by the browser.
- On success: order becomes PAID / PLACED, stock is reduced, cart is cleared, and I see the confirmation page.
- Submitting verification twice does not reduce stock twice.

**P4. A failed or cancelled payment changes nothing.** The order is marked FAILED (or stays PENDING if I just closed the window), it is hidden from my order history, and my cart is untouched.

### Orders

**O1. I can see my paid orders**, newest first, with date, items, total and status.

**O2. I can open an order** to see items, total, status and shipping address. I can never open another shopper's order (it looks like "Order not found").

## 6. Functional requirements

| ID | Requirement | Priority | Status |
|---|---|---|---|
| FR1 | Email + password auth with JWT in an HTTP-only cookie (7 days) | Must | Done |
| FR2 | Logout clears the cookie with matching attributes | Must | Done |
| FR3 | Product list with name search and category filter | Must | Done |
| FR4 | Product detail page | Must | Done |
| FR5 | Wishlist toggle and list | Should | Done |
| FR6 | Server-side cart with stock-capped quantities | Must | Done |
| FR7 | Server-calculated order total from the live catalogue | Must | Done |
| FR8 | Razorpay order creation and signature verification | Must | Done |
| FR9 | Stock decrement on confirmed payment, guarded against going negative | Must | Done |
| FR10 | Order history and order details scoped to the owner | Must | Done |
| FR11 | Health endpoint for hosting and uptime checks | Should | Done |
| FR12 | Restrict product creation to admins | Must | **Open** (v1.1) |
| FR13 | Razorpay webhook (`payment.captured`) to finish orders when the browser closes after paying | Should | **Open** (v1.1) |
| FR14 | Admin view to update order status (Confirmed, Shipped, Delivered) | Should | Open (v1.2) |
| FR15 | Change-password screen (API exists) | Could | Open |
| FR16 | Pagination for the product list | Could | Open |

## 7. Non-functional requirements

| Area | Requirement |
|---|---|
| **Security** | Passwords hashed with bcrypt (cost 10) and never returned by any endpoint. Cookies are `HttpOnly`, plus `Secure; SameSite=None` in production. CORS limited to `CLIENT_URL`. JSON bodies capped at 100 kB. Every cart, wishlist and order query is scoped to the logged-in customer. |
| **Data integrity** | Payment state moves to PAID through one atomic update, so concurrent verifications reduce stock exactly once. Stock updates use a `stock >= quantity` guard. |
| **Reliability** | The API starts accepting traffic only after MongoDB connects, and exits if it cannot. `/health` reports database status. |
| **Performance** | Frontend JS bundle under 110 kB gzipped. Search requests debounced (300 ms) and stale responses ignored. |
| **Accessibility** | Form inputs have labels, the wishlist button exposes its pressed state, the error banner uses `role="alert"`, and the page fade respects `prefers-reduced-motion`. |
| **Compatibility** | Latest two versions of Chrome, Safari, Firefox and Edge; layouts tested at 390 px and 1366 px wide. |
| **Maintainability** | ESLint passes with no errors; configuration through environment variables only; no secrets in the repo. |

## 8. Success metrics

| Metric | Target |
|---|---|
| Checkout conversion (checkout page → paid order) | ≥ 60% |
| Payment verification failures not caused by the user | 0 |
| Orders with stock conflicts (paid but not enough stock) | < 0.5% of orders |
| p95 API latency (excluding Render cold start) | < 300 ms |

## 9. Release plan

| Version | Scope |
|---|---|
| **v1.0 (current)** | Everything marked Done above, plus the fixes in this release: password hash no longer exposed, stock reduced on payment, cart reloads on login, production-ready cookies and CORS, logout, the haul redesign, product-page quantity that follows the bag, and running without Razorpay keys (checkout disabled, everything else works) |
| **v1.1** | Admin-only product creation (FR12), Razorpay webhook (FR13), seed script, rate limiting and security headers on the API |
| **v1.2** | Admin order management (FR14), change-password screen (FR15), product pagination (FR16), email confirmation on order |

## 10. Risks and open questions

| Risk | Impact | Mitigation |
|---|---|---|
| Anyone can call `POST /products` | Fake or mispriced products in the catalogue | FR12 in v1.1; until then, keep the API URL private and audit products regularly |
| Shopper pays, then closes the tab before verification | Money taken, order stays PENDING, cart not cleared | FR13 webhook; until then, reconcile against the Razorpay dashboard |
| Two shoppers pay for the last unit at the same time | One paid order without stock | Guarded decrement logs a "Stock conflict" line; refund or restock manually |
| Browsers blocking third-party cookies (frontend and API on different sites) | Login doesn't stick in Safari or some private windows | Serve both from the same site (for example `shop.example.com` and `api.example.com`); see DEPLOYMENT.md |
| Render free tier sleeps | First request after idle takes 30 to 50 s | Paid instance or an uptime ping on `/health` |
