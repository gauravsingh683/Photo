import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { captureDSLRPhoto } from './camera';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'photobooth_saas',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Setup DB Schema on boot
async function initDb() {
  try {
    // We will create the database if it doesn't exist
    const setupPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
    });
    await setupPool.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'photobooth_saas'}\``);
    await setupPool.end();
    
    // Now create tables in the actual DB
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        companyId VARCHAR(36),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Licenses (
        hardwareId VARCHAR(255) PRIMARY KEY,
        shortCode VARCHAR(10),
        validated BOOLEAN DEFAULT FALSE,
        selfieCount INT DEFAULT 0,
        validatedAt TIMESTAMP NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Analytics (
        id VARCHAR(255) PRIMARY KEY,
        printed BOOLEAN DEFAULT FALSE,
        whatsapp BOOLEAN DEFAULT FALSE,
        qr BOOLEAN DEFAULT FALSE,
        eventId VARCHAR(255) DEFAULT 'global_default',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database schema initialized');
  } catch (error: any) {
    console.error('Failed to initialize database schema:', error.message);
  }
}
initDb();

app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

app.post('/api/log', (req, res) => {
  const { message, level } = req.body;
  console.log(`[KIOSK LOG] [${level || 'INFO'}] ${message}`);
  
  try {
    const logFile = path.resolve(__dirname, '../shared/kiosk-debug.log');
    const entry = `[${new Date().toISOString()}] [${level || 'INFO'}] ${message}\n`;
    fs.appendFileSync(logFile, entry);
  } catch (e) {
    console.error("Failed to write to kiosk log file:", e);
  }
  
  res.json({ success: true });
});

// Hardware API Endpoints
app.post('/api/hardware/capture', async (req, res) => {
  try {
    const uploadDir = path.resolve(__dirname, '../shared/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Trigger the actual DSLR hardware via the camera module
    const filename = await captureDSLRPhoto(uploadDir);
    
    res.json({
      success: true,
      filename: filename,
      url: `/uploads/${filename}`,
      message: 'Hardware capture successful'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});




// ----------------------------------------------------
// WHATSAPP META CLOUD API INTEGRATION
// ----------------------------------------------------
const otpStore = new Map<string, { otp: string, expires: number }>();

function getWhatsappSettings() {
  try {
    const settingsPath = path.resolve(__dirname, '../shared/settings.json');
    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
      return settings.whatsapp;
    }
  } catch (e) {
    console.error("Error reading settings.json", e);
  }
  return null;
}

app.post('/api/whatsapp/otp-request', async (req, res) => {
  try {
    const { phone } = req.body; // e.g. "919999999999"
    const settings = getWhatsappSettings();
    
    if (!settings || !settings.apiUrl || !settings.apiKey) {
      return res.status(500).json({ success: false, error: 'WhatsApp API not configured in Admin Panel.' });
    }

    // Generate random 4 digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    otpStore.set(phone, { otp, expires: Date.now() + 5 * 60 * 1000 });

    // Send via Meta Cloud API
    const response = await fetch(settings.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: {
          body: `Your Photo Booth verification code is: ${otp}. It will expire in 5 minutes.`
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Meta API Error:", data);
      return res.status(500).json({ success: false, error: 'Failed to send OTP via WhatsApp' });
    }

    res.json({ success: true, message: 'OTP Sent' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/whatsapp/otp-verify', (req, res) => {
  const { phone, otp } = req.body;
  const record = otpStore.get(phone);
  
  if (!record) {
    return res.status(400).json({ success: false, error: 'No OTP requested for this number.' });
  }
  
  if (Date.now() > record.expires) {
    otpStore.delete(phone);
    return res.status(400).json({ success: false, error: 'OTP expired.' });
  }
  
  if (record.otp !== otp) {
    return res.status(400).json({ success: false, error: 'Invalid OTP.' });
  }
  
  // Clean up on success
  otpStore.delete(phone);
  res.json({ success: true });
});

app.post('/api/whatsapp/send-image', async (req, res) => {
  try {
    const { phone, imageSrc } = req.body; 
    const settings = getWhatsappSettings();
    
    if (!settings || !settings.apiUrl || !settings.apiKey || !settings.senderNumber) {
      return res.status(500).json({ success: false, error: 'WhatsApp API not configured.' });
    }

    // imageSrc is likely a blob URL or base64 from the frontend canvas.
    // In our booth app, the final screenshot was sent as base64 or a blob. 
    // Wait, the frontend sends it as `imageSrc`. Let's check what that is...
    // Actually, if it's base64, we need to save it to disk or upload it directly to Meta Media API!
    
    const base64Data = imageSrc.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    // 1. Upload to Meta Media API (Direct Binary Upload)
    // The Media API URL is usually https://graph.facebook.com/v20.0/<PHONE_NUMBER_ID>/media
    const mediaUrl = `https://graph.facebook.com/v20.0/${settings.senderNumber}/media`;
    
    const formData = new FormData();
    formData.append('messaging_product', 'whatsapp');
    formData.append('file', new Blob([buffer], { type: 'image/jpeg' }), 'photo.jpg');
    
    const mediaRes = await fetch(mediaUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.apiKey}`
      },
      body: formData as any
    });
    
    const mediaData = await mediaRes.json();
    if (!mediaRes.ok) {
      console.error("Meta Media Upload Error:", mediaData);
      return res.status(500).json({ success: false, error: 'Failed to upload media to WhatsApp.' });
    }

    const mediaId = mediaData.id;

    // 2. Send the Message with the Media ID
    const msgRes = await fetch(settings.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'image',
        image: {
          id: mediaId
        }
      })
    });
    
    const msgData = await msgRes.json();
    if (!msgRes.ok) {
      console.error("Meta Message Error:", msgData);
      return res.status(500).json({ success: false, error: 'Failed to send image message.' });
    }

    res.json({ success: true, message: 'Image sent successfully!' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// ----------------------------------------------------
// QR CODE & UPLOAD INTEGRATION
// ----------------------------------------------------
// Serve the static uploads directory so images can be downloaded
app.use('/uploads', express.static(path.resolve(__dirname, '../shared/uploads')));

// The endpoint to receive the base64 image from the frontend
app.post('/api/upload', async (req, res) => {
  try {
    const { image, host } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: 'No image provided' });
    }

    const base64Data = image.replace(/^data:image\/(png|jpeg);base64,/, "");
    const id = 'photo_' + Date.now() + '.jpg';
    
    const uploadDir = path.resolve(__dirname, '../shared/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(uploadDir, id), base64Data, 'base64');

    // Save analytics to MySQL
    const activeEventId = 'global_default'; // Assuming global for now, you can extend this
    try {
      await pool.query(
        'INSERT INTO Analytics (id, eventId) VALUES (?, ?)',
        [id, activeEventId]
      );
    } catch (e) {
      console.error("Failed to insert analytics record", e);
    }

    // Get Local IP to replace localhost (since phones cannot scan localhost)
    let finalHost = host;
    const os = require('os');
    const interfaces = os.networkInterfaces();
    let localIp = 'localhost';
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if (iface.family === 'IPv4' && !iface.internal) {
          localIp = iface.address;
        }
      }
    }

    if (!finalHost || finalHost.includes('localhost') || finalHost.includes('127.0.0.1')) {
      // If the frontend sent localhost (because the user opened the app on their PC via localhost),
      // we MUST replace it with the physical IP address so the phone can reach it.
      if (finalHost) {
        finalHost = finalHost.replace(/localhost|127\.0\.0\.1/, localIp);
      } else {
        finalHost = `http://${localIp}:5173`; 
      }
    }

    const url = `${finalHost}/view/${id}`;
    res.json({ success: true, url });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to upload' });
  }
});

// The endpoint to serve the HTML download page for mobile phones
app.get('/view/:id', (req, res) => {
  const id = req.params.id;
  if (!id || id.trim() === '') {
    return res.status(404).send("Not found");
  }
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Your Photo Strip</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; background: #f8fafc; margin: 0; padding: 30px 20px; color: #1e293b; }
        h2 { margin-bottom: 20px; font-weight: 700; color: #0f172a; }
        .img-container { max-width: 100%; margin: 0 auto 30px auto; }
        img { max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        a.download { display: inline-flex; align-items: center; justify-content: center; padding: 16px 32px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 1.1rem; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3); transition: transform 0.2s; }
        a.download:active { transform: scale(0.98); }
      </style>
    </head>
    <body>
      <h2>Here is your photo!</h2>
      <div class="img-container">
        <img src="/uploads/${id}" alt="Your Photo Strip" />
      </div>
      <a class="download" href="/uploads/${id}" download="My_Photo_Strip.jpg">
        <svg style="margin-right: 8px;" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        Download Photo
      </a>
    </body>
    </html>
  `;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// ----------------------------------------------------
// HARDWARE LICENSING ENDPOINTS
// ----------------------------------------------------

app.post('/api/license/register', async (req, res) => {
  const { hardwareId, shortCode } = req.body;
  if (!hardwareId || !shortCode) return res.status(400).json({ success: false });
  
  try {
    await pool.query(
      `INSERT INTO Licenses (hardwareId, shortCode) VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE shortCode = ?`,
      [hardwareId, shortCode, shortCode]
    );
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

app.get('/api/license/status', async (req, res) => {
  const hardwareId = req.query.hardwareId as string;
  if (!hardwareId) return res.status(400).json({ success: false, error: 'hardwareId required' });

  try {
    const [rows]: any = await pool.query('SELECT validated, selfieCount, selectedPrinter FROM Licenses WHERE hardwareId = ?', [hardwareId]);
    if (rows.length > 0) {
      res.json({ 
        machineCode: hardwareId, 
        isLicensed: !!rows[0].validated, 
        selfieCount: rows[0].selfieCount,
        selectedPrinter: rows[0].selectedPrinter || ''
      });
    } else {
      res.json({ machineCode: hardwareId, isLicensed: false, selfieCount: 0, selectedPrinter: '' });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ machineCode: hardwareId, isLicensed: false, selfieCount: 0, selectedPrinter: '' });
  }
});

app.post('/api/license/printers', async (req, res) => {
  const { hardwareId, printers } = req.body;
  if (!hardwareId) return res.status(400).json({ success: false, error: 'hardwareId required' });
  
  try {
    const printersJson = JSON.stringify(printers || []);
    await pool.query('UPDATE Licenses SET printers = ? WHERE hardwareId = ?', [printersJson, hardwareId]);
    res.json({ success: true });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/license/select-printer', async (req, res) => {
  const { hardwareId, printer } = req.body;
  if (!hardwareId) return res.status(400).json({ success: false, error: 'hardwareId required' });
  
  try {
    await pool.query('UPDATE Licenses SET selectedPrinter = ? WHERE hardwareId = ?', [printer, hardwareId]);
    res.json({ success: true });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/license/increment', async (req, res) => {
  const { hardwareId } = req.body;
  if (!hardwareId) return res.status(400).json({ success: false });
  
  try {
    await pool.query('UPDATE Licenses SET selfieCount = selfieCount + 1 WHERE hardwareId = ?', [hardwareId]);
    const [rows]: any = await pool.query('SELECT selfieCount FROM Licenses WHERE hardwareId = ?', [hardwareId]);
    res.json({ success: true, selfieCount: rows.length > 0 ? rows[0].selfieCount : 0 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

app.post('/api/license/validate', async (req, res) => {
  const { code } = req.body; // 6-digit shortCode
  if (!code) return res.status(400).json({ success: false });
  
  try {
    const [rows]: any = await pool.query('SELECT hardwareId FROM Licenses WHERE shortCode = ?', [code]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Code not found or expired' });
    }

    const hardwareId = rows[0].hardwareId;
    await pool.query('UPDATE Licenses SET validated = true, validatedAt = CURRENT_TIMESTAMP WHERE hardwareId = ?', [hardwareId]);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

app.get('/api/licenses', async (req, res) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM Licenses');
    
    // Convert to the exact dictionary format expected by the frontend:
    const formatted: any = {};
    for (const row of rows) {
      formatted[row.hardwareId] = {
        validated: !!row.validated,
        validatedAt: row.validatedAt ? new Date(row.validatedAt).getTime() : null,
        shortCode: row.shortCode,
        selfieCount: row.selfieCount,
        printers: row.printers ? JSON.parse(row.printers) : [],
        selectedPrinter: row.selectedPrinter || ''
      };
    }
    res.json(formatted);
  } catch(e) {
    console.error(e);
    res.json({});
  }
});

// --- ADMIN & MANAGEMENT ROUTES ---

// 1. /api/frames (GET & POST)
app.get('/api/frames', (req, res) => {
  const dbPath = path.resolve(__dirname, '../shared/frames.json');
  if (fs.existsSync(dbPath)) {
    res.setHeader('Content-Type', 'application/json');
    res.send(fs.readFileSync(dbPath));
  } else {
    res.json([]);
  }
});

app.post('/api/frames', (req, res) => {
  const dbPath = path.resolve(__dirname, '../shared/frames.json');
  try {
    fs.writeFileSync(dbPath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 2. /api/settings (GET & POST)
app.get('/api/settings', (req, res) => {
  const settingsPath = path.resolve(__dirname, '../shared/settings.json');
  if (fs.existsSync(settingsPath)) {
    res.setHeader('Content-Type', 'application/json');
    res.send(fs.readFileSync(settingsPath));
  } else {
    res.json({ printSize: '4x6' });
  }
});

app.post('/api/settings', (req, res) => {
  const settingsPath = path.resolve(__dirname, '../shared/settings.json');
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 3. /api/events (GET & POST)
app.get('/api/events', (req, res) => {
  const eventsPath = path.resolve(__dirname, '../shared/events.json');
  if (fs.existsSync(eventsPath)) {
    res.setHeader('Content-Type', 'application/json');
    res.send(fs.readFileSync(eventsPath));
  } else {
    res.json([]);
  }
});

app.post('/api/events', (req, res) => {
  const eventsPath = path.resolve(__dirname, '../shared/events.json');
  try {
    fs.writeFileSync(eventsPath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 4. /api/captures (GET)
app.get('/api/captures', async (req, res) => {
  try {
    const uploadDir = path.resolve(__dirname, '../shared/uploads');
    if (!fs.existsSync(uploadDir)) {
      return res.json([]);
    }
    
    const files = fs.readdirSync(uploadDir);
    let retentionDays = 0;
    try {
      const settingsPath = path.resolve(__dirname, '../shared/settings.json');
      if (fs.existsSync(settingsPath)) {
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        retentionDays = settings.retentionDays || 0;
      }
    } catch (e) {}

    const now = Date.now();
    const msInDay = 24 * 60 * 60 * 1000;
    
    let captureFiles = [];
    for (const f of files) {
      if (f.startsWith('photo_') || f.startsWith('capture_')) {
        const filePath = path.join(uploadDir, f);
        const stat = fs.statSync(filePath);
        
        if (retentionDays > 0) {
          const ageDays = (now - stat.mtimeMs) / msInDay;
          if (ageDays > retentionDays) {
            try {
              fs.unlinkSync(filePath);
              continue;
            } catch (e) {
              console.error('Failed to delete old capture:', e);
            }
          }
        }
        captureFiles.push({ f, stat });
      }
    }
    
    // Get analytics records from MySQL
    const [dbRows]: any = await pool.query('SELECT * FROM Analytics');
    const analyticsMap: any = {};
    for (const row of dbRows) {
      analyticsMap[row.id] = {
        printed: !!row.printed,
        whatsapp: !!row.whatsapp,
        qr: !!row.qr,
        eventId: row.eventId
      };
    }
    
    const captures = captureFiles.map(({ f, stat }) => {
      const metrics = analyticsMap[f] || { printed: false, whatsapp: false, qr: false, eventId: 'global_default' };
      return {
        id: f,
        url: `/uploads/${f}`,
        timestamp: stat.mtimeMs,
        ...metrics
      };
    }).sort((a, b) => b.timestamp - a.timestamp);
    
    res.json(captures);
  } catch (e: any) {
    res.status(500).json({ error: 'Failed to read captures' });
  }
});

// 5. /api/analytics/track (POST)
app.post('/api/analytics/track', async (req, res) => {
  try {
    const { id, metric } = req.body; // metric: 'printed', 'whatsapp', 'qr'
    if (!id || !metric) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const allowedMetrics = ['printed', 'whatsapp', 'qr'];
    if (!allowedMetrics.includes(metric)) {
      return res.status(400).json({ error: 'Invalid metric' });
    }

    const [rows]: any = await pool.query('SELECT id FROM Analytics WHERE id = ?', [id]);
    if (rows.length === 0) {
      const eventsPath = path.resolve(__dirname, '../shared/events.json');
      let activeEventId = 'global_default';
      if (fs.existsSync(eventsPath)) {
        try {
          const events = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));
          const active = events.find((e: any) => e.isActive);
          if (active) activeEventId = active.id;
        } catch(e){}
      }
      await pool.query(
        `INSERT INTO Analytics (id, eventId, \`${metric}\`) VALUES (?, ?, true)`,
        [id, activeEventId]
      );
    } else {
      await pool.query(
        `UPDATE Analytics SET \`${metric}\` = true WHERE id = ?`,
        [id]
      );
    }
    res.json({ success: true });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'Failed to track analytics' });
  }
});

// 6. /api/auth/register (POST)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Missing credentials' });
    }

    const usersPath = path.resolve(__dirname, '../shared/users.json');
    const users = fs.existsSync(usersPath) ? JSON.parse(fs.readFileSync(usersPath, 'utf-8')) : [];
    if (users.find((u: any) => u.username === username)) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }
    users.push({ username, password });
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 7. /api/auth/login (POST)
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const usersPath = path.resolve(__dirname, '../shared/users.json');
  const users = fs.existsSync(usersPath) ? JSON.parse(fs.readFileSync(usersPath, 'utf-8')) : [];
  const user = users.find((u: any) => u.username === username && u.password === password);
  if (user) {
    res.json({ success: true, token: 'mock-jwt-token' });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

// 8. /api/auth/forgot-password (POST)
app.post('/api/auth/forgot-password', (req, res) => {
  res.json({ success: true, message: 'Password reset link sent' });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
