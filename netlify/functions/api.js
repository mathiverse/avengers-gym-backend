const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // We'll update this after deployment with specific domains
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Create reusable transporter
let transporter;

// Function to create Gmail transporter
function createGmailTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // App Password from Gmail
    }
  });
}

// Initialize email transporter
function initializeTransporter() {
  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = createGmailTransporter();
      console.log('Gmail transporter initialized');
    } else {
      console.error('Email credentials not found. Please set EMAIL_USER and EMAIL_PASS environment variables.');
    }
  } catch (error) {
    console.error('Error initializing transporter:', error);
  }
}

// Initialize transporter
initializeTransporter();

// Helper function to format package type
function formatPackageType(type) {
  const types = {
    'contest': 'Contest Preparation (₹6,000/month)',
    'personal': 'Personal Training (₹3,000/month)',
    'online': 'Online Coaching (₹3,000/month)',
    'normal': 'Normal Gym Fees (₹700/month)',
    'treadmill': 'Normal Fees + Treadmill (₹900/month)'
  };
  return types[type] || type;
}

// Helper function to format training focus
function formatTrainingFocus(type) {
  const types = {
    'weight-gain': 'Weight Gain Program',
    'fat-loss': 'Fat Loss Program',
    'cardio': 'Cardio Classes',
    'diet': 'Diet & Nutrition Guidance'
  };
  return types[type] || type;
}

// Helper function to format time slot
function formatTimeSlot(slot) {
  const slots = {
    'morning': 'Morning (5:30 AM - 9:30 AM)',
    'evening': 'Evening (4:30 PM - 9:30 PM)'
  };
  return slots[slot] || slot;
}

// Helper function to format date and time
function formatDateTime(date) {
  if (!date) return 'Not specified';
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  return new Date(date).toLocaleString('en-US', options);
}

// Contact form endpoint
app.post('/contact', async (req, res) => {
  console.log('Received booking inquiry:', req.body);
  const { 
    name, 
    email, 
    phone, 
    packageType, 
    trainingType, 
    message,
    bookingDate 
  } = req.body;

  try {
    if (!transporter) {
      throw new Error('Email transporter not initialized');
    }

    // Email to gym staff
    const staffEmail = await transporter.sendMail({
      from: `"Avengers Gym" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Training Inquiry from ${name} - ${formatPackageType(packageType)}`,
      html: `
        <h2>New Training Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Package:</strong> ${formatPackageType(packageType)}</p>
        <p><strong>Requested Date/Time:</strong> ${formatDateTime(bookingDate)}</p>
        <p><strong>Training Focus:</strong> ${formatTrainingFocus(trainingType)}</p>
        ${message ? `<p><strong>Additional Information:</strong></p><p>${message}</p>` : ''}
        <br>
        <p>Please contact the client to confirm their booking for the requested date and time.</p>
      `
    });

    // Auto-reply to user
    const userEmail = await transporter.sendMail({
      from: `"Avengers Gym" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Avengers Gym! Your Training Inquiry Received',
      html: `
        <h2>Thank you for choosing Avengers Gym!</h2>
        <p>Dear ${name},</p>
        <p>We're excited to help you start your fitness journey! Our team will contact you shortly at ${phone} to confirm your booking details.</p>
        <h3>Your Booking Details:</h3>
        <ul>
          <li><strong>Selected Package:</strong> ${formatPackageType(packageType)}</li>
          <li><strong>Requested Date/Time:</strong> ${formatDateTime(bookingDate)}</li>
          <li><strong>Training Focus:</strong> ${formatTrainingFocus(trainingType)}</li>
        </ul>
        ${message ? `<p><strong>Your Additional Information:</strong></p><p>${message}</p>` : ''}
        <br>
        <p>If you need immediate assistance or have any questions:</p>
        <ul>
          <li>Call us: +91 99407 11214</li>
          <li>WhatsApp: +91 94427 17478</li>
          <li>Visit us: KAP complex, Byepass, Service Rd, Sattur, Tamil Nadu 626203</li>
        </ul>
        <p>Gym Hours:</p>
        <ul>
          <li>Morning: 5:30 AM - 9:30 AM</li>
          <li>Evening: 4:30 PM - 9:30 PM</li>
        </ul>
        <br>
        <p>Best regards,</p>
        <p>Avengers Gym Team</p>
      `
    });

    res.status(200).json({ message: 'Booking inquiry sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      message: 'Error processing your booking inquiry', 
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Root endpoint for testing
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Avengers Gym API is running!',
    endpoints: [
      { path: '/contact', method: 'POST', description: 'Submit booking inquiry' },
      { path: '/health', method: 'GET', description: 'Health check' }
    ]
  });
});

// Export the serverless function
module.exports.handler = serverless(app); 