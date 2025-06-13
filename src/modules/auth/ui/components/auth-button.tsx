"use client";

import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { ClapperboardIcon, UserCircleIcon } from "lucide-react";

export default function AuthButton() {
  return (
    <>
      <SignedIn>
        <UserButton>
          <UserButton.MenuItems>
            {/* Add User profile menu button */}
            <UserButton.Link
              href="/studio"
              label="Studio"
              labelIcon={<ClapperboardIcon className="size-4" />}
            />
            <UserButton.Action label="manageAccount" />
          </UserButton.MenuItems>
        </UserButton>
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
