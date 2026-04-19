# ShopVerse - Full-Stack MERN E-Commerce Platform ⚡

A premium e-commerce web application built with MongoDB, Express.js, React, and Node.js.

## Features

### Core
- **Auth**: JWT-based signup/login, role-based access (admin/user)
- **Products**: CRUD (admin), categories, search, filters, sorting, pagination
- **Cart & Wishlist**: Full cart management with wishlist toggle
- **Checkout**: Multi-step checkout with Razorpay integration (test mode)
- **Orders**: Create, track (placed → confirmed → shipped → delivered), invoice
- **Reviews**: Star ratings and review system

### Admin Panel
- Dashboard with analytics (revenue, orders, users, monthly sales chart)
- Product management (create/edit/delete)
- Order status management
- User role management

### AI Features
- Product recommendations (category/tag-based similar products)
- Personalized suggestions (based on purchase history)
- Image-based product search (mock mode)

## Tech Stack
- **Frontend**: React 19 + Vite, Redux Toolkit, React Router, Axios, React Icons
- **Backend**: Node.js, Express.js, MongoDB + Mongoose
- **Auth**: JWT, bcryptjs
- **Payments**: Razorpay (test mode with mock fallback)
- **Images**: Cloudinary upload support
- **Styling**: Custom CSS with dark theme, responsive design

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Backend Setup
```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and API keys
npm install
npm run seed   # Seeds admin, test user, categories, 20 products
npm run dev    # Starts on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev    # Starts on http://localhost:5173
```

### 3. Demo Credentials
| Role  | Email                | Password  |
|-------|---------------------|-----------|
| Admin | admin@shopverse.com | admin123  |
| User  | john@example.com    | user123   |

## Environment Variables

Create `server/.env` (see `.env.example`):

| Variable              | Description                    |
|-----------------------|--------------------------------|
| MONGODB_URI           | MongoDB connection string      |
| JWT_SECRET            | Secret for JWT tokens          |
| JWT_EXPIRE            | Token expiry (default: 7d)     |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name          |
| CLOUDINARY_API_KEY    | Cloudinary API key             |
| CLOUDINARY_API_SECRET | Cloudinary API secret          |
| RAZORPAY_KEY_ID       | Razorpay test key ID           |
| RAZORPAY_KEY_SECRET   | Razorpay test key secret       |
| CLIENT_URL            | Frontend URL (default: http://localhost:5173) |

## Project Structure
```
E-Commerce/
├── server/
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API route handlers
│   ├── middleware/       # Auth, upload, error handler
│   ├── utils/           # JWT helper
│   ├── seed.js          # Database seeder
│   └── index.js         # Server entry point
├── client/
│   ├── src/
│   │   ├── components/  # Layout, common components
│   │   ├── pages/       # All page components
│   │   ├── store/       # Redux store & slices
│   │   ├── utils/       # API instance
│   │   └── index.css    # Design system
│   └── index.html
└── README.md
```

## API Endpoints

### Auth
- `POST /api/auth/signup` — Register
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get profile
- `PUT /api/auth/profile` — Update profile

### Products
- `GET /api/products` — List (search, filter, sort, paginate)
- `GET /api/products/:id` — Get one
- `POST /api/products` — Create (admin)
- `PUT /api/products/:id` — Update (admin)
- `DELETE /api/products/:id` — Delete (admin)

### Cart, Wishlist, Orders, Payment, Reviews, Admin
See route files in `server/routes/` for full API.
"# elixmart" 
"# elixmart" 
"# elixmart" 
