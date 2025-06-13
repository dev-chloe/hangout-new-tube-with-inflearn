import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import AuthButton from "@/modules/auth/ui/components/auth-button";
import StudioUploadModal from "../studio-upload-modal";

export default function StudioNavbar() {
  return(
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white flex items-center px-2 pr-5 z-50  border-b shadow-md">
      <div className="flex items-center gap-4 w-full justify-between">
        <div className="flex items-center flex-shrink-0">
          <SidebarTrigger />
          <Link href="/studio">
            <p className="p-4 flex items-center gap-1">
              <Image src="/logo.svg" width={32} height={24} alt="newtube logo"/>
              <span className="text-xl font-semibold tracking-tight">Studio</span>
            </p>
          </Link>
        </div>

        <div className="flex-shrink-0 items-center flex gap-4">
          <StudioUploadModal />
          <AuthButton />
        </div>
      </div>
    </nav>
  )
}
