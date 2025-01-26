# Avengers Gym Backend

Backend server for the Avengers Gym website's contact form functionality.

## Features

- Contact form email handling
- Support for both Gmail and test mode
- Auto-reply to users
- Staff notifications

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```env
   # Server Configuration
   PORT=5001

   # Gmail Configuration
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASS=your_app_password
   ```

3. Gmail Setup (for production):
   - Enable 2-Step Verification in your Google Account
   - Generate App Password:
     1. Go to Google Account → Security → App Passwords
     2. Select "Mail" and your device
     3. Copy the 16-character password
     4. Use it as EMAIL_PASS in .env

## Development

Run the server in development mode:
```bash
npm run dev
```

### Test Mode
- Leave EMAIL_USER and EMAIL_PASS empty in .env
- Server will automatically use Ethereal Email for testing
- Preview URLs will be provided in the console

### Production Mode
- Set EMAIL_USER and EMAIL_PASS in .env
- Server will use Gmail SMTP
- Real emails will be sent

## API Endpoints

### POST /api/contact
Handles contact form submissions.

Request body:
```json
{
  "name": "string",
  "email": "string",
  "subject": "string",
  "message": "string"
}
```

### GET /health
Health check endpoint.

## Environment Variables

- `PORT`: Server port (default: 5001)
- `EMAIL_USER`: Gmail address
- `EMAIL_PASS`: Gmail App Password 