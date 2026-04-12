# Massage Clinic Management System

A modern booking and management system for a massage clinic with client database, appointment scheduling, and earnings tracking.

## Features

- 🗓️ Appointment Scheduling
- 👥 Client Management
- 💰 Payment Tracking with Gap Calculations
- 📊 Earnings Dashboard
- 👨‍⚕️ Therapist Shift Management
- 💾 SQLite Database Storage

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install:
- Express.js (backend server)
- SQLite3 (database)
- CORS (for frontend-backend communication)

### 2. Start the Server

```bash
npm start
```

The server will run on `http://localhost:3000`

You should see:
```
Connected to SQLite database
Bookings table ready
Customers table ready
Server running at http://localhost:3000
```

### 3. Open the Application

Open your browser and go to `http://localhost:3000`

Navigate between pages:
- **Home** - Assign therapists to shifts for today
- **New Booking** - Register clients and create appointments
- **Customers** - View all registered customers
- **Earnings** - Track daily/weekly earnings

## File Structure

```
relievemassage/
├── index.html           # Home page (Therapist shift assignment)
├── booking.html         # Client registration & appointment booking
├── customers.html       # Customer management
├── dashboard.html       # Earnings dashboard
├── script.js            # Main frontend logic
├── style.css            # Styling
├── server.js            # Node.js/Express backend
├── package.json         # Dependencies
├── clinic.db            # SQLite database (auto-created)
└── README.md            # This file
```

## Database Schema

### Bookings Table
- `id` - Unique booking ID
- `appointmentDate` - Date of appointment
- `appointmentTime` - Time of appointment
- `customerName` - Client full name
- `phone` - Client phone number
- `insurance` - Insurance card number
- `therapist` - Assigned therapist
- `treatment` - Type of treatment
- `totalPrice` - Total service cost
- `insuranceClaim` - Insurance coverage amount
- `gapPayment` - Out-of-pocket payment by client
- `paymentMethod` - Cash or Card
- `createdAt` - Booking creation timestamp

### Customers Table
- `id` - Unique customer ID
- `name` - Customer name
- `phone` - Phone number
- `insurance` - Insurance information
- `createdAt` - Customer registration timestamp

## API Endpoints

### POST `/api/bookings`
Create a new booking

Request body:
```json
{
  "appointmentDate": "2026-04-15",
  "appointmentTime": "14:00",
  "customerName": "John Smith",
  "phone": "0412345678",
  "insurance": "ABC123",
  "therapist": "Alice",
  "treatment": "whole-body",
  "totalPrice": 120,
  "insuranceClaim": 70,
  "gapPayment": 50,
  "paymentMethod": "card"
}
```

### GET `/api/bookings`
Get all bookings

### GET `/api/bookings/:date`
Get bookings for a specific date (YYYY-MM-DD format)

### DELETE `/api/bookings/:id`
Delete a booking by ID

### GET `/api/customers`
Get all registered customers

## Development

For development with auto-reload, use:
```bash
npm run dev
```

This requires `nodemon` which is included in devDependencies.

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Notes

- The database file (`clinic.db`) is created automatically on first run
- Client information is validated on the backend
- All monetary values are in AUD (Australian Dollars)
- Therapist assignments are managed on the home page
