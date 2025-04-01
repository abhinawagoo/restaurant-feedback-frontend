// src/app/(customer)/[restaurantId]/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Utensils,
  Phone,
  LogIn,
  ArrowRight,
} from "lucide-react";
import CustomerLayout from "@/components/layout/CustomerLayout";
import { restaurantService, feedbackService, authService } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function CustomerLandingPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [defaultFormId, setDefaultFormId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [activeTab, setActiveTab] = useState("menu");
  const [showAuthOptions, setShowAuthOptions] = useState(true); // Show auth by default
  const [authenticating, setAuthenticating] = useState(false);
  const [mobileAuthenticated, setMobileAuthenticated] = useState(false);

  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const restaurantId = params.restaurantId;
  const tableId = searchParams.get("table");
  const formId = searchParams.get("formId");

  useEffect(() => {
    async function loadRestaurantAndForm() {
      if (!restaurantId) return;

      try {
        // Load restaurant info
        const restaurantResponse = await restaurantService.getRestaurantPublic(
          restaurantId
        );
        setRestaurant(restaurantResponse.data.data);

        // If formId was provided in the URL, use it
        if (formId) {
          setDefaultFormId(formId);

          // If we're directed to a specific form, set the tab to feedback
          if (formId && !activeTab) {
            setActiveTab("feedback");
          }
        } else {
          // Otherwise, get the default form
          try {
            const formsResponse = await feedbackService.getFeedbackForms(
              restaurantId
            );
            const forms = formsResponse.data.data;

            if (forms && forms.length > 0) {
              const defaultForm =
                forms.find((form) => form.isDefault) || forms[0];
              setDefaultFormId(defaultForm._id);
            }
          } catch (formError) {
            console.error("Error loading feedback forms", formError);
            // Don't show error - feedback might be optional
          }
        }
      } catch (error) {
        console.error("Error loading restaurant", error);
        toast.error("Could not load restaurant information");
      } finally {
        setLoading(false);
      }
    }

    loadRestaurantAndForm();
  }, [restaurantId, formId, activeTab]);

  const validatePhoneNumber = (phone) => {
    // Basic validation - can be enhanced later
    if (!phone || phone.trim().length < 10) {
      setPhoneError("Please enter a valid phone number");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handlePhoneAuth = async (tableId) => {
    if (!validatePhoneNumber(phoneNumber)) {
      return;
    }

    setAuthenticating(true);

    try {
      // Use your auth service to make the API call
      const response = await authService.authenticateCustomer({
        phone: phoneNumber,
        restaurantId: restaurantId,
        tableId: tableId,
      });

      console.log("Response JSON:", JSON.stringify(response.data, null, 2));

      // Check if the request was successful
      if (!response.data.success) {
        throw new Error(response.data.message || "Authentication failed");
      }

      // Store phone number in localStorage
      localStorage.setItem("customerPhone", phoneNumber);

      // Only store serializable data
      if (response.data.customer) {
        // Create a new object with only the data we need
        const customerData = {
          visitId: response.data.customer.visitId,
          phone: response.data.customer.phone,
          restaurantId: response.data.customer.restaurantId,
          tableId: response.data.customer.tableId,
        };

        localStorage.setItem("customerInfo", JSON.stringify(customerData));
      }

      // Store token if needed
      if (response.data.token) {
        localStorage.setItem("customerToken", response.data.token);
      }

      setAuthenticating(false);
      setMobileAuthenticated(true);
      setShowAuthOptions(false);

      toast.success("Phone number verified successfully");
    } catch (error) {
      setAuthenticating(false);
      toast.error("Failed to verify phone number. Please try again.");
      console.error("Error in phone authentication:", error);
    }
  };
  const handleGoogleAuth = () => {
    // In a real app, would do Google auth
    toast.info(
      "Google One Tap Sign-in will be implemented in a future version"
    );
    // For now just continue as if successful
    setShowAuthOptions(false);
  };

  const handleSkipAuth = () => {
    // Just hide the auth options and show the main content
    setShowAuthOptions(false);
  };

  const handleStartFeedback = () => {
    if (defaultFormId) {
      // Pass the phone number as a query parameter if we have it
      let feedbackUrl = `/${restaurantId}/feedback?formId=${defaultFormId}`;

      if (tableId) {
        feedbackUrl += `&table=${tableId}`;
      }

      if (mobileAuthenticated && phoneNumber) {
        feedbackUrl += `&phone=${encodeURIComponent(phoneNumber)}`;
      }

      router.push(feedbackUrl);
    } else {
      toast.error("No feedback form available");
    }
  };

  const handleViewMenu = () => {
    router.push(`/${restaurantId}/menu${tableId ? `?table=${tableId}` : ""}`);
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-stone-700"></div>
        </div>
      </CustomerLayout>
    );
  }

  if (!restaurant) {
    return (
      <CustomerLayout>
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Restaurant Not Found</CardTitle>
            <CardDescription>
              The restaurant you are looking for does not exist or is not
              available.
            </CardDescription>
          </CardHeader>
        </Card>
      </CustomerLayout>
    );
  }

  if (showAuthOptions) {
    return (
      <CustomerLayout>
        <div className="max-w-md mx-auto py-8">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center">
                Welcome to {restaurant.name}
              </CardTitle>
              <CardDescription className="text-center">
                {tableId
                  ? `You're at Table ${tableId}`
                  : "Enter your phone number to continue"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Your phone number</label>
                <div className="flex space-x-2">
                  <Input
                    type="tel"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      setPhoneError("");
                    }}
                    className={phoneError ? "border-red-500" : ""}
                  />
                  <Button
                    onClick={() => handlePhoneAuth(tableId)}
                    disabled={authenticating}
                  >
                    {authenticating ? "Processing..." : "Continue"}
                  </Button>
                </div>
                {phoneError && (
                  <p className="text-sm text-red-500">{phoneError}</p>
                )}
                <p className="text-xs text-gray-500">
                  We'll use this to save your feedback and improve your
                  experience
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleAuth}
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </Button>
            </CardContent>
            <CardFooter className="flex justify-center pb-4">
              <Button variant="link" onClick={handleSkipAuth}>
                Skip Sign In
              </Button>
            </CardFooter>
          </Card>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-xl mx-auto py-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">
              Welcome to {restaurant.name}
            </CardTitle>
            <CardDescription className="text-center">
              {tableId
                ? `You're at Table ${tableId}`
                : "Thank you for visiting"}
              {mobileAuthenticated && phoneNumber && ` | ${phoneNumber}`}
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="menu" className="flex items-center">
              <Utensils className="mr-2 h-4 w-4" />
              Menu
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center">
              <MessageSquare className="mr-2 h-4 w-4" />
              Feedback
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu">
            <Card>
              <CardHeader>
                <CardTitle>Our Menu</CardTitle>
                <CardDescription>
                  Browse our menu and place your order with your server
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center py-8">
                  <Button size="lg" onClick={handleViewMenu}>
                    <Utensils className="mr-2 h-4 w-4" />
                    View Complete Menu
                  </Button>
                </p>

                <div className="text-center pt-4">
                  <p className="text-gray-500 mb-4">Enjoyed your meal?</p>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("feedback")}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Give Feedback
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>Your Feedback Matters</CardTitle>
                <CardDescription>
                  Please share your experience with us
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Button size="lg" onClick={handleStartFeedback}>
                    Start Feedback Form
                  </Button>
                </div>

                <div className="text-center pt-4">
                  <p className="text-gray-500 mb-4">Want to check our menu?</p>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("menu")}
                  >
                    <Utensils className="mr-2 h-4 w-4" />
                    View Menu
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CustomerLayout>
  );
}

// // src/app/(customer)/[restaurantId]/page.js
// "use client";

// import { useState, useEffect } from "react";
// import { useParams, useSearchParams, useRouter } from "next/navigation";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
//   CardFooter,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   MessageSquare,
//   Utensils,
//   Phone,
//   LogIn,
//   ArrowRight,
// } from "lucide-react";
// import CustomerLayout from "@/components/layout/CustomerLayout";
// import { restaurantService, feedbackService } from "@/lib/api";
// import { toast } from "sonner";
// import { Input } from "@/components/ui/input";
// import { Separator } from "@/components/ui/separator";

// export default function CustomerLandingPage() {
//   const [restaurant, setRestaurant] = useState(null);
//   const [defaultFormId, setDefaultFormId] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [activeTab, setActiveTab] = useState("menu");
//   const [showAuthOptions, setShowAuthOptions] = useState(false);

//   const params = useParams();
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   const restaurantId = params.restaurantId;
//   const tableId = searchParams.get("table");
//   const formId = searchParams.get("formId");

//   useEffect(() => {
//     async function loadRestaurantAndForm() {
//       if (!restaurantId) return;

//       try {
//         // Load restaurant info
//         const restaurantResponse = await restaurantService.getRestaurantPublic(
//           restaurantId
//         );
//         setRestaurant(restaurantResponse.data.data);

//         // If formId was provided in the URL, use it
//         if (formId) {
//           setDefaultFormId(formId);

//           // If we're directed to a specific form, set the tab to feedback
//           if (formId && !activeTab) {
//             setActiveTab("feedback");
//           }

//           setLoading(false);
//           return;
//         }

//         // Otherwise, get the default form
//         try {
//           const formsResponse = await feedbackService.getFeedbackForms(
//             restaurantId
//           );
//           const forms = formsResponse.data.data;

//           if (forms && forms.length > 0) {
//             const defaultForm =
//               forms.find((form) => form.isDefault) || forms[0];
//             setDefaultFormId(defaultForm._id);
//           }
//         } catch (formError) {
//           console.error("Error loading feedback forms", formError);
//           // Don't show error - feedback might be optional
//         }
//       } catch (error) {
//         console.error("Error loading restaurant", error);
//         toast.error("Could not load restaurant information");
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadRestaurantAndForm();
//   }, [restaurantId, formId, activeTab]);

//   const handlePhoneAuth = () => {
//     // In real app, would verify phone number
//     toast.success(
//       "Phone authentication will be implemented in a future version"
//     );
//     setTimeout(() => {
//       handleSkipAuth(); // For now, just skip auth
//     }, 1000);
//   };

//   const handleGoogleAuth = () => {
//     // In real app, would do Google auth
//     toast.success(
//       "Google authentication will be implemented in a future version"
//     );
//     setTimeout(() => {
//       handleSkipAuth(); // For now, just skip auth
//     }, 1000);
//   };

//   const handleSkipAuth = () => {
//     // Just hide the auth options and show the main content
//     setShowAuthOptions(false);
//   };

//   const handleStartFeedback = () => {
//     if (defaultFormId) {
//       router.push(
//         `/${restaurantId}/feedback?formId=${defaultFormId}${
//           tableId ? `&table=${tableId}` : ""
//         }`
//       );
//     } else {
//       toast.error("No feedback form available");
//     }
//   };

//   const handleViewMenu = () => {
//     router.push(`/${restaurantId}/menu${tableId ? `?table=${tableId}` : ""}`);
//   };

//   if (loading) {
//     return (
//       <CustomerLayout>
//         <div className="flex justify-center py-12">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-stone-700"></div>
//         </div>
//       </CustomerLayout>
//     );
//   }

//   if (!restaurant) {
//     return (
//       <CustomerLayout>
//         <Card className="max-w-md mx-auto">
//           <CardHeader>
//             <CardTitle>Restaurant Not Found</CardTitle>
//             <CardDescription>
//               The restaurant you are looking for does not exist or is not
//               available.
//             </CardDescription>
//           </CardHeader>
//         </Card>
//       </CustomerLayout>
//     );
//   }

//   if (showAuthOptions) {
//     return (
//       <CustomerLayout>
//         <div className="max-w-md mx-auto py-8">
//           <Card className="mb-6">
//             <CardHeader>
//               <CardTitle className="text-center">
//                 Welcome to {restaurant.name}
//               </CardTitle>
//               <CardDescription className="text-center">
//                 {tableId
//                   ? `You're at Table ${tableId}`
//                   : "Enhance your experience by signing in"}
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="space-y-2">
//                 <label className="text-sm font-medium">
//                   Sign in with phone number
//                 </label>
//                 <div className="flex space-x-2">
//                   <Input
//                     type="tel"
//                     placeholder="Phone Number"
//                     value={phoneNumber}
//                     onChange={(e) => setPhoneNumber(e.target.value)}
//                   />
//                   <Button onClick={handlePhoneAuth}>
//                     <Phone className="h-4 w-4 mr-2" /> Continue
//                   </Button>
//                 </div>
//               </div>

//               <div className="relative">
//                 <div className="absolute inset-0 flex items-center">
//                   <span className="w-full border-t" />
//                 </div>
//                 <div className="relative flex justify-center text-xs uppercase">
//                   <span className="bg-white px-2 text-gray-500">Or</span>
//                 </div>
//               </div>

//               <Button
//                 variant="outline"
//                 className="w-full"
//                 onClick={handleGoogleAuth}
//               >
//                 <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
//                   <path
//                     d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//                     fill="#4285F4"
//                   />
//                   <path
//                     d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//                     fill="#34A853"
//                   />
//                   <path
//                     d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
//                     fill="#FBBC05"
//                   />
//                   <path
//                     d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
//                     fill="#EA4335"
//                   />
//                 </svg>
//                 Continue with Google
//               </Button>
//             </CardContent>
//             <CardFooter className="flex justify-center pb-4">
//               <Button variant="link" onClick={handleSkipAuth}>
//                 Skip Sign In
//               </Button>
//             </CardFooter>
//           </Card>
//         </div>
//       </CustomerLayout>
//     );
//   }

//   return (
//     <CustomerLayout>
//       <div className="max-w-xl mx-auto py-6">
//         <Card className="mb-6">
//           <CardHeader>
//             <CardTitle className="text-center">
//               Welcome to {restaurant.name}
//             </CardTitle>
//             <CardDescription className="text-center">
//               {tableId
//                 ? `You're at Table ${tableId}`
//                 : "Thank you for visiting"}
//             </CardDescription>
//           </CardHeader>
//           <CardFooter className="flex justify-center pt-0">
//             <Button variant="link" onClick={() => setShowAuthOptions(true)}>
//               Sign in for a personalized experience
//               <ArrowRight className="ml-2 h-4 w-4" />
//             </Button>
//           </CardFooter>
//         </Card>

//         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//           <TabsList className="grid grid-cols-2 mb-8">
//             <TabsTrigger value="menu" className="flex items-center">
//               <Utensils className="mr-2 h-4 w-4" />
//               Menu
//             </TabsTrigger>
//             <TabsTrigger value="feedback" className="flex items-center">
//               <MessageSquare className="mr-2 h-4 w-4" />
//               Feedback
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value="menu">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Our Menu</CardTitle>
//                 <CardDescription>
//                   Browse our menu and place your order with your server
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <p className="text-center py-8">
//                   <Button size="lg" onClick={handleViewMenu}>
//                     <Utensils className="mr-2 h-4 w-4" />
//                     View Complete Menu
//                   </Button>
//                 </p>

//                 <div className="text-center pt-4">
//                   <p className="text-gray-500 mb-4">Enjoyed your meal?</p>
//                   <Button
//                     variant="outline"
//                     onClick={() => setActiveTab("feedback")}
//                   >
//                     <MessageSquare className="mr-2 h-4 w-4" />
//                     Give Feedback
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           <TabsContent value="feedback">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Your Feedback Matters</CardTitle>
//                 <CardDescription>
//                   Please share your experience with us
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="text-center py-8">
//                   <Button size="lg" onClick={handleStartFeedback}>
//                     Start Feedback Form
//                   </Button>
//                 </div>

//                 <div className="text-center pt-4">
//                   <p className="text-gray-500 mb-4">Want to check our menu?</p>
//                   <Button
//                     variant="outline"
//                     onClick={() => setActiveTab("menu")}
//                   >
//                     <Utensils className="mr-2 h-4 w-4" />
//                     View Menu
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
//       </div>
//     </CustomerLayout>
//   );
// }
