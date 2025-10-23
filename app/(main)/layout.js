import React from 'react'

 export const metadata = {
  title: 'Movies | FrontRow',
  description: 'Browse movies and book movie tickets'
}


export default function MainLayout({children}){
  return <div className='container mx-auto my-32'>{children}</div>
}
