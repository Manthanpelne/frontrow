
"use client"

import React, { useTransition } from 'react'
import SignIn from './sign-in-button'
import Link from 'next/link'
import { Button } from './ui/button'
import { usePathname, useRouter } from 'next/navigation'

const Header = ({isAdminPage = false, initialIsAdmin, initialSession}) => {

  const isAdmin = initialIsAdmin;

     const router = useRouter(); 
     const pathname = usePathname()

     console.log("isadminpage",isAdminPage)
  
     const [isPending, startTransition] = useTransition();
     
     const handleClick = (e) => {
    startTransition(() => {
      router.push('/admin/'); 
    });
  };

  const handleBookingClick=()=>{
    startTransition(()=>{
      router.push("/bookings")
    })
  }
  
    const bookingPath = pathname.includes("/bookings");
console.log("bookingpath",bookingPath)
  // 💡 Conditional class to hide the footer on small screens if it's an admin path
  const visibilityClass = bookingPath ? 'hidden' : 'block';


  return (
<header className="fixed top-6 w-[90%] md:w-[50%] left-1/2 -translate-x-1/2 rounded-2xl bg-[gray]/10 backdrop-blur-sm z-50">
      <nav className="mx-auto px-2 py-2 sm:py-4 sm:px-4 flex gap-2 sm:gap-5 items-center justify-between">
        <a href='/' className='font-extrabold uppercase text-xs sm:text-sm rounded-sm border-2 border-[white] bg-[#ECF86E] text-black p-2'>FrontRow</a>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-1 sm:space-x-3 md:space-x-4">
          
          {isAdminPage ? (
            // 🚀 CASE 1: On the Admin Page (Admin Folder)
            //    Only render the 'Back to App' button.
            <Link href="/">
              <Button className="flex cursor-pointer hover:bg-[#414140] shadow-md hover:shadow-xl transition-all duration-300 items-center gap-2">
                <span>Back to App</span>
              </Button>
            </Link>
          ) : (
            // 🏡 CASE 2: On the Main App Pages (App Folder)
            //    Render My Bookings, Admin Portal, and Sign In/Out.
            <>
              {/* My Bookings Link (Non-Admin User) */}
               {!isAdmin  && (
                <Button 
                  className={`${visibilityClass}  hover:bg-[#414140] shadow-md hover:shadow-xl transition-all duration-300 min-w-28 py-0 items-center cursor-pointer border-2 border-[#6d6e63] gap-2}`}
                  onClick={handleBookingClick}
                  disabled={isPending} 
                >
                  {isPending ? (
                    // Loader SVG...
                      <svg className="animate-spin text-yellow-600 m-auto h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                  
                  ) : (
                    <span className="inline text-xs sm:text-sm">My Bookings</span>
                  )}
                </Button>
               )}
              

              {/* Admin Portal Button (Admin User only) */}
              {isAdmin  && (
                <Button 
                  className="flex hover:bg-[#414140] shadow-md hover:shadow-xl transition-all duration-300 items-center text-xs md:text-sm cursor-pointer border-2 border-[#6d6e63] gap-2"
                  onClick={handleClick}
                  disabled={isPending} 
                >
                  {isPending ? (
                    // Loader SVG...
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#ECF86E]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </div>
                  ) : (
                    <span className=" inline">Dashboard</span>
                  )}
                </Button>
              )}
              
            </>
          )}
          {/* 🔑 Logout/SignIn Button (Visible only on non-admin pages) */}
          <SignIn initialSession={initialSession}/>
        </div>
      </nav>
    </header>
  );
};


export default Header