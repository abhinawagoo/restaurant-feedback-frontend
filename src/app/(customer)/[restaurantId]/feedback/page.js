// src/app/(customer)/[restaurantId]/feedback/page.js
"use client";
import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import CustomerLayout from "@/components/layout/CustomerLayout";
import CustomerFeedbackForm from "@/components/feedback/customer/CustomerFeedbackForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { ArrowLeft, LogIn } from "lucide-react";
import { feedbackService, restaurantService } from "@/lib/api";
import { toast } from "sonner";

export default function CustomerFeedbackPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [formId, setFormId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState(null);
  const [showAuthOption, setShowAuthOption] = useState(false);

  const restaurantId = params.restaurantId;
  const tableId = searchParams.get("table");
  const urlFormId = searchParams.get("formId");
  const phoneNumber = searchParams.get("phone"); // This will be passed from landing page if user provided it

  useEffect(() => {
    async function loadData() {
      if (!restaurantId) return;

      try {
        // Load restaurant info
        const restaurantResponse = await restaurantService.getRestaurantPublic(
          restaurantId
        );
        setRestaurant(restaurantResponse.data.data);

        // If formId was provided in the URL, use it
        if (urlFormId) {
          setFormId(urlFormId);
          setLoading(false);
          return;
        }

        // Otherwise, get the default form
        try {
          const formsResponse = await feedbackService.getFeedbackForms(
            restaurantId
          );
          const forms = formsResponse.data.data;

          if (forms && forms.length > 0) {
            const defaultForm =
              forms.find((form) => form.isDefault) || forms[0];
            setFormId(defaultForm._id);
          } else {
            toast.error("No feedback forms available");
          }
        } catch (formError) {
          console.error("Error loading feedback forms", formError);
          toast.error("Could not load feedback forms");
        }
      } catch (error) {
        console.error("Error loading restaurant", error);
        toast.error("Could not load restaurant information");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [restaurantId, urlFormId]);

  const handleFeedbackComplete = () => {
    // The feedback component will handle showing the thank you message
  };

  const handleGoBack = () => {
    router.push(`/${restaurantId}${tableId ? `?table=${tableId}` : ""}`);
  };

  const handleSignIn = () => {
    // Store current location and redirect to auth
    // For now, we'll just hide the auth prompt and continue as guest
    setShowAuthOption(false);
    toast.info(
      "Continuing as guest. Sign-in functionality will be available in a future update."
    );
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

  return (
    <CustomerLayout>
      <div className="max-w-2xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="sm" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {!phoneNumber && showAuthOption && (
            <Button variant="outline" size="sm" onClick={handleSignIn}>
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          )}
        </div>

        {!phoneNumber && showAuthOption && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Sign in to save your feedback and earn rewards
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => setShowAuthOption(false)}
                >
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {phoneNumber && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm">
                  Providing feedback as:{" "}
                  <span className="font-medium">{phoneNumber}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {formId ? (
          <CustomerFeedbackForm
            formId={formId}
            restaurantId={restaurantId}
            visitId={tableId || null} // Optional visit ID
            onComplete={handleFeedbackComplete}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Feedback Not Available</CardTitle>
              <CardDescription>
                Sorry, we couldn't find a feedback form for this restaurant.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={handleGoBack}>Return to Menu</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </CustomerLayout>
  );
}

