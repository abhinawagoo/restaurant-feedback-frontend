// src/components/feedback/FeedbackFormList.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { feedbackService } from "@/lib/api";
import { toast } from "sonner";

export default function FeedbackFormList({ onCreateNew }) {
  const { user } = useAuth();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadForms() {
      if (!user?.restaurantId) return;

      try {
        const response = await feedbackService.getFeedbackForms(
          user.restaurantId
        );
        setForms(response.data.data || []);
      } catch (error) {
        console.error("Error loading feedback forms", error);
        toast.error("Failed to load feedback forms");
      } finally {
        setLoading(false);
      }
    }

    loadForms();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-stone-700"></div>
      </div>
    );
  }

  if (forms.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">No Feedback Forms Yet</h3>
        <p className="text-gray-500 mb-6">
          Create your first feedback form to start collecting responses
        </p>
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Create Feedback Form
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {forms.map((form) => (
        <Card key={form._id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{form.name}</CardTitle>
              {form.isDefault && (
                <Badge variant="outline" className="bg-stone-100">
                  Default
                </Badge>
              )}
            </div>
            <CardDescription>
              {form.description || "No description"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-sm text-gray-500">
              Created: {new Date(form.createdAt).toLocaleDateString()}
            </div>
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <span className={form.active ? "text-green-600" : "text-red-600"}>
                {form.active ? "Active" : "Inactive"}
              </span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/admin/feedback/forms/${form._id}`}>
                <MessageSquare className="h-4 w-4 mr-2" />
                View Responses
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/admin/feedback/forms/${form._id}/edit`}>
                <Settings className="h-4 w-4 mr-2" />
                Edit Form
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
