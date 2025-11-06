"use client";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  getTotalTicketsCountAction,
  getTotalUsersCountAction,
  getTotalMoviesCountAction,
  getTotalRevenueAction,
} from "@/actions/admin-dashboard-actions"; // Import new actions

// Component for a single metric card
const MetricCard = ({ title, value, icon, bgColor, textColor }) => (
  <div
    className={`p-6 ${bgColor} rounded-xl shadow-lg transform transition duration-300 hover:scale-[1.02]`}
  >
    <div className="flex items-center justify-between">
      <div className={`text-4xl font-extrabold ${textColor}`}>{value}</div>
      <div className={`text-4xl ${textColor}`}>{icon}</div>
    </div>
    <div className={`mt-2 text-sm font-medium text-white/90`}>{title}</div>
  </div>
);

const AdminPage = () => {
  // --- State for Dashboard Metrics ---
  const [metrics, setMetrics] = useState({
    tickets: null,
    revenue: null,
    users: null,
    movies: null,
  });
  const [metricsLoading, setMetricsLoading] = useState(true);

  // --- Data Fetching Logic ---

  // 1. Fetch Dashboard Metrics
  const fetchMetrics = useCallback(async () => {
    setMetricsLoading(true);
    try {
      const [ticketsResult, usersResult, moviesResult, revenueResult] =
        await Promise.all([
          getTotalTicketsCountAction(),
          getTotalUsersCountAction(),
          getTotalMoviesCountAction(),
          getTotalRevenueAction(),
        ]);

      setMetrics({
        tickets: ticketsResult.success ? ticketsResult.count : "N/A",
        users: usersResult.success ? usersResult.count : "N/A",
        movies: moviesResult.success ? moviesResult.count : "N/A",
        // Format revenue string as currency
        revenue: revenueResult.success
          ? parseFloat(revenueResult.revenue).toFixed(2)
          : "0.00",
      });
    } catch (error) {
      toast.error("Failed to load dashboard metrics.");
      console.error(error);
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  // --- Effects ---
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return (
    <div className="p-4 md:p-8 bg-[#f8f8e9]">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-5">
        Administrator Portal Dashboard
      </h1>

      {/* --- 1. Dashboard Metrics Grid --- */}
      <div className="bg-white rounded-2xl px-10 flex items-center">
        <div className="w-1/2 grid grid-cols-1 h-max sm:grid-cols-2 gap-6">
          {metricsLoading ? (
            <div className="lg:col-span-4 text-center p-4 text-gray-500">
              Loading Dashboard Metrics...
            </div>
          ) : (
            <>
              <MetricCard
                title="Total Revenue"
                value={`₹${metrics.revenue}`}
                icon="💰"
                bgColor="bg-indigo-600"
                textColor="text-white"
              />
              <MetricCard
                title="Tickets Booked"
                value={metrics.tickets}
                icon="🎫"
                bgColor="bg-green-600"
                textColor="text-white"
              />
              <MetricCard
                title="Registered Users"
                value={metrics.users}
                icon="👤"
                bgColor="bg-blue-600"
                textColor="text-white"
              />
              <MetricCard
                title="Movies in System"
                value={metrics.movies}
                icon="📽️"
                bgColor="bg-yellow-600"
                textColor="text-white"
              />
            </>
          )}
        </div>
        <div className="w-1/2">
          <img className="h-[400px] w-full" src="/graph.jpg" alt="" />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
