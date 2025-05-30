"use client"; 

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ShoppingBag, Heart, LogOut } from "lucide-react";
import { logout } from "@/service/authService";

export default function AccountSidebar() {
  const pathname = usePathname();

  const handleLogout = async() => {
    localStorage.clear();
    await logout();
    location.replace("/login");
  };

  const activePage = pathname.split("/")[2] || undefined;
  // (activePage);

  return (
    <div className='bg-gray-50 rounded overflow-hidden'>
      <Link
        href='/my-account'
        className={`flex items-center gap-3 px-6 py-4 ${
          activePage === undefined
            ? "bg-yellow-400 text-black font-medium"
            : "hover:bg-gray-100"
        }`}
      >
        <User size={20} />
        <span>My Profile</span>
      </Link>

      <Link
        href='/my-account/order'
        className={`flex items-center gap-3 px-6 py-4 ${
          activePage === "order"
            ? "bg-yellow-400 text-black font-medium"
            : "hover:bg-gray-100"
        }`}
      >
        <ShoppingBag size={20} />
        <span>Order</span>
      </Link>

      <Link
        href='/my-account/wishlist'
        className={`flex items-center gap-3 px-6 py-4 ${
          activePage === "wishlist"
            ? "bg-yellow-400 text-black font-medium"
            : "hover:bg-gray-100"
        }`}
      >
        <Heart size={20} />
        <span>Wishlist</span>
      </Link>

      <button
        onClick={handleLogout}
        className='w-full flex items-center gap-3 px-6 py-4 text-left cursor-pointer hover:bg-gray-100'
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </div>
  );
}
