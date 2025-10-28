// components/Application/Admin/UserDropdown.jsx
"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import Link from "next/link";
import { useSelector } from "react-redux";

import { IoShirtOutline } from "react-icons/io5";
import { MdOutlineShoppingBag } from "react-icons/md";
import LogoutButton from "./LogoutButton";

// import adminLogo from "@/public/assets/images/advertising-banner.png"

const UserDropdown = () => {

    const auth = useSelector((store) => store.authStore.auth)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Your trigger content */}
        <Avatar>
  <AvatarImage src="https://github.com/shadcn.png" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="ms-5 w-44">
        <DropdownMenuLabel>
            <p className="font-semibold">{auth?.name}</p>
            {/* <div className="font-normal text-sm "> {auth?.email}</div> */}
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
            <Link href="" className="cursor-pointer">
                <IoShirtOutline/>
                New Product
            </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
            <Link href="" className="cursor-pointer">
                <MdOutlineShoppingBag/>
                Orders
            </Link>
        </DropdownMenuItem>

        <LogoutButton/>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
