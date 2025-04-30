// src/components/auth/LoginForm.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import HoshloopAnimation from "@/components/landing/HoshloopAnimation";
import { toast } from "sonner";

// Form validation schema
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export default function LoginForm() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Form submission handler
  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      await login(data.email, data.password);
      toast.success("Login successful");
      router.push("/admin/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="w-full max-w-md px-4 space-y-6">

        
        <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">


        {/* Logo Section */}
        <div className="flex justify-center">
          <Link href="https://hoshloop.com">
            <h2 className="text-3xl font-bold text-black hover:opacity-80 transition">
              Hosh<span className="text-green-500">Loop</span>
            </h2>
          </Link>
        </div>

        <HoshloopAnimation />
  
        {/* Login Box */}
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-gray-500">Sign in to your restaurant dashboard</p>
          </div>
  
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="your@email.com"
                        type="email"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
  
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="******"
                        type="password"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
  
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>
  
          <div className="mt-4 text-center text-sm">
            <p>
              Don't have an account?{" "}
              <Link href="/register" className="text-stone-600 hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
  );
  

  // return (
  //   <div className="mx-auto max-w-md space-y-6 p-6 bg-white rounded-lg shadow-md">
  //     <div className="space-y-2 text-center">
  //       <h1 className="text-3xl font-bold">Welcome Back</h1>
  //       <p className="text-gray-500">Sign in to your restaurant dashboard</p>
  //     </div>

  //     <Form {...form}>
  //       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
  //         <FormField
  //           control={form.control}
  //           name="email"
  //           render={({ field }) => (
  //             <FormItem>
  //               <FormLabel>Email</FormLabel>
  //               <FormControl>
  //                 <Input
  //                   placeholder="your@email.com"
  //                   type="email"
  //                   disabled={isLoading}
  //                   {...field}
  //                 />
  //               </FormControl>
  //               <FormMessage />
  //             </FormItem>
  //           )}
  //         />

  //         <FormField
  //           control={form.control}
  //           name="password"
  //           render={({ field }) => (
  //             <FormItem>
  //               <FormLabel>Password</FormLabel>
  //               <FormControl>
  //                 <Input
  //                   placeholder="******"
  //                   type="password"
  //                   disabled={isLoading}
  //                   {...field}
  //                 />
  //               </FormControl>
  //               <FormMessage />
  //             </FormItem>
  //           )}
  //         />

  //         <Button type="submit" className="w-full" disabled={isLoading}>
  //           {isLoading ? "Signing in..." : "Sign In"}
  //         </Button>
  //       </form>
  //     </Form>

  //     <div className="mt-4 text-center text-sm">
  //       <p>
  //         Don't have an account?{" "}
  //         <Link href="/register" className="text-stone-600 hover:underline">
  //           Register here
  //         </Link>
  //       </p>
  //     </div>
  //   </div>
  // );
}
