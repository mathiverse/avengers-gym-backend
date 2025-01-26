# Avengers Gym Backend

Backend server for Avengers Gym website handling email notifications and form submissions.

## Features

- Express.js server with CORS support
- Nodemailer integration for email handling
- Support for both Gmail and test mode (Ethereal Email)
- Custom email templates for staff notifications
- Form validation and error handling
- Environment variable configuration

## API Endpoints

### POST /api/contact
Handles gym session booking inquiries with the following fields:
- `name`: Client's full name
- `email`: Client's email address
- `phone`: Client's phone number
- `message`: Additional message/requirements
- `packageType`: Selected package (Contest Prep/Personal Training/Online Coaching)
- `preferredTime`: Preferred training slot (Morning/Evening)
- `trainingFocus`: Training focus area

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```env
PORT=3001
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-specific-password
RECIPIENT_EMAIL=gym-staff@example.com
NODE_ENV=development
```

4. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Email Configuration

### Gmail Setup
1. Enable 2-factor authentication in your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate a new app password for "Mail"
3. Use this password in your `.env` file

### Test Mode
In development, the server uses Ethereal Email for testing:
- No real emails are sent
- Preview URLs are logged to console
- Useful for development and testing

## Operating Hours

The gym operates in two sessions:
- Morning: 5:30 AM - 11:30 AM
- Evening: 4:30 PM - 9:30 PM

## Package Types

Current training packages:
- Contest Preparation: ₹6,000/month
- Personal Training: ₹3,000/month
- Online Coaching: ₹3,000/month

## Error Handling

The server includes comprehensive error handling for:
- Invalid email configurations
- Missing required fields
- Server errors
- Email delivery failures

## Development

To contribute:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Dependencies

- express
- cors
- dotenv
- nodemailer
- nodemon (dev) 