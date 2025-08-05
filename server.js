import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Generate unique booking ID
const generateBookingId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `BK${timestamp}${random}`;
};



// API endpoint to handle booking submissions
app.post('/api/book', async (req, res) => {
  try {
    const bookingData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'date', 'time', 'guests'];
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return res.status(400).json({ 
          success: false, 
          error: `Missing required field: ${field}` 
        });
      }
    }

    // Generate unique booking ID
    const bookingId = generateBookingId();
    
    // Prepare booking data for Supabase
    const bookingRecord = {
      booking_id: bookingId,
      name: bookingData.name,
      phone: bookingData.phone || '',
      email: bookingData.email,
      date: bookingData.date,
      time: bookingData.time,
      guest_count: parseInt(bookingData.guests),
      occasion: bookingData.occasion || null,
      special_requests: bookingData.specialRequests || null,
      status: 'success',
      error_message: null
    };

    // Save booking to Supabase
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingRecord])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('Booking saved to Supabase:', data);
    
    res.json({ 
      success: true, 
      booking_id: bookingId,
      message: 'Booking submitted successfully! Your reservation has been confirmed.'
    });

  } catch (error) {
    console.error('Error processing booking:', error);
    
    // Log failed attempt to Supabase
    try {
      const failedBooking = {
        booking_id: generateBookingId(),
        name: req.body.name || 'Unknown',
        phone: req.body.phone || '',
        email: req.body.email || 'unknown@example.com',
        date: req.body.date || '1900-01-01',
        time: req.body.time || '00:00',
        guest_count: parseInt(req.body.guests) || 0,
        occasion: req.body.occasion || null,
        special_requests: req.body.specialRequests || null,
        status: 'failed',
        error_message: error.message
      };

      await supabase
        .from('bookings')
        .insert([failedBooking]);

      console.log('Failed booking logged to Supabase');
    } catch (logError) {
      console.error('Failed to log failed booking:', logError);
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process booking',
      details: error.message 
    });
  }
});



// Serve the React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🗄️  Supabase: ${process.env.SUPABASE_URL ? 'Connected' : 'Not configured'}`);
  
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.warn('⚠️  Supabase credentials not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file');
  }
}); 