const db = require('./db');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  db.serialize(() => {
    console.log('Seeding initial data...');

    // 1. Police Users & Profiles
    const policeList = [
      ['Vikram Deshmukh', 'vikram.d@police.gov.in', '+919820112233', 'MH-KLY-901', 'Senior Police Inspector (Sr. PI)', 'Kalyan Central Police Station', 6],
      ['Anjali Shinde', 'anjali.s@police.gov.in', '+919820223344', 'MH-KLY-902', 'Assistant Police Inspector (API)', 'Cyber & Women Safety Cell, Kalyan', 5],
      ['Rajesh Pawar', 'rajesh.p@police.gov.in', '+919820334455', 'MH-THN-804', 'Police Sub-Inspector (PSI)', 'Crime Detection Unit, Thane Div', 5],
      ['Sunil Gaikwad', 'sunil.g@police.gov.in', '+919820445566', 'MH-KLY-910', 'Head Constable', 'Patrolling Division - Sector 4', 5],
      ['Meera Kadam', 'meera.k@police.gov.in', '+919820556677', 'MH-MUM-702', 'Police Sub-Inspector (PSI)', 'Special Anti-Theft Squad', 4]
    ];

    const userStmt = db.prepare(`INSERT OR IGNORE INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, 'Police')`);
    const officerStmt = db.prepare(`INSERT OR IGNORE INTO police_officers (user_id, badge_number, full_name, rank, station_division, contact_phone, duty_status, cases_assigned_count) VALUES (?, ?, ?, ?, ?, ?, 'Active', ?)`);

    policeList.forEach((p, idx) => {
      userStmt.run([p[0], p[1], p[2], defaultPasswordHash]);
      officerStmt.run([idx + 1, p[3], p[0], p[4], p[5], p[2], p[6]]);
    });

    userStmt.finalize();
    officerStmt.finalize();

    // 2. Citizens
    const citizens = [
      ['Amit Sharma', 'amit.s@gmail.com', '+919811001101', 'Kavita Sharma', '+919811001199'],
      ['Pooja Verma', 'pooja.v@gmail.com', '+919811001102', 'Suresh Verma', '+919811001198'],
      ['Siddharth Roy', 'sid.roy@yahoo.com', '+919811001103', 'Ananya Roy', '+919811001197'],
      ['Sneha Joshi', 'sneha.j@gmail.com', '+919811001104', 'Pradeep Joshi', '+919811001196'],
      ['Rohan Mehta', 'rohan.m@rediffmail.com', '+919811001105', 'Deepak Mehta', '+919811001195']
    ];

    const citizenStmt = db.prepare(`INSERT OR IGNORE INTO users (name, email, phone, password_hash, role, emergency_contact_name, emergency_contact_phone) VALUES (?, ?, ?, ?, 'Citizen', ?, ?)`);
    citizens.forEach((c) => {
      citizenStmt.run([c[0], c[1], c[2], defaultPasswordHash, c[3], c[4]]);
    });
    citizenStmt.finalize();

    // 3. 25 Crime Reports Generated Dynamically
    const categories = ['Theft', 'Physical Assault', 'Cybercrime', 'Women Harassment', 'Burglary'];
    const locations = ['Kalyan Station West', 'Shivaji Chowk', 'Khadakpada Circle', 'Godrej Hill', 'Bail Bazar'];
    const statuses = ['Submitted', 'Police Assigned', 'Under Investigation', 'Evidence Verified', 'Case Closed'];

    const reportStmt = db.prepare(`INSERT OR IGNORE INTO crime_reports (tracking_code, citizen_id, category, description, location_address, latitude, longitude, evidence_type, evidence_url, status, assigned_officer_id, sos_flag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    for (let i = 1; i <= 25; i++) {
      const code = `CR-2026-${1000 + i}`;
      const citizenId = 6 + (i % 5);
      const category = categories[i % categories.length];
      const loc = locations[i % locations.length];
      const status = statuses[i % statuses.length];
      const officerId = 1 + (i % 5);
      const isSos = i % 6 === 0 ? 1 : 0;

      reportStmt.run([
        code,
        citizenId,
        category,
        `Incident reported regarding ${category.toLowerCase()} near ${loc}. Evidence logged.`,
        loc,
        19.2437 + (i * 0.001),
        73.1355 + (i * 0.001),
        'Photo',
        `/uploads/evidence/case_${i}.jpg`,
        status,
        officerId,
        isSos
      ]);
    }
    reportStmt.finalize();

    console.log(' SQLite Database successfully seeded with Police Profiles and 25 Crime Reports!');
  });
}

seedDatabase();