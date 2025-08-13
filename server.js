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
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3001'],
  credentials: true
}));
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

    // Check availability before proceeding with booking
    const { data: availabilityData, error: availabilityError } = await supabase
      .from('availability')
      .select('is_available, current_bookings, max_capacity')
      .eq('date', bookingData.date)
      .eq('time_slot', bookingData.time)
      .single();

    if (availabilityError) {
      console.error('Error checking availability:', availabilityError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to check availability' 
      });
    }

    if (!availabilityData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Selected time slot does not exist' 
      });
    }

    if (!availabilityData.is_available) {
      return res.status(400).json({ 
        success: false, 
        error: 'Selected time slot is not available' 
      });
    }

    // Check if there's capacity for one more booking (regardless of guest count)
    const remainingCapacity = availabilityData.max_capacity - availabilityData.current_bookings;
    
    if (remainingCapacity <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'This time slot is fully booked' 
      });
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
    console.log('Inserting booking record:', bookingRecord);
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingRecord])
      .select();

    if (error) {
      console.error('Supabase booking insert error:', error);
      return res.status(500).json({ 
        success: false, 
        error: `Database error: ${error.message}` 
      });
    }

    // Update availability table to increment booking count
    const { error: updateError } = await supabase
      .from('availability')
      .update({ 
        current_bookings: availabilityData.current_bookings + 1,
        is_available: (availabilityData.current_bookings + 1) < availabilityData.max_capacity
      })
      .eq('date', bookingData.date)
      .eq('time_slot', bookingData.time);

    if (updateError) {
      console.error('Error updating availability:', updateError);
      // Note: We don't throw here as the booking was already saved
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

// API endpoint to check availability for a specific date
app.get('/api/availability', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ 
        success: false, 
        error: 'Date parameter is required' 
      });
    }

    // Query Supabase for available slots on the specified date
    const { data, error } = await supabase
      .from('availability')
      .select('time_slot, is_available, current_bookings, max_capacity')
      .eq('date', date)
      .eq('is_available', true)
      .order('time_slot');

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch availability' 
      });
    }

    // Filter out slots that are at capacity
    const availableSlots = data.filter(slot => {
      const remainingCapacity = slot.max_capacity - slot.current_bookings;
      return remainingCapacity > 0;
    });

    // Convert to simple time array for easier frontend consumption
    // Strip seconds from time format (17:30:00 -> 17:30)
    const availableTimes = availableSlots.map(slot => slot.time_slot.substring(0, 5));

    console.log(`Available times for ${date}:`, availableTimes);
    
    res.json({ 
      success: true, 
      date: date,
      available_times: availableTimes
    });

  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check availability',
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