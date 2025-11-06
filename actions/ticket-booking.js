"use server";

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { Decimal } from "decimal.js";
import { redirect } from "next/navigation";

//function to fetch booked seats for specific showtime if available
export async function getBookedSeatsAction(showtimeId) {
  if (!showtimeId) {
    return {
      success: false,
      message: "Showtime ID is required",
      bookedSeats: [],
    };
  }
  try {
    const bookedSeatRecord = await db.BookedSeat.findMany({
      where: {
        showtimeId: showtimeId,
      },
      select: {
        seatId: true,
      },
    });
    const seatIds = bookedSeatRecord.map((record) => record.seatId);
    return {
      success: true,
      message: `Found ${seatIds.length} booked seats`,
      bookedSeats: seatIds,
    };
  } catch (error) {
    console.error("Error fetching booked seats:", error.message);
    return {
      success: false,
      bookedSeats: [],
      message: "Failed to fetch current seat status.",
    };
  }
}


//booking tickets action
export async function bookTicketsAction({ showtimeId, selectedSeatsData }) {
  const session = await auth();
  const userEmail = session?.user?.email;

   if (!userEmail) {
    // Fail fast if the user is not authenticated
    return {
      success: false,
      message: "Please log in to book tickets.",
    };
  }

  const loggedInUser = await db.user.findUnique({
    where: {
      email: userEmail,
    },
    select: { id: true },
  });

  const USERID = loggedInUser?.id;

  // --- 1. Security & Authentication Checks ---
  if (!USERID) {
    // Fail fast if the user is not authenticated
    return {
      success: false,
      message: "Unauthorized! Please log in to book tickets.",
    };
  }

  // --- 2. Input Validation ---
  if (!showtimeId) {
    return {
      success: false,
      message: "Showtime ID missing. Cannot proceed with booking.",
      bookedSeats: [],
    };
  }

  if (!selectedSeatsData || selectedSeatsData.length === 0) {
    return {
      success: false,
      message: "No seats were selected for booking.",
    };
  }

  // Extract all seat IDs for concurrency checks
  const seatIds = selectedSeatsData.map((s) => s.id);

  // Calculate total price using Decimal for precision (Crucial for currency)
  const totalPrice = selectedSeatsData.reduce(
    (sum, seat) => sum.plus(new Decimal(seat.price)),
    new Decimal(0)
  );

  try {
    // --- 3. Database Transaction for Atomicity ---
    const result = await db.$transaction(async (tx) => {
      // --- 4. Concurrency Check (Double Booking Prevention) ---
      const existingBookings = await tx.BookedSeat.findMany({
        where: {
          showtimeId: showtimeId,
          seatId: { in: seatIds },
        },
      });

      if (existingBookings.length > 0) {
        const conflictingSeats = existingBookings.map((b) => b.seatId).join(", ");
        throw new Error(
          `The following seats/seat ie ${conflictingSeats} were booked by someone else. Please select new seats.`
        );
      }

      // --- 5. Create the main Ticket record ---
      const newTicket = await tx.Ticket.create({
        data: {
          totalPrice: totalPrice,
          userId: USERID, // Use the secure, server-side USERID
          showtimeId: showtimeId,
        },
      });

      const ticketId = newTicket.id;

      // --- 6. Prepare data for creating TicketSeat and BookedSeat records ---

      // a) TicketSeat
      const ticketSeatData = selectedSeatsData.map((seat) => ({
        ticketId: ticketId,
        seatId: seat.id,
        row: String.fromCharCode(65 + seat.row),
        seat: String(seat.seat),
        type: seat.type,
        price: new Decimal(seat.price),
      }));

      // b) BookedSeat
      const bookedSeatData = selectedSeatsData.map((seat) => ({
        seatId: seat.id,
        showtimeId: showtimeId,
        ticketId: ticketId,
      }));

      // --- 7. Bulk Create Records ---
      await tx.TicketSeat.createMany({ data: ticketSeatData });
      await tx.BookedSeat.createMany({ data: bookedSeatData });

      return { ticketId };
    });

    return {
      success: true,
      message: `Successfully booked ${selectedSeatsData.length} tickets!`,
      ticketId: result.ticketId,
    };
  } catch(error) {
    return {
      success: false,
      message: "Booking failed, please try again.",
    };
  }
}

//get booked tickets of users for admin side
export async function getBookedTicketsAction() {
  const session = await auth();
  const userEmail = session?.user?.email;

   if (!userEmail) {
    // Fail fast if the user is not authenticated
    return {
      success: false,
      message: "Please Sign In first!",
    };
  }

  const loggedInUser = await db.user.findUnique({
    where: {
      email: userEmail,
    },
    select: { id: true, role: true },
  });

  const role = loggedInUser?.role;

  // --- 1. Security & Authentication Checks ---
  if (!loggedInUser || role !== "ADMIN") {
    // Fail fast if the user is not authenticated
    return {
      success: false,
      message: "Unauthorized!",
      tickets: [],
    };
  }

  try {
    const bookedTickets = await db.ticket.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
        showtime: {
          select: {
            time: true,
            theater: true,
            movie: {
              select: {
                title: true,
              },
            },
          },
        },
        seats: {
          select: {
            row: true,
            seat: true,
            type: true,
            price: true,
          },
        },
      },
    });
    const TicketDetails = bookedTickets.map((ticket) => ({
      id: ticket.id,
      bookedBy: ticket.user.name,
      userEmail: ticket.user.email,
      movieTitle: ticket.showtime.movie.title,
      showtime: `${ticket.showtime.time} (${ticket.showtime.theater})`,
      totalPrice: ticket.totalPrice.toString(),// This is a Decimal object
      bookingDate: ticket.createdAt,
      seatDetails: ticket.seats.map((s) => `${s.row}${s.seat} (${s.type})`).join(", "),
      seatCount: ticket.seats.length,
    }));
    return {
            success: true,
            message: `Successfully retrieved ${bookedTickets.length} total bookings.`,
            tickets: TicketDetails,
    };
  } catch (error) {
       console.error("Error fetching booked tickets:", error.message);
        return {
            success: false,
            message: "Failed to retrieve booking data.",
            tickets: [],
        };
    }
}


// Assume 'db' is your Prisma client instance and 'auth'/'redirect' are defined.
export async function getUsersBookingsAction() {
    // 1. Authentication and Authorization Check
    const session = await auth();
    const userEmail = session?.user?.email;

    if (!userEmail) {
        // Fail fast if the user is not authenticated
        // Note: 'redirect' is usually a Next.js/framework utility.
        redirect("/")
        return {
            success: false,
            message: "Please Sign In first!",
        };
    }

    try {
        // 2. Fetch User and their Booked Tickets with all necessary details
        // We use a single query with nested 'include' statements to minimize database roundtrips.
        const userWithBookings = await db.user.findUnique({
            where: {
                email: userEmail,
            },
            select: {
                id: true,
                // Include the tickets booked by the user
                ticketsBooked: {
                    // Order by creation date to show recent bookings first
                    orderBy: {
                        createdAt: 'desc',
                    },
                    select: {
                        id: true,
                        totalPrice: true,
                        createdAt: true, // Booking date/time

                           // Include the specific seats that were part of this ticket purchase
                        seats: {
                            select: {
                                row: true,
                                seat: true,
                                type: true,
                                price: true,
                            }
                        },

                        // Include the related showtime details
                        showtime: {
                            select: {
                                time: true,
                                theater: true,
                                // Include the related movie details for the showtime
                                movie: {
                                    select: {
                                        title: true,
                                        poster: true,
                                        duration: true,
                                        releaseDate: true,
                                    }
                                }
                            }
                        }
                    }
                },
            },
        });

        // 3. Handle case where user is not found (though authenticated)
        if (!userWithBookings) {
            return {
                success: false,
                message: "User not found.",
                bookings: [],
            };
        }

   // 3.Mapping over the results to convert all Decimal objects to strings.
        const bookings = userWithBookings.ticketsBooked.map(ticket => {
            // Convert the ticket's total price
            ticket.totalPrice = ticket.totalPrice.toString();

            // Convert the price for each seat within the ticket
            ticket.seats = ticket.seats.map(seat => {
                seat.price = seat.price.toString();
                return seat;
            });
            
            if (ticket.showtime?.movie?.releaseDate) {
                ticket.showtime.movie.releaseDate = ticket.showtime.movie.releaseDate.toISOString();
            }

            return ticket;
        });
        //console.log("bookings",bookings)

        return {
            success: true,
            message: "Bookings fetched successfully.",
            bookings: bookings,
        };

    } catch (error) {
        console.error("Error fetching user bookings:", error);
        return {
            success: false,
            message: "An error occurred while fetching your bookings.",
            bookings: [],
        };
    }
}