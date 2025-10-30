"use server";

import { signIn, signOut } from "@/auth";



// Action for signing out
export async function signOutAction() {
  await signOut();
}

// Action for signing in with Google
export async function signInAction() {
  await signIn("google");
}