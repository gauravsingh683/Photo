import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const apiPlugin = () => ({
  name: 'api-plugin',
  configureServer(server: any) {
    server.middlewares.use('/api/frames', (req: any, res: any, next: any) => {
      const dbPath = path.resolve(__dirname, '../shared/frames.json');
      
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
      }
      
      if (req.method === 'GET') {
        if (fs.existsSync(dbPath)) {
          res.setHeader('Content-Type', 'application/json');
          res.end(fs.readFileSync(dbPath));
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify([]));
        }
      } else if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: Buffer) => {
          body += chunk.toString();
        });
        req.on('end', () => {
          fs.writeFileSync(dbPath, body);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
        });
      } else {
        next();
      }
    });

    server.middlewares.use('/api/settings', (req: any, res: any, next: any) => {
      const settingsPath = path.resolve(__dirname, '../shared/settings.json');
      
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
      }
      
      if (req.method === 'GET') {
        if (fs.existsSync(settingsPath)) {
          res.setHeader('Content-Type', 'application/json');
          res.end(fs.readFileSync(settingsPath));
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ printSize: '4x6' }));
        }
      } else if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: Buffer) => {
          body += chunk.toString();
        });
        req.on('end', () => {
          fs.writeFileSync(settingsPath, body);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
        });
      } else {
        next();
      }
    });

    server.middlewares.use('/api/events', (req: any, res: any, next: any) => {
      const eventsPath = path.resolve(__dirname, '../shared/events.json');
      
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
      }
      
      if (req.method === 'GET') {
        if (fs.existsSync(eventsPath)) {
          res.setHeader('Content-Type', 'application/json');
          res.end(fs.readFileSync(eventsPath));
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify([]));
        }
      } else if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', () => {
          fs.writeFileSync(eventsPath, body);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
        });
      } else {
        next();
      }
    });

    server.middlewares.use('/api/captures', (req: any, res: any, next: any) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
      }

      if (req.method === 'GET') {
        try {
          const uploadDir = path.resolve(__dirname, '../shared/uploads');
          if (!fs.existsSync(uploadDir)) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify([]));
            return;
          }
          
          const files = fs.readdirSync(uploadDir);
          
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
                    continue; // Skip adding to the list
                  } catch (e) {
                    console.error('Failed to delete old capture:', e);
                  }
                }
              }
              captureFiles.push({ f, stat });
            }
          }
          
          const analyticsPath = path.resolve(__dirname, '../shared/analytics.json');
          const analytics = fs.existsSync(analyticsPath) ? JSON.parse(fs.readFileSync(analyticsPath, 'utf-8')) : {};
          
          const captures = captureFiles.map(({ f, stat }) => {
            const metrics = analytics[f] || { printed: false, whatsapp: false, qr: false };
            return {
              id: f,
              url: `/uploads/${f}`,
              timestamp: stat.mtimeMs,
              ...metrics
            };
          }).sort((a, b) => b.timestamp - a.timestamp);
          
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(captures));
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Failed to read captures' }));
        }
      } else {
        next();
      }
    });
    
    server.middlewares.use('/api/analytics/track', (req: any, res: any, next: any) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
      }

      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const { id, metric } = JSON.parse(body); // metric: 'printed', 'whatsapp', 'qr'
            const analyticsPath = path.resolve(__dirname, '../shared/analytics.json');
            const analytics = fs.existsSync(analyticsPath) ? JSON.parse(fs.readFileSync(analyticsPath, 'utf-8')) : {};
            
            if (!analytics[id]) {
              analytics[id] = { printed: false, whatsapp: false, qr: false };
            }
            if (!analytics[id].eventId) {
              const eventsPath = path.resolve(__dirname, '../shared/events.json');
              let activeEventId = 'global_default';
              if (fs.existsSync(eventsPath)) {
                try {
                  const events = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));
                  const active = events.find((e: any) => e.isActive);
                  if (active) activeEventId = active.id;
                } catch(e){}
              }
              analytics[id].eventId = activeEventId;
            }
            
            analytics[id][metric] = true;
            
            fs.writeFileSync(analyticsPath, JSON.stringify(analytics, null, 2));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to track analytics' }));
          }
        });
      } else {
        next();
      }
    });
    
    server.middlewares.use('/api/auth/register', (req: any, res: any, next: any) => {
      const usersPath = path.resolve(__dirname, '../shared/users.json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', () => {
          const data = JSON.parse(body);
          const users = fs.existsSync(usersPath) ? JSON.parse(fs.readFileSync(usersPath, 'utf-8')) : [];
          if (users.find((u: any) => u.username === data.username)) {
            res.statusCode = 400;
            res.end(JSON.stringify({ success: false, error: 'User already exists' }));
            return;
          }
          users.push({ username: data.username, password: data.password }); // plain text for mockup DB
          fs.writeFileSync(usersPath, JSON.stringify(users));
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
        });
      } else { next(); }
    });

    server.middlewares.use('/api/auth/login', (req: any, res: any, next: any) => {
      const usersPath = path.resolve(__dirname, '../shared/users.json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', () => {
          const data = JSON.parse(body);
          const users = fs.existsSync(usersPath) ? JSON.parse(fs.readFileSync(usersPath, 'utf-8')) : [];
          const user = users.find((u: any) => u.username === data.username && u.password === data.password);
          res.setHeader('Content-Type', 'application/json');
          if (user) {
            res.end(JSON.stringify({ success: true, token: 'mock-jwt-token' }));
          } else {
            res.statusCode = 401;
            res.end(JSON.stringify({ success: false, error: 'Invalid credentials' }));
          }
        });
      } else { next(); }
    });

    server.middlewares.use('/api/auth/forgot-password', (req: any, res: any, next: any) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
      if (req.method === 'POST') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, message: 'Password reset link sent' }));
      } else { next(); }
    });

    

    

    
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiPlugin()],
  base: '/admin/',
  server: {
    port: 5174,
    strictPort: true
  }
})
