// src/app/admin/feedback/forms/[formId]/edit/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import QuestionList from "@/components/feedback/questions/QuestionList";
import CreateQuestionModal from "@/components/feedback/questions/CreateQuestionModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { feedbackService } from "@/lib/api";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

export default function EditFeedbackFormPage() {
  const params = useParams();
  const router = useRouter();
  const [form, setForm] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const formId = params.formId;

  // Form state for the feedback form settings
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formThankYouMessage, setFormThankYouMessage] = useState("");
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [formActive, setFormActive] = useState(true);

  useEffect(() => {
    async function loadFormAndQuestions() {
      if (!formId) return;

      try {
        const response = await feedbackService.getFeedbackForm(formId);
        const formData = response.data.data.form;
        setForm(formData);
        setQuestions(response.data.data.questions);

        // Set form state
        setFormName(formData.name || "");
        setFormDescription(formData.description || "");
        setFormThankYouMessage(
          formData.thankYouMessage || "Thank you for your feedback!"
        );
        setFormIsDefault(formData.isDefault || false);
        setFormActive(formData.active !== undefined ? formData.active : true);
      } catch (error) {
        console.error("Error loading form data", error);
        toast.error("Failed to load form data");
      } finally {
        setLoading(false);
      }
    }

    loadFormAndQuestions();
  }, [formId]);

  const handleQuestionAdded = async () => {
    setShowAddModal(false);
    setEditingQuestion(null);

    try {
      // Reload questions
      const response = await feedbackService.getFeedbackForm(formId);
      setQuestions(response.data.data.questions);
      toast.success("Questions updated successfully");
    } catch (error) {
      console.error("Error reloading questions", error);
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setShowAddModal(true);
  };

  const handleDeleteQuestion = async (questionId) => {
    // In a real app, you would implement deletion via API
    toast.error("Delete functionality not implemented in this demo");
  };

  const handleSaveForm = async () => {
    setSaving(true);

    try {
      // In a real app, you would implement form update via API
      // For this demo, we'll just simulate it

      await new Promise((resolve) => setTimeout(resolve, 800));

      // Update local state
      setForm({
        ...form,
        name: formName,
        description: formDescription,
        thankYouMessage: formThankYouMessage,
        isDefault: formIsDefault,
        active: formActive,
      });

      toast.success("Form settings saved successfully");
    } catch (error) {
      console.error("Error saving form", error);
      toast.error("Failed to save form settings");
    } finally {
      setSaving(false);
    }
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

  if (!form) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Form not found</h3>
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
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">{form.name}</h1>
            <p className="text-gray-500">
              {form.description || "No description provided"}
            </p>
          </div>
        </div>

        <Card className="bg-white p-6 rounded-lg shadow">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Form Settings</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="form-name">Form Name</Label>
                <Input
                  id="form-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Customer Satisfaction Survey"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-description">Description (Optional)</Label>
                <Textarea
                  id="form-description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Help us improve by sharing your experience"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-thankyou">Thank You Message</Label>
                <Textarea
                  id="form-thankyou"
                  value={formThankYouMessage}
                  onChange={(e) => setFormThankYouMessage(e.target.value)}
                  placeholder="Thank you for your feedback!"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="form-default"
                  checked={formIsDefault}
                  onCheckedChange={setFormIsDefault}
                />
                <Label htmlFor="form-default">Make this the default form</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="form-active"
                  checked={formActive}
                  onCheckedChange={setFormActive}
                />
                <Label htmlFor="form-active">Form is active</Label>
              </div>
            </div>

            <Button className="mt-4" onClick={handleSaveForm} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
          <div>
            <h2 className="text-xl font-semibold">Questions</h2>
            <p className="text-gray-500">
              {questions.length} question{questions.length !== 1 ? "s" : ""} in
              this form
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingQuestion(null);
              setShowAddModal(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <QuestionList
            formId={formId}
            questions={questions}
            onEdit={handleEditQuestion}
            onDelete={handleDeleteQuestion}
          />
        </div>

        <CreateQuestionModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          formId={formId}
          onSuccess={handleQuestionAdded}
          editQuestion={editingQuestion}
        />
      </div>
    </AdminLayout>
  );
}
