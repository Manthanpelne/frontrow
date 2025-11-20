
"use client"

import { getUsersBookingsAction } from '@/actions/ticket-booking'
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner' // Assuming 'sonner' is installed for toasts

// --- ICON PLACEHOLDERS (Add these if you don't use a separate icon library) ---
const CalendarIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);

const MapPinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);
// --------------------------------------------------------------------------

// --- BookingCard Component (Handles the display logic for a single ticket) ---
// This is the clean UI using Tailwind CSS.
function BookingCard({ booking }) {
  const { movie } = booking.showtime;
  
  // Convert ISO string date to a readable format
  const bookingDate = new Date(booking.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  // Format the total price string to show currency
  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
  }).format(Number(booking.totalPrice)); // Convert the price string back to a number for formatting

  return (
    <div className="flex flex-col md:flex-row group bg-white rounded-4xl shadow-md overflow-hidden transition duration-300 hover:shadow-lg border border-[gray">
      
      {/* Movie Poster Section */}
      <div className="md:w-1/4 w-full h-80 bg-gray-200 shrink-0">
        <img
          src={movie.poster || '/placeholder-poster.jpg'} // Use a placeholder if poster is missing
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-400"
        />
      </div>

      {/* Booking Details Section */}
      <div className="p-5 md:p-8 grow">
        <div className="flex justify-between gap-4 items-start mb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-gray-900">
              {movie.title}
            </h2>
            <p className="text-sm opacity-65 ">
              Date: <span className='text-rose-500 font-bold'>{bookingDate}</span>
            </p>
          </div>
          <div className="text-right pt-2 md:pt-0">
            <p className="text-md sm:text-xl font-extrabold text-green-600">
              {formattedTotal}
            </p>
            <span className="text-xs text-gray-500">Total Paid</span>
          </div>
        </div>

        {/* Showtime and Location */}
        <div className="grid grid-cols-2 gap-4 border-t border-b py-4 mb-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Showtime</p>
              <p className="font-semibold text-gray-800">
                {booking.showtime.time}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <MapPinIcon className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Theater</p>
              <p className="font-semibold text-gray-800">
                {booking.showtime.theater}
              </p>
            </div>
          </div>
        </div>
        
        {/* Seat Details */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            🎟️ Your Seats ({booking.seats.length})
          </h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {booking.seats.map((seat, index) => (
              <span
                key={index}
                className={`px-3 py-1 text-xs sm:text-md font-medium rounded-full ${
                  seat.type.toLowerCase() === 'vip' 
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                    : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                }`}
              >
                {seat.row}-{seat.seat} ({seat.type})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
// --------------------------------------------------------------------------


// --- Main bookingPage Component ---
const BookingPage = () => {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
 
    const fetchTickets = async() =>{
        setLoading(true)
        setError(null) // Clear previous errors
        try {
            // getUsersBookingsAction returns { success: boolean, message: string, bookings: Ticket[] }
            const result = await getUsersBookingsAction()
            
            if(result.success){
                // Correctly set the tickets state with the bookings array
                setTickets(result.bookings || [])
                console.log("Fetched Bookings:", result.bookings)
            } else {
                // Handle unauthorized or other errors from the Server Action
                toast.error(result.message || "Failed to fetch tickets.")
                setError(result.message || "Failed to fetch tickets.")
                setTickets([])
            }
        } catch (err) {
            console.error(err)
            toast.error("An unexpected error occurred.")
            setError("An unexpected error occurred.")
            setTickets([])
        } finally {
            setLoading(false)
        }
    } 
 
    useEffect(()=>{
        fetchTickets()
    },[])

    // --- Conditional Rendering ---
    if (loading) {
        return (
            <div className="text-center py-20 text-gray-500">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-3"></div>
                <p>Loading your bookings...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="text-center py-2 rounded-lg max-w-md mx-auto ">
               <Image
               src="/404.png"
               width={100}
               height={100}
               className='opacity-40 m-auto w-full'
               />
            </div>
        );
    }

    if (tickets.length === 0) {
        return (
            <div className="text-center py-16">
                <h2 className="text-2xl font-semibold text-gray-700">
                    No Bookings Found 😢
                </h2>
                <p className="text-gray-500 mt-2">
                    Time to catch a new movie!
                </p>
                <button 
                    onClick={fetchTickets}
                    className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
                >
                    Retry Fetch
                </button>
            </div>
        );
    }
    
    // --- Success State: Render the list of tickets ---
    return (
        <div className="max-w-6xl mx-auto px-4 md:px-6">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-5 md:mb-8">
                🍿 My Bookings
            </h1>

            <div className="space-y-8">
                {tickets.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                ))}
            </div>
        </div>
    )
}

export default BookingPage