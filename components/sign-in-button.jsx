"use client"

import { LogOut, User2 } from "lucide-react";
import { Button } from "./ui/button";
import { signInAction, signOutAction } from "@/actions/auth-actions";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";



export default function SignIn({initialSession}) {

  const user = initialSession?.user;

  return user ? (
    <>
      <div className="flex items-center gap-2">
        <form
          // Pass the imported Server Action directly to the `action` prop
          action={signOutAction}
        >
            <Tooltip>
      <TooltipTrigger asChild>
      <Button className="text-xs md:text-sm border-2 border-[#6d6e63]  cursor-pointer" type="submit">
            <span className="hidden sm:block">Logout</span>
            <LogOut/>
          </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Logout</p>
      </TooltipContent>
    </Tooltip>
         
        </form>
      </div>
    </>
  ) : (
    <>
      <div className="flex items-center gap-2">
        <form
          // Pass the imported Server Action directly to the `action` prop
          action={signInAction}
        >
          <Button className="border-2 border-[#6d6e63] cursor-pointer" type="submit">
            Sign In <User2 className=""/>
          </Button>
        </form>
      </div>
    </>
  );
}