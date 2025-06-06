// src/components/layout/CustomerLayout.js
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { restaurantService } from "@/lib/api";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTheme } from "next-themes";

export default function CustomerLayout({ children }) {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadRestaurant() {
      try {
        // Get restaurantId from the URL or query params
        const restaurantId = params.restaurantId;

        if (restaurantId) {
          const response = await restaurantService.getRestaurantPublic(
            restaurantId
          );
          setRestaurant(response.data.data);
        }
      } catch (error) {
        console.error("Error loading restaurant", error);
      } finally {
        setLoading(false);
      }
    }

    loadRestaurant();
  }, [params]);

  // Apply restaurant branding if available
  const headerStyle = restaurant
    ? {
        backgroundColor: restaurant.primaryColor || "#78716c",
        color: "#ffffff",
      }
    : { backgroundColor: "#78716c", color: "#ffffff" };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-stone-700 dark:border-stone-300"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header style={headerStyle} className="py-4 px-6 shadow-md relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {restaurant?.logo && (
              <div className="mr-3">
                <Image
                  src={restaurant.logo}
                  alt={restaurant.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
            )}
            <h1 className="text-xl font-bold">
              {restaurant?.name || "Restaurant"}
            </h1>
          </div>
          {mounted && <ThemeToggle />}
        </div>
      </header>

      <main className="flex-grow container mx-auto py-6 px-4">{children}</main>

      <footer className="py-4 px-6 bg-gray-100 dark:bg-gray-800 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>Powered by RestaurantQR</p>
      </footer>
    </div>
  );
}