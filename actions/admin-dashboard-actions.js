"use server";

import { db } from "@/lib/prisma";

// Fetches the total number of tickets ever booked
export async function getTotalTicketsCountAction() {
    try {
        const count = await db.ticket.count();
        return { success: true, count };
    } catch (error) {
        console.error("Error fetching total tickets count:", error.message);
        return { success: false, count: 0 };
    }
}

// Fetches the total number of registered users
export async function getTotalUsersCountAction() {
    try {
        const count = await db.user.count();
        return { success: true, count };
    } catch (error) {
        console.error("Error fetching total users count:", error.message);
        return { success: false, count: 0 };
    }
}

// Fetches the total number of movies currently in the database
export async function getTotalMoviesCountAction() {
    try {
        const count = await db.movie.count();
        return { success: true, count };
    } catch (error) {
        console.error("Error fetching total movies count:", error.message);
        return { success: false, count: 0 };
    }
}

// Fetches the total revenue from all booked tickets
export async function getTotalRevenueAction() {
    try {
        // Aggregation to sum all totalPrice fields
        const result = await db.ticket.aggregate({
            _sum: {
                totalPrice: true,
            },
        });
        
        // CRITICAL: Convert the resulting Decimal object to a string for serialization
        const totalRevenue = result._sum.totalPrice ? result._sum.totalPrice.toString() : "0.00";

        return { success: true, revenue: totalRevenue };
    } catch (error) {
        console.error("Error fetching total revenue:", error.message);
        return { success: false, revenue: "0.00" };
    }
}
