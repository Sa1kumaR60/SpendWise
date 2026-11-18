# SpendWise — Personal Budget & Expense Tracker

SpendWise is a full-stack MERN (MongoDB, Express, React, Node.js) budgeting and expense tracking web application built as an educational college project. It allows students and individuals to record income and expenses, organize transactions by category, set and monitor monthly budgets with proactive threshold warnings, analyze spending trends through interactive visual charts, and export data to CSV.

---

## Table of Contents
1. [Tech Stack & Architecture](#tech-stack--architecture)
2. [How the MERN Stack Works Together](#how-the-mern-stack-works-together)
3. [Key Features](#key-features)
4. [Prerequisites](#prerequisites)
5. [Project Structure](#project-structure)
6. [Environment Configuration](#environment-configuration)
7. [Installation & Setup](#installation--setup)
8. [Database Seeding & Demo Account](#database-seeding--demo-account)
9. [Running the Application](#running-the-application)
10. [Running Backend Tests](#running-backend-tests)
11. [API Endpoints Reference](#api-endpoints-reference)
12. [Security & Ownership Isolation](#security--ownership-isolation)
13. [Limitations & Educational Scope](#limitations--educational-scope)

---

## Tech Stack & Architecture

### Frontend
- **Framework:** React 18 with [Vite](https://vitejs.dev/) for fast Hot Module Replacement (HMR) and optimized builds
- **Routing:** React Router DOM v6
- **Styling:** Modern, responsive CSS with CSS variables, light/dark mode support, and an uncluttered red accent theme
- **Visualizations:** Chart.js & React-Chartjs-2 for income vs. expense trends and category donut charts
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js 4
- **Database ODM:** Mongoose 8
- **Authentication:** JSON Web Tokens (JWT) stored in secure, HTTP-only cookies
- **Password Security:** Salted hashes via bcryptjs (10 rounds)
- **Validation:** Express-Validator middleware with structured field-level error messages
- **Data Export:** RFC 4180-compliant CSV generation with quotation escaping

### Database
- **Engine:** MongoDB (Local MongoDB community server or MongoDB Atlas cluster)

---

## How the MERN Stack Works Together

```
+-------------------------------------------------------------------------+
|                         Client Layer (React + Vite)                     |
|  - React Components (Dashboard, Transactions, Budgets, Reports, etc.)   |
|  - AuthContext (Session state & Theme sync)                             |
|  - Fetch API Service with credentials: 'include' (HTTP-only cookies)   |
+----------------------------------+--------------------------------------+
                                   |
                         HTTP / REST API (JSON)
                                   |
+----------------------------------v--------------------------------------+
|                     Server Layer (Node.js + Express)                    |
|  - CORS & Cookie Parser Middleware                                      |
|  - Auth Middleware (Verifies JWT cookie, extracts req.user)             |
|  - Validation Middleware (Express-Validator input sanitation)           |
|  - Controllers (Business logic, ownership verification, aggregations)   |
+----------------------------------+--------------------------------------+
                                   |
                          Mongoose Queries / ODM
                                   |
+----------------------------------v--------------------------------------+
|                        Database Layer (MongoDB)                         |
|  - Collections: users, transactions, categories, budgets                |
|  - Aggregation Pipelines (Monthly trend, Category sums, Budget metrics) |
+-------------------------------------------------------------------------+
```

1. **Client Request:** The user interacts with the React frontend (e.g., records an expense). The frontend service dispatches an asynchronous `fetch` request with JSON payload to the Express backend.
2. **Authentication Guard:** The incoming request includes the `token` cookie. The backend `protect` middleware verifies the JWT signature and extracts the logged-in user ID.
3. **Validation & Ownership:** The controller validates the input fields (amount > 0, date format, matching category type) and ensures the category and transaction records belong strictly to the authenticated user.
4. **Data Persistence:** Mongoose executes validated queries against MongoDB, returning the updated document or aggregation results.
5. **State Update:** React receives the JSON response, re-renders the UI, and recalculates visual indicators (e.g., budget progress bars, stat cards).

---

## Key Features

### 1. Authentication & Account Management
- Secure sign-up, login, and logout.
- Password hashing using `bcryptjs`.
- JWT session tokens stored in `httpOnly`, `sameSite: 'lax'` cookies to mitigate XSS risks.
- Automatic seeding of default income and expense categories upon user registration.
- Profile management: Update display name, toggle light/dark theme, and switch preferred currency (`USD $`, `EUR €`, `GBP £`, `INR ₹`, `CAD CA$`, `AUD AU$`, `JPY ¥`).

### 2. Dashboard & Visual Metrics
- Key Metric Cards: Total Income, Total Expenses, Net Balance, and Savings Rate.
- Monthly Cash Flow Trend: 6-month comparative bar chart of income vs. expenses.
- Expense Category Breakdown: Interactive doughnut chart displaying category share percentages.
- Proactive Budget Warnings: Alert banner highlights categories nearing (>= 80%) or exceeding (>= 100%) limits.
- Quick Month Switcher: Easily inspect past or future months.
- Clean empty states for users with zero transactions.

### 3. Transactions Management
- Full CRUD for income and expense transactions.
- Fields: Amount, Type, Category, Date, Description, and Optional Notes.
- Search filter: Real-time search by description or notes.
- Multi-criteria filters: Filter by Type (Income/Expense), Category, and Date Range.
- Sortable: Sort by Date (Newest/Oldest) or Amount (High/Low).
- Pagination: 10 transactions per page with page indicators.
- Safe deletion: Modal confirmation before deleting any transaction.

### 4. Categories Management
- Sensible seeded default categories for both income and expense.
- Add custom categories with custom color tags.
- Rename and update category colors.
- Safe deletion protection: Blocks deleting a category if it is currently utilized by existing transactions or active budgets.
- Strict isolation: Expense and income categories remain distinct.

### 5. Monthly Budgets
- Set monthly spending limits per expense category.
- Real-time calculation of spent amount, remaining balance, and consumption percentage.
- Color-coded progress bars:
  - **Green:** Healthy (< 80%)
  - **Amber:** Warning / Near Limit (80% - 99%)
  - **Red:** Exceeded (>= 100%)
- Prevents duplicate budgets for the same category and month.

### 6. Reports & CSV Export
- Deep-dive annual or custom-range spending and income summaries.
- Category distribution tables with counts, percentages, and totals.
- Filtered CSV Export: Downloads user transactions as RFC 4180-compliant CSV files with properly escaped quotes and commas.

---

## Prerequisites

Before running the project locally, ensure you have:
1. **Node.js:** v18.0.0 or higher (`node -v`)
2. **npm:** v9.0.0 or higher (`npm -v`)
3. **MongoDB:** Either:
   - A local MongoDB instance running on `mongodb://127.0.0.1:27017`
   - Or a free cloud database cluster from [MongoDB Atlas](https://www.mongodb.com/atlas)

---

## Project Structure

```
itsp_pjt/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB Mongoose connection
│   │   ├── controllers/
│   │   │   ├── authController.js     # User registration, login, logout, me
│   │   │   ├── budgetController.js   # Budget CRUD and spent calculation
│   │   │   ├── categoryController.js # Category CRUD and usage validation
│   │   │   ├── dashboardController.js# Aggregations, metrics, trends, alerts
│   │   │   ├── reportController.js   # Detailed reports and period summaries
│   │   │   ├── transactionController.js # Transaction CRUD, filter, CSV export
│   │   │   └── userController.js     # User profile and password updates
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # JWT cookie verification & user injection
│   │   │   ├── errorMiddleware.js    # 404 handler & standardized error formatting
│   │   │   └── validateMiddleware.js # Express-validator error handler
│   │   ├── models/
│   │   │   ├── Budget.js             # Budget schema (user, category, month, amount)
│   │   │   ├── Category.js           # Category schema (user, name, type, color)
│   │   │   ├── Transaction.js        # Transaction schema (user, amount, type, etc.)
│   │   │   └── User.js               # User schema (name, email, password hash, etc.)
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── budgetRoutes.js
│   │   │   ├── categoryRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── reportRoutes.js
│   │   │   ├── transactionRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── scripts/
│   │   │   └── seed.js               # Demo account & sample transactions seeder
│   │   ├── tests/
│   │   │   ├── auth.test.js          # Authentication test suite
│   │   │   ├── budget.test.js        # Budget calculations & warnings suite
│   │   │   ├── ownership.test.js     # Multi-tenant data isolation suite
│   │   │   ├── setup.js              # In-memory test database runner
│   │   │   └── transaction.test.js   # Transaction CRUD, filter, CSV suite
│   │   ├── utils/
│   │   │   ├── csvHelper.js          # RFC 4180 CSV serializer
│   │   │   └── defaultCategories.js  # Starter categories template
│   │   └── app.js                    # Express app & middleware config
│   ├── .env.example                  # Backend environment variable template
│   ├── package.json
│   └── server.js                     # HTTP server entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── common/
│   │   │       ├── ConfirmModal.jsx  # Reusable confirmation dialog
│   │   │       ├── EmptyState.jsx    # Standardized empty state view
│   │   │       ├── Modal.jsx         # Accessible popup modal
│   │   │       ├── Navbar.jsx        # Topbar with month selector & mobile toggle
│   │   │       ├── ProgressBar.jsx   # Dynamic budget status bar
│   │   │       ├── Sidebar.jsx       # Brand navigation & user profile
│   │   │       └── StatCard.jsx      # KPI statistics card
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Global user session & theme management
│   │   ├── pages/
│   │   │   ├── Budgets.jsx           # Budget planning & consumption page
│   │   │   ├── Categories.jsx        # Category organization page
│   │   │   ├── Dashboard.jsx         # Main financial dashboard & charts
│   │   │   ├── Login.jsx             # User sign-in with 1-click demo button
│   │   │   ├── Register.jsx          # New account registration
│   │   │   ├── Reports.jsx           # Annual & custom-range spending reports
│   │   │   ├── Settings.jsx          # Profile, theme, & password settings
│   │   │   └── Transactions.jsx      # Paginated, searchable transaction table
│   │   ├── services/
│   │   │   └── api.js                # Unified fetch API client
│   │   ├── utils/
│   │   │   └── formatters.js         # Currency and date formatters
│   │   ├── App.jsx                   # Client routes & protected layout
│   │   ├── index.css                 # Clean CSS design system & dark theme
│   │   └── main.jsx                  # React DOM entry point
│   ├── .env.example                  # Frontend environment variable template
│   ├── index.html
│   ├── package.json
│   └── vite.config.js                # Vite development server & API proxy
└── README.md
```

---

## Environment Configuration

### Backend (`backend/.env`)
Create a `.env` file in the `backend/` folder based on `backend/.env.example`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/spendwise
JWT_SECRET=spendwise_dev_secret_key_987654321_secure
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```
*Note: If using MongoDB Atlas, replace `MONGODB_URI` with your connection string (e.g., `mongodb+srv://<user>:<password>@cluster.mongodb.net/spendwise`).*

### Frontend (`frontend/.env`)
Create a `.env` file in the `frontend/` folder based on `frontend/.env.example`:
```env
VITE_API_URL=/api
```
*(The Vite dev server proxies `/api` requests to `http://localhost:5000`, ensuring cookies function seamlessly across localhost ports).*

---

## Installation & Setup

1. **Clone or open the repository:**
   ```bash
   cd itsp_pjt
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

---

## Database Seeding & Demo Account

To populate the database with realistic college student transactions, categories, and active budgets for demonstration:

```bash
cd backend
npm run seed
```

### Pre-configured Demo Login Credentials:
- **Email:** `demo@spendwise.edu`
- **Password:** `Password123!`
- *(A one-click "Auto-fill Demo Credentials" button is also provided directly on the Login page).*

---

## Running the Application

### 1. Start the Backend API Server
In a terminal window:
```bash
cd backend
npm run dev
```
The server will start on `http://localhost:5000`. You can verify API health at `http://localhost:5000/api/health`.

### 2. Start the Frontend Development Server
In a second terminal window:
```bash
cd frontend
npm run dev
```
Open your browser and navigate to:
```
http://localhost:5173
```

---

## Running Backend Tests

The project includes automated integration tests covering authentication, multi-tenant ownership protection, transaction CRUD/filtering/pagination/CSV, and budget calculation algorithms.

To run the test suite:
```bash
cd backend
npm test
```

---

## API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user & seed categories | Public |
| `POST` | `/api/auth/login` | Authenticate user & issue HTTP-only cookie | Public |
| `POST` | `/api/auth/logout` | Clear auth cookie | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user data | Private |

### Transactions (`/api/transactions`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/transactions` | Query filtered, paginated transactions | Private |
| `GET` | `/api/transactions/:id` | Retrieve single transaction by ID | Private |
| `POST` | `/api/transactions` | Record new transaction | Private |
| `PUT` | `/api/transactions/:id` | Update existing transaction | Private |
| `DELETE` | `/api/transactions/:id` | Delete transaction | Private |
| `GET` | `/api/transactions/export/csv` | Download filtered transactions as CSV | Private |

### Budgets (`/api/budgets`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/budgets?month=YYYY-MM` | Get monthly budgets with spent metrics | Private |
| `POST` | `/api/budgets` | Set monthly spending limit | Private |
| `PUT` | `/api/budgets/:id` | Modify budget limit | Private |
| `DELETE` | `/api/budgets/:id` | Remove budget limit | Private |

### Categories (`/api/categories`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/categories` | List user's income and expense categories | Private |
| `POST` | `/api/categories` | Create custom category | Private |
| `PUT` | `/api/categories/:id` | Rename or update category color | Private |
| `DELETE` | `/api/categories/:id` | Delete category (checks usage) | Private |

### Dashboard & Reports (`/api/dashboard`, `/api/reports`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/dashboard?month=YYYY-MM` | Fetch KPI metrics, charts, budget alerts | Private |
| `GET` | `/api/reports/summary` | Generate period spending & category distribution | Private |

### User Settings (`/api/users`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `PUT` | `/api/users/profile` | Update name, currency, theme | Private |
| `PUT` | `/api/users/password` | Change user password | Private |

---

## Security & Ownership Isolation

1. **Strict User Scoping:** Every database query in `Transaction`, `Budget`, and `Category` controllers filters by `user: req.user._id`. Users cannot view, modify, or delete another user's records even if they manipulate request parameters or IDs.
2. **Category Cross-Check:** When creating or editing transactions or budgets, the server validates that the specified category belongs to the authenticated user and matches the transaction type.
3. **HTTP-Only Cookies:** Tokens cannot be read by browser JavaScript (`document.cookie`), shielding sessions from Cross-Site Scripting (XSS).
4. **Input Sanitization:** Server-side validation via `express-validator` rejects malicious, empty, or malformed payloads before database execution.

---

## Limitations & Educational Scope

- **No Real Bank Integrations:** In accordance with the educational project requirements, SpendWise does not integrate with Plaid, Open Banking, or external payment gateways. All transactions are recorded manually or generated via the seed script.
- **Local Currency Display:** Currency symbols (`$`, `€`, `£`, `₹`, etc.) are visual formatting preferences and do not perform real-time FX currency conversions.
- **Single-Tenant Database:** Designed for local evaluation, presentation, and small-team deployment.
