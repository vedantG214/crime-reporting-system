const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database/db');
const { sendEmailNotification, sendSMSNotification } = require('./services/notify.service');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'crimeguard_secure_token_key_2026';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 1. Register API
app.post('/api/auth/register', async (req, res) => {
  const { name, email, phone, password, role, emergency_contact_name, emergency_contact_phone } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    db.run(
      `INSERT INTO users (name, email, phone, password_hash, role, emergency_contact_name, emergency_contact_phone) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone, hash, role || 'Citizen', emergency_contact_name || '', emergency_contact_phone || ''],
      function (err) {
        if (err) return res.status(400).json({ error: 'Email already exists or invalid details.' });
        
        sendEmailNotification(email, 'Welcome to CrimeGuard', `Hello ${name}, your CrimeGuard account is active.`);
        sendSMSNotification(phone, `CrimeGuard: Registration successful. Keep your password safe.`);
        
        res.status(201).json({ message: 'Registration successful', userId: this.lastID });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. Login API
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'User not found.' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ error: 'Invalid password.' });

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });

    sendSMSNotification(user.phone, `CrimeGuard Alert: New login detected on your account.`);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emergency_contact_name: user.emergency_contact_name,
        emergency_contact_phone: user.emergency_contact_phone,
      },
    });
  });
});

// 3. Get All Reports (For Police & Viva Demo)
app.get('/api/reports', (req, res) => {
  db.all(
    `SELECT r.*, u.name as citizen_name, u.phone as citizen_phone, p.full_name as officer_name, p.badge_number 
     FROM crime_reports r 
     LEFT JOIN users u ON r.citizen_id = u.id 
     LEFT JOIN police_officers p ON r.assigned_officer_id = p.id 
     ORDER BY r.id DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// 4. Track FIR / Case by Code
app.get('/api/reports/track/:code', (req, res) => {
  db.get(
    `SELECT r.*, p.full_name as officer_name, p.contact_phone as officer_phone, p.station_division 
     FROM crime_reports r 
     LEFT JOIN police_officers p ON r.assigned_officer_id = p.id 
     WHERE r.tracking_code = ?`,
    [req.params.code],
    (err, row) => {
      if (err || !row) return res.status(404).json({ error: 'Invalid Tracking Code.' });
      res.json(row);
    }
  );
});

// 5. Submit New Crime Report
app.post('/api/reports', (req, res) => {
  const { citizen_id, category, description, location_address, latitude, longitude, evidence_type, evidence_url } = req.body;
  const tracking_code = `CR-2026-${Math.floor(10000 + Math.random() * 90000)}`;

  db.run(
    `INSERT INTO crime_reports (tracking_code, citizen_id, category, description, location_address, latitude, longitude, evidence_type, evidence_url, status, assigned_officer_id) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted', 1)`,
    [tracking_code, citizen_id, category, description, location_address, latitude || 19.2437, longitude || 73.1355, evidence_type || 'Photo', evidence_url || ''],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      db.get(`SELECT email, phone FROM users WHERE id = ?`, [citizen_id], (uErr, user) => {
        if (user) {
          sendEmailNotification(user.email, 'FIR Lodged Successfully', `Your report has been logged. Tracking ID: ${tracking_code}`);
          sendSMSNotification(user.phone, `CrimeGuard: Your FIR is logged with ID ${tracking_code}. Track status online.`);
        }
      });

      res.status(201).json({ message: 'Report submitted', tracking_code });
    }
  );
});

// 6. Instant SOS Alert Route
app.post('/api/sos', (req, res) => {
  const { citizen_id, latitude, longitude } = req.body;

  db.get(`SELECT name, phone, emergency_contact_name, emergency_contact_phone FROM users WHERE id = ?`, [citizen_id], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'User details not found' });

    const sosTracking = `CR-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const lat = latitude || 19.2437;
    const lng = longitude || 73.1355;

    db.run(
      `INSERT INTO crime_reports (tracking_code, citizen_id, category, description, location_address, latitude, longitude, evidence_type, status, assigned_officer_id, sos_flag) 
       VALUES (?, ?, 'Physical Assault', 'EMERGENCY SOS BUTTON ACTIVATED', 'Live Emergency Coordinates', ?, ?, 'Multiple', 'Police Assigned', 3, 1)`,
      [sosTracking, citizen_id, lat, lng]
    );

    sendSMSNotification(user.emergency_contact_phone || user.phone, `EMERGENCY ALERT: ${user.name} triggered SOS! Location: https://maps.google.com/?q=${lat},${lng}`);
    sendSMSNotification('+919820334455', `POLICE SOS ALERT: Immediate assistance required for ${user.name} at coordinates ${lat}, ${lng}`);

    res.json({ message: 'SOS Alert triggered successfully', tracking_code: sosTracking });
  });
});

app.listen(PORT, () => {
  console.log(` CrimeGuard Server running on http://localhost:${PORT}`);
});