# SeaFest BD — User Manual

**Smart Tourism & Event Management Platform**
Version 1.0 | June 2026

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Public User Paths](#public-user-paths)
4. [Customer Paths (Logged In)](#customer-paths-logged-in)
5. [Event Manager / Organizer Paths](#event-manager--organizer-paths)
6. [Admin Paths](#admin-paths)
7. [All URL Paths Reference](#all-url-paths-reference)
8. [Roles & Permissions](#roles--permissions)
9. [Running the Project](#running-the-project)

---

## Introduction

SeaFest BD is a smart tourism and event management platform for Bangladesh. It allows customers to discover and book events, organizers to create and manage events, and admins to oversee the entire platform.

---

## Getting Started

### Registration

1. Go to **http://localhost:5173/register**
2. Fill in your name, email, phone, and password
3. Click **Register**
4. You will be logged in automatically as a **Customer**

### Login

1. Go to **http://localhost:5173/login**
2. Enter your email and password
3. Click **Login**
4. You will be redirected based on your role

### Forgot Password

1. Go to **http://localhost:5173/forgot-password**
2. Enter your registered email
3. Check your email for a reset link

---

## Public User Paths

These pages are accessible to **everyone** (no login required).

### Home Page
- **URL:** `http://localhost:5173/`
- Shows featured events, categories, and platform highlights
- Browse upcoming events
- Click any event card to see its details

### All Events
- **URL:** `http://localhost:5173/events`
- Browse all approved events
- Filter by category (DJ Party, Beach Party, Food Festival, Music Concert, Wedding Event, Cultural Program, Tourism Festival, New Year, Corporate Event, Hotel Event)
- Search events by name or location

### Event Detail
- **URL:** `http://localhost:5173/events/:id`
- View full event details: date, location, description, tickets, images
- See available ticket types and prices
- **Book Now** button — requires login

---

## Customer Paths (Logged In)

These pages require a **Customer** (or any) account.

### My Bookings
- **URL:** `http://localhost:5173/bookings`
- View all your event bookings
- See booking status: Pending, Confirmed, Cancelled, Refunded, Attended
- Click a booking to see its full detail

### Booking Detail
- **URL:** `http://localhost:5173/bookings/:id`
- View full booking information
- See your QR code ticket
- Download or screenshot ticket for entry

### My Profile
- **URL:** `http://localhost:5173/profile`
- View and update your personal information
- Change your name, phone, avatar
- Change your password

### Become an Organizer
- **URL:** `http://localhost:5173/become-organizer`
- Apply to become an Event Manager/Organizer
- Fill in: organization name, organization info, national ID, bank details
- Upload supporting documents
- Application status: Pending → Under Review → Approved / Rejected
- Once approved by Admin, your role changes to **Manager**

---

## Event Manager / Organizer Paths

These pages require role: **Manager** or **Admin**.

### Manager Dashboard
- **URL:** `http://localhost:5173/manager`
- Overview of your events: total events, bookings, revenue
- Quick stats and recent activity

### My Events
- **URL:** `http://localhost:5173/manager/events`
- List all events you have created
- See event status: Draft, Pending, Approved, Rejected, Suspended, Cancelled
- Edit or delete your events

### Create Event
- **URL:** `http://localhost:5173/manager/events/create`
- Create a new event
- Fill in:
  - Title, Description, Category
  - Date & End Date
  - Location, Latitude, Longitude
  - Cover Image & Gallery Images
  - Total Capacity
  - Ticket Types (type name, price, quantity)
  - Tags
- Event is submitted with status **Pending** — Admin must approve before it goes live

### Scan Ticket
- **URL:** `http://localhost:5173/manager/scan`
- Scan attendee QR code tickets at the event entrance
- Validates ticket authenticity
- Marks attendee as **Attended**

---

## Admin Paths

These pages require role: **Admin** only.

### Admin Dashboard
- **URL:** `http://localhost:5173/admin`
- Platform-wide stats: total users, events, bookings, revenue
- Recent activity overview

### Manage Users
- **URL:** `http://localhost:5173/admin/users`
- View all registered users
- Filter by role: Customer, Manager, Hotel Manager, Support, Finance, Admin
- Suspend or activate user accounts
- Change user roles

### Manage Events
- **URL:** `http://localhost:5173/admin/events`
- View all events on the platform
- Approve or Reject pending events
- Suspend or Cancel live events
- Add admin notes to events

### Organizer Applications
- **URL:** `http://localhost:5173/admin/applications`
- View all organizer applications
- Review applicant documents and details
- Approve → user becomes Manager
- Reject → application is declined with a note

### Revenue
- **URL:** `http://localhost:5173/admin/revenue`
- Platform revenue overview
- Booking and payment analytics
- Filter by date range

---

## All URL Paths Reference

| Path | Access | Description |
|------|--------|-------------|
| `/` | Public | Home page |
| `/events` | Public | All events listing |
| `/events/:id` | Public | Event detail & booking |
| `/login` | Public | Login page |
| `/register` | Public | Register new account |
| `/forgot-password` | Public | Password reset request |
| `/bookings` | Customer+ | My bookings list |
| `/bookings/:id` | Customer+ | Booking detail + QR ticket |
| `/profile` | Customer+ | Edit profile & password |
| `/become-organizer` | Customer+ | Apply to be an organizer |
| `/manager` | Manager/Admin | Manager dashboard |
| `/manager/events` | Manager/Admin | My events list |
| `/manager/events/create` | Manager/Admin | Create new event |
| `/manager/scan` | Manager/Admin | Scan QR ticket at door |
| `/admin` | Admin only | Admin dashboard |
| `/admin/users` | Admin only | Manage all users |
| `/admin/events` | Admin only | Approve/reject events |
| `/admin/applications` | Admin only | Organizer applications |
| `/admin/revenue` | Admin only | Revenue & analytics |

---

## Roles & Permissions

| Role | What They Can Do |
|------|-----------------|
| **Customer** | Browse events, book tickets, view bookings, apply to become organizer |
| **Manager** | Everything a Customer can do + create/manage events, scan tickets |
| **Hotel Manager** | Same as Manager, focused on hotel events |
| **Support** | Customer support access |
| **Finance** | Revenue and payment access |
| **Admin** | Full access — manage users, approve events, handle applications, view revenue |

---

## Running the Project

### Requirements
- Node.js v18+
- MariaDB / MySQL

### Backend
```bash
cd seafest-bd/server
cp .env.example .env   # fill in DB credentials
npm install
npm run dev            # runs on http://localhost:5000
```

### Frontend
```bash
cd seafest-bd/client
npm install
npm run dev            # runs on http://localhost:5173
```

### Environment Variables (server/.env)
| Variable | Description |
|----------|-------------|
| `DB_HOST` | Database host (default: localhost) |
| `DB_PORT` | Database port (default: 3306) |
| `DB_NAME` | Database name (seafest_bd) |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `JWT_SECRET` | Secret key for JWT tokens |
| `STRIPE_SECRET_KEY` | Stripe payment key |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary image storage |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `EMAIL_USER` | Gmail address for emails |
| `EMAIL_PASS` | Gmail app password |
| `CLIENT_URL` | Frontend URL (http://localhost:5173) |

---

*SeaFest BD — Husbey University Project | 2026*
