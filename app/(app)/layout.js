import HeaderWrapper from '@/components/HeaderWrapper'
import React from 'react'

 export const metadata = {
  title: 'Movies | FrontRow',
  description: 'Browse movies and book movie tickets'
}


export default function AppLayout({children}){
  return <div className='my-24 md:my-32 min-h-screen'>
    <HeaderWrapper isAdminPage={false} />
    {children}</div>
}
