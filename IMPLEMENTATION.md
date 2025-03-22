# Avengers Gym Backend - Implementation Guide

This document provides step-by-step instructions for implementing and deploying the Avengers Gym backend API as a Netlify serverless function.

## Step 1: Install Required Dependencies

```bash
cd avengers-gym-backend
npm install serverless-http netlify-cli --save-dev
```

## Step 2: Verify Project Structure

Ensure your project structure looks like this:

```
avengers-gym-backend/
├── netlify/
│   └── functions/
│       └── api.js              # Serverless function
├── .env                        # Environment variables (not in git)
├── .env.example                # Example environment variables
├── .gitignore                  # Git ignore file
├── DEPLOYMENT.md               # Deployment documentation
├── IMPLEMENTATION.md           # This file
├── netlify.toml                # Netlify configuration
├── package.json                # Project dependencies
├── package-lock.json           # Lock file
├── README.md                   # Project overview
└── server.js                   # Original Express server (not used in serverless)
```

## Step 3: Generate Gmail App Password

1. Enable 2-Step Verification on your Google Account:
   - Go to your [Google Account Security settings](https://myaccount.google.com/security)
   - Under "Signing in to Google," select "2-Step Verification" and turn it on
   - Follow the setup steps

2. Create App Password:
   - Go back to your [Google Account Security settings](https://myaccount.google.com/security)
   - Under "Signing in to Google," select "App passwords"
   - Select "Mail" as the app and "Other" as the device
   - Name it "Avengers Gym Backend" and click "Generate"
   - Save the 16-character code that appears

## Step 4: Set Up Local Environment Variables

Create a `.env` file with your Gmail credentials:

```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
```

## Step 5: Test Locally

Run the Netlify development server to test your functions:

```bash
npx netlify dev
```

This will start the local server, typically on port 8888. You can test the API by sending a POST request to:

```
http://localhost:8888/api/contact
```

With a body like:

```json
{
  "name": "Test User",
  "email": "your-test-email@example.com",
  "phone": "1234567890",
  "packageType": "normal",
  "trainingType": "weight-gain",
  "message": "This is a test message",
  "bookingDate": "2023-11-15T10:30:00.000Z"
}
```

## Step 6: Update Frontend API Endpoint

Update your frontend to call the Netlify function endpoint:

1. If hosting frontend and backend on the same Netlify site:
   - Use `/api/contact` as the API endpoint

2. If hosting frontend and backend on different Netlify sites:
   - Use `https://your-backend-site.netlify.app/api/contact` as the API endpoint

## Step 7: Deploy to Netlify

1. Login to Netlify:
   ```bash
   npx netlify login
   ```

2. Initialize a new Netlify site:
   ```bash
   npx netlify init
   ```
   - Choose "Create & configure a new site"
   - Select your team
   - Name your site (e.g., "avengers-gym-backend")

3. Set environment variables:
   ```bash
   npx netlify env:set EMAIL_USER your-gmail@gmail.com
   npx netlify env:set EMAIL_PASS your-gmail-app-password
   ```

4. Deploy to production:
   ```bash
   npx netlify deploy --prod
   ```

5. Verify deployment:
   - Check the deployed URL in your console
   - Test the API endpoint at: `https://your-site-name.netlify.app/api/contact`

## Step 8: Update CORS Settings (If Needed)

If you're hosting your frontend on a different domain, update the CORS settings in `netlify/functions/api.js`:

```javascript
app.use(cors({
  origin: ['https://your-frontend-domain.com', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  credentials: true
}));
```

Then redeploy:

```bash
npx netlify deploy --prod
```

## Step 9: Verify Frontend-Backend Integration

1. Submit a form on your frontend website
2. Check if the email is sent to both your gym email and the user
3. Verify that the response is handled correctly in the frontend

## Troubleshooting

1. Check Netlify function logs:
   - Go to Netlify dashboard → Your site → Functions → api → Logs
   - Look for any error messages

2. Test email credentials:
   - Ensure your Gmail account has "Less secure app access" enabled or is using an App Password
   - Try sending a test email using the credentials

3. Check CORS issues:
   - Open browser DevTools → Network tab → Look for CORS errors
   - Update the CORS configuration in your API function
``` 