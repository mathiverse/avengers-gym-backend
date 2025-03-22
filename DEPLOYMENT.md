# Avengers Gym Backend - Netlify Serverless Deployment Guide

This guide explains how to deploy the Avengers Gym backend API as a Netlify serverless function, which is ideal for integrating with your Netlify-hosted frontend.

## Project Details

- **Project Name**: Avengers Gym Backend
- **Description**: Node.js Express API for handling gym booking requests
- **Main Feature**: Email notification system for gym bookings

## Prerequisites

- Node.js 14+ installed
- npm or yarn package manager
- Netlify account
- Gmail account for sending emails

## Step 1: Generate Gmail App Password

To use Gmail with your application, you need an "App Password" instead of your regular Gmail password:

1. **Enable 2-Step Verification**:
   - Go to your Google Account → Security
   - Under "Signing in to Google," select "2-Step Verification" and turn it on
   - Follow the setup steps if not already enabled

2. **Create App Password**:
   - Go to your Google Account → Security
   - Under "Signing in to Google," select "App passwords"
   - Select "Mail" as the app and "Other" as the device
   - Name it "Avengers Gym Backend" and click "Generate"
   - **Save the 16-character code** that appears - this is your app password
   - Example: `abcd efgh ijkl mnop` (spaces will be removed when used)

## Step 2: Set Up Project for Netlify Functions

1. **Install Required Packages**:
   ```bash
   npm install serverless-http netlify-cli --save-dev
   ```

2. **Create Netlify Function Structure**:
   ```bash
   mkdir -p netlify/functions
   ```

3. **Create .env File**:
   ```
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-app-password
   ```

## Step 3: Deployment Configuration

### netlify.toml

Create a `netlify.toml` file in the project root:

```toml
[build]
  publish = "."
  functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
```

### netlify/functions/api.js

Create the serverless function file that will handle all API routes:

```javascript
// See the api.js file in this repository
```

## Step 4: Frontend Integration

Update your frontend API calls to point to the Netlify Functions endpoint:

```javascript
// If frontend and backend are on the same Netlify site
const API_URL = '/api/contact';

// If frontend and backend are on different Netlify sites
const API_URL = 'https://avengers-gym-backend.netlify.app/api/contact';
```

## Step 5: Deployment Steps

1. **Initialize Netlify Project**:
   ```bash
   npx netlify login
   npx netlify init
   ```
   - Choose "Create & configure a new site"
   - Select your team
   - Name your site (e.g., "avengers-gym-backend")

2. **Set Environment Variables**:
   ```bash
   npx netlify env:set EMAIL_USER your-gmail@gmail.com
   npx netlify env:set EMAIL_PASS your-gmail-app-password
   ```

3. **Deploy to Netlify**:
   ```bash
   npx netlify deploy --prod
   ```

## Troubleshooting

### Email Issues
- Ensure your Gmail account has "Less secure app access" enabled or is using an App Password
- Check Netlify Function logs for error messages
- Verify environment variables are set correctly

### CORS Issues
- Update the CORS configuration in your API function to allow requests from your frontend domain
- For testing locally, enable `http://localhost:3000` in the allowed origins

### Function Timeouts
- Netlify Functions have a 10-second timeout
- If sending emails takes too long, consider using a queue or third-party email service

## Usage Limits

- Free tier of Netlify Functions: 125K requests per month, 100 hours of runtime
- Gmail: 500 emails per day (regular Gmail), 2000 emails per day (Google Workspace)

## Local Development

Test locally before deploying:

```bash
npx netlify dev
```

This will run your functions locally and provide a local URL for testing. 