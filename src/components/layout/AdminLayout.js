// src/components/layout/AdminLayout.js
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import {
  LayoutDashboard,
  Menu,
  MessageSquare,
  QrCode,
  Settings,
  LogOut,
  ChevronLeft,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Menu Management",
      href: "/admin/menu",
      icon: <Menu className="w-5 h-5" />,
    },
    {
      name: "Feedback",
      href: "/admin/feedback",
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      name: "QR Codes",
      href: "/admin/qrcodes",
      icon: <QrCode className="w-5 h-5" />,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 h-full flex flex-col`}
      >
        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
          {isSidebarOpen ? (
            <h1 className="text-xl font-bold dark:text-white">RestaurantQR</h1>
          ) : (
            <span className="text-2xl font-bold dark:text-white">RQ</span>
          )}
          <div className="flex items-center gap-2">
            {isSidebarOpen && <ThemeToggle />}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <ChevronLeft
                className={`h-5 w-5 transition-transform ${
                  !isSidebarOpen ? "rotate-180" : ""
                }`}
              />
            </Button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    pathname === item.href
                      ? "bg-stone-100 dark:bg-stone-700 text-stone-900 dark:text-stone-100"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {item.icon}
                  {isSidebarOpen && <span className="ml-3">{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t dark:border-gray-700 p-4">
          <div className="flex items-center mb-4">
            <div className="bg-stone-200 dark:bg-stone-700 rounded-full p-2">
              <User className="h-6 w-6 text-stone-700 dark:text-stone-200" />
            </div>
            {isSidebarOpen && (
              <div className="ml-3">
                <p className="font-medium dark:text-white">{user?.name || "Admin User"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || ""}</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isSidebarOpen && <ThemeToggle />}
            <Button
              variant="outline"
              size={isSidebarOpen ? "default" : "icon"}
              className={isSidebarOpen ? "w-full" : ""}
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              {isSidebarOpen && <span className="ml-2">Logout</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700 p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold dark:text-white">
              {navItems.find((item) => item.href === pathname)?.name || "Admin"}
            </h2>
            {/* Added theme toggle for smaller screens where sidebar might be collapsed */}
            <div className="flex items-center">
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}