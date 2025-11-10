import { auth } from "@/auth";
import { db } from "./prisma";

export async function checkAdminAuth(){
      const session = await auth();
    if (!session?.user?.email) {
      return { authorized: false, reason: "not logged in" };
    }

    const loggedInUser = await db.user.findUnique({
      where: {
        email: session?.user?.email,
      },
    });
    if (!loggedInUser) throw new Error("User does not exist");

        if (loggedInUser.role !== 'ADMIN') {
     return { authorized: false, reason: "Unauthorized! Only admin can access" };
   }
}