import { Button } from "@/components/ui/button";
import { UserCircleIcon } from "lucide-react";

export default function AuthButton() {
  // TODO: Add different auth states
  return (
    <Button variant="outline" className="px-4 text-sm font-medium text-blue-500 hover:text-blue-900 border-blue-200 rounded-full shadow-none hover:bg-blue-200">
      <UserCircleIcon />
      Sign in
    </Button>
  )
}
