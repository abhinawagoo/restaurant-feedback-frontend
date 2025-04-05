// src/app/admin/feedback/analytics/[formId]/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, BarChart, Calendar } from "lucide-react";
import { feedbackService } from "@/lib/api";
import { toast } from "sonner";
import FeedbackSummary from "@/components/feedback/analytics/FeedbackSummary";
import QuestionBreakdown from "@/components/feedback/analytics/QuestionBreakdown";
import ResponseList from "@/components/feedback/analytics/ResponseList";
import FeedbackTimeline from "@/components/feedback/analytics/FeedbackTimeline";

export default function FeedbackAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [responses, setResponses] = useState([]);
  const formId = params.formId;

  useEffect(() => {
    async function loadFormAndAnalytics() {
      try {
        setLoading(true);
        // Load the form data
        const formResponse = await feedbackService.getFeedbackForm(formId);
        setFormData(formResponse.data.data);

        // Load analytics data
        const analyticsResponse = await feedbackService.getFormAnalytics(formId);
        setAnalyticsData(analyticsResponse.data.data);

        // Load responses (paginated)
        const responsesResponse = await feedbackService.getFormResponses(formId, { page: 1, limit: 100 });
        setResponses(responsesResponse.data.data);
      } catch (error) {
        console.error("Error loading analytics data", error);
        toast.error("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    }

    loadFormAndAnalytics();
  }, [formId]);

  const handleViewResponseDetail = (responseId) => {
    router.push(`/admin/feedback/responses/${responseId}`);
  };

  const handleViewQuestionDetail = (questionId) => {
    router.push(`/admin/feedback/analytics/${formId}/questions/${questionId}`);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-stone-700"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!formData || !analyticsData) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Analytics not available</h3>
          <Button onClick={() => router.push("/admin/feedback")}>
            Back to Feedback Forms
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/admin/feedback")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold mb-1">{formData.form.name}</h1>
              <p className="text-gray-500">
                {analyticsData.totalResponses} total responses
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/feedback/forms/${formId}/edit`)}
          >
            Edit Form
          </Button>
        </div>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="summary">
              <BarChart className="h-4 w-4 mr-2" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="questions">
              <FileText className="h-4 w-4 mr-2" />
              Questions
            </TabsTrigger>
            <TabsTrigger value="responses">
              <FileText className="h-4 w-4 mr-2" />
              Responses
            </TabsTrigger>
            <TabsTrigger value="timeline">
              <Calendar className="h-4 w-4 mr-2" />
              Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-0">
            <FeedbackSummary 
              analyticsData={analyticsData} 
              formData={formData} 
            />
          </TabsContent>

          <TabsContent value="questions" className="mt-0">
            <QuestionBreakdown 
              questions={formData.questions} 
              analytics={analyticsData.questionAnalytics} 
              onViewDetail={handleViewQuestionDetail}
            />
          </TabsContent>

          <TabsContent value="responses" className="mt-0">
            <ResponseList 
              responses={responses} 
              onViewDetail={handleViewResponseDetail} 
            />
          </TabsContent>

          <TabsContent value="timeline" className="mt-0">
            <FeedbackTimeline 
              responseData={analyticsData.timelineData} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}