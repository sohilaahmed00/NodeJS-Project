# Node.js E-Commerce API

A full-featured RESTful e-commerce backend built with **Node.js**, **Express**, and **MongoDB**. Includes product management, cart, orders, authentication, reviews, wishlists, coupons, and more — with interactive API documentation via Swagger.

---

## Features

- **Authentication** — JWT-based signup, login, and role-based access control
- **Products & Categories** — Full CRUD with image uploads via Multer
- **Cart & Orders** — Cart management and order processing with Stripe integration
- **Coupons** — Discount coupon creation and validation
- **Wishlist** — Per-user wishlist management
- **Reviews** — Product reviews and ratings
- **User & Address Management** — Profile updates and saved shipping addresses
- **API Docs** — Interactive Swagger UI at `/api-docs`

---

## Tech Stack

| Layer        | Technology                 |
| ------------ | -------------------------- |
| Runtime      | Node.js (ESM)              |
| Framework    | Express 5                  |
| Database     | MongoDB + Mongoose         |
| Auth         | JWT + bcrypt               |
| File Uploads | Multer                     |
| Payments     | Stripe                     |
| Email        | Nodemailer + Pug templates |
| API Docs     | Swagger UI + YAML          |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/sohilaahmed00/NodeJS-Project.git
cd NodeJS-Project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory and add the following:

```env
NODE_ENV=development
PORT=3000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24hours

STRIPE_SECRET_KEY=your_stripe_secret_key

EMAIL_HOST=your_email_host
EMAIL_PORT=your_email_port
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_password
```

### 4. Start the server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

---

## API Documentation

Once the server is running, visit:
[http://localhost:3000/api-docs](http://localhost:3000/api-docs)
