# ShopKart

A simple, honest online store. Find a product, add it to your cart, pay with UPI or card, and see your order. Nothing else gets in the way.

---

## What it is

ShopKart is a web store for a small catalogue of everyday products across electronics, fashion, books and home goods. Shoppers create an account, browse and search the catalogue, keep a wishlist, build a cart and check out through Razorpay, India's most widely used payment gateway. After paying, they can come back any time to see what they ordered and where it is being shipped.

The cart and wishlist are stored on the server, not in the browser, so a shopper who adds something on their laptop sees it on their phone.

## Why it exists

- **Small sellers need a store, not a marketplace.** Marketplaces take a commission and put the seller's products next to competitors. A small brand or college store needs its own checkout with its own catalogue.
- **Checkout is where most stores lose people.** Long forms, surprise totals and failed payments drive shoppers away. ShopKart keeps checkout to one short address form and one payment step, with the total shown before you pay.
- **Prices and stock must be trusted.** The amount charged is always calculated on the server from the live catalogue. Nothing the browser sends can change a price, and a shopper can never put more in the cart than is in stock.
- **Payments must be verified, not assumed.** An order only counts as paid after the server has checked Razorpay's cryptographic signature. A closed popup or a failed card never turns into a "paid" order.

## Who it is for

**Primary: shoppers in India**
People buying a few items at a time on mobile or desktop who expect UPI, cards and netbanking, prices in rupees and a checkout that takes under a minute.

**Secondary: the store owner**
A small business or student team that wants to run a store with its own branding and payment account, on hosting that costs nothing to start.

**Also: developers learning full-stack commerce**
The codebase is small enough to read in an afternoon and covers authentication, server-side carts, payment verification and stock control.

**Who it is not for**
Multi-vendor marketplaces, stores with thousands of products and complex variants (size, colour), or businesses that need invoicing, returns and shipping integrations out of the box.

## How it works

1. **Sign up** with name, email, mobile number and password. You are logged in straight away.
2. **Browse** the catalogue on the Products page. Search by name or pick a category.
3. **Open a product** to see its description, price and how many units are left.
4. **Save it for later** with the heart button, or **add it to your cart**.
5. **Review your cart.** Change quantities (never more than are in stock) or remove items. The total updates as you go.
6. **Check out.** Enter a shipping address (name, 10-digit mobile number, address, city, state, 6-digit pincode).
7. **Pay** in the Razorpay window using UPI, card, netbanking or a wallet.
8. **See the confirmation.** Once the payment is verified, the order is placed, your cart is emptied and stock is reduced.
9. **Track your orders** on the Orders page, with full details for each one.

If the payment fails or you close the payment window, nothing is charged, the order is not placed and your cart stays exactly as it was.

## Core features

**Accounts**
- Email and password sign up and login. Emails are case-insensitive.
- Sessions kept in a secure, HTTP-only cookie for 7 days
- Logout from any page

**Catalogue**
- Product grid with image, category, price and stock
- Search by product name
- Category filter, with shareable links (`/products?category=Books`)
- Product detail page

**Wishlist**
- Add or remove from any product card or detail page
- Wishlist page with every saved product

**Cart**
- Stored on the server, so it is the same on every device
- Quantity controls capped at available stock
- Items whose product has been removed from the store disappear automatically
- Running total in the navbar and on the cart page

**Checkout and payments**
- Shipping address form with validation for Indian phone numbers and pincodes
- Razorpay Checkout (UPI, cards, netbanking, wallets)
- Total calculated on the server; payment signature verified on the server
- Stock reduced only after a confirmed payment

**Orders**
- Order history (paid orders only)
- Order details: items, total, status, shipping address
- Confirmation screen after payment

## Principles

- **The server decides what things cost.** Prices, totals and stock always come from the database, never from the browser.
- **Paid means verified.** An order is marked paid only after the Razorpay signature checks out.
- **Nothing is lost on failure.** A failed or abandoned payment leaves the cart untouched.
- **Your data is yours.** Shoppers can only ever see their own cart, wishlist and orders.
- **Fast on a phone.** Every page works on a small screen, and the whole app is a single lightweight bundle.

## Out of scope (for now)

- Admin dashboard for managing products and orders
- Product variants (size, colour) and multiple images
- Coupons, discounts and shipping charges (delivery is shown as free)
- Returns, refunds and cancellations from the app
- Order status updates after "Placed" (shipped, delivered)
- Email or SMS notifications
- Guest checkout

## Tech at a glance

| Layer | Choice |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router 7, Axios |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose 9 |
| Payments | Razorpay Orders API and Checkout |
| Auth | JWT in an HTTP-only cookie, bcrypt password hashing |
| Hosting | Vercel (frontend), Render (API), MongoDB Atlas (database) |

Requirements are in [PRD.md](./PRD.md). Technical details are in [TECHNICAL.md](./TECHNICAL.md).
