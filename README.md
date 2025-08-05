# 🍽️ Bella Vista Restaurant - Booking Website

A beautiful restaurant booking website with email confirmation functionality.

## ✨ Features

- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Form Validation**: Client-side validation for all booking fields
- **Email Confirmation**: Automatic email sending with booking details
- **Real-time Feedback**: Success/error messages for user interactions

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Email service account (Gmail, Outlook, etc.)

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd dummy-restaurant
   npm install
   ```

2. **Set up email configuration:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your email credentials:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=your-email@gmail.com
   PORT=3001
   ```
   
   **Important**: Use the same email address for both `EMAIL_USER` and `EMAIL_FROM`. The password should be the app password for the `EMAIL_USER` account.

3. **Build the React app:**
   ```bash
   npm run build
   ```

4. **Start the server:**
   ```bash
   npm run server
   ```

5. **Open your browser:**
   ```
   http://localhost:3001
   ```

## 📧 Email Setup

### Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. **Use the app password** in your `.env` file as `EMAIL_PASS`
4. **Set both `EMAIL_USER` and `EMAIL_FROM`** to the same Gmail address

### Other Email Services

You can use any SMTP service. Update the `EMAIL_SERVICE` in your `.env`:

- **Outlook/Hotmail**: `EMAIL_SERVICE=outlook`
- **Yahoo**: `EMAIL_SERVICE=yahoo`
- **Custom SMTP**: Use `EMAIL_SERVICE=smtp` and add `EMAIL_HOST` and `EMAIL_PORT`

## 🧪 Testing the Email Functionality

1. Fill out the booking form with your email address
2. Submit the form
3. Check your email for the confirmation message
4. The email will include all booking details in a beautiful HTML template

## 📁 Project Structure

```
dummy-restaurant/
├── src/
│   ├── App.tsx          # Main React component with booking form
│   ├── main.tsx         # React entry point
│   └── index.css        # Tailwind CSS styles
├── server.js            # Express server with email functionality
├── package.json         # Dependencies and scripts
├── env.example          # Environment variables template
└── README.md           # This file
```

## 🔧 Development

### Development Mode
```bash
npm run dev          # Start Vite dev server
npm run server       # Start backend server (in another terminal)
```

### Production Build
```bash
npm run build        # Build React app
npm run server       # Start production server
```

## 📋 API Endpoints

### POST `/api/send-booking-email`

Sends a confirmation email for a booking.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "date": "2025-01-15",
  "time": "19:00",
  "guests": "4",
  "occasion": "Anniversary",
  "specialRequests": "Window seat please"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "message-id",
  "message": "Confirmation email sent successfully!"
}
```

## 🎨 Customization

### Email Template
The email template is defined in `server.js` in the `createEmailTemplate` function. You can customize:
- HTML structure and styling
- Restaurant information
- Email content and branding

### Form Fields
Add or modify form fields in `src/App.tsx`:
1. Update the `BookingForm` interface
2. Add form validation rules
3. Update the email template to include new fields

## 🐛 Troubleshooting

### Email Not Sending
1. Check your `.env` file has correct credentials
2. For Gmail, ensure you're using an App Password, not your regular password
3. Check the server console for error messages

### ⚠️ Important Note
**The dummy website currently doesn't send actual emails** - this is a known limitation. The email functionality is set up but not fully implemented. The booking form will show success messages but no confirmation emails will be sent to users.

### CORS Issues
The server includes CORS middleware, but if you're running on different ports, ensure the frontend is calling the correct backend URL.

### Port Conflicts
Change the `PORT` in your `.env` file if port 3001 is already in use.

## 📄 License

This project is for demonstration purposes. Feel free to use and modify as needed. 