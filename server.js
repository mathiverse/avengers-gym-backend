require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:4000', 'http://localhost:3000'], // Allow both ports just in case
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
      pass: process.env.EMAIL_PASS // Use App Password here, not regular password
    }
  });
}

// Function to create test account (fallback)
async function createTestAccount() {
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (error) {
    console.error('Error creating test account:', error);
    return null;
  }
}

// Initialize email transporter
async function initializeTransporter() {
  try {
    // First try Gmail
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = createGmailTransporter();
      console.log('Gmail transporter initialized');
      return;
    }

    // Fallback to test account if Gmail credentials are not provided
    console.log('Gmail credentials not found, falling back to test account...');
    transporter = await createTestAccount();
    if (transporter) {
      console.log('Test email account created for development');
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
    'online': 'Online Coaching (₹3,000/month)'
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
    'morning': 'Morning (5:30 AM - 11:30 AM)',
    'evening': 'Evening (4:30 PM - 9:30 PM)'
  };
  return slots[slot] || slot;
}

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  console.log('Received booking inquiry:', req.body);
  const { 
    name, 
    email, 
    phone, 
    packageType, 
    preferredTime, 
    trainingType, 
    message 
  } = req.body;

  try {
    if (!transporter) {
      throw new Error('Email transporter not initialized');
    }

    // Determine if we're in test mode
    const isTestMode = !process.env.EMAIL_USER;

    // Email to gym staff
    const staffEmail = await transporter.sendMail({
      from: isTestMode ? '"Avengers Gym" <test@example.com>' : process.env.EMAIL_USER,
      to: isTestMode ? email : process.env.EMAIL_USER,
      subject: `New Training Inquiry from ${name} - ${formatPackageType(packageType)}`,
      html: `
        <h2>New Training Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Package:</strong> ${formatPackageType(packageType)}</p>
        <p><strong>Preferred Time:</strong> ${formatTimeSlot(preferredTime)}</p>
        <p><strong>Training Focus:</strong> ${formatTrainingFocus(trainingType)}</p>
        ${message ? `<p><strong>Additional Information:</strong></p><p>${message}</p>` : ''}
        <br>
        <p>Please contact the client to discuss package details and schedule their first session.</p>
      `
    });

    // Auto-reply to user
    const userEmail = await transporter.sendMail({
      from: isTestMode ? '"Avengers Gym" <test@example.com>' : process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Avengers Gym! Your Training Inquiry Received',
      html: `
        <h2>Thank you for choosing Avengers Gym!</h2>
        <p>Dear ${name},</p>
        <p>We're excited to help you start your fitness journey! Our team will contact you shortly at ${phone} to discuss your training preferences and schedule your first session.</p>
        <h3>Your Inquiry Details:</h3>
        <ul>
          <li><strong>Selected Package:</strong> ${formatPackageType(packageType)}</li>
          <li><strong>Preferred Time:</strong> ${formatTimeSlot(preferredTime)}</li>
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
          <li>Morning: 5:30 AM - 11:30 AM</li>
          <li>Evening: 4:30 PM - 9:30 PM</li>
        </ul>
        <br>
        <p>Best regards,</p>
        <p>Avengers Gym Team</p>
      `
    });

    // If in test mode, return preview URLs
    if (isTestMode) {
      console.log('Test Mode - Email Preview URLs:');
      console.log('Staff Email:', nodemailer.getTestMessageUrl(staffEmail));
      console.log('User Email:', nodemailer.getTestMessageUrl(userEmail));
      
      res.status(200).json({
        message: 'Test emails sent successfully',
        previewUrls: {
          staffEmail: nodemailer.getTestMessageUrl(staffEmail),
          userEmail: nodemailer.getTestMessageUrl(userEmail)
        }
      });
    } else {
      res.status(200).json({ message: 'Booking inquiry sent successfully' });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error processing your booking inquiry' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 