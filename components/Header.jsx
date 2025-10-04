import React from 'react'
import SignIn from './sign-in-button'
import { checkUser } from '@/lib/checkUser'
import Link from 'next/link'
import { Button } from './ui/button'

const Header = async({isAdminPage = false}) => {

 const user = await checkUser()
const isAdmin = user?.role === "ADMIN"
 console.log("isadminPage",isAdminPage)

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <nav className="mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className='font-bold text-lg'>FrontRow</h1>
        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
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
                <Link href="/admin">
                  <Button variant="outline" className="flex items-center gap-2">
                    <span className="hidden md:inline">Admin Portal</span>
                  </Button>
                </Link>
              )}
            </div>
          )}

         <SignIn/>

        </div>
      </nav>
    </header>
  );
};


//   const user = await checkUser()
//   const isAdmin = user?.role === "ADMIN"
//   console.log("isadmin",isAdmin)
//   return (
//     <header>
//     <div className='flex justify-between px-10 py-2'>
//       <p>frontRow</p>
   
//     <div className='flex items-center gap-4'>
      
//        {isAdmin && !isAdminPage ? 
//       <>
//     <Link href="/admin">
//       <Button>Admin Panel</Button>
//     </Link>
//       </> 
//       : 
//       <>
//        <Link href="/bookings">
//       <Button>My Bookings</Button>
//     </Link>
//       </>}
//     <SignIn/>
    
//     </div>
//     </div>
//     </header>
//   )
// }

export default Header