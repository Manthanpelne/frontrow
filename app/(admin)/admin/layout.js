import { getAdmin } from '@/actions/admin'
import NotFoundPage from '@/app/not-found'
import Header from '@/components/Header'
import React from 'react'

const AdminLayout = async({children}) => {

     const admin = await getAdmin()

     if(!admin.authorized){
        return <NotFoundPage/>
     }

  return (
    <div className='h-full'>
        <Header isAdminPage={true}/>
        <main className='my-20'>{children}</main>
    </div>
  )
}

export default AdminLayout