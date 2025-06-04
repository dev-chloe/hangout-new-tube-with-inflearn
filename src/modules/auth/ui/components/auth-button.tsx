"use client";

import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { UserCircleIcon } from "lucide-react";

export default function AuthButton() {
  return (
    <>
      <SignedIn>
        <UserButton />
        {/* Add menu itmes for Studio and User profile */}
      </SignedIn>

      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="outline" className="px-4 text-sm font-medium text-blue-500 hover:text-blue-900 border-blue-200 rounded-full shadow-none hover:bg-blue-200">
            <UserCircleIcon />
            Sign in
          </Button>
        </SignInButton>
      </SignedOut>
    </>
  )
}
