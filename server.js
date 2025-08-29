const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 9000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for OTPs (use Redis or database in production)
const otpStore = new Map();

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other services like Outlook, Yahoo, etc.
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

// Generate OTP endpoint
app.post('/api/otp/generate', async (req, res) => {
  try {
    const { email, purpose = 'email-verification' } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }
    
    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiration
    
    // Store OTP with email
    otpStore.set(email, {
      otp,
      expiresAt,
      purpose,
      attempts: 0
    });
    
    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Your One-Time Password (OTP) for email verification is:</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; margin: 20px 0;">
            <h1 style="margin: 0; color: #333; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes. Please do not share it with anyone.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #888; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
        </div>
      `,
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    console.log(`OTP sent to ${email}: ${otp}`);
    
    res.json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: '10 minutes'
    });
    
  } catch (error) {
    console.error('Error generating OTP:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP' 
    });
  }
});

// Verify OTP endpoint
app.post('/api/otp/verify', (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and OTP are required' 
      });
    }
    
    const storedData = otpStore.get(email);
    
    if (!storedData) {
      return res.json({ 
        success: false, 
        message: 'No OTP found for this email. Please request a new OTP.' 
      });
    }
    
    // Check if expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.json({ 
        success: false, 
        message: 'OTP has expired. Please request a new OTP.' 
      });
    }
    
    // Check if OTP matches
    if (storedData.otp === otp) {
      otpStore.delete(email);
      return res.json({ 
        success: true, 
        message: 'Email verified successfully' 
      });
    } else {
      // Increment attempt counter
      storedData.attempts += 1;
      
      // Delete after too many attempts
      if (storedData.attempts >= 3) {
        otpStore.delete(email);
        return res.json({ 
          success: false, 
          message: 'Too many failed attempts. Please request a new OTP.' 
        });
      }
      
      return res.json({ 
        success: false, 
        message: 'Invalid OTP',
        attemptsLeft: 3 - storedData.attempts
      });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify OTP' 
    });
  }
});

// Check if OTP exists for email
app.get('/api/otp/status/:email', (req, res) => {
  try {
    const { email } = req.params;
    const storedData = otpStore.get(email);
    
    if (!storedData) {
      return res.json({ 
        exists: false, 
        message: 'No active OTP for this email' 
      });
    }
    
    const expiresIn = Math.round((storedData.expiresAt - Date.now()) / 1000 / 60);
    
    res.json({
      exists: true,
      expiresIn: `${expiresIn} minutes`,
      attempts: storedData.attempts
    });
  } catch (error) {
    console.error('Error checking OTP status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check OTP status' 
    });
  }
});

// Clean up expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  let deletedCount = 0;
  
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(email);
      deletedCount++;
    }
  }
  
  if (deletedCount > 0) {
    console.log(`Cleaned up ${deletedCount} expired OTPs`);
  }
}, 60 * 1000); // Run every minute

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  });
});

app.listen(port, () => {
  console.log(`OTP API server running on port ${port}`);
});