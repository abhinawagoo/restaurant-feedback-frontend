// src/app/admin/dashboard/page.js
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare, ThumbsUp, Award, Users } from "lucide-react";
import { feedbackService } from "@/lib/api";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalResponses: 0,
    averageRating: 0,
    positiveResponses: 0,
    customerReached: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user?.restaurantId) return;

      try {
        // In a real app, you would fetch actual stats from the backend
        // For now, we&apos;ll use mock data
        const response = await feedbackService.getFeedbackResponses(
          user.restaurantId
        );

        // Calculate stats
        const responses = response.data.data || [];
        const totalCount = responses.length;
        const ratings = responses.map((r) => r.overallRating).filter(Boolean);
        const avgRating = ratings.length
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          : 0;
        const positiveCount = ratings.filter((r) => r >= 4).length;

        setStats({
          totalResponses: totalCount,
          averageRating: avgRating.toFixed(1),
          positiveResponses: positiveCount,
          customerReached: totalCount * 2, // Mock approximation
        });
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {user?.name || "Admin"}
          </h1>
          <p className="text-gray-500">
            Here&apos;s an overview of your restaurant&apos;s feedback
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Responses
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.totalResponses}
              </div>
              <p className="text-xs text-gray-500">
                Total feedback submissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Average Rating
              </CardTitle>
              <Award className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.averageRating} / 5
              </div>
              <p className="text-xs text-gray-500">
                Overall satisfaction score
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Positive Feedback
              </CardTitle>
              <ThumbsUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.positiveResponses}
              </div>
              <p className="text-xs text-gray-500">Responses with 4+ rating</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Customers Reached
              </CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.customerReached}
              </div>
              <p className="text-xs text-gray-500">Estimate of total views</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
              <CardDescription>Latest customer responses</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : stats.totalResponses === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No feedback submissions yet
                </div>
              ) : (
                // src/app/admin/dashboard/page.js (continuing from where we left off)
                <div className="space-y-4">
                  <p>Recent feedback items would appear here...</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feedback Overview</CardTitle>
              <CardDescription>
                Rating distribution for the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
                <div className="h-[200px] flex items-center justify-center">
                  <p className="text-center text-gray-500">
                    Rating distribution chart would appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
