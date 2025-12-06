"use client";

import React from 'react';
import { Twitter, Instagram, Linkedin } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils'; // Assuming you have a utility function for combining classes

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  
  // 💡 Check if the current path includes "/admin"
  const isAdminPath = pathname.includes("/admin");

  // 💡 Conditional class to hide the footer on small screens if it's an admin path
  const visibilityClass = isAdminPath ? 'hidden md:block' : 'block';

  return (
    <footer 
      className={
        `relative  bg-black text-white pt-10 pb-6 mt-20 border-t border-gray-700",
        ${visibilityClass} // Apply the conditional visibility class
      `}
    >
      <div className="px-4 sm:px-6 lg:px-12">
        
        {/* Main Content Row: Logo/Brand and Links */}
        <div className="flex items-center justify-between gap-8 mb-8 border-b border-gray-700 pb-8">
          
          {/* Column 1: Brand Info */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xl font-extrabold uppercase text-[#ECF86E] tracking-wide">
              FrontRow
            </h3>
            <p className="mt-2 text-sm text-[gray]">
              Your gateway to premium cinema experiences. Book your favorite seat now!
            </p>
          </div>

          {/* Column 4: Social Media Icons */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-md font-semibold text-gray-200 uppercase mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-yellow-300 transition duration-150 rounded-full p-1 border border-gray-700 hover:border-yellow-300">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-yellow-300 transition duration-150 rounded-full p-1 border border-gray-700 hover:border-yellow-300">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-gray-400 hover:text-yellow-300 transition duration-150 rounded-full p-1 border border-gray-700 hover:border-yellow-300">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="text-center md:flex md:justify-between md:items-center">
          <p className="text-sm text-[gray]">
            &copy; {currentYear} FrontRow Ticketing System. All rights reserved.
          </p>
          <div className="mt-3 md:mt-0">
            <a href="/terms" className="text-xs text-gray-500 hover:text-yellow-300 transition duration-150">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;