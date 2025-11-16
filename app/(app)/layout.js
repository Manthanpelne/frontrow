import HeaderWrapper from '@/components/HeaderWrapper'
import React from 'react'


export default function AppLayout({children}){
  return <div className='my-24 sm:my-28 md:my-32 min-h-screen'>
    <HeaderWrapper isAdminPage={false} />
    {children}</div>
}