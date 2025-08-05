import React, { useState } from 'react';
import { Calendar, Clock, Users, Mail, Phone, User, MessageCircle, Utensils, MapPin, Star } from 'lucide-react';

interface BookingForm {
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  guests: string;
  occasion: string;
  specialRequests: string;
}

interface TimeSlot {
  time: string;
  display: string;
  available: boolean;
}

function App() {
  const [formData, setFormData] = useState<BookingForm>({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    guests: '',
    occasion: '',
    specialRequests: ''
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<BookingForm>>({});
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<BookingForm> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.date) {
      newErrors.date = 'Reservation date is required';
    }
    
    if (!formData.time) {
      newErrors.time = 'Reservation time is required';
    }
    
    if (!formData.guests.trim()) {
      newErrors.guests = 'Number of guests is required';
    } else if (parseInt(formData.guests) < 1 || parseInt(formData.guests) > 20) {
      newErrors.guests = 'Number of guests must be between 1 and 20';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Send booking data to backend for database storage
        const response = await fetch('http://localhost:3001/api/book', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (result.success) {
          setIsSubmitted(true);
          console.log('Booking submitted successfully:', result);
        } else {
          console.error('Failed to submit booking:', result.error);
          alert(`Booking failed: ${result.error}`);
        }
      } catch (error) {
        console.error('Error submitting booking:', error);
        alert('Network error: Failed to submit booking. Please check your connection and try again.');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof BookingForm]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      date: '',
      time: '',
      guests: '',
      occasion: '',
      specialRequests: ''
    });
    setIsSubmitted(false);
    setErrors({});
  };

  // Get today's date for min attribute
  const today = new Date().toISOString().split('T')[0];

  // Default time slots
  const defaultTimeSlots: TimeSlot[] = [
    { time: '17:00', display: '5:00 PM', available: true },
    { time: '17:30', display: '5:30 PM', available: true },
    { time: '18:00', display: '6:00 PM', available: true },
    { time: '18:30', display: '6:30 PM', available: true },
    { time: '19:00', display: '7:00 PM', available: true },
    { time: '19:30', display: '7:30 PM', available: true },
    { time: '20:00', display: '8:00 PM', available: true },
    { time: '20:30', display: '8:30 PM', available: true },
    { time: '21:00', display: '9:00 PM', available: true },
    { time: '21:30', display: '9:30 PM', available: true }
  ];

  // Fetch availability for selected date
  const fetchAvailability = async (date: string) => {
    if (!date) return;
    
    setLoadingAvailability(true);
    try {
      const response = await fetch(`http://localhost:3001/api/availability?date=${date}`);
      const data = await response.json();
      
      if (data.success) {
        const updatedSlots = defaultTimeSlots.map(slot => ({
          ...slot,
          available: data.availability[slot.time] || true
        }));
        setTimeSlots(updatedSlots);
      } else {
        setTimeSlots(defaultTimeSlots);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      setTimeSlots(defaultTimeSlots);
    } finally {
      setLoadingAvailability(false);
    }
  };

  // Update time slots when date changes
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear time selection when date changes
    setFormData(prev => ({
      ...prev,
      time: ''
    }));
    
    // Fetch availability for new date
    fetchAvailability(value);
    
    // Clear error when user starts typing
    if (errors[name as keyof BookingForm]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-stone-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Utensils className="h-8 w-8 text-amber-400" />
              <h1 className="text-2xl font-bold">Bella Vista</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-stone-300 hover:text-white transition-colors">Menu</a>
              <a href="#" className="text-stone-300 hover:text-white transition-colors">About</a>
              <a href="#" className="text-stone-300 hover:text-white transition-colors">Contact</a>
              <a href="#booking" className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors">
                Book Table
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-stone-900 to-stone-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-5xl font-bold mb-6">
              Fine Dining
              <span className="text-amber-400"> Experience</span>
            </h2>
            <p className="text-xl text-stone-300 mb-8 leading-relaxed">
              Experience culinary excellence in an elegant atmosphere. Our award-winning chefs create 
              memorable dishes using the finest ingredients, paired with exceptional service.
            </p>
            <div className="flex flex-wrap gap-6 text-stone-300">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-amber-400" />
                <span>123 Gourmet Street, Culinary District</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-amber-400" />
                <span>Michelin Starred Restaurant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-stone-900 mb-4">Reserve Your Table</h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Book your dining experience at Bella Vista. We look forward to serving you 
              an unforgettable culinary journey.
            </p>
          </div>

          {!isSubmitted ? (
            <div className="bg-stone-50 rounded-2xl p-8 shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-stone-700 mb-2">
                      <User className="inline h-4 w-4 mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                        errors.name ? 'border-red-500' : 'border-stone-300 focus:border-amber-500'
                      }`}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-stone-700 mb-2">
                      <Phone className="inline h-4 w-4 mr-2" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+15551234567"
                      className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                        errors.phone ? 'border-red-500' : 'border-stone-300 focus:border-amber-500'
                      }`}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-stone-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-2" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john.doe@example.com"
                    className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                      errors.email ? 'border-red-500' : 'border-stone-300 focus:border-amber-500'
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                {/* Reservation Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="date" className="block text-sm font-semibold text-stone-700 mb-2">
                      <Calendar className="inline h-4 w-4 mr-2" />
                      Date *
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleDateChange}
                      min={today}
                      className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                        errors.date ? 'border-red-500' : 'border-stone-300 focus:border-amber-500'
                      }`}
                    />
                    {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                  </div>

                  <div>
                    <label htmlFor="time" className="block text-sm font-semibold text-stone-700 mb-2">
                      <Clock className="inline h-4 w-4 mr-2" />
                      Time *
                    </label>
                    <select
                      id="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      disabled={loadingAvailability}
                      className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                        errors.time ? 'border-red-500' : 'border-stone-300 focus:border-amber-500'
                      } ${loadingAvailability ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="">
                        {loadingAvailability ? 'Loading availability...' : 'Select Time'}
                      </option>
                      {timeSlots.map((slot) => (
                        <option 
                          key={slot.time} 
                          value={slot.time}
                          disabled={!slot.available}
                          style={{ 
                            color: !slot.available ? '#9CA3AF' : 'inherit',
                            backgroundColor: !slot.available ? '#F3F4F6' : 'inherit'
                          }}
                        >
                          {slot.display} {!slot.available ? '(Unavailable)' : ''}
                        </option>
                      ))}
                    </select>
                    {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
                  </div>

                  <div>
                    <label htmlFor="guests" className="block text-sm font-semibold text-stone-700 mb-2">
                      <Users className="inline h-4 w-4 mr-2" />
                      Guests *
                    </label>
                    <input
                      type="number"
                      id="guests"
                      name="guests"
                      value={formData.guests}
                      onChange={handleInputChange}
                      min="1"
                      max="20"
                      placeholder="4"
                      className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                        errors.guests ? 'border-red-500' : 'border-stone-300 focus:border-amber-500'
                      }`}
                    />
                    {errors.guests && <p className="text-red-500 text-sm mt-1">{errors.guests}</p>}
                  </div>
                </div>

                {/* Optional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="occasion" className="block text-sm font-semibold text-stone-700 mb-2">
                      Occasion (Optional)
                    </label>
                    <select
                      id="occasion"
                      name="occasion"
                      value={formData.occasion}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                    >
                      <option value="">Select Occasion</option>
                      <option value="Birthday">Birthday</option>
                      <option value="Anniversary">Anniversary</option>
                      <option value="Business Dinner">Business Dinner</option>
                      <option value="Romantic Dinner">Romantic Dinner</option>
                      <option value="Family Celebration">Family Celebration</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="specialRequests" className="block text-sm font-semibold text-stone-700 mb-2">
                      <MessageCircle className="inline h-4 w-4 mr-2" />
                      Special Requests (Optional)
                    </label>
                    <textarea
                      id="specialRequests"
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleInputChange}
                      placeholder="Window seat, dietary restrictions, etc."
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border-2 border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    className="w-full bg-amber-600 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all transform hover:scale-105"
                  >
                    Reserve Table
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Utensils className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-800 mb-4">Reservation Confirmed!</h3>
                <div className="text-green-700 space-y-2 mb-6">
                  <p><strong>Name:</strong> {formData.name}</p>
                  <p><strong>Date:</strong> {formData.date}</p>
                  <p><strong>Time:</strong> {formData.time}</p>
                  <p><strong>Guests:</strong> {formData.guests}</p>
                  {formData.occasion && <p><strong>Occasion:</strong> {formData.occasion}</p>}
                </div>
                <p className="text-green-600 mb-6">
                  Thank you for choosing Bella Vista! Your booking has been confirmed and saved to our system.
                  We look forward to serving you.
                </p>
                <button
                  onClick={resetForm}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Make Another Reservation
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Utensils className="h-6 w-6 text-amber-400" />
                <h3 className="text-xl font-bold">Bella Vista</h3>
              </div>
              <p className="text-stone-300 leading-relaxed">
                Experience fine dining at its finest. Our commitment to excellence ensures 
                every meal is a memorable experience.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-stone-300">
                <p>123 Gourmet Street</p>
                <p>Culinary District, CD 12345</p>
                <p>Phone: +1 (555) 123-4567</p>
                <p>Email: info@bellavista.com</p>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Hours</h4>
              <div className="space-y-2 text-stone-300">
                <p>Monday - Thursday: 5:00 PM - 10:00 PM</p>
                <p>Friday - Saturday: 5:00 PM - 11:00 PM</p>
                <p>Sunday: 5:00 PM - 9:00 PM</p>
              </div>
            </div>
          </div>
          <div className="border-t border-stone-700 mt-8 pt-8 text-center text-stone-400">
            <p>&copy; 2025 Bella Vista Restaurant. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;