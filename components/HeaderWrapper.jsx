"use server"

import { checkUser } from '@/lib/checkUser';
import React from 'react'
import Header from './Header';
import { auth } from '@/auth';

const HeaderWrapper = async ({ isAdminPage = false }) => {
  // 1. Fetch data on the server, where `headers()` and server context are available
  const user = await checkUser();
  const isAdmin = user?.role === "ADMIN";

  const session = await auth()

  // 2. Pass the fetched data down to the Client Component
  return (
    <Header 
      isAdminPage={isAdminPage} 
      initialIsAdmin={isAdmin} // Pass the isAdmin flag
      initialSession={session}
    />
  );
};

export default HeaderWrapper;