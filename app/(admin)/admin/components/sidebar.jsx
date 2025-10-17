"use client"

import { cn } from '@/lib/utils'
import { Camera, LayoutDashboard, Theater, Ticket, Tv, Video } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'


const routes = [
  {
    label:"Dashboard",
    icon:LayoutDashboard,
    href: "/admin",
  },
  {
  label:"Movies",
    icon:Video,
    href: "/admin/movies",
  },
    {
  label:"Tickets",
    icon:Ticket,
    href: "/admin/tickets",
  }
]

const Sidebar = () => {

  const pathname = usePathname()

  return (
    <>
    {/* desktop sidebar */}
    <div className='hidden md:flex flex-col border-r overflow-y-auto h-full bg-white shadow-sm gap-3'>
      {routes.map((route)=>{
        return(
          <Link key={route.href} href={route.href} className={cn("flex items-center gap-3 px-4 hover:bg-gray-100 transition-all duration-200 py-2 text-black/70 hover:text-black",
            pathname == route.href ? "bg-green-50 hover:bg-green-50  text-green-700" : "null"
          )}>
            <route.icon className='h-5 w-5' />
            {route.label}
          </Link>
        )
      })}
    </div>

    {/* mobile sidebar */}
    <div className='md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-2xl border-t flex justify-around items-center h-16'>
         {routes.map((route)=>{
        return(
          <Link key={route.href} href={route.href} className={cn("flex flex-col items-center gap-1 px-4 hover:bg-gray-100 transition-all duration-200 py-3 flex-1 text-black/70 hover:text-black",
            pathname == route.href ? "bg-green-50 hover:bg-green-50  text-green-700" : "null"
          )}>
            <route.icon className='h-5 w-5' />
            {route.label}
          </Link>
        )
      })}
    </div>
    </>
  )
}

export default Sidebar