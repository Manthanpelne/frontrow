
"use client"

import React, { useEffect, useState, useTransition } from 'react'
import SignIn from './sign-in-button'
import Link from 'next/link'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'

const Header = ({isAdminPage = false, initialIsAdmin, initialSession}) => {

  const isAdmin = initialIsAdmin;

     const router = useRouter(); 
  
     const [isPending, startTransition] = useTransition();
     
     const handleClick = (e) => {
    startTransition(() => {
      router.push('/admin/'); 
    });
  };
  


  return (
<header className="fixed top-6 w-[50%] left-1/2 -translate-x-1/2 rounded-2xl bg-[gray]/10 backdrop-blur-md z-50">
      <nav className="mx-auto px-8 py-4 flex text-[#ECF86E] items-center justify-between">
        <a href='/' className='font-extrabold uppercase text-sm rounded-sm bg-[#ECF86E] text-black p-2'>FrontRow</a>
        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          {/* ... (Your existing logic for isAdminPage) ... */}

          {isAdminPage ? (
            <>
              <Link href="/">
                <Button variant="outline" className="flex items-center gap-2">
                  <span>Back to App</span>
                </Button>
              </Link>
            </>
          ) : (
            <div>
              {!isAdmin && (
                <Link
                  href="/bookings"
                  className="text-gray-600 hover:text-blue-600 flex items-center gap-2"
                >
                  <Button variant="outline">
                    <span className="hidden md:inline">My Bookings</span>
                  </Button>
                </Link>
              )}

              {isAdmin && (
                  <Button 
                    className="flex items-center cursor-pointer border-2 border-[#6d6e63] gap-2"
                    onClick={handleClick}
                    disabled={isPending} 
                  >
                    {/* Loader logic applied here (same as previous fix) */}
                    {isPending ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#ECF86E]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </div>
                    ) : (
                      <span className="hidden md:inline">Admin Portal</span>
                    )}
                  </Button>
                
              )}
            </div>
          )}
   
         
          <SignIn initialSession={initialSession}/>

        </div>
      </nav>
    </header>
  );
};


export default Header