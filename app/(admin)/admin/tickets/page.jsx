"use client"
import { getBookedTicketsAction } from '@/actions/ticket-booking'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'

const GetTicketsPage = () => {
    
    // State to hold the fetched ticket data
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(false)

    const fetchTickets = async() =>{
        setLoading(true)
        try {
            const result = await getBookedTicketsAction()
            if(result.success){
                // Data is safe to set directly as it was serialized in the Server Action
                setTickets(result.tickets)
            } else {
                // Handle unauthorized or other errors from the Server Action
                toast.error(result.message || "Failed to fetch tickets")
            }
        } catch (error) {
            console.error(error)
            toast.error("An unexpected error occurred while fetching tickets.")
        } finally {
            setLoading(false)
        }
    } 

    useEffect(()=>{
        fetchTickets()
    },[])

    return (
        <div className="px-4 md:px-8 min-h-screen">
            <h1 className="text-xl sm:text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4">
                🎬 Admin Ticket Bookings
            </h1>

            {/* Loading State */}
            {loading && (
               <div className="flex justify-center text-sm items-center p-12 opacity-35">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span>Loading Data...</span>
             </div>
            )}

            {/* Empty State */}
            {!loading && tickets.length === 0 && (
                <div className="text-center p-10 bg-white rounded-lg shadow-md text-gray-500">
                    No Data found.
                </div>
            )}

            {/* Table View */}
            {!loading && tickets.length > 0 && (
                <div className="bg-white shadow-md border rounded-xl overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-[#f1f1f1] sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Movie
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Showtime/Theater
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Customer / Email
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Seats
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Count
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    ₹ Total Price
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Booked On
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {tickets.map((ticket) => (
                                <tr key={ticket.id} className="hover:bg-yellow-50 transition duration-150 ease-in-out">
                                    {/* Movie Title */}
                                    <td className="px-6 py-2 md:py-4 text-center whitespace-nowrap text-sm font-semibold text-gray-900 max-w-xs overflow-hidden text-ellipsis">
                                        {ticket.movieTitle}
                                    </td>
                                    {/* Showtime/Theater */}
                                    <td className="px-6 py-2 md:py-4 text-center whitespace-nowrap text-sm text-gray-600">
                                        {ticket.showtime}
                                    </td>
                                    {/* Customer / Email */}
                                    <td className="px-6 py-2 md:py-4 text-center whitespace-nowrap text-sm text-gray-600">
                                        <div className="font-medium text-gray-900">{ticket.bookedBy}</div>
                                        <div className="text-gray-500 text-xs">{ticket.userEmail}</div>
                                    </td>
                                    {/* Seat Details */}
                                    <td className="px-6 py-2 md:py-4 text-center max-w-xs text-sm text-gray-700 overflow-hidden text-ellipsis">
                                        {ticket.seatDetails}
                                    </td>
                                    {/* Count */}
                                    <td className="px-6 py-2 md:py-4 whitespace-nowrap text-center text-sm font-medium text-gray-700">
                                        {ticket.seatCount}
                                    </td>
                                    {/* Total Price */}
                                    <td className="px-6 py-2 md:py-4 whitespace-nowrap text-center text-sm font-bold text-green-700">
                                        {/* Since totalPrice is a string, we parse it for display formatting */}
                                        ₹ {parseFloat(ticket.totalPrice).toFixed(2)} 
                                    </td>
                                    {/* Booked On */}
                                    <td className="px-6 py-2 md:py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                        {/* Ensure date-fns is installed: npm install date-fns */}
                                        {format(new Date(ticket.bookingDate), 'MMM dd, yyyy h:mm a')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default GetTicketsPage