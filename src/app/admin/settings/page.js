"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
// import { restaurantService, subscriptionService } from "@/lib/api";
import { toast } from "sonner";

// Settings components
import GeneralSettings from "@/components/admin/settings/GeneralSettings";
import AppearanceSettings from "@/components/admin/settings/AppearanceSettings";
// import BusinessHoursSettings from "@/components/settings/BusinessHoursSettings";
// import FeedbackSettings from "@/components/settings/FeedbackSettings";
// import BillingSettings from "@/components/settings/BillingSettings";
// import StaffSettings from "@/components/admin/settings/StaffSettings";

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const [restaurant, setRestaurant] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Handle tab change from URL query params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (
        tab &&
        [
          "general",
          "appearance",
          "hours",
          "qrcode",
          "feedback",
          "billing",
          "staff",
        ].includes(tab)
      ) {
        setActiveTab(tab);
      }

      // Handle status messages from payments
      const status = params.get("status");
      if (status === "success") {
        toast.success("Payment processed successfully");
      } else if (status === "canceled") {
        toast.info("Payment was canceled");
      }
    }
  }, []);

  // Update URL when tab changes
  const handleTabChange = (value) => {
    setActiveTab(value);
    if (typeof window !== "undefined") {
      const url = new URL(window.location);
      url.searchParams.set("tab", value);
      window.history.pushState({}, "", url);
    }
  };

  // Fetch restaurant data
  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      setLoading(true);
      try {
        // Fetch restaurant data
        // const restaurantData = await restaurantService.getRestaurant();
        // setRestaurant(restaurantData);
        // Fetch subscription data
        // const subscriptionData = await subscriptionService.getSubscription();
        // setSubscription(subscriptionData);
        // Fetch available plans
        // const plansData = await subscriptionService.getPlans();
        // setPlans(plansData);
      } catch (error) {
        console.error("Error loading settings data:", error);
        toast.error("Failed to load settings. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, refreshKey]);

  // Handle data refresh after updates
  const handleDataRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (loading && !restaurant) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
          <div className="grid gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="h-24 flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Restaurant Settings</h1>
            <p className="text-muted-foreground">
              Manage your restaurant profile, appearance, and subscription.
            </p>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-3 md:grid-cols-7 w-full">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            {/* <TabsTrigger value="hours">Hours</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger> */}
          </TabsList>

          <TabsContent value="general">
            <GeneralSettings
              restaurant={restaurant}
              onUpdate={handleDataRefresh}
            />
          </TabsContent>

          <TabsContent value="appearance">
            <AppearanceSettings
              restaurant={restaurant}
              onUpdate={handleDataRefresh}
            />
          </TabsContent>

          {/* <TabsContent value="hours">
            <BusinessHoursSettings
              restaurant={restaurant}
              onUpdate={handleDataRefresh}
            />
          </TabsContent> */}

          {/* 
          <TabsContent value="feedback">
            <FeedbackSettings
              restaurant={restaurant}
              onUpdate={handleDataRefresh}
            />
          </TabsContent> */}

          {/* <TabsContent value="billing">
            <BillingSettings
              restaurant={restaurant}
              subscription={subscription}
              plans={plans}
              onUpdate={handleDataRefresh}
            />
          </TabsContent> */}

          {/* <TabsContent value="staff">
            <StaffSettings
              restaurant={restaurant}
              subscription={subscription}
              onUpdate={handleDataRefresh}
            />
          </TabsContent> */}
        </Tabs>
      </div>
    </AdminLayout>
  );
}
