# SeaFest BD

**Smart Tourism, Entertainment & Event Management Platform**
> Discover. Book. Celebrate. — Cox's Bazar, Bangladesh

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MySQL + Sequelize ORM |
| Auth | JWT |
| Payments | Stripe + SSLCommerz + bKash/Nagad |
| Email | Nodemailer |
| Storage | Cloudinary |
| QR Codes | qrcode library |

---

## Project Structure

```
seafest-bd/
  server/          # Node.js + Express API
    config/        # Database config
    controllers/   # Business logic
    models/        # Sequelize models
    routes/        # API routes
    middleware/    # Auth middleware
    utils/         # Email helpers
  client/          # React + Vite frontend
    src/
      pages/
        public/    # Home, Events, Event Detail
        auth/      # Login, Register, Forgot Password
        customer/  # Bookings, Profile, Apply Organizer
        manager/   # Manager Dashboard, Events, QR Scanner
        admin/     # Admin Dashboard, Users, Events, Applications, Revenue
      components/
        layout/    # Navbar, Footer, AdminLayout, ManagerLayout
      context/     # AuthContext
      features/    # Axios instance
```

---

## Setup Instructions

### 1. Database
Create a MySQL database named `seafest_bd`.

### 2. Backend
```bash
cd server
cp .env.example .env
# Fill in your credentials in .env
npm install
npm run dev
```

### 3. Frontend
```bash
cd client
npm install
npm run dev
```

---

## API Routes

| Method | Route | Description |
|---|---|---|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/events | List events |
| GET | /api/events/:id | Event detail |
| POST | /api/bookings | Create booking |
| POST | /api/payments/confirm | Confirm payment |
| GET | /api/admin/dashboard | Admin stats |
| PUT | /api/admin/events/:id/status | Approve/reject event |
| PUT | /api/admin/applications/:id | Review organizer app |

---

## User Roles

| Role | Capabilities |
|---|---|
| `customer` | Browse, book, review |
| `manager` | Create events, scan tickets, view analytics |
| `hotel_manager` | Manage hotel packages |
| `support` | Support functions |
| `finance` | View financial reports |
| `admin` | Full system access |

---

## Developer
**Husbey Hawlader** — SeaFest BD v1.0 (2026)
