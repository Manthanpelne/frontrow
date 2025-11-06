import { getAdmin } from '@/actions/admin'
import NotFoundPage from '@/app/not-found'
import React from 'react'
import Sidebar from './components/sidebar'
import HeaderWrapper from '@/components/HeaderWrapper'

const AdminLayout = async({children}) => {

     const admin = await getAdmin()

     if(!admin.authorized){
        return <NotFoundPage/>
     }

  return (
    <div className='h-full'>
        <HeaderWrapper isAdminPage={true}/>
        <div className='flex h-full w-56 flex-col top-0 fixed inset-y-0 z-0 border-r'>
          <Sidebar/>
        </div>
        <main className='my-20 md:pl-56 h-full md:my-32'>{children}</main>
    </div>
  )
}

export default AdminLayout