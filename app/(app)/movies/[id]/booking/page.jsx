"use client";

import { bookTicketsAction, getBookedSeatsAction } from "@/actions/ticket-booking";
import { Loader2 } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import React, { useMemo, useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

// --- START: Helper Functions for Seat Initialization ---

const getSeatTypeConfig = (row, seatTypes, colors) => {
  const seatTypeEntries = Object.entries(seatTypes);
  for (let i = 0; i < seatTypeEntries.length; i++) {
    const [typeKey, config] = seatTypeEntries[i];
    if (config.rows.includes(row)) {
      const color = colors[i % colors.length];
      return { type: typeKey, color, ...config };
    }
  }
  // Default to the first type if row is not explicitly defined
  const [firstType, firstConfig] = seatTypeEntries[0];
  return { type: firstType, color: colors[0], ...firstConfig };
};


//2nd helper function for adding default rows insife seatTypes
const convertSeatPrices = (pricesArray) => {
  // Define default row distribution (you'll need to customize this logic)
  const defaultRowDistribution = {
    standard: { rows: [0, 1, 2] },
    vip: { rows: [3, 4, 5] },
    premium: { rows: [6, 7] },
  };

  const seatTypesObject = {};
  
  pricesArray.forEach(priceItem => {
    // Normalize the seat type name (e.g., 'Standard' -> 'standard') for use as a key
    const typeKey = priceItem.seatType.toLowerCase();
    
    seatTypesObject[typeKey] = {
      name: priceItem.seatType,
      // Ensure price is a number
      price: parseFloat(priceItem.price), 
      // Add default row distribution based on the type name
      rows: defaultRowDistribution[typeKey] ? defaultRowDistribution[typeKey].rows : [],
    };
  });
  
  return seatTypesObject;
};

// --- END: Helper Functions ---


const TicketBookingPage = ({
  layout = {
    rows: 8,
    seatsPerRow: 12,
    aislePosition: 5,
  },
  bookedSeats: initialBookedSeats = [],
  onBookingComplete = () => {},
  title = "Cinema Hall Booking",
  subtitle = "Select your preferred seats",
}) => {

    const [bookedSeats, setBookedSeats] = useState(initialBookedSeats);
    const [isFetchingSeats, setIsFetchingSeats] = useState(true)
    const [isBooking, setIsBooking] = useState(false) //for button loading state


   const params = useParams()
   const searchParams = useSearchParams()
   const showtimeId = Number(params.showtimeid);
   const pricesParam = searchParams.get("prices");


   const defaultSeatTypes = {
     standard: { name: "Standard", price: 150.00, rows: [0, 1, 2] },
     vip: { name: "VIP", price: 350.00, rows: [3, 4, 5] },
     premium: { name: "Premium", price: 250.00, rows: [6, 7] },
  };

const seatTypes = useMemo(() => {
        let seatTypesFromUrl = {};
        
        if (pricesParam) {
            try {
                // Decode and Parse the JSON string
                const seatPrices = JSON.parse(decodeURIComponent(pricesParam));
                seatTypesFromUrl = convertSeatPrices(seatPrices);
            } catch (error) {
                console.error("Error processing seat prices from URL. Using default.", error);
            }
        }
        
        // Return dynamic data if available, otherwise return default
        return Object.keys(seatTypesFromUrl).length > 0 ? seatTypesFromUrl : defaultSeatTypes;
    }, [pricesParam]); // Recalculate only if pricesParam changes

    //console.log("seattype", seatTypes);

    //fetching boooked seats
    useEffect(() => {
      if(!showtimeId){
       toast.error("Showtime ID is missing in URL")
       setIsFetchingSeats(false)
       return
      }

      const fetchBookedSeats = async() =>{
        try {
          const result = await getBookedSeatsAction(showtimeId)
          if(result.success){
            setBookedSeats(result.bookedSeats)
          }else{
            toast.error(result.message)
          }
        } catch (error) {
          toast.error("Error connecting to the server to get seat status.");
            } finally {
                setIsFetchingSeats(false);
            }
      }
      fetchBookedSeats()

    }, [showtimeId])
    
   
  
  const colors = ["blue", "purple", "yellow", "green", "red", "indigo", "pink", "gray"];
  

  const bookedSeatsSet = useMemo(() => new Set(bookedSeats), [bookedSeats]);


  const initialSeats = useMemo(() => {
    const seats = [];
    for (let row = 0; row < layout.rows; row++) {
      const seatRow = [];
      const seatTypeInfo = getSeatTypeConfig(row, seatTypes, colors);

      for (let seat = 0; seat < layout.seatsPerRow; seat++) {
        // FIXED: Corrected seatId format to Row-Number (e.g., "A-1")
        const seatId = `${String.fromCharCode(65 + row)}-${seat + 1}`;

        seatRow.push({
          id: seatId,
          row: row, // Numerical row index (0-7)
          seat: seat + 1, // Seat number (1-12)
          type: seatTypeInfo?.type || "Standard",
          price: seatTypeInfo?.price || 150.00,
          color: seatTypeInfo?.color || "blue",
          // Status check now uses the Set for O(1) lookup
          status: bookedSeatsSet.has(seatId) ? "Booked" : "Available",
          selected: false,
        });
      }
      seats.push(seatRow);
    }
    return seats;
  }, [layout, seatTypes, bookedSeatsSet]);


  const [seats, setSeats] = useState(initialSeats);

  
  // Memoize selected seats for summary calculation
  const selectedSeats = useMemo(() => seats.flat().filter(s => s.selected), [seats]);
  

  const totalSelectedPrice = useMemo(() => 
    selectedSeats.reduce((sum, seat) => sum + seat.price, 0).toFixed(2), 
    [selectedSeats]
  );


   const ticketCount = selectedSeats.length;
  // Use 'Ticket' if count is 1, 'Tickets' otherwise, for the button text
  const ticketWord = ticketCount === 1 ? 'Ticket' : 'Tickets';
  

  // --- Styling Logic ---
  const getColorClass = useCallback((colorName) => {
    const colorMap = {
      blue: "bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200",
      purple: "bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200",
      yellow: "bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200",
      green: "bg-green-100 border-green-300 text-green-800 hover:bg-green-200",
      red: "bg-red-100 border-red-300 text-red-800 hover:bg-red-200",
      indigo: "bg-indigo-100 border-indigo-300 text-indigo-800 hover:bg-indigo-200",
      pink: "bg-pink-100 border-pink-300 text-pink-800 hover:bg-pink-200",
      gray: "bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200",
    };
    return colorMap[colorName] || colorMap.blue;
  }, []); // Dependency array is empty as colorMap is static

  const getSeatClassName = useCallback((seat) => {
    const baseClass = "w-8 h-8 sm:h-10 lg:w-12 lg:h-12 m-1 rounded-t-lg border-2 cursor-pointer transition-all duration-200 flex items-center justify-center text-xs sm:text-sm font-bold shadow-md";

    if (seat.status === "Booked") {
      return `${baseClass} bg-gray-400 border-gray-500 text-gray-600 cursor-not-allowed opacity-70 shadow-inner`;
    }
    
    if (seat.selected) {
      return `${baseClass} bg-green-500 border-green-700 text-white transform scale-105 shadow-xl ring-2 ring-green-500`;
    }

    return `${baseClass} ${getColorClass(seat.color)}`;
  }, [getColorClass]);


  // --- Interaction Logic ---
  const handleSeatClick = (rowIndex, seatIndex) => {
    
    // Find the seat using numerical indices (0-7 for row, 0-11 for seat index)
    const seatObj = seats[rowIndex][seatIndex];
    
    if (seatObj.status === "Booked") return; // Cannot select booked seats

    setSeats(prevSeats => 
        prevSeats.map((r, rIdx) => 
            r.map((s, sIdx) => {
                // Find the specific seat by its numerical indices
                if (rIdx === rowIndex && sIdx === seatIndex) {
                    // Toggle selection
                    return { ...s, selected: !s.selected };
                }
                return s;
            })
        )
    );
  };
  
  
  // --- Booking Completion Logic (now includes toast and reset) ---
 const handleBookingComplete = async() => {
   if(selectedSeats.length === 0){
    return
   }
   setIsBooking(true)
   try {
    const selectedSeatsData = selectedSeats.map(seat => ({
       id : seat.id,
       type: seat.type,
       row: seat.row,
       seat: seat.seat,
       price: Number(seat.price)
    }))
    const result = await bookTicketsAction({
      showtimeId: showtimeId,
      selectedSeatsData: selectedSeatsData
    })
    if(result.success){
      toast.success(result.message)
      setSeats(prevSeats => 
      prevSeats.map(r => r.map(s => ({ ...s, selected: false })))
      );
      setBookedSeats(prev => [...prev, ...selectedSeats.map(s => s.id)])
      onBookingComplete(result.ticketId)
    }else{
      toast.error(result.message)
    }
   } catch (error) {
      console.error(error.message)
      //toast.error(error)
        } finally {
            setIsBooking(false);
        }
 }


  // --- Rendering Helpers ---
  const renderSeatSection = (seatRow, startIndex, endIndex) => {
    return (
      <div className="flex">
        {seatRow.slice(startIndex, endIndex).map((seat, index) => {
          // Calculate the true numerical index for the seat within the row (0 to 11)
          const seatGlobalIndex = startIndex + index; 
          
          return (
            <div className={getSeatClassName(seat)} 
              key={seat.id}
              title = {`${seat.id} (${seat.type}) - ₹${seat.price.toFixed(2)}`}
              // Pass the numerical row index (seat.row) and the true seat index (seatGlobalIndex)
              onClick={() => handleSeatClick(seat.row, seatGlobalIndex)}
            >
              {seat.seat} {/* Display the seat number (1 to 12) */}
            </div>
          );
        })}
      </div>
    );
  };

  const renderLegend = () => (
    <div className="mt-8 pt-4 border-t border-gray-200">
        <h3 className="text-xl font-bold text-gray-700 mb-4 text-center">Seat Legend</h3>
        <div className="flex flex-wrap justify-center space-x-6 text-sm">
            {/* Render legend items based on seatTypes prop */}
            {Object.entries(seatTypes).map(([typeKey, config], index) => {
                const colorName = colors[index % colors.length];
                return (
                    <div key={typeKey} className="flex items-center m-2">
                        <span className={`w-5 h-5 rounded-full mr-2 border-2 ${getColorClass(colorName)}`}></span>
                        {config.name} (₹{config.price.toFixed(2)})
                    </div>
                );
            })}
            <div className="flex items-center m-2">
                <span className="w-5 h-5 rounded-full mr-2 bg-gray-400 border-gray-500"></span> Booked
            </div>
            <div className="flex items-center m-2">
                <span className="w-5 h-5 rounded-full mr-2 bg-green-500 border-green-700"></span> Selected
            </div>
        </div>
    </div>
  );


  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-10 border border-gray-100">
        
        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-[#96a20e] drop-shadow-2xl mb-2 ">{title}</h1>
          <p className="text-[gray] mb-8">{subtitle}</p>
        </div>

        {/* Screen */}
        <div className="w-3/4 mx-auto h-2 bg-linear-to-r from-gray-500 via-gray-800 to-gray-500 rounded-2xl shadow-xl"></div>
        <p className="text-center mb-10 uppercase text-gray-700 font-semibold text-sm mt-3">SCREEN THIS WAY</p>


        {/* Seat Map Container */}
        <div className="overflow-x-auto p-4 md:p-6 bg-gray-100 rounded-xl shadow-inner border border-gray-200">
            {isFetchingSeats ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    <span className="text-gray-600">Loading seat status...</span>
                </div>
            ) : (
                   <div className="flex flex-col items-center min-w-max">
                {seats.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex items-center mb-2">
                        {/* Row Label (A, B, C...) */}
                        <span className="w-10 text-center font-extrabold text-gray-700 mr-4 text-lg">
                            {String.fromCharCode(65 + rowIndex)}
                        </span>
                        
                        {/* Left Section of Seats */}
                        {renderSeatSection(row, 0, layout.aislePosition)}
                        
                        {/* Aisle Spacer */}
                        <div className="w-8 md:w-12 h-10"></div>
                        
                        {/* Right Section of Seats */}
                        {renderSeatSection(row, layout.aislePosition, layout.seatsPerRow)}
                    </div>
                ))}
            </div>
            )}
        </div>

        {/* Legend */}
        {renderLegend()}

        {/* Summary and Book Button */}
        <div className="mt-10 pt-6 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Order Summary</h3>
            
            <div className="mb-4">
                <p className="font-medium text-gray-600 mb-2">Selected Seats ({selectedSeats.length}):</p>
                <div className="flex flex-wrap" style={{ minHeight: '32px' }}>
                    {selectedSeats.map(s => (
                        <span key={s.id} className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-1 rounded-full m-1 border border-indigo-300">
                            {s.id} ({s.type})
                        </span>
                    ))}
                    {selectedSeats.length === 0 && <p className="text-gray-400 italic m-1">No seats selected yet.</p>}
                </div>
            </div>
            
            <div className="flex justify-between items-center md:text-xl font-extrabold text-gray-900 border-t pt-4">
                <span>Total Payable (INR):</span>
                <span>₹{totalSelectedPrice}</span>
            </div>
            
            <button
                // Use the new handler that includes the toast logic
                onClick={handleBookingComplete}
                disabled={selectedSeats.length === 0 || isBooking}
                className="mt-6 w-full px-6 cursor-pointer py-4 flex items-center justify-center bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-xl"
            >
              {isBooking ? (
                <> 
                    <Loader2 className="mr-2 h-7 w-8 animate-spin" /> Booking...
                </>
              ) : (
                  `Book ${selectedSeats.length ? selectedSeats.length : "your"} ${ticketWord}`
              )
            }
            </button>
        </div>
      </div>
      
    </div>
  );
};

export default TicketBookingPage;
