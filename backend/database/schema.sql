-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('Citizen', 'Police', 'Admin')) DEFAULT 'Citizen',
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Police Officers Table
CREATE TABLE IF NOT EXISTS police_officers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    badge_number TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    rank TEXT NOT NULL,
    station_division TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    duty_status TEXT CHECK(duty_status IN ('Active', 'On-Leave', 'Emergency-Dispatched')) DEFAULT 'Active',
    cases_assigned_count INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Crime Reports / FIR Table
CREATE TABLE IF NOT EXISTS crime_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tracking_code TEXT UNIQUE NOT NULL,
    citizen_id INTEGER NOT NULL,
    category TEXT CHECK(category IN ('Theft', 'Physical Assault', 'Cybercrime', 'Women Harassment', 'Burglary', 'Vehicle Theft', 'Fraud', 'Vandalism')),
    description TEXT NOT NULL,
    location_address TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    evidence_type TEXT CHECK(evidence_type IN ('Photo', 'Video', 'Document', 'Multiple')),
    evidence_url TEXT,
    status TEXT CHECK(status IN ('Submitted', 'Police Assigned', 'Under Investigation', 'Evidence Verified', 'Case Closed')) DEFAULT 'Submitted',
    assigned_officer_id INTEGER,
    sos_flag INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (citizen_id) REFERENCES users(id),
    FOREIGN KEY (assigned_officer_id) REFERENCES police_officers(id)
);

-- 4. Notification & SOS Logs Table
CREATE TABLE IF NOT EXISTS notification_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient_type TEXT CHECK(recipient_type IN ('Citizen', 'Police', 'EmergencyContact')),
    recipient_target TEXT NOT NULL,
    channel TEXT CHECK(channel IN ('EMAIL', 'SMS')),
    event_type TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'SENT',
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
);