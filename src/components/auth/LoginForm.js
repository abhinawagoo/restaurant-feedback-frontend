// // src/components/auth/LoginForm.js
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { useAuth } from "@/contexts/AuthContext";
// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// // import HoshloopAnimation from "@/components/landing/HoshloopAnimation";
// import { toast } from "sonner";

// // Form validation schema
// const formSchema = z.object({
//   email: z.string().email({ message: "Please enter a valid email" }),
//   password: z
//     .string()
//     .min(6, { message: "Password must be at least 6 characters" }),
// });

// export default function LoginForm() {
//   const { login } = useAuth();
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();

//   // Initialize form
//   const form = useForm({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//     },
//   });

//   // Form submission handler
//   const onSubmit = async (data) => {
//     setIsLoading(true);

//     try {
//       await login(data.email, data.password);
//       toast.success("Login successful");
//       router.push("/admin/dashboard");
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Login failed");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//       <div className="w-full max-w-md px-4 space-y-6">

        
//         <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">


//         {/* Logo Section */}
//         <div className="flex justify-center">
//           <Link href="https://hoshloop.com">
//             <h2 className="text-3xl font-bold text-black hover:opacity-80 transition">
//               Hosh<span className="text-green-500">Loop</span>
//             </h2>
//           </Link>
//         </div>

  
//         {/* Login Box */}
//           <div className="space-y-2 text-center">
//             <h1 className="text-3xl font-bold">Welcome Back</h1>
//             <p className="text-gray-500">Sign in to your restaurant dashboard</p>
//           </div>
  
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//               <FormField
//                 control={form.control}
//                 name="email"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Email</FormLabel>
//                     <FormControl>
//                       <Input
//                         placeholder="your@email.com"
//                         type="email"
//                         disabled={isLoading}     
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
  
//               <FormField
//                 control={form.control}
//                 name="password"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Password</FormLabel>
//                     <FormControl>
//                       <Input
//                         placeholder="******"
//                         type="password"
//                         disabled={isLoading}
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
  
//               <Button type="submit" className="w-full" disabled={isLoading}>
//                 {isLoading ? "Signing in..." : "Sign In"}
//               </Button>
//             </form>
//           </Form>
  
//           <div className="mt-4 text-center text-sm">
//             <p>
//               Don't have an account?{" "}
//               <Link href="/register" className="text-stone-600 hover:underline">
//                 Register here
//               </Link>
//             </p>
//           </div>
//         </div>
//       </div>
//   );
  

  
// }
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
// import HoshloopAnimation from "@/components/landing/HoshloopAnimation";
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

        
        <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700/20">


        {/* Logo Section */}
        <div className="flex justify-center">
          <Link href="https://hoshloop.com">
            <h2 className="text-3xl font-bold text-black dark:text-white hover:opacity-80 transition">
              Hosh<span className="text-green-500">Loop</span>
            </h2>
          </Link>
        </div>

  
        {/* Login Box */}
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
            <p className="text-gray-500 dark:text-gray-400">Sign in to your restaurant dashboard</p>
          </div>
  
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="your@email.com"
                        type="email"
                        disabled={isLoading}
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-green-500 dark:focus:border-green-400"
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
                    <FormLabel className="text-gray-700 dark:text-gray-300">Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="******"
                        type="password"
                        disabled={isLoading}
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-green-500 dark:focus:border-green-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
  
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>
  
          <div className="mt-4 text-center text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link href="/register" className="text-stone-600 dark:text-stone-400 hover:underline hover:text-green-600 dark:hover:text-green-400">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
  );
  

  
}