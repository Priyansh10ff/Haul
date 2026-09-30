# ShopKart 🛍️

ShopKart is a full-stack MERN e-commerce application built to practice authentication, product management, wishlist functionality, cart management, and frontend state management.

## Features

### Authentication
- Customer registration and login
- JWT-based authentication
- HTTP-only authentication cookie
- Protected and public routes
- Logout
- Change password

### Products
- View all products
- View individual product details
- Search products
- Filter products by category
- Product stock display
- Responsive product cards

### Wishlist
- Add products to wishlist
- Remove products from wishlist
- View the user's wishlist
- Wishlist state is reflected on product cards and product details

### Cart
- Add products to cart
- View cart items
- Increase/decrease product quantity
- Remove products from cart
- Quantity checked against product stock
- Cart count shared across the application
- Cart state managed with React Context

## Tech Stack

### Frontend
- React
- React Router
- Axios
- Tailwind CSS
- React Context API

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- cookie-parser
- CORS

## Project Structure

```text
ShopKart/
├── backend/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/
        ├── context/
        ├── pages/
        ├── services/
        └── App.jsx
```

## How the Frontend Works

The main flow is:

```text
React Component
      ↓
Axios Request
      ↓
Express Route
      ↓
Controller
      ↓
MongoDB
      ↓
Response
      ↓
React State / Context
      ↓
UI Update
```

## Cart Context

The cart is shared between components using React Context API.

Without Context, cart data would have to be passed through props between components. Context provides one shared cart state that components such as the Navbar, Product Details, and Cart page can access.

```text
CartProvider
     ↓
Shared cart state
     ├── Navbar
     ├── Product Details
     ├── Products
     └── Cart
```

When the user adds or removes an item:

```text
User Action
    ↓
Cart Context function
    ↓
Backend API
    ↓
Database update
    ↓
Update React state
    ↓
UI updates
```

The Context manages frontend state, while MongoDB stores the persistent cart data.

## Wishlist Flow

```text
User clicks Wishlist
        ↓
POST / DELETE request
        ↓
Backend updates wishlist
        ↓
Frontend updates wishlist state
        ↓
UI reflects the new state
```

The Product Details page gets the product ID from the URL using React Router's `useParams()`.

```text
/products/:id
       ↓
useParams()
       ↓
product ID
       ↓
GET /products/:id
       ↓
Product details
```

## Mongoose Populate

Cart and wishlist store references to products.

Without `populate()`:

```text
cart → product ID
```

With `populate()`:

```text
cart → product details
```

This allows the frontend to receive information such as the product name, price, image, and stock.

## API Configuration

The frontend uses a centralized Axios instance in:

```text
frontend/src/services/api.js
```

It contains the backend URL and enables credentials so authentication cookies can be sent with requests.

## Routing

React Router handles navigation.

Main routes:

```text
/login
/signup
/home
/products
/products/:id
```

Protected routes require the user to be authenticated.

## Running the Project

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Configure MongoDB and the required environment variables before starting the backend.

## Environment Variables

```text
MONGO_URI
JWT_SECRET
```

Never commit real secrets or API keys to GitHub.

## Concepts Demonstrated

- REST APIs
- JWT authentication
- HTTP-only cookies
- Authentication middleware
- Protected routes
- React state management
- React Context API
- Axios
- MongoDB references
- Mongoose populate
- Product search and filtering
- Wishlist management
- Cart management
- Quantity management
- Frontend/backend synchronization

## Author

**Priyansh**

Built as a MERN stack e-commerce project for learning and development practice.
