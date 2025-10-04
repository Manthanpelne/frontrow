"use server";

import { auth } from "@/auth";
import { db } from "@/lib/prisma";

export async function getAdmin(){

const session = await auth()
if (!session?.user?.email){
    return {authorized: false, reason: "not logged in"}
}
 const loggedInUser = await db.user.findUnique({
            where : {
                email : session?.user?.email
            }
        })
 if(!loggedInUser || loggedInUser?.role !== "ADMIN"){
    return {authorized: false, reason: "not an admin"}
 }

 return {authorized:true, loggedInUser}
}