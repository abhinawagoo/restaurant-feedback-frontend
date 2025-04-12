// src/contexts/AuthContext.js
"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { authService } from "@/lib/api";
import { usePathname, useRouter } from "next/navigation";

// Create auth context
const AuthContext = createContext();

// Define protected routes pattern
const PROTECTED_ROUTE_PATTERN = /^\/admin/; // All routes starting with /admin

// Auth provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pathname = usePathname();
  const router = useRouter();
  
  // Check if current route requires authentication
  const isProtectedRoute = () => {
    return PROTECTED_ROUTE_PATTERN.test(pathname);
  };

  // Load user on initial render
  useEffect(() => {
    async function loadUser() {
      try {
        // Check for token
        const token = localStorage.getItem("token");

        if (!token) {
          // If on a protected route and no token, redirect to login
          if (isProtectedRoute()) {
            router.push('/login');
          }
          setLoading(false);
          return;
        }

        // Fetch current user
        const response = await authService.getCurrentUser();
        setUser(response.data.user);
      } catch (err) {
        console.error("Failed to load user", err);
        localStorage.removeItem("token");
        
        // If on a protected route and auth failed, redirect to login
        if (isProtectedRoute()) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [pathname, router]);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const data = await authService.login({ email, password });
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await authService.register(formData);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);

    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      localStorage.removeItem("token");
      setLoading(false);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    isProtectedRoute,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}