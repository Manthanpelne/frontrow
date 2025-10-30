"use client"

import { Button } from "./ui/button";
import { signInAction, signOutAction } from "@/actions/auth-actions";



export default function SignIn({initialSession}) {

  const user = initialSession?.user;

  return user ? (
    <>
      <div className="flex items-center gap-2">
        <form
          // Pass the imported Server Action directly to the `action` prop
          action={signOutAction}
        >
          <Button className="border text-sm cursor-pointer p-2" type="submit">
            Logout
          </Button>
        </form>
      </div>
    </>
  ) : (
    <>
      <div className="flex items-center gap-2">
        <h1>you are not logged in</h1>
        <form
          // Pass the imported Server Action directly to the `action` prop
          action={signInAction}
        >
          <button className="border cursor-pointer p-2" type="submit">
            Signin with Google
          </button>
        </form>
      </div>
    </>
  );
}