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

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  console.log('Received contact form submission:', req.body);
  const { name, email, subject, message } = req.body;

  try {
    if (!transporter) {
      throw new Error('Email transporter not initialized');
    }

    // Determine if we're in test mode
    const isTestMode = !process.env.EMAIL_USER;

    // Email to gym staff
    const staffEmail = await transporter.sendMail({
      from: isTestMode ? '"Avengers Gym" <avengers_gym_sattur@gmail.com>' : process.env.EMAIL_USER,
      to: isTestMode ? email : process.env.EMAIL_USER, // In real mode, send to gym's email
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    });

    // Auto-reply to user
    const userEmail = await transporter.sendMail({
      from: isTestMode ? '"Avengers Gym" <test@example.com>' : process.env.EMAIL_USER,
      to: email,
      subject: 'Thank you for contacting Avengers Gym',
      html: `
        <h2>Thank you for contacting Avengers Gym!</h2>
        <p>Dear ${name},</p>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p>Here's a copy of your message:</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
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
      res.status(200).json({ message: 'Emails sent successfully' });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email' });
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