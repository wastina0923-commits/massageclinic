const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Session configuration
app.use(session({
    secret: 'your-secret-key-change-this-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true in production with HTTPS
}));

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
            hotStone INTEGER DEFAULT 0,
            aroma INTEGER DEFAULT 0,
            cupping INTEGER DEFAULT 0,
            tigerBalm INTEGER DEFAULT 0,
            deepTissue INTEGER DEFAULT 0,
            guaSha INTEGER DEFAULT 0,
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
            // Add addon columns if they don't exist
            db.run(`ALTER TABLE bookings ADD COLUMN hotStone INTEGER DEFAULT 0`, (err) => {
                if (err && !err.message.includes('duplicate column name')) {
                    console.error('Error adding hotStone column:', err);
                } else if (!err) {
                    console.log('Added hotStone column to existing table');
                }
            });
            db.run(`ALTER TABLE bookings ADD COLUMN aroma INTEGER DEFAULT 0`, (err) => {
                if (err && !err.message.includes('duplicate column name')) {
                    console.error('Error adding aroma column:', err);
                } else if (!err) {
                    console.log('Added aroma column to existing table');
                }
            });
            db.run(`ALTER TABLE bookings ADD COLUMN cupping INTEGER DEFAULT 0`, (err) => {
                if (err && !err.message.includes('duplicate column name')) {
                    console.error('Error adding cupping column:', err);
                } else if (!err) {
                    console.log('Added cupping column to existing table');
                }
            });
            db.run(`ALTER TABLE bookings ADD COLUMN tigerBalm INTEGER DEFAULT 0`, (err) => {
                if (err && !err.message.includes('duplicate column name')) {
                    console.error('Error adding tigerBalm column:', err);
                } else if (!err) {
                    console.log('Added tigerBalm column to existing table');
                }
            });
            db.run(`ALTER TABLE bookings ADD COLUMN deepTissue INTEGER DEFAULT 0`, (err) => {
                if (err && !err.message.includes('duplicate column name')) {
                    console.error('Error adding deepTissue column:', err);
                } else if (!err) {
                    console.log('Added deepTissue column to existing table');
                }
            });
            db.run(`ALTER TABLE bookings ADD COLUMN guaSha INTEGER DEFAULT 0`, (err) => {
                if (err && !err.message.includes('duplicate column name')) {
                    console.error('Error adding guaSha column:', err);
                } else if (!err) {
                    console.log('Added guaSha column to existing table');
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

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating users table:', err);
        } else {
            console.log('Users table ready');
            // Create default admin user if no users exist
            db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
                if (!err && row.count === 0) {
                    const hashedPassword = bcrypt.hashSync('admin123', 10);
                    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
                        ['admin', hashedPassword, 'admin'], (err) => {
                        if (!err) {
                            console.log('Default admin user created: username=admin, password=admin123');
                        }
                    });
                }
            });
        }
    });
}

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session.userId) {
        return next();
    } else {
        return res.status(401).json({ error: 'Authentication required' });
    }
}

// Authentication routes
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.role = user.role;

        res.json({ success: true, message: 'Login successful', user: { username: user.username, role: user.role } });
    });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logout successful' });
    });
});

app.get('/api/check-auth', (req, res) => {
    if (req.session.userId) {
        res.json({ authenticated: true, user: { username: req.session.username, role: req.session.role } });
    } else {
        res.json({ authenticated: false });
    }
});

// API Routes

// Save a new booking
app.post('/api/bookings', requireAuth, (req, res) => {
    const { appointmentDate, appointmentTime, therapyDuration, endTime, customerName, phone, insurance, therapist, treatment, totalPrice, insuranceClaim, gapPayment, paymentMethod, hotStone, aroma, cupping, tigerBalm, deepTissue, guaSha } = req.body;

    // Validate required fields
    if (!appointmentDate || !appointmentTime || !customerName || !phone || !therapist || !treatment) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const stmt = db.prepare(`
        INSERT INTO bookings (appointmentDate, appointmentTime, therapyDuration, endTime, customerName, phone, insurance, therapist, treatment, hotStone, aroma, cupping, tigerBalm, deepTissue, guaSha, totalPrice, insuranceClaim, gapPayment, paymentMethod)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
        appointmentDate,
        appointmentTime,
        therapyDuration || null,
        endTime || null,
        customerName,
        phone,
        insurance || null,
        therapist,
        treatment,
        hotStone ? 1 : 0,
        aroma ? 1 : 0,
        cupping ? 1 : 0,
        tigerBalm ? 1 : 0,
        deepTissue ? 1 : 0,
        guaSha ? 1 : 0,
        totalPrice || 0,
        insuranceClaim || 0,
        gapPayment || 0,
        paymentMethod || 'cash'
    ], function(err) {
        if (err) {
            console.error('Error inserting booking:', err);
            return res.status(500).json({ error: 'Failed to save booking' });
        }
        res.json({ success: true, bookingId: this.lastID, message: 'Booking saved successfully' });
    });
});

// Get all bookings
app.get('/api/bookings', requireAuth, (req, res) => {
    db.all('SELECT * FROM bookings ORDER BY appointmentDate DESC, appointmentTime DESC', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch bookings' });
        }
        res.json(rows);
    });
});

// Get booking by id
app.get('/api/bookings/id/:id', requireAuth, (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM bookings WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch booking' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json(row);
    });
});

// Get bookings for a specific date
app.get('/api/bookings/:date', requireAuth, (req, res) => {
    const date = req.params.date;
    db.all('SELECT * FROM bookings WHERE appointmentDate = ? ORDER BY appointmentTime', [date], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch bookings' });
        }
        res.json(rows);
    });
});

// Get all customers
app.get('/api/customers', requireAuth, (req, res) => {
    db.all('SELECT * FROM customers ORDER BY name', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch customers' });
        }
        res.json(rows);
    });
});

// Get customer bookings by name
app.get('/api/customer/:name', requireAuth, (req, res) => {
    const name = req.params.name;
    db.all('SELECT * FROM bookings WHERE customerName = ? ORDER BY appointmentDate DESC', [name], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch customer bookings' });
        }
        res.json(rows);
    });
});

// Update a booking
app.put('/api/bookings/:id', requireAuth, (req, res) => {
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
        hotStone,
        aroma,
        cupping,
        tigerBalm,
        deepTissue,
        guaSha,
        totalPrice,
        insuranceClaim,
        gapPayment,
        paymentMethod
    } = req.body;

    if (!customerName || !phone || !appointmentDate || !appointmentTime || !therapist || !treatment) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate gap payment server-side to ensure accuracy
    const calculatedGapPayment = (totalPrice || 0) - (insuranceClaim || 0);

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
            hotStone = ?,
            aroma = ?,
            cupping = ?,
            tigerBalm = ?,
            deepTissue = ?,
            guaSha = ?,
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
            hotStone ? 1 : 0,
            aroma ? 1 : 0,
            cupping ? 1 : 0,
            tigerBalm ? 1 : 0,
            deepTissue ? 1 : 0,
            guaSha ? 1 : 0,
            totalPrice || 0,
            insuranceClaim || 0,
            calculatedGapPayment,
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
app.delete('/api/bookings/:id', requireAuth, (req, res) => {
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
