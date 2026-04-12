const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Initialize SQLite Database
const db = new sqlite3.Database('./clinic.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Create tables if they don't exist
function initializeDatabase() {
    db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            appointmentDate TEXT NOT NULL,
            appointmentTime TEXT NOT NULL,
            therapyDuration INTEGER,
            endTime TEXT,
            customerName TEXT NOT NULL,
            phone TEXT NOT NULL,
            insurance TEXT,
            therapist TEXT NOT NULL,
            treatment TEXT NOT NULL,
            totalPrice REAL NOT NULL,
            insuranceClaim REAL NOT NULL,
            gapPayment REAL NOT NULL,
            paymentMethod TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating table:', err);
        } else {
            console.log('Bookings table ready');
            // Add therapyDuration column if it doesn't exist (for existing databases)
            db.run(`ALTER TABLE bookings ADD COLUMN therapyDuration INTEGER`, (err) => {
                if (err && !err.message.includes('duplicate column name')) {
                    console.error('Error adding therapyDuration column:', err);
                } else if (!err) {
                    console.log('Added therapyDuration column to existing table');
                }
            });
            // Add endTime column if it doesn't exist (for existing databases)
            db.run(`ALTER TABLE bookings ADD COLUMN endTime TEXT`, (err) => {
                if (err && !err.message.includes('duplicate column name')) {
                    console.error('Error adding endTime column:', err);
                } else if (!err) {
                    console.log('Added endTime column to existing table');
                }
            });
        }
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            phone TEXT,
            insurance TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating customers table:', err);
        } else {
            console.log('Customers table ready');
        }
    });
}

// API Routes

// Save a new booking
app.post('/api/bookings', (req, res) => {
    const { appointmentDate, appointmentTime, therapyDuration, endTime, customerName, phone, insurance, therapist, treatment, totalPrice, insuranceClaim, gapPayment, paymentMethod } = req.body;

    // Validate required fields
    if (!appointmentDate || !appointmentTime || !customerName || !phone || !therapist || !treatment) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const stmt = db.prepare(`
        INSERT INTO bookings (appointmentDate, appointmentTime, therapyDuration, endTime, customerName, phone, insurance, therapist, treatment, totalPrice, insuranceClaim, gapPayment, paymentMethod)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([appointmentDate, appointmentTime, therapyDuration || null, endTime || null, customerName, phone, insurance || null, therapist, treatment, totalPrice || 0, insuranceClaim || 0, gapPayment || 0, paymentMethod || 'cash'], function(err) {
        if (err) {
            console.error('Error inserting booking:', err);
            return res.status(500).json({ error: 'Failed to save booking' });
        }
        res.json({ success: true, bookingId: this.lastID, message: 'Booking saved successfully' });
    });
});

// Get all bookings
app.get('/api/bookings', (req, res) => {
    db.all('SELECT * FROM bookings ORDER BY appointmentDate DESC, appointmentTime DESC', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch bookings' });
        }
        res.json(rows);
    });
});

// Get bookings for a specific date
app.get('/api/bookings/:date', (req, res) => {
    const date = req.params.date;
    db.all('SELECT * FROM bookings WHERE appointmentDate = ? ORDER BY appointmentTime', [date], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch bookings' });
        }
        res.json(rows);
    });
});

// Get all customers
app.get('/api/customers', (req, res) => {
    db.all('SELECT * FROM customers ORDER BY name', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch customers' });
        }
        res.json(rows);
    });
});

// Get customer bookings by name
app.get('/api/customer/:name', (req, res) => {
    const name = req.params.name;
    db.all('SELECT * FROM bookings WHERE customerName = ? ORDER BY appointmentDate DESC', [name], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch customer bookings' });
        }
        res.json(rows);
    });
});

// Update a booking
app.put('/api/bookings/:id', (req, res) => {
    const id = req.params.id;
    const {
        appointmentDate,
        appointmentTime,
        therapyDuration,
        endTime,
        customerName,
        phone,
        insurance,
        therapist,
        treatment,
        totalPrice,
        insuranceClaim,
        gapPayment,
        paymentMethod
    } = req.body;

    if (!customerName || !phone || !appointmentDate || !appointmentTime || !therapist || !treatment) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    db.run(
        `UPDATE bookings SET 
            appointmentDate = ?,
            appointmentTime = ?,
            therapyDuration = ?,
            endTime = ?,
            customerName = ?,
            phone = ?,
            insurance = ?,
            therapist = ?,
            treatment = ?,
            totalPrice = ?,
            insuranceClaim = ?,
            gapPayment = ?,
            paymentMethod = ?
        WHERE id = ?`,
        [
            appointmentDate,
            appointmentTime,
            therapyDuration || null,
            endTime || null,
            customerName,
            phone,
            insurance || null,
            therapist,
            treatment,
            totalPrice || 0,
            insuranceClaim || 0,
            gapPayment || 0,
            paymentMethod || 'cash',
            id
        ],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to update booking' });
            }
            res.json({ success: true, message: 'Booking updated' });
        }
    );
});

// Delete a booking
app.delete('/api/bookings/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM bookings WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete booking' });
        }
        res.json({ success: true, message: 'Booking deleted' });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// Close database on exit
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});
